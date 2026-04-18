// game_path.js — ألغاز المسارات (paths) من D1 فقط؛ لا Gemini / Workers AI.
import { jsonResponse, errorResponse } from './utils.js';

function isPathPuzzlePayload(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (!obj.startWord || !obj.endWord) return false;
  if (!Array.isArray(obj.paths) || obj.paths.length !== 4) return false;
  for (let i = 0; i < 4; i++) {
    const p = obj.paths[i];
    if (!p || !Array.isArray(p.steps) || p.steps.length !== 4) return false;
  }
  return true;
}

async function selectPathJsonRows(env, level, language, limit) {
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const lang = language === 'en' ? 'en' : 'ar';
  const lim = Math.max(1, Math.min(120, Number(limit) || 80));
  const out = await env.DB.prepare(
    `SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT ?`,
  )
    .bind(L, lang, lim)
    .all();
  return out?.results || [];
}

async function selectPathJsonRowsByLang(env, language, limit) {
  const lang = language === 'en' ? 'en' : 'ar';
  const lim = Math.max(1, Math.min(120, Number(limit) || 80));
  const out = await env.DB.prepare(
    `SELECT json FROM puzzles WHERE lang = ? ORDER BY RANDOM() LIMIT ?`,
  )
    .bind(lang, lim)
    .all();
  return out?.results || [];
}

function normalizePathPuzzle(raw, level, isArabic) {
  const puzzle = { ...raw, paths: raw.paths.map((p) => ({ ...p, steps: [...p.steps] })) };
  puzzle.paths = puzzle.paths.map((path, idx) => ({
    label: path.label || ['A', 'B', 'C', 'D'][idx],
    steps: path.steps,
    isCorrect: !!path.isCorrect,
    explanation: path.explanation || '',
  }));
  const correctCount = puzzle.paths.filter((p) => p.isCorrect).length;
  if (correctCount !== 1) {
    puzzle.paths.forEach((p, i) => {
      p.isCorrect = i === 0;
    });
  }
  return {
    startWord: puzzle.startWord,
    endWord: puzzle.endWord,
    paths: puzzle.paths,
    hint:
      puzzle.hint ||
      (isArabic ? 'فكر بشكل منطقي' : 'Think logically'),
    puzzleId: puzzle.puzzleId || `path_${level}_${Date.now()}`,
    level,
    source: 'd1',
  };
}

async function pickPathPuzzleFromD1(env, language, level) {
  const tryRows = async (rows) => {
    for (const row of rows) {
      try {
        const obj = JSON.parse(row.json);
        if (!isPathPuzzlePayload(obj)) continue;
        return normalizePathPuzzle(obj, level, language === 'ar');
      } catch {
        /* skip */
      }
    }
    return null;
  };

  let rows = await selectPathJsonRows(env, level, language, 80);
  let picked = await tryRows(rows);
  if (picked) return picked;

  rows = await selectPathJsonRowsByLang(env, language, 80);
  picked = await tryRows(rows);
  return picked;
}

/**
 * POST /api/generate-path — لغز مسارات من صف يحتوي `paths` (4 مسارات × 4 خطوات) في جدول puzzles.
 */
export async function generatePathLevel(request, env, headers) {
  let body = {};
  try {
    body = (await request.json()) || {};
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const language = body.language === 'en' ? 'en' : 'ar';
  const level = Math.max(1, Math.min(100, Number(body.level) || 1));
  const isArabic = language === 'ar';

  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }

  const puzzle = await pickPathPuzzleFromD1(env, language, level);
  if (!puzzle) {
    return jsonResponse(
      {
        error: 'EMPTY_BANK',
        reason:
          'No path puzzles in D1. Store JSON with startWord, endWord, paths[4].steps[4] in puzzles.',
      },
      404,
    );
  }

  if (!puzzle.puzzleId || String(puzzle.puzzleId).startsWith('path_')) {
    puzzle.puzzleId = `d1-path-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
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
