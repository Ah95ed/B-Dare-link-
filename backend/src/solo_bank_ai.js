// solo_bank_ai.js — توليد ألغاز سلسلة السولو (logical_chain) عبر Gemini / Workers AI / OpenAI / Groq
import { linkChainMinMax } from './prompt.js';
import { normalizeChainPuzzleForClient } from './puzzle_normalize.js';
import { difficultyBandForLevel } from './puzzle_db.js';

function extractJsonObjectSubstring(text) {
  const s = String(text ?? '');
  const objStart = s.indexOf('{');
  const objEnd = s.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return s.slice(objStart, objEnd + 1);
  }
  return s.trim();
}

/**
 * يحاول إصلاح JSON الشائع الاعتلال من نماذج اللغة (أحرف تحكم غير مهربة داخل النصوص).
 */
function safeParseJsonFromModelOutput(rawText) {
  const cleaned0 = String(rawText ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const candidate0 = extractJsonObjectSubstring(cleaned0);

  const strategies = [
    (s) => s,
    (s) => s.replace(/\u2028|\u2029/g, ' '),
    (s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' '),
    (s) =>
      s
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim(),
  ];

  let lastErr = null;
  for (const prep of strategies) {
    for (const base of [candidate0, cleaned0]) {
      const s = prep(base);
      if (!s) continue;
      try {
        return JSON.parse(s);
      } catch (e) {
        lastErr = e;
      }
    }
  }
  throw lastErr ?? new Error('invalid_json');
}

function stripLatin(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[a-zA-Z]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripLatinFromChainPuzzle(p) {
  if (!p || typeof p !== 'object') return p;
  const out = { ...p };
  for (const f of ['startWord', 'endWord', 'hint', 'riddleText']) {
    if (typeof out[f] === 'string') out[f] = stripLatin(out[f]);
  }
  if (Array.isArray(out.steps)) {
    out.steps = out.steps.map((s) => {
      if (!s || typeof s !== 'object') return s;
      const step = { ...s };
      if (typeof step.word === 'string') step.word = stripLatin(step.word);
      if (typeof step.correctAnswer === 'string') {
        step.correctAnswer = stripLatin(step.correctAnswer);
      }
      if (typeof step.answer === 'string') step.answer = stripLatin(step.answer);
      if (Array.isArray(step.options)) {
        step.options = step.options
          .map((o) => stripLatin(String(o ?? '')))
          .filter(Boolean);
      }
      return step;
    });
  }
  return out;
}

function validateSoloChainSteps(puzzle) {
  const steps = puzzle?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return 'no_steps';
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    if (!st || typeof st !== 'object') return `bad_step_${i}`;
    const w = String(st.word ?? st.correctAnswer ?? st.answer ?? '').trim();
    const opts = Array.isArray(st.options) ? st.options.map((o) => String(o).trim()) : [];
    if (opts.length !== 4) return `step_${i}_need_4_options`;
    if (!w || !opts.includes(w)) return `step_${i}_word_not_in_options`;
  }
  return null;
}

function looksLikeSoloChainObject(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const ty = String(obj.type || 'logical_chain').toLowerCase();
  if (ty === 'quiz' || ty === 'spot_diff' || ty === 'spotdiff') return false;
  if (!Array.isArray(obj.steps) || obj.steps.length === 0) return false;
  const s = String(obj.startWord ?? obj.start ?? obj.from ?? '').trim();
  const e = String(obj.endWord ?? obj.end ?? obj.to ?? '').trim();
  return s.length > 0 && e.length > 0 && s !== e;
}

function buildSoloLogicalChainPrompts(language, level, forcedDifficulty, seed) {
  const lang = language === 'en' ? 'en' : 'ar';
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const { min, max } = linkChainMinMax(L);
  const band = difficultyBandForLevel(L);
  const diffHint =
    forcedDifficulty != null
      ? `حقل difficulty في JSON يجب أن يكون الرقم ${forcedDifficulty} بالضبط (1–5).`
      : `حقل difficulty رقم صحيح 1–5 يعكس صعوبة السلسلة (غالباً مناسب للمستوى ≈ ${band}).`;

  if (lang === 'ar') {
    return {
      system: `أنت مولّد ألغاز لعبة "الرابط العجيب" — نمط واحد فقط: logical_chain.
المخرجات: JSON صالح فقط بدون Markdown وبدون أي نص خارج JSON.

قواعد صارمة:
- المحتوى آمن ومناسب للعائلة.
- type يجب أن يكون بالضبط: "logical_chain".
- ممنوع: pathOptions، correctPathIndex، لغز_شعري، poetic_riddle، quiz.
- startWord و endWord كلمتان عربيتان مختلفتان وغير فارغتين.
- steps: مصفوفة بطول من ${min} إلى ${max} عنصرًا.
- كل عنصر في steps يحتوي:
  - "word": الكلمة الصحيحة للخطوة.
  - "options": مصفوفة بطول 4 بالضبط، وكل عنصر نص قصير، وتتضمن نفس نص "word" حرفيًا مرة واحدة.
  - يمكن إضافة "stepQuestion" اختياريًا (نص قصير).
- لا تكرر نفس كلمة (بعد تقليم المسافات) في: startWord + كل step.word + endWord.
- ${diffHint}
- أضف "hint" نصيًا قصيرًا مفيدًا.
- أضف "puzzleId" فريدًا نصيًا (مثلاً solo-ar-L${L}-...).`,
      user: `أنشئ لغز سلسلة جديدًا بالكامل. مستوى اللاعب في اللعبة: ${L}.
Seed: ${seed}
تأكد أن الخيارات الأربعة في كل خطوة مختلفة بعد تقليم المسافات، وأن الإجابة الصحيحة موجودة ضمنها.`,
    };
  }

  return {
    system: `You generate puzzles for "Wonder Link" — ONLY type "logical_chain".
Output: valid JSON only. No Markdown. No text outside JSON.

Strict rules:
- Family-safe content.
- type must be exactly "logical_chain".
- Forbidden: pathOptions, correctPathIndex, poetic_riddle, quiz, spot puzzles.
- startWord and endWord: two different non-empty English words.
- steps: array length between ${min} and ${max}.
- Each step must include:
  - "word": the correct intermediate word.
  - "options": array of exactly 4 short strings; must include "word" literally once.
  - optional "stepQuestion" short string.
- Do not repeat any normalized word across startWord + every step.word + endWord.
- ${forcedDifficulty != null ? `Field difficulty must be exactly the integer ${forcedDifficulty} (1–5).` : `Field difficulty is an integer 1–5 matching puzzle hardness (often ~${band} for this player level).`}
- Include a helpful short "hint".
- Include a unique string "puzzleId" (e.g. solo-en-L${L}-...).`,
    user: `Create one fresh chain puzzle. Player level in-game: ${L}.
Seed: ${seed}
Ensure 4 distinct options per step (after trim) and the correct word appears exactly once in options.`,
  };
}

async function callGeminiJson(env, systemPrompt, userPrompt, temperature) {
  const key = env.GEMINI_API_KEY;
  if (!key) return '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-2.0-flash';
  const modelPath = String(geminiModel).startsWith('models/')
    ? String(geminiModel)
    : `models/${geminiModel}`;
  const maxOut = Math.min(8192, Math.max(256, Number(env.GEMINI_MAX_OUTPUT_TOKENS) || 900));
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature,
        maxOutputTokens: maxOut,
      },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callWorkersAiJson(env, systemPrompt, userPrompt, temperature) {
  if (!env?.AI) return '';
  const aiModel = env.AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  const out = await env.AI.run(aiModel, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: Math.min(2048, Math.max(256, Number(env.GEMINI_MAX_OUTPUT_TOKENS) || 900)),
  });
  const text =
    out?.response ??
    out?.result ??
    out?.output_text ??
    out?.text ??
    (typeof out === 'string' ? out : JSON.stringify(out));
  return String(text || '');
}

async function callOpenAiJson(env, systemPrompt, userPrompt, temperature) {
  const openaiApiKey = env?.OPENAI_API_KEY;
  if (!openaiApiKey) return '';
  const openaiModel = env?.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`OpenAI Error: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callGroqJson(env, systemPrompt, userPrompt, temperature) {
  const groqApiKey = env?.GROQ_API_KEY;
  if (!groqApiKey) return '';
  const groqModel = env?.GROQ_MODEL || 'llama-3.1-8b-instant';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 1000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Groq Error: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function generateChainJsonText(env, language, level, forcedDifficulty, seed) {
  const { system, user } = buildSoloLogicalChainPrompts(language, level, forcedDifficulty, seed);
  const temp = Math.min(1, Math.max(0.2, Number(env.SOLO_BANK_AI_TEMPERATURE) || 0.55));

  let content = '';
  try {
    content = await callGeminiJson(env, system, user, temp);
  } catch (e) {
    console.warn('[solo_bank_ai] Gemini failed:', String(e?.message || e));
    content = '';
  }

  if (!content) {
    try {
      content = await callWorkersAiJson(env, system, user, temp);
    } catch (e) {
      console.warn('[solo_bank_ai] Workers AI failed:', String(e?.message || e));
      content = '';
    }
  }

  if (!content) {
    try {
      content = await callOpenAiJson(env, system, user, temp);
    } catch (e) {
      console.warn('[solo_bank_ai] OpenAI failed:', String(e?.message || e));
      content = '';
    }
  }

  if (!content) {
    try {
      content = await callGroqJson(env, system, user, temp);
    } catch (e) {
      console.warn('[solo_bank_ai] Groq failed:', String(e?.message || e));
      content = '';
    }
  }

  if (!content) {
    throw new Error('No AI provider returned content (configure GEMINI_API_KEY or others)');
  }

  return content;
}

function coerceLogicalChainAfterNormalize(p) {
  if (!p || typeof p !== 'object') return p;
  const out = { ...p };
  out.type = 'logical_chain';
  delete out.pathOptions;
  delete out.correctPathIndex;
  delete out.riddleText;
  return out;
}

/**
 * يولّد لغز سلسلة واحداً جاهزاً للإدراج في D1 (بعد التحقق والتطبيع).
 */
export async function generateOneSoloChainPuzzle(env, { level, language, difficulty = null }) {
  const lang = language === 'en' ? 'en' : 'ar';
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const forcedDifficulty = Number.isFinite(Number(difficulty))
    ? Math.max(1, Math.min(5, Number(difficulty)))
    : null;

  const maxAttempts = Math.min(
    8,
    Math.max(1, Number(env.SOLO_BANK_AI_PARSE_RETRIES) || 4),
  );

  let lastErr = 'unknown';
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const seed = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}_${attempt}`;
      const raw = await generateChainJsonText(env, lang, L, forcedDifficulty, seed);
      let parsed = safeParseJsonFromModelOutput(raw);
      if (lang === 'ar') {
        parsed = stripLatinFromChainPuzzle(parsed);
      }
      let p = normalizeChainPuzzleForClient(parsed);
      p = coerceLogicalChainAfterNormalize(p);

      if (!looksLikeSoloChainObject(p)) {
        throw new Error('AI output is not a valid solo chain puzzle shape');
      }

      const stepErr = validateSoloChainSteps(p);
      if (stepErr) {
        throw new Error(`AI puzzle failed validation: ${stepErr}`);
      }

      const band = difficultyBandForLevel(L);
      p.difficulty = forcedDifficulty ?? p.difficulty ?? band;
      if (!p.puzzleId) {
        p.puzzleId = `solo-ai-${L}-${lang}-${Date.now()}-${attempt}`;
      }

      return p;
    } catch (e) {
      lastErr = String(e?.message || e);
      console.warn(`[solo_bank_ai] attempt ${attempt + 1}/${maxAttempts} failed:`, lastErr);
    }
  }

  throw new Error(lastErr);
}
