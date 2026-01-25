// tournament.js - Daily/Weekly Tournament System
import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';

/**
 * Get current daily challenge
 * Everyone gets the same puzzle, scored by time and accuracy
 */
export async function getDailyChallenge(request, env) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    // Check if daily challenge exists for today
    let challenge = await env.DB
      .prepare('SELECT * FROM daily_challenges WHERE date = ?')
      .bind(today)
      .first();
    
    if (!challenge) {
      // Generate new daily challenge
      const puzzleResult = await env.DB
        .prepare('SELECT json FROM puzzles WHERE lang = ? ORDER BY RANDOM() LIMIT 1')
        .bind('ar')
        .first();
      
      if (!puzzleResult) {
        return errorResponse('No puzzles available', 500);
      }
      
      // Create daily challenge
      await env.DB
        .prepare('INSERT INTO daily_challenges (date, puzzle_json, created_at) VALUES (?, ?, datetime("now"))')
        .bind(today, puzzleResult.json)
        .run();
      
      challenge = { date: today, puzzle_json: puzzleResult.json };
    }
    
    const puzzle = JSON.parse(challenge.puzzle_json);
    
    return jsonResponse({
      date: today,
      puzzle: puzzle,
      expiresIn: getSecondsUntilMidnight(),
    }, 200);
    
  } catch (e) {
    console.error('getDailyChallenge error:', e);
    return errorResponse(e.message, 500);
  }
}

/**
 * Submit daily challenge score
 */
export async function submitDailyScore(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) {
    return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
  }
  
  const { timeTaken, mistakes, completed } = await request.json();
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate score: base 1000, minus time penalty, minus mistake penalty
  let score = 1000;
  score -= Math.min(timeTaken, 300) * 2; // Time penalty (max 600)
  score -= mistakes * 50; // Mistake penalty
  if (!completed) score = Math.floor(score * 0.5); // Incomplete penalty
  score = Math.max(0, score);
  
  try {
    // Check if user already submitted today
    const existing = await env.DB
      .prepare('SELECT score FROM daily_scores WHERE user_id = ? AND date = ?')
      .bind(user.id, today)
      .first();
    
    if (existing) {
      // Only update if new score is better
      if (score > existing.score) {
        await env.DB
          .prepare('UPDATE daily_scores SET score = ?, time_taken = ?, mistakes = ?, updated_at = datetime("now") WHERE user_id = ? AND date = ?')
          .bind(score, timeTaken, mistakes, user.id, today)
          .run();
      }
    } else {
      await env.DB
        .prepare('INSERT INTO daily_scores (user_id, date, score, time_taken, mistakes, created_at) VALUES (?, ?, ?, ?, ?, datetime("now"))')
        .bind(user.id, today, score, timeTaken, mistakes)
        .run();
    }
    
    // Get user's rank
    const rankResult = await env.DB
      .prepare(`
        SELECT COUNT(*) + 1 as rank FROM daily_scores 
        WHERE date = ? AND score > ?
      `)
      .bind(today, score)
      .first();
    
    return jsonResponse({
      success: true,
      score,
      rank: rankResult?.rank || 1,
      isNewBest: !existing || score > existing.score,
    }, 200);
    
  } catch (e) {
    console.error('submitDailyScore error:', e);
    return errorResponse(e.message, 500);
  }
}

/**
 * Get daily leaderboard
 */
export async function getDailyLeaderboard(request, env) {
  const url = new URL(request.url);
  const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  
  try {
    const results = await env.DB
      .prepare(`
        SELECT ds.user_id, ds.score, ds.time_taken, ds.mistakes, u.username
        FROM daily_scores ds
        JOIN users u ON ds.user_id = u.id
        WHERE ds.date = ?
        ORDER BY ds.score DESC, ds.time_taken ASC
        LIMIT ?
      `)
      .bind(date, limit)
      .all();
    
    const leaderboard = results.results.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      score: row.score,
      timeTaken: row.time_taken,
      mistakes: row.mistakes,
    }));
    
    return jsonResponse({
      date,
      leaderboard,
      totalParticipants: leaderboard.length,
    }, 200);
    
  } catch (e) {
    console.error('getDailyLeaderboard error:', e);
    return errorResponse(e.message, 500);
  }
}

/**
 * Get weekly tournament standings
 */
export async function getWeeklyStandings(request, env) {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  
  try {
    const results = await env.DB
      .prepare(`
        SELECT ds.user_id, SUM(ds.score) as total_score, COUNT(*) as days_played, u.username
        FROM daily_scores ds
        JOIN users u ON ds.user_id = u.id
        WHERE ds.date >= ? AND ds.date <= ?
        GROUP BY ds.user_id
        ORDER BY total_score DESC
        LIMIT 50
      `)
      .bind(startOfWeek, endOfWeek)
      .all();
    
    const standings = results.results.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      totalScore: row.total_score,
      daysPlayed: row.days_played,
    }));
    
    return jsonResponse({
      weekStart: startOfWeek,
      weekEnd: endOfWeek,
      standings,
      daysRemaining: getDaysUntilEndOfWeek(now),
    }, 200);
    
  } catch (e) {
    console.error('getWeeklyStandings error:', e);
    return errorResponse(e.message, 500);
  }
}

// Helper functions
function getSecondsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.floor((midnight - now) / 1000);
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getEndOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (7 - day) % 7;
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

function getDaysUntilEndOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  return (7 - day) % 7 || 7;
}
