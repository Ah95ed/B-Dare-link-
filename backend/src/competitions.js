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

    // Allow joining waiting/active/finished rooms
    // Users can rejoin finished rooms to see results or replay
    if (room.status !== 'waiting' && room.status !== 'active' && room.status !== 'finished') {
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
        // Log puzzle fetch for verification
        const ci = Number(currentPuzzle.correctIndex);
        const opts = Array.isArray(currentPuzzle.options) ? currentPuzzle.options : [];
        const correctAns = ci >= 0 && ci < opts.length ? opts[ci] : 'N/A';
        console.log('[FETCH PUZZLE]', {
          roomId,
          puzzleIndex: room.current_puzzle_index,
          question: currentPuzzle.question,
          optionCount: opts.length,
          correctIndex: ci,
          correctAnswer: correctAns,
          category: currentPuzzle.category
        });
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
  const puzzleCount = Math.max(room.puzzle_count || 5, 5); // ensure at least 5 puzzles

  let puzzlesData = [];

  const isValidQuiz = (p) => {
    if (!p) return false;
    if (typeof p.question !== 'string' || p.question.trim().length === 0) return false;
    if (!Array.isArray(p.options) || p.options.length < 2) return false;
    if (p.correctIndex === undefined || p.correctIndex === null) return false;
    return true;
  };

  if (puzzleSource === 'database') {
    // Get random puzzles from database
    const puzzles = await env.DB.prepare(
      'SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT ?'
    )
      .bind(difficulty, language, puzzleCount)
      .all();

    if (puzzles.results.length === 0) {
      console.warn('No puzzles found for requested level/lang, attempting fallback.');

      // Try to fetch any puzzle regardless of level/lang as a quick fallback
      const anyFallback = await env.DB.prepare(
        'SELECT id, json FROM puzzles ORDER BY RANDOM() LIMIT ?'
      )
        .bind(puzzleCount)
        .all();

      if (anyFallback.results.length > 0) {
        puzzlesData = anyFallback.results.map(p => ({
          puzzleId: p.id,
          puzzleJson: p.json,
        }));
      } else {
        // As a last resort, try to generate puzzles via AI if configured
        console.warn('No puzzles in DB at all; attempting AI generation fallback');
        for (let i = 0; i < puzzleCount; i++) {
          try {
            const aiPuzzle = await generateAIPuzzle(env, language, difficulty);
            puzzlesData.push({ puzzleId: null, puzzleJson: JSON.stringify(aiPuzzle) });
          } catch (e) {
            console.error('AI fallback generation failed:', e);
          }
        }
      }
    } else {
      // Validate each puzzle; fallback to AI if malformed
      for (const p of puzzles.results) {
        try {
          const parsed = JSON.parse(p.json);
          if (isValidQuiz(parsed)) {
            puzzlesData.push({ puzzleId: p.id, puzzleJson: p.json });
          } else {
            try {
              const aiPuzzle = await generateAIPuzzle(env, language, difficulty);
              puzzlesData.push({ puzzleId: null, puzzleJson: JSON.stringify(aiPuzzle) });
            } catch (e) {
              console.warn('AI fallback failed, skipping malformed puzzle', e);
            }
          }
        } catch (e) {
          try {
            const aiPuzzle = await generateAIPuzzle(env, language, difficulty);
            puzzlesData.push({ puzzleId: null, puzzleJson: JSON.stringify(aiPuzzle) });
          } catch (err) {
            console.warn('AI fallback failed after JSON parse error', err);
          }
        }
      }
    }
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
    // Final fallback: try any puzzles from DB
    const anyFallback = await env.DB.prepare(
      'SELECT id, json FROM puzzles ORDER BY RANDOM() LIMIT ?'
    )
      .bind(puzzleCount)
      .all();

    for (const p of anyFallback.results || []) {
      try {
        const parsed = JSON.parse(p.json);
        if (isValidQuiz(parsed)) {
          puzzlesData.push({ puzzleId: p.id, puzzleJson: p.json });
        }
      } catch (e) { }
    }

    if (puzzlesData.length === 0) {
      throw new Error('No puzzles available');
    }
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
      totalPuzzles: puzzlesData.length,
      roomId: roomId,
      timePerPuzzle: room.time_per_puzzle || 60
    })
  }));
}

// Helper function to generate AI puzzle (Quiz format for competitions)
async function generateAIPuzzle(env, language, level) {
  // Decide quiz type: 'wonder_link' (pair-link) or generic 'quiz'
  const quizType = (env?.QUIZ_TYPE || 'wonder_link').toLowerCase();

  const prompts = await import('./prompt.js');
  const useWonderLink = quizType === 'wonder_link' || quizType === 'link';

  const systemPrompt = useWonderLink
    ? prompts.buildLinkQuizSystemPrompt({ language, level })
    : prompts.buildQuizSystemPrompt({ language, level });
  const userPrompt = useWonderLink
    ? prompts.buildLinkQuizUserPrompt({ language, level, seed: Date.now() })
    : prompts.buildQuizUserPrompt({ language, level, seed: Date.now() });

  const openaiApiKey = env?.OPENAI_API_KEY;
  const openaiModel = env?.OPENAI_MODEL || 'gpt-4o-mini';
  const groqApiKey = env?.GROQ_API_KEY;
  const groqModel = env?.GROQ_MODEL || 'llama-3.1-8b-instant';

  // User provided specific Gemini PRO Key
  const geminiApiKey = env?.GEMINI_API_KEY || 'AIzaSyB8TZZA574oaqNymEmW-9UnptJHBA4ViDs';
  const geminiModel = env?.GEMINI_MODEL || 'gemini-1.5-flash-001';

  let content = '';

  if (geminiApiKey) {
    // Use Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

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
  const parsed = JSON.parse(cleanContent);

  // Validate the puzzle has required fields
  if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
    console.error('Invalid puzzle from AI:', parsed);
    throw new Error('AI generated invalid puzzle format');
  }
  if (parsed.correctIndex === undefined || parsed.correctIndex === null) {
    console.error('Missing correctIndex in AI puzzle:', parsed);
    throw new Error('AI puzzle missing correctIndex');
  }

  try {
    const cidx = Number(parsed.correctIndex);
    const ans = Array.isArray(parsed.options) && cidx >= 0 && cidx < parsed.options.length
      ? parsed.options[cidx]
      : 'N/A';
    console.log('[AI QUIZ]', {
      language,
      level,
      category: parsed.category || 'quiz',
      question: parsed.question,
      correctIndex: parsed.correctIndex,
      correctAnswer: ans
    });
  } catch (_) { /* ignore logging errors */ }

  // Ensure category is set for wonder_link
  if (useWonderLink) {
    parsed.category = parsed.category || 'wonder_link';
  }
  return parsed;
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

    // Allow answering any puzzle that exists in the room and hasn't been answered by this user yet
    // (instead of strict current_puzzle_index check which can fail with network delays)
    const puzzleRow = await env.DB.prepare(
      'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
    )
      .bind(roomId, puzzleIndex)
      .first();

    if (!puzzleRow) return errorResponse('Puzzle not found', 400);

    const puzzle = JSON.parse(puzzleRow.puzzle_json);

    // Normalize correctIndex to number if present
    if (puzzle.correctIndex !== undefined && puzzle.correctIndex !== null) {
      puzzle.correctIndex = Number(puzzle.correctIndex);
    }
    // Check answer based on puzzle format
    let isCorrect = false;

    // Debug log
    console.log('[SUBMIT ANSWER]', {
      answerIndex,
      correctIndex: puzzle.correctIndex,
      correctIndexType: typeof puzzle.correctIndex,
      steps,
      hasSteps: Array.isArray(puzzle.steps),
      puzzleKeys: Object.keys(puzzle)
    });

    if (answerIndex !== undefined && typeof puzzle.correctIndex === 'number') {
      // New quiz format: compare answerIndex with correctIndex
      isCorrect = Number(answerIndex) === Number(puzzle.correctIndex);
    } else if (steps && Array.isArray(puzzle.steps)) {
      // Legacy format: compare steps array
      const correctSteps = puzzle.steps.map((s) => s.word);
      isCorrect = JSON.stringify(correctSteps) === JSON.stringify(steps);
    } else {
      console.log('[ERROR] Invalid puzzle format', {
        answerIndex,
        correctIndex: puzzle.correctIndex,
        correctIndexType: typeof puzzle.correctIndex,
        steps,
        puzzleSteps: puzzle.steps,
        fullPuzzle: puzzle
      });
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

    // Ensure puzzle_id references a real row to satisfy FK constraint
    // If puzzle came from DB it may already have puzzleId; otherwise insert a stub row
    let puzzleId = null;
    if (puzzle.puzzleId) {
      puzzleId = puzzle.puzzleId;
    }
    if (!puzzleId) {
      const lang = room.language || 'ar';
      const difficulty = room.difficulty || 1;
      const jsonStr = JSON.stringify(puzzle);
      const inserted = await env.DB.prepare(
        'INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)' // returns last_row_id
      )
        .bind(difficulty, lang, jsonStr)
        .run();
      puzzleId = inserted.meta.last_row_id;
    }

    await env.DB.prepare(
      'INSERT INTO room_results (room_id, user_id, puzzle_id, puzzle_index, is_correct, time_taken) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(roomId, user.id, puzzleId, puzzleIndex, isCorrect, timeTaken)
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
              puzzleIndex: puzzleIndex + 1,
              roomId: roomId,
              timePerPuzzle: room.time_per_puzzle || 60
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
          body: JSON.stringify({ type: 'finish_game', roomId: roomId })
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
    // Get all rooms user participated in (exclude deleted rooms)
    const rooms = await env.DB.prepare(
      `SELECT r.id, r.name, r.code, r.status, r.created_by, r.puzzle_count, 
              r.time_per_puzzle, r.difficulty, r.language, r.puzzle_source, r.created_at,
              u.username as creator_name,
              COUNT(DISTINCT rp.user_id) as participant_count
      FROM rooms r 
      JOIN room_participants rp ON r.id = rp.room_id 
      JOIN users u ON r.created_by = u.id
      WHERE rp.user_id = ? 
      GROUP BY r.id
      ORDER BY r.created_at DESC LIMIT 50`
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

    // Clean up dependent tables to satisfy FK constraints
    await env.DB.prepare('DELETE FROM room_results WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_puzzles WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_participants WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM competition_participants WHERE room_id = ?').bind(roomId).run();

    // Delete the room record
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

// Reopen a finished room (Host only): reset status/puzzles/scores
export async function reopenRoom(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId } = await request.json();
  if (!roomId) return errorResponse('roomId required', 400);

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);
    if (room.created_by !== user.id) return errorResponse('Only host can reopen room', 403);

    // Clear puzzles/results
    await env.DB.prepare('DELETE FROM room_results WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_puzzles WHERE room_id = ?').bind(roomId).run();

    // Reset participants
    await env.DB.prepare('UPDATE room_participants SET score = 0, puzzles_solved = 0, current_puzzle_index = 0, is_ready = 0 WHERE room_id = ?')
      .bind(roomId)
      .run();

    // Reset room status
    await env.DB.prepare('UPDATE rooms SET status = ?, current_puzzle_index = 0, current_puzzle_id = NULL, started_at = NULL, finished_at = NULL WHERE id = ?')
      .bind('waiting', roomId)
      .run();

    // Notify DO (optional best-effort)
    try {
      const doId = env.ROOM_DO.idFromName(roomId.toString());
      const roomObject = env.ROOM_DO.get(doId);
      await roomObject.fetch(new Request('http://room/reopen', {
        method: 'POST',
        body: JSON.stringify({ type: 'room_reopened' })
      }));
    } catch (_) { }

    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Force advance to next puzzle (Host only)
export async function forceNextPuzzle(request, env) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const { roomId } = await request.json();
  if (!roomId) return errorResponse('roomId required', 400);

  try {
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);
    if (room.created_by !== user.id) return errorResponse('Only host can advance puzzle', 403);
    if (room.status !== 'active') return errorResponse('Room is not active', 400);

    const currentIdx = room.current_puzzle_index ?? 0;
    const nextIdx = currentIdx + 1;

    if (nextIdx >= (room.puzzle_count ?? 0)) {
      // Finish the game if no more puzzles
      await env.DB.prepare('UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind('finished', roomId)
        .run();
      const doId = env.ROOM_DO.idFromName(roomId.toString());
      const roomObject = env.ROOM_DO.get(doId);
      await roomObject.fetch(new Request('http://room/finish-game', {
        method: 'POST',
        body: JSON.stringify({ type: 'finish_game', roomId })
      }));
      return jsonResponse({ success: true, gameFinished: true });
    }

    const nextRow = await env.DB.prepare(
      'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
    ).bind(roomId, nextIdx).first();

    if (!nextRow) return errorResponse('Next puzzle not found', 404);

    await env.DB.prepare('UPDATE rooms SET current_puzzle_index = ? WHERE id = ?')
      .bind(nextIdx, roomId)
      .run();

    const nextPuzzle = JSON.parse(nextRow.puzzle_json);

    const doId = env.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env.ROOM_DO.get(doId);
    await roomObject.fetch(new Request('http://room/next-puzzle', {
      method: 'POST',
      body: JSON.stringify({
        type: 'next_puzzle',
        puzzle: nextPuzzle,
        puzzleIndex: nextIdx,
        roomId: roomId,
        timePerPuzzle: room.time_per_puzzle || 60
      })
    }));

    return jsonResponse({ success: true, nextPuzzle });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
