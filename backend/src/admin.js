// admin.js – simple admin endpoints for managing stored puzzles
import { jsonResponse, errorResponse } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { generateLevel as generateLevelHandler } from './game.js';
import { normalizeChainPuzzleForClient } from './puzzle_normalize.js';
import { insertPuzzleIntoD1 } from './puzzle_db.js';

const IMPORT_MAX_BATCH = 500;

function normalizeAdminLang(v) {
  return v === 'en' || v === 'english' ? 'en' : 'ar';
}

/** Same expectations as Flutter solo validation: 4 options, word ∈ options. */
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

export async function listPuzzles(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const url = new URL(request.url);
    const level = url.searchParams.get('level');
    const lang = url.searchParams.get('lang');

    let q = 'SELECT id, level, lang, json, created_at FROM puzzles';
    const binds = [];
    const clauses = [];
    if (level) {
        clauses.push('level = ?');
        binds.push(Number(level));
    }
    if (lang) {
        clauses.push('lang = ?');
        binds.push(lang);
    }
    if (clauses.length) q += ' WHERE ' + clauses.join(' AND ');
    q += ' ORDER BY created_at DESC LIMIT 200';

    const rows = await env.DB.prepare(q).bind(...binds).all();
    const out = rows.results.map(r => ({ id: r.id, level: r.level, lang: r.lang, puzzle: JSON.parse(r.json), created_at: r.created_at }));
    return jsonResponse(out, 200);
}

export async function deletePuzzle(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const { id, puzzleId } = await request.json();
    if (!id && !puzzleId) return errorResponse('Missing id or puzzleId', 400);

    try {
        if (id) {
            await env.DB.prepare('DELETE FROM puzzles WHERE id = ?').bind(id).run();
        } else {
            await env.DB.prepare('DELETE FROM puzzles WHERE json LIKE ?').bind(`%"puzzleId":"${puzzleId}"%`).run();
        }
        return jsonResponse({ success: true }, 200);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function regeneratePuzzle(request, env, headers) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { level = 1, language = 'ar' } = body;

    // Delegate to existing generateLevel handler by constructing a Request
    const fakeReq = new Request('https://internal/generate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, language }),
    });

    return await generateLevelHandler(fakeReq, env, headers || {});
}

export async function generateBulkPuzzles(request, env, headers) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    return errorResponse(
        'Bulk Gemini generation is disabled. Insert puzzles into D1 (puzzles table) manually or via import.',
        503,
    );
}

/**
 * POST /admin/puzzles — insert one or many chain puzzles into D1 (user id 1 only).
 *
 * Body (choose one shape):
 * - { level, language|lang, puzzle: object|string }
 * - { level, language|lang, puzzles: object[] }
 * - { items: [ { level?, lang?, puzzle } ] }
 *
 * Optional: source (string, stored in puzzles.source)
 */
export async function importPuzzles(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);
  if (!env?.DB) return errorResponse('Database not configured', 500);

  let body = {};
  try {
    body = (await request.json()) || {};
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  const defaultLevel = Math.max(1, Math.min(100, Number(body.level) || 1));
  const defaultLang = normalizeAdminLang(body.language ?? body.lang ?? 'ar');
  const source = String(body.source || 'admin_import').slice(0, 32) || 'admin_import';

  /** @type {{ level: number, lang: string, puzzle: unknown }[]} */
  let puzzlesToInsert = [];

  if (Array.isArray(body.puzzles)) {
    puzzlesToInsert = body.puzzles.map((p) => ({
      level: defaultLevel,
      lang: defaultLang,
      puzzle: p,
    }));
  } else if (Array.isArray(body.items)) {
    for (const it of body.items) {
      if (!it || typeof it !== 'object') continue;
      puzzlesToInsert.push({
        level: Math.max(1, Math.min(100, Number(it.level) || defaultLevel)),
        lang: normalizeAdminLang(it.lang ?? it.language ?? defaultLang),
        puzzle: it.puzzle,
      });
    }
  } else if (body.puzzle != null) {
    puzzlesToInsert = [{ level: defaultLevel, lang: defaultLang, puzzle: body.puzzle }];
  } else {
    return errorResponse('Body needs puzzle, puzzles[], or items[]', 400);
  }

  if (puzzlesToInsert.length === 0) {
    return errorResponse('No puzzles to import', 400);
  }
  if (puzzlesToInsert.length > IMPORT_MAX_BATCH) {
    return errorResponse(`Max ${IMPORT_MAX_BATCH} puzzles per request`, 400);
  }

  const inserted = [];
  const duplicates = [];
  const failed = [];

  for (let idx = 0; idx < puzzlesToInsert.length; idx++) {
    const row = puzzlesToInsert[idx];
    let p = row.puzzle;
    if (typeof p === 'string') {
      try {
        p = JSON.parse(p);
      } catch {
        failed.push({ index: idx, err: 'invalid_json_string' });
        continue;
      }
    }
    if (!p || typeof p !== 'object') {
      failed.push({ index: idx, err: 'puzzle_not_object' });
      continue;
    }

    p = normalizeChainPuzzleForClient(p);

    if (!looksLikeSoloChainObject(p)) {
      failed.push({ index: idx, err: 'not_solo_chain_shape' });
      continue;
    }

    const stepErr = validateSoloChainSteps(p);
    if (stepErr) {
      failed.push({ index: idx, err: stepErr });
      continue;
    }

    const ins = await insertPuzzleIntoD1(env, {
      level: row.level,
      lang: row.lang,
      puzzle: p,
      source,
    });

    if (ins.ok) {
      inserted.push({
        index: idx,
        lastRowId: ins.lastRowId,
        level: row.level,
        lang: row.lang,
        mode: ins.mode,
      });
    } else if (ins.duplicate) {
      duplicates.push({ index: idx, err: ins.err || 'duplicate_question_hash' });
    } else {
      failed.push({ index: idx, err: ins.err || 'insert_failed' });
    }
  }

  return jsonResponse(
    {
      ok: true,
      inserted: inserted.length,
      duplicates: duplicates.length,
      failed: failed.length,
      insertedRows: inserted,
      duplicateRows: duplicates,
      failedRows: failed,
    },
    200,
  );
}
