// solo_bank.js — ألغاز السولو من D1؛ تعبئة البنك عبر توليد خادم مُعطّلة.
import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { difficultyBandForLevel, insertPuzzleIntoD1 } from './puzzle_db.js';

export { difficultyBandForLevel } from './puzzle_db.js';

function buildUserKey(user, guestId) {
  if (user?.id) return `u:${Number(user.id)}`;
  const g = String(guestId ?? '').trim().slice(0, 80);
  if (g.length < 8) return null;
  return `g:${g}`;
}

/**
 * Fetch random puzzles for solo. No `difficulty` filter so D1 works before/without migration 0004.
 * If `solo_player_puzzles` is missing, retries without exclude-played subquery.
 */
async function selectPuzzleRows(env, { language, level, userKey, count, excludePlayed }) {
  let sql = `
    SELECT p.id, p.json
    FROM puzzles p
    WHERE p.lang = ?
      AND p.level = ?
  `;
  const binds = [language, level];
  if (excludePlayed) {
    sql += ` AND p.id NOT IN (
      SELECT puzzle_id FROM solo_player_puzzles
      WHERE user_key = ? AND level = ?
    )`;
    binds.push(userKey, level);
  }
  sql += ` ORDER BY RANDOM() LIMIT ?`;
  binds.push(count);
  try {
    const out = await env.DB.prepare(sql).bind(...binds).all();
    return out?.results || [];
  } catch (e) {
    if (excludePlayed) {
      console.warn('selectPuzzleRows: excludePlayed query failed, retrying without history:', e?.message || e);
      return selectPuzzleRows(env, { language, level, userKey, count, excludePlayed: false });
    }
    console.error('selectPuzzleRows failed:', e);
    return [];
  }
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
      userKey,
      count,
      excludePlayed: true,
    })) || [];

  if (rows.length < count) {
    rows = await selectPuzzleRows(env, {
      language,
      level,
      userKey,
      count,
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
        reason:
          'No puzzles in D1. Import rows into the puzzles table or use admin tools to add JSON.',
        puzzles: [],
        count: 0,
      },
      200,
      { 'X-Solo-Bank': 'empty' },
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

  try {
    const ins = env.DB.prepare(
      `INSERT OR IGNORE INTO solo_player_puzzles (user_key, puzzle_id, level) VALUES (?, ?, ?)`,
    );
    for (const r of rows) {
      if (r?.id != null) {
        await ins.bind(userKey, r.id, level).run();
      }
    }
  } catch (e) {
    console.warn('solo_player_puzzles insert skipped (table missing or error):', e?.message || e);
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

/** تعبئة البنك عبر Gemini مُعطّلة — أضف الألغاز إلى D1 يدوياً. */
export async function insertBankPuzzlesFromAi(env, headers, { level, language, count, source }) {
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const lang = language === 'en' ? 'en' : 'ar';
  const n = Math.min(200, Math.max(1, Number(count) || 1));
  const band = difficultyBandForLevel(L);
  return {
    inserted: 0,
    skipped: 0,
    level: L,
    language: lang,
    difficultyBand: band,
    requested: n,
    errors: [
      'AI_BANK_INSERT_DISABLED: add puzzle JSON rows to D1 (import / SQL / admin insert).',
    ],
  };
}

/**
 * Cron: كان يعبّئ البنك عبر Gemini — مُعطّل؛ عبّئ جدول puzzles في D1 يدوياً.
 */
export async function runAutoSoloBankTopUp(_env) {
  return {
    skipped: true,
    reason:
      'SOLO_BANK_AUTO: server-side AI bank refill is disabled. Populate D1 puzzles table directly.',
  };
}

/**
 * POST /solo-bank/generate — كان يولّد عبر Gemini؛ مُعطّل (503). عبّئ D1 يدوياً.
 */
export async function soloBankPublicGenerate(request, env, _headers, _ctx) {
  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }

  const webKey = String(env.SOLO_BANK_WEB_KEY || '').trim();
  if (webKey.length < 16) {
    return errorResponse('SOLO_BANK_WEB_KEY not set (min 16 chars)', 503);
  }

  const hdr = String(request.headers.get('X-Wonder-Solo-Key') || '').trim();
  if (hdr !== webKey) {
    return errorResponse('Forbidden', 403);
  }

  return errorResponse(
    'Web solo-bank AI generation is disabled. Add puzzles to D1 (puzzles table) via SQL or import.',
    503,
  );
}

/**
 * POST /admin/solo-bank/refill — user id 1 only.
 */
export async function refillSoloBank(request, env, _headers, _ctx) {
  const user = await getUserFromRequest(request, env);
  if (!user || Number(user.id) !== 1) {
    return errorResponse('Unauthorized', 401);
  }
  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }

  return errorResponse(
    'Solo bank AI refill is disabled. Populate D1 (puzzles table) manually or via import.',
    503,
  );
}

/**
 * GET /solo-bank/status?level=1&lang=ar — نفس حماية المفتاح للتحقق من عدد الصفوف في D1
 */
export async function soloBankPublicStatus(request, env) {
  if (!env?.DB) {
    return errorResponse('Database not configured', 500);
  }
  const webKey = String(env.SOLO_BANK_WEB_KEY || '').trim();
  if (webKey.length < 16) {
    return errorResponse('SOLO_BANK_WEB_KEY not set (min 16 chars)', 503);
  }
  const hdr = String(request.headers.get('X-Wonder-Solo-Key') || '').trim();
  if (hdr !== webKey) {
    return errorResponse('Forbidden', 403);
  }

  const u = new URL(request.url);
  const level = Math.max(1, Math.min(100, Number(u.searchParams.get('level')) || 1));
  const language = u.searchParams.get('lang') === 'en' ? 'en' : 'ar';

  const row = await env.DB
    .prepare(`SELECT COUNT(*) as c FROM puzzles WHERE level = ? AND lang = ?`)
    .bind(level, language)
    .first();
  const total = await env.DB.prepare(`SELECT COUNT(*) as c FROM puzzles`).first();

  return jsonResponse({
    ok: true,
    level,
    language,
    puzzlesAtLevelLang: Number(row?.c ?? 0),
    puzzlesTotal: Number(total?.c ?? 0),
  });
}
