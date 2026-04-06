import { jsonResponse } from './utils.js';

function normalizeText(value) {
    return String(value ?? '').trim().toLowerCase();
}

function buildPuzzleSignatureFromJson(rawJson, language, level) {
    let parsed;
    try {
        parsed = JSON.parse(rawJson);
    } catch (_) {
        return '';
    }

    const type = normalizeText(parsed?.type || 'logical_chain');
    const startWord = normalizeText(parsed?.startWord);
    const endWord = normalizeText(parsed?.endWord);
    const steps = Array.isArray(parsed?.steps)
        ? parsed.steps
            .map((s) => normalizeText(s?.word || s?.correctAnswer || ''))
            .filter(Boolean)
            .join('>')
        : '';

    if (!steps) return '';
    return `${language}|${Number(level)}|${type}|${startWord}|${steps}|${endWord}`;
}

function toEpochMs(timestamp) {
    const ms = Date.parse(String(timestamp ?? ''));
    return Number.isFinite(ms) ? ms : 0;
}

async function deleteByIds(env, ids) {
    if (!env?.DB || !Array.isArray(ids) || ids.length === 0) return 0;

    let deleted = 0;
    const chunkSize = 100;
    for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => '?').join(',');
        const sql = `DELETE FROM puzzles WHERE id IN (${placeholders})`;
        const stmt = env.DB.prepare(sql).bind(...chunk);
        await stmt.run();
        deleted += chunk.length;
    }

    return deleted;
}

export async function runPuzzleCleanup(env, options = {}) {
    if (!env?.DB) {
        return {
            ok: false,
            reason: 'DB binding missing',
            deleted: 0,
            duplicateDeleted: 0,
            agedDeleted: 0,
            overflowDeleted: 0,
            groupsScanned: 0,
        };
    }

    const maxPerGroup = Math.max(100, Number(options.maxPerGroup ?? env?.PUZZLE_RETENTION_PER_GROUP ?? 1200));
    const maxAgeDays = Math.max(7, Number(options.maxAgeDays ?? env?.PUZZLE_RETENTION_DAYS ?? 45));
    const recentProtect = Math.max(50, Number(options.recentProtect ?? env?.PUZZLE_RECENT_PROTECT ?? 250));
    const dryRun = options.dryRun === true;

    const cutoffMs = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    const groupsResult = await env.DB
        .prepare('SELECT level, lang, COUNT(*) as c FROM puzzles GROUP BY level, lang')
        .all();
    const groups = groupsResult?.results || [];

    let totalDeleted = 0;
    let duplicateDeleted = 0;
    let agedDeleted = 0;
    let overflowDeleted = 0;

    for (const group of groups) {
        const level = Number(group.level);
        const lang = String(group.lang);

        const rowsResult = await env.DB
            .prepare('SELECT id, created_at, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY created_at DESC, id DESC LIMIT 5000')
            .bind(level, lang)
            .all();

        const rows = rowsResult?.results || [];
        if (rows.length === 0) continue;

        const signatureSeen = new Set();
        const keep = [];
        const deleteIds = new Set();

        // Pass 1: remove exact duplicates by content signature, keep newest copy.
        for (const row of rows) {
            const id = Number(row.id);
            const signature = buildPuzzleSignatureFromJson(row.json, lang, level);

            // If signature invalid, keep for safety (do not accidentally delete all malformed rows).
            if (!signature) {
                keep.push(row);
                continue;
            }

            if (signatureSeen.has(signature)) {
                deleteIds.add(id);
                duplicateDeleted++;
            } else {
                signatureSeen.add(signature);
                keep.push(row);
            }
        }

        // Pass 2: age-based cleanup for old rows, while preserving a recent floor.
        if (keep.length > recentProtect) {
            for (let i = keep.length - 1; i >= recentProtect; i--) {
                const row = keep[i];
                if (toEpochMs(row.created_at) < cutoffMs) {
                    const id = Number(row.id);
                    if (!deleteIds.has(id)) {
                        deleteIds.add(id);
                        agedDeleted++;
                    }
                }
            }
        }

        // Pass 3: hard cap per level/lang after dedup and aging.
        const keptAfterDeletes = keep.filter((row) => !deleteIds.has(Number(row.id)));
        if (keptAfterDeletes.length > maxPerGroup) {
            for (let i = maxPerGroup; i < keptAfterDeletes.length; i++) {
                const id = Number(keptAfterDeletes[i].id);
                if (!deleteIds.has(id)) {
                    deleteIds.add(id);
                    overflowDeleted++;
                }
            }
        }

        const ids = [...deleteIds];
        if (!dryRun && ids.length > 0) {
            totalDeleted += await deleteByIds(env, ids);
        } else {
            totalDeleted += ids.length;
        }
    }

    return {
        ok: true,
        deleted: totalDeleted,
        duplicateDeleted,
        agedDeleted,
        overflowDeleted,
        groupsScanned: groups.length,
        maxPerGroup,
        maxAgeDays,
        recentProtect,
        dryRun,
        ranAt: new Date().toISOString(),
    };
}

export async function cleanupPuzzlesEndpoint(request, env) {
    const url = new URL(request.url);
    const dryRun = url.searchParams.get('dryRun') === '1';

    const result = await runPuzzleCleanup(env, { dryRun });
    return jsonResponse(result, result.ok ? 200 : 500);
}
