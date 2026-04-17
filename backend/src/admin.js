// admin.js – simple admin endpoints for managing stored puzzles
import { jsonResponse, errorResponse } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { generateLevel as generateLevelHandler } from './game.js';

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
