// game.js - game logic handlers for the Worker
import { jsonResponse, errorResponse } from './utils.js';
import { buildSystemPrompt, buildUserPrompt, expectedStepsMinMax } from './prompt.js';

/** Aligns with client excludeQuestionKeys / buildQuestionSignature (type|start|end). */
export function puzzleJsonToQuestionKey(puzzle) {
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const type = norm(puzzle?.type || 'logical_chain');
  const start = norm(puzzle?.startWord);
  const end = norm(puzzle?.endWord);
  if (!start || !end) return null;
  return `${type}|${start}|${end}`;
}

/**
 * Solo fast-path: one HTTP round-trip from the app while generating N puzzles
 * sequentially on the Worker (avoids N mobile↔edge RTTs).
 */
async function generateLevelBatch(request, env, headers, requestBody, batchCount) {
  const puzzles = [];
  const normKey = (k) => String(k ?? '').trim().toLowerCase();
  const excludes = Array.isArray(requestBody.excludeQuestionKeys)
    ? requestBody.excludeQuestionKeys.map(normKey).filter(Boolean)
    : [];
  const url =
    typeof request.url === 'string'
      ? request.url
      : request.url?.toString?.() ?? 'https://internal/generate-level';

  for (let i = 0; i < batchCount; i++) {
    const innerBody = {
      ...requestBody,
      excludeQuestionKeys: [...new Set(excludes)],
      count: 1,
      // Inner solo-batch: skip repeated D1 scans + fewer AI retries (same RTT budget).
      skipRecentSignatureDb: i > 0,
      soloBatchInner: true,
    };
    const innerReq = new Request(url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(innerBody),
    });
    const res = await generateLevel(innerReq, env, headers);
    let puzzle;
    try {
      puzzle = await res.json();
    } catch {
      break;
    }
    if (!puzzle || typeof puzzle !== 'object' || puzzle.error) {
      break;
    }
    puzzles.push(puzzle);
    const qk = puzzleJsonToQuestionKey(puzzle);
    if (qk) excludes.push(qk);
  }

  return new Response(JSON.stringify({ puzzles, count: puzzles.length }), {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'X-Gen-Batch': String(puzzles.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
    status: 200,
  });
}

/** Generate a new puzzle level with strict logic and option quality checks */
export async function generateLevel(request, env, headers) {
  const requestBody = (await request.json()) || {};
  const batchCount = Math.min(8, Math.max(1, Number(requestBody.count ?? 1)));
  if (batchCount > 1) {
    return await generateLevelBatch(request, env, headers, requestBody, batchCount);
  }

  const {
    language = 'ar',
    level = 1,
    fresh = false,
    source = 'ai',
    excludeQuestionKeys = [],
    skipRecentSignatureDb = false,
    soloBatchInner = false,
  } = requestBody || {};
  const isArabic = language === 'ar';

  const groqApiKey = env?.GROQ_API_KEY;
  const groqModel = env?.GROQ_MODEL || 'llama-3.1-8b-instant';
  const aiModel = env?.AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  const openaiApiKey = env?.OPENAI_API_KEY;
  const openaiModel = env?.OPENAI_MODEL || 'gpt-4o-mini';
  const geminiApiKey = env?.GEMINI_API_KEY;
  const geminiModel = env?.GEMINI_MODEL || 'gemini-2.0-flash';

  // Keep generate-level compatible with chain gameplay UI.
  const forcedPuzzleType = 'logical_chain';
  const systemPrompt = buildSystemPrompt({ language, level, puzzleType: forcedPuzzleType });
  const seed = Math.floor(Math.random() * 10000);
  const userPrompt = buildUserPrompt({
    language,
    level,
    seed,
    puzzleType: forcedPuzzleType,
    excludeQuestionKeys,
  });
  let generationProvider = 'unknown';

  const normalize = (s) => String(s ?? '').trim().toLowerCase();
  const hasArabicLetters = (s) => /[\u0600-\u06FF]/.test(String(s ?? ''));

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
    'question',
    'answer',
    'chain',
    'level',
    'stage',
  ]);

  const fallbackWordBank = isArabic
    ? ['كتاب', 'قلم', 'نور', 'علم', 'باب', 'صوت', 'ورق', 'فكر', 'بحر', 'شمس']
    : ['book', 'pen', 'light', 'mind', 'door', 'sound', 'paper', 'idea', 'sea', 'sun'];

  const isCleanToken = (token) => {
    const value = String(token ?? '').trim();
    return Boolean(value) && !/[0-9_]/.test(value);
  };

  const tokenizeWords = (text) =>
    String(text ?? '')
      .split(/[\s,،.;:!?"'()\[\]{}\-—–_/\\|+]+/)
      .map((w) => normalize(w))
      .filter(Boolean)
      .filter((w) => isCleanToken(w));

  const normalizePuzzle = (puzzle) => {
    if (!puzzle || typeof puzzle !== 'object') return null;
    if (!Array.isArray(puzzle.steps)) return null;

    const startWord = (puzzle.startWord || '').trim();
    const endWord = (puzzle.endWord || '').trim();

    const steps = puzzle.steps
      .filter((s) => s && (typeof s.word === 'string' || typeof s.correctAnswer === 'string'))
      .map((s) => ({
        word: String(s.word || s.correctAnswer || '').trim(),
        stepQuestion: s.stepQuestion ? String(s.stepQuestion).trim() : undefined,
        options: Array.isArray(s.options) ? s.options.map((o) => String(o).trim()) : [],
      }))
      .filter((s) => s.word.length > 0);

    return {
      type: puzzle.type,
      difficulty: puzzle.difficulty,
      riddleText: typeof puzzle.riddleText === 'string' ? puzzle.riddleText.trim() : undefined,
      startWord,
      endWord,
      steps,
      pathOptions: Array.isArray(puzzle.pathOptions)
        ? puzzle.pathOptions.map((o) => String(o).trim()).filter(Boolean)
        : undefined,
      correctPathIndex:
        Number.isInteger(puzzle.correctPathIndex) && puzzle.correctPathIndex >= 0
          ? puzzle.correctPathIndex
          : undefined,
      hint: typeof puzzle.hint === 'string' ? puzzle.hint.trim() : '',
      puzzleId: typeof puzzle.puzzleId === 'string' ? puzzle.puzzleId : undefined,
    };
  };

  const buildPuzzleSignature = (p) => {
    const safe = normalizePuzzle(p);
    if (!safe) return '';
    const start = normalize(safe.startWord);
    const end = normalize(safe.endWord);
    const type = normalize(safe.type || 'logical_chain');
    const riddle = normalize(safe.riddleText || '');
    const stepQuestions = safe.steps
      .map((s) => normalize(s.stepQuestion || ''))
      .filter(Boolean)
      .join('>');
    const steps = safe.steps
      .map((s) => normalize(s.word))
      .filter(Boolean)
      .join('>');
    return `${language}|${Number(level)}|${type}|${start}|${steps}|${end}|${riddle}|${stepQuestions}`;
  };

  const buildQuestionSignature = (p) => {
    const safe = normalizePuzzle(p);
    if (!safe) return '';
    const type = normalize(safe.type || 'logical_chain');
    const start = normalize(safe.startWord);
    const end = normalize(safe.endWord);
    if (!start || !end) return '';
    return `${type}|${start}|${end}`;
  };

  const excludedQuestionSignatures = new Set(
    Array.isArray(excludeQuestionKeys)
      ? excludeQuestionKeys.map((k) => normalize(k)).filter(Boolean)
      : []
  );

  const normalizeOptionsTo4 = ({ word, options, start, end, pool = [], usedGlobal = new Set() }) => {
    const wNorm = normalize(word);
    const startNorm = normalize(start);
    const endNorm = normalize(end);

    let list = options.map((o) => String(o));
    if (!list.map(normalize).includes(wNorm)) {
      list.unshift(word);
    }

    const seen = new Set();
    list = list.filter((o) => {
      const n = normalize(o);
      if (!n) return false;
      if (startNorm && n === startNorm) return false;
      if (endNorm && n === endNorm) return false;
      if (bannedMeta.has(o) || bannedMeta.has(n)) return false;
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    });

    for (const candidate of pool) {
      if (list.length >= 4) break;
      const c = String(candidate);
      const cNorm = normalize(c);
      if (!cNorm || cNorm === wNorm) continue;
      if (startNorm && cNorm === startNorm) continue;
      if (endNorm && cNorm === endNorm) continue;
      if (bannedMeta.has(c) || bannedMeta.has(cNorm)) continue;
      if (seen.has(cNorm)) continue;
      if (usedGlobal.has(cNorm)) continue;
      seen.add(cNorm);
      list.push(c);
    }

    for (const candidate of pool) {
      if (list.length >= 4) break;
      const c = String(candidate);
      const cNorm = normalize(c);
      if (!cNorm || cNorm === wNorm) continue;
      if (startNorm && cNorm === startNorm) continue;
      if (endNorm && cNorm === endNorm) continue;
      if (bannedMeta.has(c) || bannedMeta.has(cNorm)) continue;
      if (seen.has(cNorm)) continue;
      seen.add(cNorm);
      list.push(c);
    }

    for (const fallback of fallbackWordBank) {
      if (list.length >= 4) break;
      const fNorm = normalize(fallback);
      if (!fNorm || seen.has(fNorm)) continue;
      if (startNorm && fNorm === startNorm) continue;
      if (endNorm && fNorm === endNorm) continue;
      seen.add(fNorm);
      list.push(fallback);
    }

    while (list.length < 4) {
      list.push(word);
    }

    if (list.length > 4) {
      const withCorrectFirst = [word, ...list.filter((o) => normalize(o) !== wNorm)];
      list = withCorrectFirst.slice(0, 4);
    }

    if (!list.map(normalize).includes(wNorm)) {
      list[list.length - 1] = word;
    }

    for (const option of list) {
      const oNorm = normalize(option);
      if (oNorm && oNorm !== wNorm) {
        usedGlobal.add(oNorm);
      }
    }

    return list;
  };

  const ensurePathOptions = (puzzle) => {
    if (!puzzle || !Array.isArray(puzzle.steps)) return puzzle;

    const chainWords = [
      String(puzzle.startWord || '').trim(),
      ...puzzle.steps.map((s) => String(s?.word || '').trim()),
      String(puzzle.endWord || '').trim(),
    ].filter(Boolean);

    const tokenPool = [
      ...chainWords,
      ...puzzle.steps.flatMap((s) => (Array.isArray(s?.options) ? s.options : [])),
    ]
      .flatMap((t) => tokenizeWords(t))
      .filter((t) => t && !bannedMeta.has(t) && isCleanToken(t));

    const chooseWord = (exclude = new Set()) => {
      for (const token of tokenPool.sort(() => Math.random() - 0.5)) {
        if (!exclude.has(token)) return token;
      }
      for (const token of fallbackWordBank) {
        if (!exclude.has(normalize(token)) && !bannedMeta.has(normalize(token))) {
          return token;
        }
      }
      return fallbackWordBank[0];
    };

    const buildPhrase = (seedWords) => {
      const words = [];
      const seen = new Set();
      for (const raw of seedWords) {
        const n = normalize(raw);
        if (!n || seen.has(n) || bannedMeta.has(n) || !isCleanToken(n)) continue;
        seen.add(n);
        words.push(String(raw).trim());
        if (words.length >= 4) break;
      }
      while (words.length < 4) {
        const next = chooseWord(new Set(words.map(normalize)));
        const n = normalize(next);
        if (!n || seen.has(n) || bannedMeta.has(n) || !isCleanToken(n)) continue;
        seen.add(n);
        words.push(next);
      }
      return words.slice(0, 4).join(' ');
    };

    const correctPath = buildPhrase(chainWords.length >= 4 ? chainWords.slice(0, 4) : chainWords);

    const pathOptions = [correctPath];
    let guard = 0;
    while (pathOptions.length < 4 && guard < 40) {
      guard += 1;
      const seeds = tokenPool.sort(() => Math.random() - 0.5).slice(0, 4);
      const candidate = buildPhrase(seeds);
      const cNorm = normalize(candidate);
      if (!cNorm) continue;
      if (pathOptions.map(normalize).includes(cNorm)) continue;
      pathOptions.push(candidate);
    }

    while (pathOptions.length < 4) {
      pathOptions.push(buildPhrase([fallbackWordBank[pathOptions.length % fallbackWordBank.length]]));
    }

    const shuffled = pathOptions.sort(() => Math.random() - 0.5);
    const correctPathIndex = shuffled.findIndex((o) => normalize(o) === normalize(correctPath));

    return {
      ...puzzle,
      pathOptions: shuffled,
      correctPathIndex: correctPathIndex >= 0 ? correctPathIndex : 0,
    };
  };

  const isBadPuzzle = (puzzle) => {
    const p = normalizePuzzle(puzzle);
    if (!p) return true;
    if (p.steps.length === 0) return true;

    const start = p.startWord || '';
    const end = p.endWord || '';

    // Allow empty start/end if type is poetic_riddle or لغز_شعري
    const isPoetic = p.type === 'لغز_شعري' || p.type === 'poetic_riddle';

    if (!isPoetic) {
      if (!start || !end) return true;
      if (normalize(start) === normalize(end)) return true;
      if (bannedMeta.has(start) || bannedMeta.has(end) || bannedMeta.has(normalize(start)) || bannedMeta.has(normalize(end))) {
        return true;
      }
      // Temporarily disabled for testing - language validation
      // if (isArabic && start && end) {
      //   if (!hasArabicLetters(start) || !hasArabicLetters(end)) return true;
      // }
      // if (!isArabic && start && end) {
      //   if (hasArabicLetters(start) && hasArabicLetters(end)) return true;
      // }
    }

    if (!isPoetic) {
      const { min, max } = expectedStepsMinMax(level);
      if (p.steps.length < min || p.steps.length > max) return true;
    }

    // Reject duplicates across the whole chain (case/space-insensitive)
    const chainWords = [start, ...p.steps.map((s) => s.word), end].map(normalize).filter(Boolean);
    if (new Set(chainWords).size !== chainWords.length) return true;

    // Reject duplicate questions within the same puzzle.
    const questionTexts = p.steps
      .map((s) => normalize(s.stepQuestion || ''))
      .filter(Boolean);
    if (questionTexts.length > 0 && new Set(questionTexts).size !== questionTexts.length) return true;

    // Reject repeated option phrases/words across the puzzle (strict mode).
    const seenOptionPhrases = new Set();
    const seenOptionWords = new Set();

    for (const s of p.steps) {
      const w = s.word.trim();
      if (!w) return true;
      if (bannedMeta.has(w) || bannedMeta.has(normalize(w))) return true;
      // Temporarily disabled for testing
      // if (isArabic && w && !hasArabicLetters(w) && /[a-zA-Z]/.test(w)) return true;
      // if (!isArabic && w && hasArabicLetters(w)) return true;
      if (!Array.isArray(s.options) || s.options.length < 3) return true;

      const normalizedOptions = normalizeOptionsTo4({
        word: w,
        options: s.options,
        start,
        end,
      });

      const optionsNorm = normalizedOptions.map(normalize);
      if (!optionsNorm.includes(normalize(w))) return true;
      if (new Set(optionsNorm).size < 4) return true; // Exactly 4 unique options required

      for (const optionText of normalizedOptions) {
        const phrase = normalize(optionText);
        if (!phrase) return true;
        if (seenOptionPhrases.has(phrase)) return true;
        seenOptionPhrases.add(phrase);

        const words = tokenizeWords(optionText);
        if (words.length === 0) return true;
        if (new Set(words).size !== words.length) return true; // no repeated word inside option

        for (const token of words) {
          if (bannedMeta.has(token)) return true;
          if (seenOptionWords.has(token)) return true;
          seenOptionWords.add(token);
        }
      }
    }

    return false;
  };

  const bankMin = Math.max(0, Number(env?.PUZZLE_BANK_MIN ?? 1));

  const buildDatabaseFallback = () => {
    const simple = isArabic
      ? {
        start: '\u0643\u062a\u0627\u0628',
        end: '\u0645\u0643\u062a\u0628\u0629',
        hint: '\u0627\u0633\u062a\u0639\u0645\u0644 \u0633\u0644\u0633\u0644\u0629 \u0628\u0633\u064a\u0637\u0629 \u0644\u0644\u0631\u0628\u0637 \u0628\u064a\u0646 \u0627\u0644\u0628\u062f\u0627\u064a\u0629 \u0648\u0627\u0644\u0646\u0647\u0627\u064a\u0629.',
        steps: [
          { word: '\u0642\u0631\u0627\u0621\u0629', options: ['\u0642\u0631\u0627\u0621\u0629', '\u0637\u0628\u062e', '\u0631\u064a\u0627\u0636\u0629', '\u062a\u0633\u0648\u0642'] },
          { word: '\u0645\u0639\u0631\u0641\u0629', options: ['\u0645\u0639\u0631\u0641\u0629', '\u0636\u0648\u0636\u0627\u0621', '\u0625\u0632\u0639\u0627\u062c', '\u062a\u0639\u0628'] },
        ],
      }
      : {
        start: 'Book',
        end: 'Library',
        hint: 'Use a simple logical chain from start to end.',
        steps: [
          { word: 'Reading', options: ['Reading', 'Cooking', 'Running', 'Dancing'] },
          { word: 'Knowledge', options: ['Knowledge', 'Noise', 'Fatigue', 'Confusion'] },
        ],
      };

    const fallback = {
      type: forcedPuzzleType,
      startWord: simple.start,
      endWord: simple.end,
      steps: simple.steps.map((s) => ({
        word: s.word,
        options: normalizeOptionsTo4({
          word: s.word,
          options: s.options,
          start: simple.start,
          end: simple.end,
        }).sort(() => Math.random() - 0.5),
      })),
      hint: simple.hint,
      puzzleId: `db-fallback-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    };

    return ensurePathOptions(fallback);
  };

  // Do not serve cached puzzles for gameplay generation.
  // Every request should be a fresh puzzle so questions do not repeat between stages.

  const callChat = async ({ messages, temperature, purpose }) => {
    // Prefer Gemini if configured
    if (geminiApiKey) {
      if (purpose === 'generate') generationProvider = 'gemini';

      const systemMsg = messages.find((m) => m.role === 'system')?.content;
      const userMsg = messages.find((m) => m.role === 'user')?.content;

      const parts = [];
      if (systemMsg) parts.push({ text: systemMsg });
      if (userMsg) parts.push({ text: userMsg });

      // Short JSON chains rarely need >~900 tokens; lower caps reduce latency and cost.
      const maxOut =
        purpose === 'critic'
          ? Math.max(64, Math.min(512, Number(env?.GEMINI_MAX_OUTPUT_CRITIC_TOKENS ?? 256)))
          : Math.max(400, Math.min(2048, Number(env?.GEMINI_MAX_OUTPUT_TOKENS ?? 900)));

      const bodyPayload = {
        contents: [{ parts }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxOut,
        }
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        const err = new Error(`gemini_http_${response.status}`);
        err.details = text;
        throw err;
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return String(content).replace(/```json/g, '').replace(/```/g, '').trim();
    }

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

    const pool = [template.start, template.end, ...steps.map((s) => s.word), ...steps.flatMap((s) => s.distractors)].filter(Boolean);

    const fallback = {
      type: forcedPuzzleType,
      startWord: template.start,
      endWord: template.end,
      steps: steps.map((s) => ({
        word: s.word,
        options: normalizeOptionsTo4({
          word: s.word,
          options: [s.word, ...s.distractors],
          start: template.start,
          end: template.end,
          pool,
        }).sort(() => Math.random() - 0.5),
      })),
      hint: template.hint,
      puzzleId: `fallback-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
    };

    return ensurePathOptions(fallback);
  };

  const buildUniqueFallbackPuzzle = (requestQuestionSignatures) => {
    const buildSyntheticUniqueFallback = (attemptOffset = 0) => {
      const modifiers = isArabic
        ? ['سريع', 'هادئ', 'لامع', 'عميق', 'دافئ', 'قوي', 'خفيف', 'قديم']
        : ['swift', 'calm', 'bright', 'deep', 'warm', 'strong', 'light', 'ancient'];

      const nouns = fallbackWordBank;
      const nLen = nouns.length;
      const mLen = modifiers.length;

      const startBase = nouns[attemptOffset % nLen];
      const endBase = nouns[(attemptOffset * 3 + 2) % nLen];
      const midOne = nouns[(attemptOffset * 5 + 3) % nLen];
      const midTwo = nouns[(attemptOffset * 7 + 4) % nLen];

      const startWord = `${modifiers[attemptOffset % mLen]} ${startBase}`;
      const endWord = `${modifiers[(attemptOffset + 3) % mLen]} ${endBase}`;
      const stepOneWord = `${modifiers[(attemptOffset + 1) % mLen]} ${midOne}`;
      const stepTwoWord = `${modifiers[(attemptOffset + 2) % mLen]} ${midTwo}`;

      const pool = [
        startWord,
        endWord,
        stepOneWord,
        stepTwoWord,
        ...nouns,
      ].filter(Boolean);

      const synthetic = {
        type: forcedPuzzleType,
        startWord,
        endWord,
        steps: [
          {
            word: stepOneWord,
            options: normalizeOptionsTo4({
              word: stepOneWord,
              options: [stepOneWord, ...nouns.slice(0, 3)],
              start: startWord,
              end: endWord,
              pool,
            }).sort(() => Math.random() - 0.5),
          },
          {
            word: stepTwoWord,
            options: normalizeOptionsTo4({
              word: stepTwoWord,
              options: [stepTwoWord, ...nouns.slice(3, 6)],
              start: startWord,
              end: endWord,
              pool,
            }).sort(() => Math.random() - 0.5),
          },
        ],
        hint: isArabic
          ? 'اربط الكلمات عبر علاقة مفهومية واضحة.'
          : 'Connect the words through a clear conceptual relation.',
        puzzleId: `fallback-synthetic-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      };

      return ensurePathOptions(synthetic);
    };

    for (let i = 0; i < 40; i++) {
      const candidate = buildFallbackPuzzle();
      const qSig = buildQuestionSignature(candidate);
      if (!qSig) continue;
      if (excludedQuestionSignatures.has(qSig) || requestQuestionSignatures.has(qSig)) {
        continue;
      }
      requestQuestionSignatures.add(qSig);
      candidate.questionKey = qSig;
      return candidate;
    }

    for (let i = 0; i < 300; i++) {
      const candidate = buildSyntheticUniqueFallback(i);
      const qSig = buildQuestionSignature(candidate);
      if (!qSig) continue;
      if (excludedQuestionSignatures.has(qSig) || requestQuestionSignatures.has(qSig)) {
        continue;
      }
      requestQuestionSignatures.add(qSig);
      candidate.questionKey = qSig;
      return candidate;
    }

    // Absolute last resort when all synthetic combinations are exhausted.
    const forced = buildSyntheticUniqueFallback(Math.floor(Math.random() * 10000));
    const forcedQSig = buildQuestionSignature(forced);
    if (forcedQSig) {
      requestQuestionSignatures.add(forcedQSig);
      forced.questionKey = forcedQSig;
    }
    return forced;
  };

  const criticSystem = `You are a strict QA checker for word-connection puzzles.
Reject puzzles that feel random, illogical, or have weak/unclear links between consecutive words.
Return ONLY valid JSON: {"ok": boolean, "reason": string}.`;

  const callCritic = async (puzzle) => {
    const isPoetic = puzzle.type === 'لغز_شعري' || puzzle.type === 'poetic_riddle';
    const criticUser = `Language: ${isArabic ? 'Arabic' : 'English'}
Level: ${level}

Evaluate this puzzle JSON for logical coherence and fairness. Requirements:
${isPoetic ? '- It is a poetic riddle. Ensure the riddle text is metaphorical and accurately describes the entity to guess.\n- Each step should have exactly 4 options (1 correct + 3 plausible distractors).' : '- Each adjacent pair (start->step1, step_i->step_{i+1}, lastStep->end) must have a clear, defensible relationship.\n- The overall chain must not feel random.\n- Start and end should feel semantically distant but linkable.\n- Each step must have exactly 4 options (1 correct + 3 plausible distractors), not random.'}

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
    } catch (_) { }
    return { ok: false, reason: 'critic_invalid_json' };
  };

  const enableCritic = String(env?.ENABLE_CRITIC ?? '') === '1';
  const maxAttempts = soloBatchInner
    ? Math.max(1, Math.min(8, Number(env?.MAX_GEN_ATTEMPTS_INNER ?? 4)))
    : Math.max(1, Math.min(12, Number(env?.MAX_GEN_ATTEMPTS ?? 6)));

  // Prevent repeats by loading recent signatures for this level/language.
  const recentSignatures = new Set();
  const recentLimit = Math.max(
    40,
    Math.min(400, Number(env?.PUZZLE_RECENT_SIGNATURE_LIMIT ?? 120)),
  );
  if (env.DB && !skipRecentSignatureDb) {
    try {
      const recentRows = await env.DB
        .prepare(
          'SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY created_at DESC LIMIT ?',
        )
        .bind(Number(level), language, recentLimit)
        .all();
      for (const row of recentRows?.results || []) {
        try {
          const parsed = JSON.parse(row.json);
          const sig = buildPuzzleSignature(parsed);
          if (sig) recentSignatures.add(sig);
        } catch (_) {
          // Ignore corrupted historical rows.
        }
      }
    } catch (e) {
      console.log('Recent signatures load failed:', e);
    }
  }

  // Also block duplicates inside the same request.
  const requestSignatures = new Set();
  const requestQuestionSignatures = new Set();

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
                  'Previous output was weak/illogical/duplicate or violated rules. Retry with a NEW coherent chain and return JSON only.',
              },
            ]),
        ],
        temperature: 0.7,
        purpose: 'generate',
      });
    } catch (e) {
      console.error('Generation Error:', e);
      // If the AI provider is unavailable (e.g. bad key), return a high-quality local fallback.
      const fallback = buildUniqueFallbackPuzzle(requestQuestionSignatures);
      fallback.debugError = e.message;
      if (e.details) fallback.debugDetails = e.details;

      return new Response(JSON.stringify(fallback), {
        headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': 'fallback' },
        status: 200,
      });
    }

    try {
      const parsed = JSON.parse(lastRaw);
      if (isBadPuzzle(parsed)) {
        if (attempt === maxAttempts - 1) {
          // All generation attempts failed. Fall back.
          const fallback = buildUniqueFallbackPuzzle(requestQuestionSignatures);
          fallback.debugError = 'NO_SAFE_PUZZLE - failed_generation_or_quality_checks';
          fallback.lastRaw = lastRaw;
          return new Response(JSON.stringify(fallback), {
            headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': 'fallback' },
            status: 200,
          });
        }
        puzzle = null;
        continue;
      }
      puzzle = parsed;
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

    // Build a global pool to improve distractor quality and reduce repetition.
    const globalOptionPool = [
      normalized.startWord,
      normalized.endWord,
      ...normalized.steps.map((s) => s.word),
      ...normalized.steps.flatMap((s) => s.options || []),
    ].filter(Boolean);
    const usedDistractorsGlobal = new Set();

    // Normalize options to 4 so downstream clients are consistent
    normalized.steps = normalized.steps.map((s) => ({
      word: s.word,
      stepQuestion: s.stepQuestion,
      options: normalizeOptionsTo4({
        word: s.word,
        options: s.options,
        start: normalized.startWord,
        end: normalized.endWord,
        pool: globalOptionPool,
        usedGlobal: usedDistractorsGlobal,
      }),
    }));
    const enrichedNormalized = ensurePathOptions(normalized);

    const signatureKey = buildPuzzleSignature(enrichedNormalized);
    if (!signatureKey || recentSignatures.has(signatureKey) || requestSignatures.has(signatureKey)) {
      puzzle = null;
      continue;
    }

    const questionSignature = buildQuestionSignature(enrichedNormalized);
    if (
      !questionSignature ||
      excludedQuestionSignatures.has(questionSignature) ||
      requestQuestionSignatures.has(questionSignature)
    ) {
      puzzle = null;
      continue;
    }

    requestSignatures.add(signatureKey);
    requestQuestionSignatures.add(questionSignature);
    enrichedNormalized.signatureKey = signatureKey;
    enrichedNormalized.questionKey = questionSignature;

    candidates.push(enrichedNormalized);

    if (enableCritic) {
      const qa = await callCritic(enrichedNormalized);
      if (qa.ok) {
        puzzle = enrichedNormalized;
        break;
      }
    } else {
      puzzle = enrichedNormalized;
      break;
    }

    puzzle = null;
  }

  // If critic rejects all candidates, return the best available candidate
  if (!puzzle && candidates.length > 0) {
    puzzle = candidates[0];
  }

  if (!puzzle) {
    return new Response(JSON.stringify({
      error: 'NO_SAFE_PUZZLE',
      reason: 'failed_generation_or_quality_checks',
      debugLastRaw: lastRaw
    }), {
      headers: { ...headers, 'Content-Type': 'application/json', 'X-AI-Provider': generationProvider },
      status: 200,
    });
  }

  if (!puzzle.puzzleId) {
    puzzle.puzzleId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  if (!puzzle.signatureKey) {
    puzzle.signatureKey = buildPuzzleSignature(puzzle);
  }

  puzzle = ensurePathOptions(puzzle);

  const finalJson = JSON.stringify(puzzle);

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
