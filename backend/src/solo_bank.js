// solo_bank.js — ألغاز السولو من D1؛ تعبئة عبر /solo-bank-tools + AI أو استيراد يدوي.
import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { difficultyBandForLevel, insertPuzzleIntoD1 } from './puzzle_db.js';
import { normalizeChainPuzzleForClient } from './puzzle_normalize.js';
import { generateOneSoloChainPuzzle } from './solo_bank_ai.js';

export { difficultyBandForLevel } from './puzzle_db.js';

function buildUserKey(user, guestId) {
  if (user?.id) return `u:${Number(user.id)}`;
  const g = String(guestId ?? '').trim().slice(0, 80);
  if (g.length < 8) return null;
  return `g:${g}`;
}

/** صفّ D1 مناسب لوضع السولو (سلسلة كلمات) — يتجاهل quiz وغيرها. */
function jsonLooksLikeSoloChainPuzzle(jsonStr) {
  try {
    const o = JSON.parse(jsonStr);
    const ty = String(o.type || 'logical_chain').toLowerCase();
    if (ty === 'quiz' || ty === 'spot_diff' || ty === 'spotdiff') return false;
    if (!Array.isArray(o.steps) || o.steps.length === 0) return false;
    const s = String(o.startWord ?? o.start ?? o.from ?? '').trim();
    const e = String(o.endWord ?? o.end ?? o.to ?? '').trim();
    return s.length > 0 && e.length > 0 && s !== e;
  } catch {
    return false;
  }
}

function dedupePuzzleRowsById(rows) {
  const out = [];
  const seen = new Set();
  for (const r of rows || []) {
    if (r?.id == null || seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

function parseBool(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'boolean') return value;
  const s = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(s)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(s)) return false;
  return fallback;
}

function parseDifficultyMaybe(value) {
  if (value == null || value === '' || value === 'auto') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 1 || n > 5) return null;
  return Math.floor(n);
}

function isDifficultyColumnError(err) {
  const msg = String(err?.message || err || '').toLowerCase();
  return msg.includes('difficulty') && (msg.includes('no such column') || msg.includes('does not exist'));
}

/**
 * Fetch random rows for solo, with optional difficulty if migration 0004 exists.
 * If `solo_player_puzzles` is missing, retries without exclude-played subquery.
 */
async function selectPuzzleRows(
  env,
  { language, level, userKey, count, excludePlayed, fetchLimit, difficulty = null },
) {
  const lim = Math.min(400, Math.max(1, Number(fetchLimit) || count));
  let sql = `
    SELECT p.id, p.json
    FROM puzzles p
    WHERE p.lang = ?
      AND p.level = ?
  `;
  const binds = [language, level];
  if (difficulty != null) {
    sql += ` AND p.difficulty = ?`;
    binds.push(difficulty);
  }
  if (excludePlayed) {
    sql += ` AND p.id NOT IN (
      SELECT puzzle_id FROM solo_player_puzzles
      WHERE user_key = ? AND level = ?
    )`;
    binds.push(userKey, level);
  }
  sql += ` ORDER BY RANDOM() LIMIT ?`;
  binds.push(lim);
  try {
    const out = await env.DB.prepare(sql).bind(...binds).all();
    return out?.results || [];
  } catch (e) {
    if (difficulty != null && isDifficultyColumnError(e)) {
      console.warn('selectPuzzleRows: difficulty column missing, retrying without difficulty filter');
      return selectPuzzleRows(env, {
        language,
        level,
        userKey,
        count,
        excludePlayed,
        fetchLimit: lim,
        difficulty: null,
      });
    }
    if (excludePlayed) {
      console.warn('selectPuzzleRows: excludePlayed query failed, retrying without history:', e?.message || e);
      return selectPuzzleRows(env, {
        language,
        level,
        userKey,
        count,
        excludePlayed: false,
        fetchLimit: lim,
        difficulty,
      });
    }
    console.error('selectPuzzleRows failed:', e);
    return [];
  }
}

async function selectByLanguageRows(env, { language, fetchLimit, difficulty = null }) {
  const lim = Math.min(400, Math.max(1, Number(fetchLimit) || 80));
  let sql = `SELECT id, json FROM puzzles WHERE lang = ?`;
  const binds = [language];
  if (difficulty != null) {
    sql += ` AND difficulty = ?`;
    binds.push(difficulty);
  }
  sql += ` ORDER BY RANDOM() LIMIT ?`;
  binds.push(lim);
  try {
    const out = await env.DB.prepare(sql).bind(...binds).all();
    return out?.results || [];
  } catch (e) {
    if (difficulty != null && isDifficultyColumnError(e)) {
      return selectByLanguageRows(env, { language, fetchLimit: lim, difficulty: null });
    }
    console.warn('selectByLanguageRows failed:', e?.message || e);
    return [];
  }
}

/**
 * POST /api/solo/level-pack
 * Body:
 * {
 *   language: 'ar'|'en',
 *   level: number,
 *   count?: number,
 *   guestId?: string,
 *   difficulty?: 1..5|'auto',
 *   strictLevelOnly?: boolean,    // true = لا fallback عبر كل المستويات
 *   allowHistoryReuse?: boolean,  // false = لا يُسمح بإرجاع ألغاز سبق لعبها لنفس المستوى
 *   includePlayed?: boolean,      // true = تجاهل سجل solo_player_puzzles
 *   fetchLimit?: number,          // 20..400
 *   details?: boolean,            // true = تضمين تفاصيل الاختيار في الرد
 * }
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
  const requestedDifficulty = parseDifficultyMaybe(body.difficulty);
  const strictLevelOnly = parseBool(body.strictLevelOnly, false);
  const allowHistoryReuse = parseBool(body.allowHistoryReuse, true);
  const includePlayed = parseBool(body.includePlayed, false);
  const details = parseBool(body.details, false);
  const fetchLimit = Math.min(
    400,
    Math.max(20, Number(body.fetchLimit) || Math.max(40, count * 15)),
  );

  const user = await getUserFromRequest(request, env);
  const userKey = buildUserKey(user, guestId);
  if (!userKey) {
    return errorResponse('guestId required (min 8 chars) for anonymous solo', 400);
  }

  const band = difficultyBandForLevel(level);
  const effectiveDifficulty = requestedDifficulty ?? band;
  let reusedHistory = false;

  let rows =
    (await selectPuzzleRows(env, {
      language,
      level,
      userKey,
      count,
      excludePlayed: !includePlayed,
      fetchLimit,
      difficulty: effectiveDifficulty,
    })) || [];

  if (allowHistoryReuse && rows.length < fetchLimit && !includePlayed) {
    const more =
      (await selectPuzzleRows(env, {
        language,
        level,
        userKey,
        count,
        excludePlayed: false,
        fetchLimit,
        difficulty: effectiveDifficulty,
      })) || [];
    rows = dedupePuzzleRowsById([...rows, ...more]);
    if (more.length) reusedHistory = true;
  }

  if (!strictLevelOnly && rows.length < fetchLimit) {
    const any = await selectByLanguageRows(env, {
      language,
      fetchLimit,
      difficulty: effectiveDifficulty,
    });
    rows = dedupePuzzleRowsById([...rows, ...any]);
    if (any.length) reusedHistory = true;
  }

  let chainRows = rows.filter((r) => r?.json && jsonLooksLikeSoloChainPuzzle(r.json));

  if (!strictLevelOnly && chainRows.length < count) {
    const extra = await selectByLanguageRows(env, {
      language,
      fetchLimit,
      difficulty: effectiveDifficulty,
    });
    chainRows = dedupePuzzleRowsById([...chainRows, ...extra]).filter((r) =>
      jsonLooksLikeSoloChainPuzzle(r.json),
    );
    if (extra.length) reusedHistory = true;
  }

  if (!chainRows.length) {
    return jsonResponse(
      {
        error: 'EMPTY_BANK',
        reason:
          'No matching chain puzzles in D1. Try reducing strict filters (difficulty/strictLevelOnly/history).',
        puzzles: [],
        count: 0,
        difficultyBand: band,
        requestedDifficulty,
        strictLevelOnly,
      },
      200,
      { 'X-Solo-Bank': 'empty' },
    );
  }

  const paired = [];
  for (const r of chainRows) {
    if (paired.length >= count) break;
    try {
      const puzzle = normalizeChainPuzzleForClient(JSON.parse(r.json));
      if (puzzle && Array.isArray(puzzle.steps) && puzzle.steps.length > 0) {
        paired.push({ row: r, puzzle });
      }
    } catch {
      /* skip */
    }
  }

  if (!paired.length) {
    return jsonResponse(
      {
        error: 'EMPTY_BANK',
        reason:
          'Chain-shaped rows in D1 could not be parsed. Check JSON syntax in puzzles.json.',
        puzzles: [],
        count: 0,
        difficultyBand: band,
        requestedDifficulty,
      },
      200,
      { 'X-Solo-Bank': 'empty' },
    );
  }

  const puzzles = paired.map((p) => p.puzzle);
  const rowsForHistory = paired.map((p) => p.row);

  if (!includePlayed) {
    try {
      const ins = env.DB.prepare(
        `INSERT OR IGNORE INTO solo_player_puzzles (user_key, puzzle_id, level) VALUES (?, ?, ?)`,
      );
      for (const r of rowsForHistory) {
        if (r?.id != null) {
          await ins.bind(userKey, r.id, level).run();
        }
      }
    } catch (e) {
      console.warn('solo_player_puzzles insert skipped (table missing or error):', e?.message || e);
    }
  }

  const responseBody = {
    puzzles,
    count: puzzles.length,
    source: 'd1_bank',
    difficultyBand: band,
    requestedDifficulty,
    strictLevelOnly,
    allowHistoryReuse,
    includePlayed,
    reusedHistory,
  };
  if (details) {
    responseBody.meta = {
      level,
      language,
      fetchLimit,
      initialRows: rows.length,
      chainRows: chainRows.length,
    };
  }

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
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
 * POST /solo-bank/generate — توليد لغز/ألغاز سلسلة عبر AI وحفظها في D1 (مفتاح SOLO_BANK_WEB_KEY).
 * صفحة /solo-bank-tools ترسل count متبقٍ؛ يُنفَّذ حتى SOLO_BANK_WEB_INSERT_PER_REQUEST محاولات لكل طلب.
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

  let body = {};
  try {
    body = (await request.json()) || {};
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const count = Math.min(500, Math.max(1, Number(body.count) || 1));
  const level = Math.max(1, Math.min(100, Number(body.level) || 1));
  const language = body.language === 'en' ? 'en' : 'ar';
  const difficulty = parseDifficultyMaybe(body.difficulty);
  const details = parseBool(body.details, false);

  const hasAi = !!(
    env.GEMINI_API_KEY ||
    env.AI ||
    env.OPENAI_API_KEY ||
    env.GROQ_API_KEY
  );
  if (!hasAi) {
    return errorResponse(
      'No AI provider configured. Set GEMINI_API_KEY (recommended) or OPENAI_API_KEY / GROQ_API_KEY, or bind Workers AI.',
      503,
    );
  }

  const perReq = Math.min(
    10,
    Math.max(
      1,
      Number(body.perRequest) || Number(env.SOLO_BANK_WEB_INSERT_PER_REQUEST) || 1,
    ),
  );
  const attempts = Math.min(count, perReq);

  let inserted = 0;
  let skipped = 0;
  /** @type {string[]} */
  const errors = [];

  for (let i = 0; i < attempts; i++) {
    try {
      const puzzle = await generateOneSoloChainPuzzle(env, {
        level,
        language,
        difficulty,
      });
      const ins = await insertPuzzleIntoD1(env, {
        level,
        lang: language,
        puzzle,
        source: 'solo_bank_web',
      });
      if (ins.ok) inserted += 1;
      else if (ins.duplicate) skipped += 1;
      else errors.push(String(ins.err || 'insert_failed'));
    } catch (e) {
      errors.push(String(e?.message || e));
    }
  }

  const success = inserted > 0 || skipped > 0;
  const remaining = success ? Math.max(0, count - attempts) : count;

  const out = {
    success,
    inserted,
    skipped,
    remaining,
    errors,
  };
  if (details) {
    out.config = {
      level,
      language,
      requestedDifficulty: difficulty,
      requestedCount: count,
      attempts,
      perRequest: perReq,
    };
  }
  return jsonResponse(out);
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
  const difficulty = parseDifficultyMaybe(u.searchParams.get('difficulty'));
  const details = parseBool(u.searchParams.get('details'), false);

  let row;
  if (difficulty != null) {
    try {
      row = await env.DB
        .prepare(
          `SELECT COUNT(*) as c FROM puzzles WHERE level = ? AND lang = ? AND difficulty = ?`,
        )
        .bind(level, language, difficulty)
        .first();
    } catch (e) {
      if (isDifficultyColumnError(e)) {
        row = await env.DB
          .prepare(`SELECT COUNT(*) as c FROM puzzles WHERE level = ? AND lang = ?`)
          .bind(level, language)
          .first();
      } else {
        throw e;
      }
    }
  } else {
    row = await env.DB
      .prepare(`SELECT COUNT(*) as c FROM puzzles WHERE level = ? AND lang = ?`)
      .bind(level, language)
      .first();
  }
  const total = await env.DB.prepare(`SELECT COUNT(*) as c FROM puzzles`).first();

  const out = {
    ok: true,
    level,
    language,
    requestedDifficulty: difficulty,
    puzzlesAtLevelLang: Number(row?.c ?? 0),
    puzzlesTotal: Number(total?.c ?? 0),
  };
  if (details) {
    out.note =
      difficulty == null
        ? 'status without difficulty filter'
        : 'status with difficulty filter (or fallback if difficulty column missing)';
  }
  return jsonResponse(out);
}
