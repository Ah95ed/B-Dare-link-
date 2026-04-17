// puzzle_db.js — single D1 insert path for puzzles (extended schema + legacy fallback).
import { puzzleJsonToQuestionKey } from './game.js';

export function difficultyBandForLevel(lv) {
  const L = Math.max(1, Number(lv) || 1);
  return Math.min(5, Math.max(1, Math.ceil(L / 10)));
}

function normalizeLang(lang) {
  return lang === 'en' ? 'en' : 'ar';
}

/**
 * Insert one puzzle row. Tries full columns (migration 0004); on schema mismatch uses legacy (level, lang, json).
 * @param {object} opts
 * @param {number} opts.level
 * @param {string} opts.lang - 'ar' | 'en'
 * @param {object|string} opts.puzzle - object or JSON string
 * @param {string} [opts.source]
 * @returns {Promise<{ ok: boolean, mode?: string, duplicate?: boolean, err?: string, lastRowId?: number }>}
 */
export async function insertPuzzleIntoD1(env, { level, lang, puzzle, source = 'api' }) {
  if (!env?.DB) {
    return { ok: false, err: 'Database not configured' };
  }

  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const language = normalizeLang(lang);
  const band = difficultyBandForLevel(L);
  const src = String(source || 'api').slice(0, 32) || 'api';

  let jsonStr;
  let obj;
  try {
    if (typeof puzzle === 'string') {
      jsonStr = puzzle;
      obj = JSON.parse(puzzle);
    } else {
      obj = puzzle;
      jsonStr = JSON.stringify(puzzle);
    }
  } catch (e) {
    return { ok: false, err: `invalid_puzzle_json: ${e?.message || e}` };
  }

  const questionHash = puzzleJsonToQuestionKey(obj);

  try {
    const r = await env.DB
      .prepare(
        `INSERT INTO puzzles (level, lang, difficulty, question_hash, json, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(L, language, band, questionHash || null, jsonStr, src)
      .run();
    return { ok: true, mode: 'full', lastRowId: r.meta?.last_row_id };
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes('UNIQUE') || msg.includes('unique')) {
      return { ok: false, duplicate: true, err: msg };
    }
    const schemaMismatch =
      msg.includes('no such column') ||
      msg.includes('does not exist') ||
      /SQLITE_ERROR.*difficulty/i.test(msg);
    if (schemaMismatch) {
      try {
        const r = await env.DB
          .prepare(`INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)`)
          .bind(L, language, jsonStr)
          .run();
        console.warn(
          'insertPuzzleIntoD1: legacy (level,lang,json) — run migration 0004 or scripts/d1_solo_bank_patch.sql',
        );
        return { ok: true, mode: 'legacy', lastRowId: r.meta?.last_row_id };
      } catch (e2) {
        console.error('insertPuzzleIntoD1 legacy insert failed:', e2);
        return { ok: false, err: String(e2?.message || e2) };
      }
    }
    console.error('insertPuzzleIntoD1 failed:', e);
    return { ok: false, err: msg };
  }
}
