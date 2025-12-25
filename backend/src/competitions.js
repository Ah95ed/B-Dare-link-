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
    puzzleSource = 'database', // 'ai', 'database', 'manual'
    difficulty = 1,
    language = 'ar',
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

    console.log('Creating room with:', { name, code, competitionId, maxParticipants, puzzleCount, timePerPuzzle, puzzleSource, difficulty, language, userId: user.id });

    const result = await env.DB.prepare(
      'INSERT INTO rooms (name, code, competition_id, max_participants, puzzle_count, time_per_puzzle, puzzle_source, difficulty, language, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(name, code, competitionId, maxParticipants, puzzleCount, timePerPuzzle, puzzleSource, difficulty, language, user.id, 'waiting')
      .run();

    if (!result.success) {
      console.error('Failed to insert room:', result);
      return errorResponse('Failed to create room in database', 500);
    }

    const roomId = result.meta.last_row_id;
    console.log('Room created with ID:', roomId);

    // Add creator as participant
    await env.DB.prepare('INSERT INTO room_participants (room_id, user_id, is_ready) VALUES (?, ?, ?)')
      .bind(roomId, user.id, 1) // Host starts as ready
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
      .bind(room.id, user.id, 0) // Join as not ready
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

    // Get current puzzle if active (from room_puzzles)
    let currentPuzzle = null;
    if (room.status === 'active' && room.current_puzzle_index !== null) {
      const puzzleRow = await env.DB.prepare(
        'SELECT puzzle_json, solved_by FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
      )
        .bind(roomId, room.current_puzzle_index)
        .first();
      if (puzzleRow) {
        currentPuzzle = JSON.parse(puzzleRow.puzzle_json);
        // Add solved_by info if available
        if (puzzleRow.solved_by) {
          const solver = await env.DB.prepare('SELECT username FROM users WHERE id = ?')
            .bind(puzzleRow.solved_by)
            .first();
          if (solver) {
            currentPuzzle._solvedBy = solver.username;
          }
        }
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

  const puzzleSource = room.puzzle_source || 'database';
  const difficulty = room.difficulty || 1;
  const language = room.language || 'ar';
  const puzzleCount = room.puzzle_count || 5;

  let puzzlesData = [];

  if (puzzleSource === 'database') {
    // Get random puzzles from database
    const puzzles = await env.DB.prepare(
      'SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT ?'
    )
      .bind(difficulty, language, puzzleCount)
      .all();

    if (puzzles.results.length === 0) {
      throw new Error('No puzzles available in database');
    }

    puzzlesData = puzzles.results.map(p => ({
      puzzleId: p.id,
      puzzleJson: p.json
    }));
  } else if (puzzleSource === 'ai') {
    // Generate puzzles using AI (multiple calls)
    for (let i = 0; i < puzzleCount; i++) {
      try {
        const aiPuzzle = await generateAIPuzzle(env, language, difficulty);
        puzzlesData.push({
          puzzleId: null, // AI generated, no DB id
          puzzleJson: JSON.stringify(aiPuzzle)
        });
      } catch (e) {
        console.error('AI puzzle generation failed:', e);
        // Fallback to database puzzle
        const fallback = await env.DB.prepare(
          'SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1'
        )
          .bind(difficulty, language)
          .first();
        if (fallback) {
          puzzlesData.push({ puzzleId: fallback.id, puzzleJson: fallback.json });
        }
      }
    }
  }
  // 'manual' puzzles would be pre-stored when room is created

  if (puzzlesData.length === 0) {
    throw new Error('No puzzles available');
  }

  // Store puzzles in room_puzzles table
  for (let i = 0; i < puzzlesData.length; i++) {
    await env.DB.prepare(
      'INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)'
    )
      .bind(roomId, i, puzzlesData[i].puzzleJson)
      .run();
  }

  // Set first puzzle
  await env.DB.prepare('UPDATE rooms SET status = ?, current_puzzle_index = 0, started_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind('active', roomId)
    .run();

  // Reset participant scores
  await env.DB.prepare('UPDATE room_participants SET score = 0, puzzles_solved = 0, current_puzzle_index = 0 WHERE room_id = ?')
    .bind(roomId)
    .run();

  // Notify Durable Object to broadcast game start with first puzzle
  const firstPuzzle = JSON.parse(puzzlesData[0].puzzleJson);
  const doId = env.ROOM_DO.idFromName(roomId.toString());
  const roomObject = env.ROOM_DO.get(doId);
  await roomObject.fetch(new Request('http://room/start-game-event', {
    method: 'POST',
    body: JSON.stringify({ 
      type: 'start_game',
      puzzle: firstPuzzle,
      puzzleIndex: 0,
      totalPuzzles: puzzlesData.length
    })
  }));
}

// Helper function to generate AI puzzle (Quiz format for competitions)
async function generateAIPuzzle(env, language, level) {
  const { buildQuizSystemPrompt, buildQuizUserPrompt } = await import('./prompt.js');
  
  // Use Quiz format for simple Q&A
  const systemPrompt = buildQuizSystemPrompt({ language, level });
  const userPrompt = buildQuizUserPrompt({ language, level, seed: Date.now() });
  
  const openaiApiKey = env?.OPENAI_API_KEY;
  const openaiModel = env?.OPENAI_MODEL || 'gpt-4o-mini';
  const groqApiKey = env?.GROQ_API_KEY;
  const groqModel = env?.GROQ_MODEL || 'llama-3.1-8b-instant';
  
  // User provided specific Gemini PRO Key
  const geminiApiKey = env?.GEMINI_API_KEY || 'AIzaSyB8TZZA574oaqNymEmW-9UnptJHBA4ViDs';

  let content = '';

  if (geminiApiKey) {
      // Use Gemini
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt + "\n\n" + userPrompt
            }]
          }],
          generationConfig: {
            response_mime_type: "application/json",
            temperature: 0.9,
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else if (openaiApiKey) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 900,
      }),
    });
    const data = await response.json();
    content = data?.choices?.[0]?.message?.content ?? '';
  } else if (groqApiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqApiKey}` },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 1000,
      }),
    });
    const data = await response.json();
    content = data?.choices?.[0]?.message?.content ?? '';
  } else {
    throw new Error('No AI provider configured');
  }

  // Parse the JSON response
  const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleanContent);
}

// Submit answer (supports both quiz format and legacy steps format)
export async function submitAnswer(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { roomId, puzzleIndex, answerIndex, steps, timeTaken } = body;
  
  // Support both formats: answerIndex (new quiz) or steps (legacy)
  if (!roomId || puzzleIndex === undefined) {
    return errorResponse('Missing required fields', 400);
  }
  if (answerIndex === undefined && !Array.isArray(steps)) {
    return errorResponse('Missing answer (answerIndex or steps)', 400);
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

    // Get puzzle from room_puzzles table
    const puzzleRow = await env.DB.prepare(
      'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
    )
      .bind(roomId, puzzleIndex)
      .first();
    
    if (!puzzleRow) return errorResponse('Puzzle not found', 404);

    const puzzle = JSON.parse(puzzleRow.puzzle_json);
    
    // Check answer based on puzzle format
    let isCorrect = false;
    if (answerIndex !== undefined && puzzle.correctIndex !== undefined) {
      // New quiz format: compare answerIndex with correctIndex
      isCorrect = Number(answerIndex) === Number(puzzle.correctIndex);
    } else if (steps && puzzle.steps) {
      // Legacy format: compare steps array
      const correctSteps = puzzle.steps.map((s) => s.word);
      isCorrect = JSON.stringify(correctSteps) === JSON.stringify(steps);
    } else {
      return errorResponse('Invalid puzzle format', 400);
    }

    // Check if this is the first correct answer (fastest)
    let isFirstCorrect = false;
    if (isCorrect) {
      const existingCorrect = await env.DB.prepare(
        'SELECT COUNT(*) AS c FROM room_results WHERE room_id = ? AND puzzle_index = ? AND is_correct = 1'
      )
        .bind(roomId, puzzleIndex)
        .first();
      
      isFirstCorrect = existingCorrect.c === 0;
      
      // If first correct, mark as solved in room_puzzles
      if (isFirstCorrect) {
        await env.DB.prepare(
          'UPDATE room_puzzles SET solved_by = ?, solved_at = CURRENT_TIMESTAMP WHERE room_id = ? AND puzzle_index = ?'
        )
          .bind(user.id, roomId, puzzleIndex)
          .run();
      }
    }

    // Save result (puzzle_id can be null for AI-generated puzzles)
    await env.DB.prepare(
      'INSERT INTO room_results (room_id, user_id, puzzle_id, puzzle_index, is_correct, time_taken) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(roomId, user.id, null, puzzleIndex, isCorrect, timeTaken)
      .run();

    let points = 0;
    let rank = null;
    
    if (isCorrect) {
      // Calculate points based on speed and if first
      if (isFirstCorrect) {
        // Bonus for being first
        points = Math.max(500, 2000 - Math.floor(timeTaken / 50));
        rank = 1;
      } else {
        // Regular points for correct answer
        points = Math.max(100, 1000 - Math.floor(timeTaken / 100));
        
        // Get rank (how many solved before this user)
        const fasterCount = await env.DB.prepare(
          'SELECT COUNT(*) AS c FROM room_results WHERE room_id = ? AND puzzle_index = ? AND is_correct = 1 AND time_taken < ?'
        )
          .bind(roomId, puzzleIndex, timeTaken)
          .first();
        rank = fasterCount.c + 1;
      }
      
      // Update participant score
      await env.DB.prepare(
        'UPDATE room_participants SET score = score + ?, puzzles_solved = puzzles_solved + 1, current_puzzle_index = ? WHERE room_id = ? AND user_id = ?'
      )
        .bind(points, puzzleIndex + 1, roomId, user.id)
        .run();

      // Notify Durable Object about first solve
      if (isFirstCorrect) {
        const doId = env.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env.ROOM_DO.get(doId);
        await roomObject.fetch(new Request('http://room/puzzle-solved', {
          method: 'POST',
          body: JSON.stringify({
            type: 'puzzle_solved_first',
            userId: user.id,
            username: user.username,
            puzzleIndex: puzzleIndex,
            timeTaken: timeTaken
          })
        }));
      }
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
    let gameFinished = false;
    
    if (finished.c >= participants.c) {
      // All finished, move to next puzzle
      if (puzzleIndex < room.puzzle_count - 1) {
        // Get next puzzle from room_puzzles
        const nextPuzzleRow = await env.DB.prepare(
          'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        )
          .bind(roomId, puzzleIndex + 1)
          .first();

        if (nextPuzzleRow) {
          await env.DB.prepare('UPDATE rooms SET current_puzzle_index = ? WHERE id = ?')
            .bind(puzzleIndex + 1, roomId)
            .run();
          nextPuzzle = JSON.parse(nextPuzzleRow.puzzle_json);
          
          // Notify Durable Object about next puzzle
          const doId = env.ROOM_DO.idFromName(roomId.toString());
          const roomObject = env.ROOM_DO.get(doId);
          await roomObject.fetch(new Request('http://room/next-puzzle', {
            method: 'POST',
            body: JSON.stringify({
              type: 'next_puzzle',
              puzzle: nextPuzzle,
              puzzleIndex: puzzleIndex + 1
            })
          }));
        }
      } else {
        // Game finished
        gameFinished = true;
        await env.DB.prepare('UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
          .bind('finished', roomId)
          .run();
        
        // Notify Durable Object
        const doId = env.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env.ROOM_DO.get(doId);
        await roomObject.fetch(new Request('http://room/finish-game', {
          method: 'POST',
          body: JSON.stringify({ type: 'finish_game' })
        }));
      }
    }

    return jsonResponse({
      success: true,
      isCorrect,
      isFirstCorrect,
      points,
      rank,
      nextPuzzle,
      gameFinished,
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

// Get rooms the user has joined
export async function getMyRooms(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  try {
    const rooms = await env.DB.prepare(
      `SELECT r.*, u.username as creator_name, 
      (SELECT COUNT(*) FROM room_participants WHERE room_id = r.id) as participant_count
      FROM rooms r 
      JOIN room_participants rp ON r.id = rp.room_id 
      JOIN users u ON r.created_by = u.id
      WHERE rp.user_id = ? AND r.status != 'finished'
      ORDER BY r.created_at DESC`
    )
      .bind(user.id)
      .all();

    return jsonResponse({ rooms: rooms.results });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Leave a room
export async function leaveRoom(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId } = await request.json();
  if (!roomId) return errorResponse('roomId required', 400);

  try {
    await env.DB.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?')
      .bind(roomId, user.id)
      .run();

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Kick a user from a room (Host only)
export async function kickUser(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId, targetUserId } = await request.json();
  if (!roomId || !targetUserId) return errorResponse('roomId and targetUserId required', 400);

  try {
    // Verify host
    const room = await env.DB.prepare('SELECT created_by FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);
    if (room.created_by !== user.id) return errorResponse('Only host can kick users', 403);

    // Remove from DB
    await env.DB.prepare('DELETE FROM room_participants WHERE room_id = ? AND user_id = ?')
      .bind(roomId, targetUserId)
      .run();

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Manual start game (Host only)
export async function manualStartGame(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId } = await request.json();
  if (!roomId) return errorResponse('roomId required', 400);

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);
    if (room.created_by !== user.id) return errorResponse('Only host can start game', 403);
    if (room.status !== 'waiting') return errorResponse('Room is not in waiting status', 400);

    // Start the game
    await startRoomGame(env, roomId);

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

export async function deleteRoom(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');
  if (!roomId) return errorResponse('roomId required', 400);

  try {
    // Verify host
    const room = await env.DB.prepare('SELECT created_by FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);
    if (room.created_by !== user.id) return errorResponse('Only host can delete room', 403);

    // Delete participants and room
    await env.DB.prepare('DELETE FROM room_participants WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_results WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM rooms WHERE id = ?').bind(roomId).run();

    // Notify Durable Object to close all connections
    const doId = env.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env.ROOM_DO.get(doId);
    await roomObject.fetch(new Request('http://room/delete-event', {
      method: 'POST',
      body: JSON.stringify({ type: 'room_deleted' })
    }));

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
