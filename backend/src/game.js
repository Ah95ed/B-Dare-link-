// game.js — ألغاز السلسلة من D1 فقط (لا توليد Gemini/OpenAI على الخادم لهذا المسار).
import { jsonResponse, errorResponse } from './utils.js';
import { normalizeChainPuzzleForClient } from './puzzle_normalize.js';

export function puzzleJsonToQuestionKey(puzzle) {
  const norm = (s) => String(s ?? '').trim().toLowerCase();
  const type = norm(puzzle?.type || 'logical_chain');
  const start = norm(puzzle?.startWord);
  const end = norm(puzzle?.endWord);
  if (!start || !end) return null;
  return `${type}|${start}|${end}`;
}

function exclusionSet(excludeQuestionKeys) {
  return new Set(
    (excludeQuestionKeys || [])
      .map((k) => String(k).trim().toLowerCase())
      .filter(Boolean),
  );
}

async function selectPuzzleJsonRows(env, level, language, limit) {
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const lang = language === 'en' ? 'en' : 'ar';
  const lim = Math.max(1, Math.min(120, Number(limit) || 80));
  const out = await env.DB
    .prepare(
      `SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT ?`,
    )
    .bind(L, lang, lim)
    .all();
  return out?.results || [];
}

async function selectPuzzleJsonRowsByLang(env, language, limit) {
  const lang = language === 'en' ? 'en' : 'ar';
  const lim = Math.max(1, Math.min(120, Number(limit) || 80));
  const out = await env.DB
    .prepare(`SELECT json FROM puzzles WHERE lang = ? ORDER BY RANDOM() LIMIT ?`)
    .bind(lang, lim)
    .all();
  return out?.results || [];
}

async function pickPuzzleObjectFromRows(rows, excl) {
  for (const row of rows) {
    try {
      const obj = JSON.parse(row.json);
      const qk = puzzleJsonToQuestionKey(obj);
      if (qk && excl.has(qk.toLowerCase())) continue;
      if (
        obj &&
        typeof obj === 'object' &&
        Array.isArray(obj.steps) &&
        obj.steps.length > 0
      ) {
        return obj;
      }
    } catch {
      /* skip bad row */
    }
  }
  return null;
}

/**
 * جلب لغز واحد جاهز من جدول puzzles (نفس فكرة بنك السولو).
 */
export async function fetchOneChainPuzzleFromD1(env, requestBody) {
  const { language = 'ar', level = 1, excludeQuestionKeys = [] } = requestBody || {};
  const excl = exclusionSet(excludeQuestionKeys);

  let rows = await selectPuzzleJsonRows(env, level, language, 80);
  let picked = await pickPuzzleObjectFromRows(rows, excl);
  if (picked) return normalizeChainPuzzleForClient(picked);

  rows = await selectPuzzleJsonRowsByLang(env, language, 80);
  picked = await pickPuzzleObjectFromRows(rows, excl);
  return picked ? normalizeChainPuzzleForClient(picked) : null;
}

/**
 * دفعة ألغاز لـ /generate-level عند count>1 — كل عنصر من D1.
 */
async function generateLevelBatch(request, env, headers, requestBody, batchCount) {
  const puzzles = [];
  const normKey = (k) => String(k ?? '').trim().toLowerCase();
  const excludes = new Set(
    Array.isArray(requestBody.excludeQuestionKeys)
      ? requestBody.excludeQuestionKeys.map(normKey).filter(Boolean)
      : [],
  );
  const url =
    typeof request.url === 'string'
      ? request.url
      : request.url?.toString?.() ?? 'https://internal/generate-level';

  for (let i = 0; i < batchCount; i++) {
    const innerBody = {
      ...requestBody,
      excludeQuestionKeys: [...excludes],
      count: 1,
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
    if (qk) excludes.add(qk.toLowerCase());
  }

  return new Response(JSON.stringify({ puzzles, count: puzzles.length }), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'X-Gen-Batch': String(puzzles.length),
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

/**
 * POST /generate-level — يعيد لغزاً عشوائياً من D1 فقط.
 * طلبات التعبئة القديمة (requireGemini) مُعطّلة.
 */
export async function generateLevel(request, env, headers) {
  const requestBody = (await request.json()) || {};
  const batchCount = Math.min(8, Math.max(1, Number(requestBody.count ?? 1)));
  if (batchCount > 1) {
    return await generateLevelBatch(request, env, headers, requestBody, batchCount);
  }

  const requireGeminiRaw = requestBody.requireGemini;
  const requireGeminiBool =
    requireGeminiRaw === true || String(requireGeminiRaw ?? '') === '1';
  if (requireGeminiBool) {
    return errorResponse(
      'توليد الذكاء الاصطناعي على الخادم مُعطّل. أضف الألغاز إلى D1 (استيراد/لوحة تحكم) ثم استخدم /generate-level أو /api/solo/level-pack.',
      503,
    );
  }

  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }

  let puzzle = await fetchOneChainPuzzleFromD1(env, requestBody);
  if (!puzzle) {
    return jsonResponse(
      {
        error: 'EMPTY_BANK',
        reason: 'No puzzles in D1 for this level and language.',
      },
      404,
    );
  }

  if (!puzzle.puzzleId) {
    puzzle.puzzleId = `d1-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  }

  return new Response(JSON.stringify(puzzle), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'X-Puzzle-Source': 'd1',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
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
    row = await env.DB
      .prepare(
        'SELECT json FROM puzzles WHERE level = ? AND lang = ? AND json LIKE ? LIMIT 1',
      )
      .bind(Number(level), language, `%\"puzzleId\":\"${puzzleId}\"%`)
      .first();
  }
  if (!row) {
    row = await env.DB
      .prepare(
        'SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY id DESC LIMIT 1',
      )
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

  const stepList = puzzle.steps || [];
  const correctSteps = stepList.map((s) =>
    String((s && (s.word ?? s.correctAnswer)) ?? '').trim(),
  );
  const userSteps = steps.map((s) =>
    String(typeof s === 'object' ? (s.word ?? s.correctAnswer ?? '') : s).trim(),
  );
  const isCorrect = JSON.stringify(correctSteps) === JSON.stringify(userSteps);

  return jsonResponse(
    { success: true, correct: isCorrect, expected: correctSteps, provided: userSteps },
    200,
  );
}
