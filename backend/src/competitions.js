// competitions.js – Multiplayer competitions and rooms
import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';

// Generate unique room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new room
export async function createRoom(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const {
    name = `Room ${user.username}`,
    maxParticipants = 10,
    puzzleCount = 5,
    timePerPuzzle = 60,
    competitionId = null,
  } = body;

  let code;
  let attempts = 0;
  do {
    code = generateRoomCode();
    const existing = await env.DB.prepare('SELECT id FROM rooms WHERE code = ?').bind(code).first();
    if (!existing) break;
    attempts++;
    if (attempts > 10) {
      return errorResponse('Failed to generate unique room code', 500);
    }
  } while (true);

  try {
    if (!env || !env.DB) {
      console.error('createRoom: DB binding missing');
      return errorResponse('Server misconfiguration: database missing', 500);
    }

    console.log('Creating room with:', { name, code, competitionId, maxParticipants, puzzleCount, timePerPuzzle, userId: user.id });

    const result = await env.DB.prepare(
      'INSERT INTO rooms (name, code, competition_id, max_participants, puzzle_count, time_per_puzzle, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(name, code, competitionId, maxParticipants, puzzleCount, timePerPuzzle, user.id)
      .run();

    if (!result.success) {
      console.error('Failed to insert room:', result);
      return errorResponse('Failed to create room in database', 500);
    }

    const roomId = result.meta.last_row_id;
    console.log('Room created with ID:', roomId);

    // Add creator as participant
    await env.DB.prepare('INSERT INTO room_participants (room_id, user_id, is_ready) VALUES (?, ?, ?)')
      .bind(roomId, user.id, 0) // SQLite uses 0/1 for boolean
      .run();

    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();

    return jsonResponse({ success: true, room }, 201);
  } catch (e) {
    console.error('createRoom error:', e);
    return errorResponse(e.message, 500);
  }
}

// Join a room by code
export async function joinRoom(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { code } = await request.json();
  if (!code) return errorResponse('Room code required', 400);

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE code = ?').bind(code).first();
    if (!room) return errorResponse('Room not found', 404);

    if (room.status !== 'waiting') {
      return errorResponse('Room is not accepting new participants', 400);
    }

    // Check if already joined
    const existing = await env.DB.prepare('SELECT id FROM room_participants WHERE room_id = ? AND user_id = ?')
      .bind(room.id, user.id)
      .first();
    if (existing) {
      return jsonResponse({ success: true, room, message: 'Already in room' }, 200);
    }

    // Check max participants
    const participantCount = await env.DB.prepare('SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ?')
      .bind(room.id)
      .first();
    if (participantCount.c >= room.max_participants) {
      return errorResponse('Room is full', 400);
    }

    // Add participant
    await env.DB.prepare('INSERT INTO room_participants (room_id, user_id, is_ready) VALUES (?, ?, ?)')
      .bind(room.id, user.id, false)
      .run();

    return jsonResponse({ success: true, room }, 200);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Get room status
export async function getRoomStatus(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');
  if (!roomId) return errorResponse('roomId required', 400);

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);

    // Get participants
    const participants = await env.DB.prepare(
      'SELECT rp.*, u.username, u.total_score FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC'
    )
      .bind(roomId)
      .all();

    // Get current puzzle if active
    let currentPuzzle = null;
    if (room.status === 'active' && room.current_puzzle_id) {
      const puzzleRow = await env.DB.prepare('SELECT * FROM puzzles WHERE id = ?').bind(room.current_puzzle_id).first();
      if (puzzleRow) {
        currentPuzzle = JSON.parse(puzzleRow.json);
      }
    }

    return jsonResponse({
      room,
      participants: participants.results,
      currentPuzzle,
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Set ready status
export async function setReady(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId, isReady } = await request.json();
  if (!roomId || typeof isReady !== 'boolean') {
    return errorResponse('roomId and isReady required', 400);
  }

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);

    if (room.status !== 'waiting') {
      return errorResponse('Room is not in waiting status', 400);
    }

    await env.DB.prepare('UPDATE room_participants SET is_ready = ? WHERE room_id = ? AND user_id = ?')
      .bind(isReady, roomId, user.id)
      .run();

    // Check if all participants are ready
    const participants = await env.DB.prepare('SELECT is_ready FROM room_participants WHERE room_id = ?')
      .bind(roomId)
      .all();
    const allReady = participants.results.every((p) => p.is_ready);

    if (allReady && participants.results.length >= 2) {
      // Start the room game
      await startRoomGame(env, roomId);
    }

    return jsonResponse({ success: true, allReady });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Start room game
async function startRoomGame(env, roomId) {
  const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
  if (!room) return;

  // Get random puzzles for the room
  const puzzles = await env.DB.prepare(
    'SELECT id, json FROM puzzles WHERE level = 1 AND lang = ? ORDER BY RANDOM() LIMIT ?'
  )
    .bind('ar', room.puzzle_count)
    .all();

  if (puzzles.results.length === 0) {
    throw new Error('No puzzles available');
  }

  // Set first puzzle
  const firstPuzzle = puzzles.results[0];
  await env.DB.prepare('UPDATE rooms SET status = ?, current_puzzle_id = ?, current_puzzle_index = 0, started_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind('active', firstPuzzle.id, roomId)
    .run();

  // Reset participant scores
  await env.DB.prepare('UPDATE room_participants SET score = 0, puzzles_solved = 0, current_puzzle_index = 0 WHERE room_id = ?')
    .bind(roomId)
    .run();
}

// Submit answer
export async function submitAnswer(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId, puzzleId, puzzleIndex, steps, timeTaken } = await request.json();
  if (!roomId || !puzzleId || puzzleIndex === undefined || !Array.isArray(steps)) {
    return errorResponse('Missing required fields', 400);
  }

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);

    if (room.status !== 'active') {
      return errorResponse('Room is not active', 400);
    }

    if (room.current_puzzle_index !== puzzleIndex) {
      return errorResponse('Wrong puzzle index', 400);
    }

    // Get puzzle
    const puzzleRow = await env.DB.prepare('SELECT json FROM puzzles WHERE id = ?').bind(puzzleId).first();
    if (!puzzleRow) return errorResponse('Puzzle not found', 404);

    const puzzle = JSON.parse(puzzleRow.json);
    const correctSteps = puzzle.steps.map((s) => s.word);
    const isCorrect = JSON.stringify(correctSteps) === JSON.stringify(steps);

    // Save result
    await env.DB.prepare(
      'INSERT INTO room_results (room_id, user_id, puzzle_id, puzzle_index, is_correct, time_taken) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(roomId, user.id, puzzleId, puzzleIndex, isCorrect, timeTaken)
      .run();

    if (isCorrect) {
      // Update participant score
      const points = Math.max(100, 1000 - Math.floor(timeTaken / 100)); // More points for faster answers
      await env.DB.prepare(
        'UPDATE room_participants SET score = score + ?, puzzles_solved = puzzles_solved + 1, current_puzzle_index = ? WHERE room_id = ? AND user_id = ?'
      )
        .bind(points, puzzleIndex + 1, roomId, user.id)
        .run();
    }

    // Check if all participants finished this puzzle
    const participants = await env.DB.prepare('SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ?')
      .bind(roomId)
      .first();
    const finished = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM room_results WHERE room_id = ? AND puzzle_index = ?'
    )
      .bind(roomId, puzzleIndex)
      .first();

    let nextPuzzle = null;
    if (finished.c >= participants.c) {
      // All finished, move to next puzzle
      if (puzzleIndex < room.puzzle_count - 1) {
        // Get next puzzle
        const nextPuzzleRow = await env.DB.prepare(
          'SELECT id, json FROM puzzles WHERE level = 1 AND lang = ? AND id != ? ORDER BY RANDOM() LIMIT 1'
        )
          .bind('ar', puzzleId)
          .first();

        if (nextPuzzleRow) {
          await env.DB.prepare('UPDATE rooms SET current_puzzle_id = ?, current_puzzle_index = ? WHERE id = ?')
            .bind(nextPuzzleRow.id, puzzleIndex + 1, roomId)
            .run();
          nextPuzzle = JSON.parse(nextPuzzleRow.json);
        }
      } else {
        // Game finished
        await env.DB.prepare('UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind('finished', roomId)
          .run();
      }
    }

    return jsonResponse({
      success: true,
      isCorrect,
      points: isCorrect ? Math.max(100, 1000 - Math.floor(timeTaken / 100)) : 0,
      nextPuzzle,
      gameFinished: puzzleIndex >= room.puzzle_count - 1 && finished.c >= participants.c,
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Get leaderboard
export async function getLeaderboard(request, env) {
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) return errorResponse('roomId required', 400);

  try {
    const leaderboard = await env.DB.prepare(
      `SELECT 
        rp.user_id,
        u.username,
        rp.score,
        rp.puzzles_solved,
        rp.current_puzzle_index,
        COUNT(rr.id) as total_answers,
        SUM(CASE WHEN rr.is_correct THEN 1 ELSE 0 END) as correct_answers
      FROM room_participants rp
      JOIN users u ON rp.user_id = u.id
      LEFT JOIN room_results rr ON rp.room_id = rr.room_id AND rp.user_id = rr.user_id
      WHERE rp.room_id = ?
      GROUP BY rp.user_id, u.username, rp.score, rp.puzzles_solved, rp.current_puzzle_index
      ORDER BY rp.score DESC, rp.puzzles_solved DESC, correct_answers DESC`
    )
      .bind(roomId)
      .all();

    return jsonResponse({ leaderboard: leaderboard.results });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Create global competition
export async function createCompetition(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const {
    name = `Competition ${new Date().toLocaleDateString()}`,
    maxParticipants = 100,
    puzzleCount = 10,
    timePerPuzzle = 60,
  } = body;

  try {
    const result = await env.DB.prepare(
      'INSERT INTO competitions (name, type, max_participants, puzzle_count, time_per_puzzle, created_by) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(name, 'global', maxParticipants, puzzleCount, timePerPuzzle, user.id)
      .run();

    const competition = await env.DB.prepare('SELECT * FROM competitions WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first();

    return jsonResponse({ success: true, competition }, 201);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Join competition
export async function joinCompetition(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { competitionId } = await request.json();
  if (!competitionId) return errorResponse('competitionId required', 400);

  try {
    const competition = await env.DB.prepare('SELECT * FROM competitions WHERE id = ?').bind(competitionId).first();
    if (!competition) return errorResponse('Competition not found', 404);

    if (competition.status !== 'waiting') {
      return errorResponse('Competition is not accepting new participants', 400);
    }

    // Check if already joined
    const existing = await env.DB.prepare(
      'SELECT id FROM competition_participants WHERE competition_id = ? AND user_id = ?'
    )
      .bind(competitionId, user.id)
      .first();
    if (existing) {
      return jsonResponse({ success: true, message: 'Already joined' }, 200);
    }

    // Check max participants
    const participantCount = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM competition_participants WHERE competition_id = ?'
    )
      .bind(competitionId)
      .first();
    if (participantCount.c >= competition.max_participants) {
      return errorResponse('Competition is full', 400);
    }

    // Add participant
    await env.DB.prepare('INSERT INTO competition_participants (competition_id, user_id) VALUES (?, ?)')
      .bind(competitionId, user.id)
      .run();

    return jsonResponse({ success: true, competition }, 200);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Get active competitions
export async function getActiveCompetitions(request, env) {
  try {
    const competitions = await env.DB.prepare(
      'SELECT c.*, u.username as creator_name, COUNT(cp.id) as participant_count FROM competitions c LEFT JOIN users u ON c.created_by = u.id LEFT JOIN competition_participants cp ON c.id = cp.competition_id WHERE c.status IN (?, ?) GROUP BY c.id ORDER BY c.created_at DESC'
    )
      .bind('waiting', 'active')
      .all();

    return jsonResponse({ competitions: competitions.results });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

