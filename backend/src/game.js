// game.js - game logic handlers for the Worker
import { jsonResponse, errorResponse } from './utils.js';
import { buildSystemPrompt, buildUserPrompt, expectedStepsMinMax } from './prompt.js';

/** Generate a new puzzle level using Groq chat completions */
export async function generateLevel(request, env, headers) {
  const { language = 'ar', level = 1, fresh = false } = await request.json();
  const isArabic = language === 'ar';

  const groqApiKey = env?.GROQ_API_KEY;
  const groqModel = env?.GROQ_MODEL || 'llama-3.1-8b-instant';
  const aiModel = env?.AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  const openaiApiKey = env?.OPENAI_API_KEY;
  const openaiModel = env?.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = buildSystemPrompt({ language, level });
  const seed = Math.floor(Math.random() * 10000);
  const userPrompt = buildUserPrompt({ language, level, seed });
  let generationProvider = 'unknown';

  const bannedMeta = new Set([
    // Arabic (unicode escapes for tooling safety)
    '\u0628\u062f\u0627\u064a\u0629', // بداية
    '\u0646\u0647\u0627\u064a\u0629', // نهاية
    '\u0643\u0644\u0645\u0629', // كلمة
    '\u062e\u0637\u0648\u0629', // خطوة
    '\u0644\u063a\u0632', // لغز
    '\u0633\u0624\u0627\u0644', // سؤال
    '\u062c\u0648\u0627\u0628', // جواب
    '\u0625\u062c\u0627\u0628\u0629', // إجابة
    '\u0631\u0627\u0628\u0637', // رابط
    '\u0633\u0644\u0633\u0644\u0629', // سلسلة
    '\u0645\u0633\u062a\u0648\u0649', // مستوى
    '\u0645\u0631\u062d\u0644\u0629', // مرحلة
    // English
    'start',
    'end',
    'word',
    'step',
    'puzzle',
    'question',
    'answer',
    'chain',
    'level',
    'stage',
  ]);

  const normalize = (s) => String(s ?? '').trim().toLowerCase();
  const hasArabicLetters = (s) => /[\u0600-\u06FF]/.test(String(s ?? ''));

  const normalizePuzzle = (puzzle) => {
    if (!puzzle || typeof puzzle !== 'object') return null;
    if (!Array.isArray(puzzle.steps)) return null;
    if (typeof puzzle.startWord !== 'string' || typeof puzzle.endWord !== 'string') return null;

    const startWord = puzzle.startWord.trim();
    const endWord = puzzle.endWord.trim();
    if (!startWord || !endWord) return null;

    const steps = puzzle.steps
      .filter((s) => s && typeof s.word === 'string')
      .map((s) => ({
        word: String(s.word).trim(),
        options: Array.isArray(s.options) ? s.options.map((o) => String(o).trim()) : [],
      }))
      .filter((s) => s.word.length > 0);

    return {
      startWord,
      endWord,
      steps,
      hint: typeof puzzle.hint === 'string' ? puzzle.hint.trim() : '',
      puzzleId: typeof puzzle.puzzleId === 'string' ? puzzle.puzzleId : undefined,
    };
  };

  const normalizeOptionsTo3 = ({ word, options, start, end }) => {
    const wNorm = normalize(word);
    const startNorm = normalize(start);
    const endNorm = normalize(end);

    let list = options.map((o) => String(o));
    if (!list.map(normalize).includes(wNorm)) list.push(word);

    const seen = new Set();
    list = list.filter((o) => {
      const n = normalize(o);
      if (!n) return false;
      if (n === startNorm || n === endNorm) return false;
      if (bannedMeta.has(o) || bannedMeta.has(n)) return false;
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    });

    if (!list.map(normalize).includes(wNorm)) list.unshift(word);
    while (list.length < 3) list.push(word);
    if (list.length > 3) list = list.slice(0, 3);

    // Ensure the correct word exists after trimming
    if (!list.map(normalize).includes(wNorm)) {
      list[list.length - 1] = word;
    }

    return list;
  };

  const isBadPuzzle = (puzzle) => {
    const p = normalizePuzzle(puzzle);
    if (!p) return true;
    if (p.steps.length === 0) return true;

    const start = p.startWord;
    const end = p.endWord;
    if (!start || !end) return true;
    if (normalize(start) === normalize(end)) return true;
    if (bannedMeta.has(start) || bannedMeta.has(end) || bannedMeta.has(normalize(start)) || bannedMeta.has(normalize(end))) {
      return true;
    }
    if (isArabic && (!hasArabicLetters(start) || !hasArabicLetters(end))) return true;

    const { min, max } = expectedStepsMinMax(level);
    if (p.steps.length < min || p.steps.length > max) return true;

    // Reject duplicates across the whole chain (case/space-insensitive)
    const chainWords = [start, ...p.steps.map((s) => s.word), end].map(normalize).filter(Boolean);
    if (new Set(chainWords).size !== chainWords.length) return true;

    for (const s of p.steps) {
      const w = s.word.trim();
      if (!w) return true;
      if (bannedMeta.has(w) || bannedMeta.has(normalize(w))) return true;
      if (isArabic && !hasArabicLetters(w)) return true;
      if (!Array.isArray(s.options) || s.options.length < 3) return true;

      const normalizedOptions = normalizeOptionsTo3({
        word: w,
        options: s.options,
        start,
        end,
      });

      const optionsNorm = normalizedOptions.map(normalize);
      if (!optionsNorm.includes(normalize(w))) return true;
      if (new Set(optionsNorm).size !== 3) return true;
    }

    return false;
  };

  const bankMin = Math.max(0, Number(env?.PUZZLE_BANK_MIN ?? 30));

  // Cache path: once we have a puzzle bank in D1, serve a random cached puzzle
  // so new users don't trigger AI generation.
  if (env?.DB && !fresh) {
    try {
      const countRow = await env.DB
        .prepare('SELECT COUNT(*) AS c FROM puzzles WHERE level = ? AND lang = ?')
        .bind(Number(level), language)
        .first();
      const count = Number(countRow?.c ?? 0);

      if (count >= bankMin && count > 0) {
        const row = await env.DB
          .prepare('SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1')
          .bind(Number(level), language)
          .first();
        if (row?.json) {
          const cached = JSON.parse(row.json);
          if (!isBadPuzzle(cached)) {
            generationProvider = 'd1_cache';
            if (!cached.puzzleId) cached.puzzleId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
            return new Response(JSON.stringify(cached), {
              headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': generationProvider },
              status: 200,
            });
          }
        }
      }
    } catch (_) {
      // ignore cache read errors and fall back to generation
    }
  }

  const callChat = async ({ messages, temperature, purpose }) => {
    // Prefer OpenAI if configured.
    if (openaiApiKey) {
      if (purpose === 'generate') generationProvider = 'openai';
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: openaiModel,
          messages,
          temperature,
          max_tokens: 900,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const err = new Error(`openai_http_${response.status}`);
        err.details = text;
        throw err;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      return String(content).replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // Prefer Cloudflare Workers AI (has a free-tier for many accounts and needs no external API key).
    if (env?.AI) {
      if (purpose === 'generate') generationProvider = 'workers_ai';
      const out = await env.AI.run(aiModel, {
        messages,
        temperature,
        max_tokens: 900,
      });
      const content =
        out?.response ??
        out?.result ??
        out?.output_text ??
        out?.text ??
        (typeof out === 'string' ? out : JSON.stringify(out));
      return String(content).replace(/```json/g, '').replace(/```/g, '').trim();
    }

    // Fallback to Groq if configured
    if (groqApiKey) {
      if (purpose === 'generate') generationProvider = 'groq';
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: groqModel,
          messages,
          temperature,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const err = new Error(`groq_http_${response.status}`);
        err.details = text;
        throw err;
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content ?? '';
      return content.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    throw new Error('no_ai_provider_configured');
  };

  const fallbackTemplates = {
    ar: [
      {
        start: 'بحر',
        end: 'خروف',
        hint: 'فكّر في سلسلة من ظواهر الطبيعة وما ينتج عنها.',
        steps: [
          { word: 'بخار', distractors: ['موج', 'ملح'] },
          { word: 'غيوم', distractors: ['شمس', 'رياح'] },
          { word: 'مطر', distractors: ['برق', 'رعد'] },
          { word: 'عشب', distractors: ['تراب', 'حجر'] },
        ],
      },
      {
        start: 'ثلج',
        end: 'مدفأة',
        hint: 'فكّر في فصل بارد وما نستخدمه لمقاومة البرد.',
        steps: [
          { word: 'برد', distractors: ['حر', 'غبار'] },
          { word: 'شتاء', distractors: ['صيف', 'ربيع'] },
          { word: 'معطف', distractors: ['قبعة', 'حذاء'] },
        ],
      },
      {
        start: 'كتاب',
        end: 'مكتبة',
        hint: 'فكّر في القراءة وأماكن حفظ المعرفة.',
        steps: [
          { word: 'قراءة', distractors: ['طبخ', 'سباحة'] },
          { word: 'معرفة', distractors: ['ضوضاء', 'تعب'] },
          { word: 'رف', distractors: ['كرسي', 'نافذة'] },
        ],
      },
      {
        start: 'قهوة',
        end: 'نعاس',
        hint: 'فكّر في الطاقة والتركيز ثم ما يحدث عند زوالها.',
        steps: [
          { word: 'كافيين', distractors: ['سكر', 'ملح'] },
          { word: 'نشاط', distractors: ['كسل', 'حزن'] },
          { word: 'سهر', distractors: ['نزهة', 'رياضة'] },
        ],
      },
      {
        start: 'شمس',
        end: 'ظل',
        hint: 'فكّر في الضوء وما يسببه للأشياء.',
        steps: [
          { word: 'ضوء', distractors: ['صوت', 'رائحة'] },
          { word: 'حاجز', distractors: ['ماء', 'هواء'] },
        ],
      },
    ],
    en: [
      {
        start: 'Sea',
        end: 'Sheep',
        hint: 'Think of natural processes and what they produce.',
        steps: [
          { word: 'Steam', distractors: ['Salt', 'Wave'] },
          { word: 'Clouds', distractors: ['Sun', 'Wind'] },
          { word: 'Rain', distractors: ['Thunder', 'Lightning'] },
          { word: 'Grass', distractors: ['Stone', 'Sand'] },
        ],
      },
      {
        start: 'Ice',
        end: 'Heater',
        hint: 'Think of cold weather and how we deal with it.',
        steps: [
          { word: 'Cold', distractors: ['Heat', 'Dust'] },
          { word: 'Winter', distractors: ['Summer', 'Spring'] },
          { word: 'Coat', distractors: ['Socks', 'Hat'] },
        ],
      },
      {
        start: 'Book',
        end: 'Library',
        hint: 'Think of reading and storing knowledge.',
        steps: [
          { word: 'Reading', distractors: ['Cooking', 'Running'] },
          { word: 'Knowledge', distractors: ['Noise', 'Sleep'] },
          { word: 'Shelf', distractors: ['Door', 'Window'] },
        ],
      },
      {
        start: 'Coffee',
        end: 'Sleepiness',
        hint: 'Think of energy, focus, and what happens later.',
        steps: [
          { word: 'Caffeine', distractors: ['Sugar', 'Salt'] },
          { word: 'Alertness', distractors: ['Sadness', 'Boredom'] },
          { word: 'Late night', distractors: ['Picnic', 'Workout'] },
        ],
      },
      {
        start: 'Sun',
        end: 'Shadow',
        hint: 'Think of light and what it creates.',
        steps: [
          { word: 'Light', distractors: ['Sound', 'Smell'] },
          { word: 'Obstacle', distractors: ['Water', 'Air'] },
        ],
      },
    ],
  };

  const buildFallbackPuzzle = () => {
    const bank = isArabic ? fallbackTemplates.ar : fallbackTemplates.en;
    const template = bank[Math.floor(Math.random() * bank.length)];
    const { min, max } = expectedStepsMinMax(level);
    const cap = Math.max(1, Math.min(max, template.steps.length));
    const wanted = Math.min(cap, Math.max(min, 1) + Math.floor(Math.random() * (cap - Math.max(min, 1) + 1)));
    const steps = template.steps.slice(0, wanted);

    return {
      startWord: template.start,
      endWord: template.end,
      steps: steps.map((s) => ({
        word: s.word,
        options: [s.word, ...s.distractors].slice(0, 3).sort(() => Math.random() - 0.5),
      })),
      hint: template.hint,
      puzzleId: `fallback-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    };
  };

  const criticSystem = `You are a strict QA checker for word-connection puzzles.
Reject puzzles that feel random, illogical, or have weak/unclear links between consecutive words.
Return ONLY valid JSON: {"ok": boolean, "reason": string}.`;

  const callCritic = async (puzzle) => {
    const criticUser = `Language: ${isArabic ? 'Arabic' : 'English'}
Level: ${level}

Evaluate this puzzle JSON for logical coherence and fairness. Requirements:
- Each adjacent pair (start->step1, step_i->step_{i+1}, lastStep->end) must have a clear, defensible relationship.
- The overall chain must not feel random.
- Start and end should feel semantically distant but linkable.
- Each step must have exactly 3 options (1 correct + 2 plausible distractors), not random.

Puzzle JSON:
${JSON.stringify(puzzle)}

Return ONLY {"ok":true,"reason":"..."} or {"ok":false,"reason":"..."} with a short reason.`;

    const out = await callChat({
      messages: [
        { role: 'system', content: criticSystem },
        { role: 'user', content: criticUser },
      ],
      temperature: 0.2,
      purpose: 'critic',
    });

    try {
      const parsed = JSON.parse(out);
      if (typeof parsed?.ok === 'boolean') return { ok: parsed.ok, reason: String(parsed.reason ?? '') };
    } catch (_) {}
    return { ok: false, reason: 'critic_invalid_json' };
  };

  const enableCritic = String(env?.ENABLE_CRITIC ?? '') === '1';
  const maxAttempts = Math.max(1, Math.min(6, Number(env?.MAX_GEN_ATTEMPTS ?? 3)));

  let puzzle = null;
  let lastRaw = '';
  const candidates = [];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      lastRaw = await callChat({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
          ...(attempt === 0
            ? []
            : [
                {
                  role: 'user',
                  content:
                    'Previous output was weak/illogical or violated rules. Retry with a coherent, realistic chain and return JSON only.',
                },
              ]),
        ],
        temperature: 0.7,
        purpose: 'generate',
      });
    } catch (e) {
      // If the AI provider is unavailable (e.g. bad key), return a high-quality local fallback.
      return new Response(JSON.stringify(buildFallbackPuzzle()), {
        headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': 'fallback' },
        status: 200,
      });
    }

    try {
      puzzle = JSON.parse(lastRaw);
    } catch (_) {
      puzzle = null;
    }

    if (isBadPuzzle(puzzle)) {
      puzzle = null;
      continue;
    }

    const normalized = normalizePuzzle(puzzle);
    if (!normalized) {
      puzzle = null;
      continue;
    }

    // Normalize options to 3 so downstream clients are consistent
    normalized.steps = normalized.steps.map((s) => ({
      word: s.word,
      options: normalizeOptionsTo3({
        word: s.word,
        options: s.options,
        start: normalized.startWord,
        end: normalized.endWord,
      }),
    }));

    candidates.push(normalized);

    if (enableCritic) {
      const qa = await callCritic(normalized);
      if (qa.ok) {
        puzzle = normalized;
        break;
      }
    } else {
      puzzle = normalized;
      break;
    }

    puzzle = null;
  }

  // If critic rejects all candidates, return the best available candidate
  if (!puzzle && candidates.length > 0) {
    puzzle = candidates[0];
  }

  if (!puzzle) {
    return new Response(JSON.stringify({ error: 'NO_SAFE_PUZZLE', reason: 'failed_generation_or_quality_checks' }), {
      headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': generationProvider },
      status: 200,
    });
  }

  if (!puzzle.puzzleId) {
    puzzle.puzzleId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  const finalJson = JSON.stringify(puzzle);

  if (env.DB) {
    try {
      await env.DB.prepare('INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)')
        .bind(level, language, finalJson)
        .run();
    } catch (e) {
      console.log('Cache insert failed:', e);
    }
  }

  return new Response(finalJson, {
    headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': generationProvider },
  });
}

/** Validate a submitted solution against stored puzzle */
export async function submitSolution(request, env, headers) {
  const body = await request.json();
  const { language = 'ar', level = 1, steps, puzzleId } = body;
  if (!Array.isArray(steps) || steps.length === 0) {
    return errorResponse('Missing or invalid steps', 400);
  }

  let row;
  if (puzzleId) {
    row = await env.DB.prepare('SELECT json FROM puzzles WHERE level = ? AND lang = ? AND json LIKE ? LIMIT 1')
      .bind(Number(level), language, `%\"puzzleId\":\"${puzzleId}\"%`)
      .first();
  }
  if (!row) {
    row = await env.DB.prepare('SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY created_at DESC LIMIT 1')
      .bind(Number(level), language)
      .first();
  }
  if (!row) {
    return errorResponse('Puzzle not found', 404);
  }

  let puzzle;
  try {
    puzzle = JSON.parse(row.json);
  } catch (e) {
    return errorResponse('Corrupted puzzle data', 500);
  }

  const correctSteps = puzzle.steps.map((s) => s.word);
  const userSteps = steps.map((s) => (typeof s === 'object' ? s.word : s));
  const isCorrect = JSON.stringify(correctSteps) === JSON.stringify(userSteps);

  return jsonResponse({ success: true, correct: isCorrect, expected: correctSteps, provided: userSteps }, 200);
}
