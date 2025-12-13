// progress.js – handlers for user progress endpoints
import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';

/** Get all progress for the authenticated user */
export async function getProgress(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });

  const { results } = await env.DB.prepare('SELECT * FROM progress WHERE user_id = ?')
    .bind(user.id)
    .all();
  return jsonResponse(results);
}

/** Save or update progress for a level */
export async function saveProgress(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });

  const { level, score, stars } = await request.json();
  if (level == null || score == null || stars == null) {
    return errorResponse('Missing fields', 400);
  }

  const existing = await env.DB.prepare('SELECT id FROM progress WHERE user_id = ? AND level = ?')
    .bind(user.id, level)
    .first();

  if (existing) {
    await env.DB.prepare('UPDATE progress SET score = max(score, ?), stars = max(stars, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(score, stars, existing.id)
      .run();
  } else {
    await env.DB.prepare('INSERT INTO progress (user_id, level, score, stars) VALUES (?, ?, ?, ?)')
      .bind(user.id, level, score, stars)
      .run();
  }

  // Update total score for the user
  await env.DB.prepare('UPDATE users SET total_score = total_score + ? WHERE id = ?')
    .bind(score, user.id)
    .run();

  return jsonResponse({ success: true });
}
