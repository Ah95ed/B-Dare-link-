// solo_bank.js — D1-backed solo puzzles (AI only on Worker for refill/admin).
import { jsonResponse, errorResponse } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { generateLevel, puzzleJsonToQuestionKey } from './game.js';

/** Difficulty band 1..5 from game level (coarse ramp). */
export function difficultyBandForLevel(lv) {
  const L = Math.max(1, Number(lv) || 1);
  return Math.min(5, Math.max(1, Math.ceil(L / 10)));
}

function buildUserKey(user, guestId) {
  if (user?.id) return `u:${Number(user.id)}`;
  const g = String(guestId ?? '').trim().slice(0, 80);
  if (g.length < 8) return null;
  return `g:${g}`;
}

async function selectPuzzleRows(env, { language, level, band, userKey, count, useDifficulty, excludePlayed }) {
  let sql = `
    SELECT p.id, p.json
    FROM puzzles p
    WHERE p.lang = ?
      AND p.level = ?
  `;
  const binds = [language, level];
  if (useDifficulty) {
    sql += ` AND p.difficulty = ?`;
    binds.push(band);
  }
  if (excludePlayed) {
    sql += ` AND p.id NOT IN (
      SELECT puzzle_id FROM solo_player_puzzles
      WHERE user_key = ? AND level = ?
    )`;
    binds.push(userKey, level);
  }
  sql += ` ORDER BY RANDOM() LIMIT ?`;
  binds.push(count);
  const out = await env.DB.prepare(sql).bind(...binds).all();
  return out?.results || [];
}

/**
 * POST /api/solo/level-pack
 * Body: { language: 'ar'|'en', level: number, count?: number, guestId?: string }
 */
export async function getSoloLevelPack(request, env, headers) {
  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }

  let body = {};
  try {
    body = (await request.json()) || {};
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const language = body.language === 'en' ? 'en' : 'ar';
  const level = Math.max(1, Math.min(100, Number(body.level) || 1));
  const count = Math.min(100, Math.max(1, Number(body.count) || 5));
  const guestId = typeof body.guestId === 'string' ? body.guestId : '';

  const user = await getUserFromRequest(request, env);
  const userKey = buildUserKey(user, guestId);
  if (!userKey) {
    return errorResponse('guestId required (min 8 chars) for anonymous solo', 400);
  }

  const band = difficultyBandForLevel(level);
  let reusedHistory = false;

  let rows =
    (await selectPuzzleRows(env, {
      language,
      level,
      band,
      userKey,
      count,
      useDifficulty: true,
      excludePlayed: true,
    })) || [];

  if (rows.length < count) {
    rows = await selectPuzzleRows(env, {
      language,
      level,
      band,
      userKey,
      count,
      useDifficulty: false,
      excludePlayed: true,
    });
  }

  if (rows.length < count) {
    rows = await selectPuzzleRows(env, {
      language,
      level,
      band,
      userKey,
      count,
      useDifficulty: true,
      excludePlayed: false,
    });
    reusedHistory = rows.length > 0;
  }

  if (rows.length < count) {
    rows = await selectPuzzleRows(env, {
      language,
      level,
      band,
      userKey,
      count,
      useDifficulty: false,
      excludePlayed: false,
    });
    reusedHistory = rows.length > 0;
  }

  if (rows.length < count) {
    const any = await env.DB
      .prepare(
        `SELECT id, json FROM puzzles WHERE lang = ? ORDER BY RANDOM() LIMIT ?`,
      )
      .bind(language, count)
      .all();
    rows = any?.results || [];
    reusedHistory = true;
  }

  if (!rows.length) {
    return jsonResponse(
      {
        error: 'EMPTY_BANK',
        reason: 'No puzzles in D1. Admin: POST /admin/solo-bank/refill',
        puzzles: [],
        count: 0,
      },
      200,
    );
  }

  const puzzles = rows
    .map((r) => {
      try {
        return JSON.parse(r.json);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const ins = env.DB.prepare(
    `INSERT OR IGNORE INTO solo_player_puzzles (user_key, puzzle_id, level) VALUES (?, ?, ?)`,
  );
  for (const r of rows) {
    if (r?.id != null) {
      await ins.bind(userKey, r.id, level).run();
    }
  }

  return new Response(
    JSON.stringify({
      puzzles,
      count: puzzles.length,
      source: 'd1_bank',
      difficultyBand: band,
      reusedHistory,
    }),
    {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}

/**
 * POST /admin/solo-bank/refill — user id 1 only.
 */
export async function refillSoloBank(request, env, headers) {
  const user = await getUserFromRequest(request, env);
  if (!user || Number(user.id) !== 1) {
    return errorResponse('Unauthorized', 401);
  }
  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }

  let body = {};
  try {
    body = (await request.json()) || {};
  } catch {
    body = {};
  }

  const level = Math.max(1, Math.min(100, Number(body.level) || 1));
  const language = body.language === 'en' ? 'en' : 'ar';
  const count = Math.min(200, Math.max(1, Number(body.count) || 100));
  const band = difficultyBandForLevel(level);

  const url =
    typeof request.url === 'string'
      ? request.url
      : request.url?.toString?.() ?? 'https://internal/refill';

  let inserted = 0;
  let skipped = 0;
  const errors = [];

  for (let i = 0; i < count; i++) {
    const innerReq = new Request(url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({
        language,
        level,
        count: 1,
        source: 'ai',
        skipRecentSignatureDb: i > 0,
        soloBatchInner: true,
      }),
    });

    try {
      const res = await generateLevel(innerReq, env, headers);
      const puzzle = await res.json();
      if (!puzzle || puzzle.error) {
        errors.push(String(puzzle?.error || puzzle?.reason || 'gen_failed'));
        continue;
      }

      const qh = puzzleJsonToQuestionKey(puzzle);
      const jsonStr = JSON.stringify(puzzle);

      try {
        await env.DB
          .prepare(
            `INSERT INTO puzzles (level, lang, difficulty, question_hash, json, source)
             VALUES (?, ?, ?, ?, ?, ?)`,
          )
          .bind(level, language, band, qh || null, jsonStr, 'bank_refill')
          .run();
        inserted += 1;
      } catch (e) {
        const msg = String(e?.message || e);
        if (msg.includes('UNIQUE') || msg.includes('unique')) {
          skipped += 1;
        } else {
          errors.push(msg);
        }
      }
    } catch (e) {
      errors.push(String(e?.message || e));
    }
  }

  return jsonResponse({
    success: true,
    requested: count,
    inserted,
    skipped,
    level,
    language,
    difficultyBand: band,
    errors: errors.length ? errors.slice(0, 30) : undefined,
  });
}
