// competitions.js – Multiplayer competitions and rooms
import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { linkChainMinMax } from './prompt.js';

// Generate unique room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Public puzzle payloads must not leak the correct answer before a user answers.
function toPublicPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') return puzzle;
  const copy = Array.isArray(puzzle) ? puzzle.slice() : { ...puzzle };
  delete copy.correctIndex;
  return copy;
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

    // Add creator as participant with manager role
    await env.DB.prepare('INSERT INTO room_participants (room_id, user_id, is_ready, role) VALUES (?, ?, ?, ?)')
      .bind(roomId, user.id, 1, 'manager') // Creator is manager
      .run();

    // Create default room settings
    await env.DB.prepare(`
      INSERT INTO room_settings (
        room_id, 
        hints_enabled, 
        hints_per_player, 
        hint_penalty_percent,
        allow_report_bad_puzzle,
        auto_advance_seconds,
        shuffle_options,
        show_rankings_live,
        allow_skip_puzzle,
        min_time_per_puzzle,
        manager_can_skip_puzzle,
        manager_can_reset_scores,
        manager_can_freeze_players,
        manager_can_kick_players,
        manager_can_change_difficulty,
        allow_co_managers,
        show_detailed_stats_to_all
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      roomId,
      1, // hints_enabled
      3, // hints_per_player
      10, // hint_penalty_percent
      1, // allow_report_bad_puzzle
      2, // auto_advance_seconds
      1, // shuffle_options
      1, // show_rankings_live
      0, // allow_skip_puzzle
      5, // min_time_per_puzzle
      1, // manager_can_skip_puzzle
      1, // manager_can_reset_scores
      1, // manager_can_freeze_players
      1, // manager_can_kick_players
      1, // manager_can_change_difficulty
      1, // allow_co_managers
      0  // show_detailed_stats_to_all
    ).run();

    console.log('Room settings created for room:', roomId);

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

    // Add participant as regular player
    await env.DB.prepare('INSERT INTO room_participants (room_id, user_id, is_ready, role) VALUES (?, ?, ?, ?)')
      .bind(room.id, user.id, 0, 'player') // Join as player, not ready
      .run();

    return jsonResponse({ success: true, room }, 200);
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// ========== Room Quiz Puzzle Helpers (robustness) ==========
function normalizeQuizPuzzle(raw, { puzzleId = null } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const p = { ...raw };

  if (puzzleId !== null && puzzleId !== undefined) {
    p.puzzleId = puzzleId;
  }

  const question = typeof p.question === 'string' ? p.question.trim() : '';
  const options = Array.isArray(p.options)
    ? p.options.map((o) => String(o ?? '').trim()).filter(Boolean)
    : [];

  if (!question) return null;
  if (options.length < 2) return null;

  if (p.correctIndex === undefined || p.correctIndex === null) return null;
  let correctIndex = Number(p.correctIndex);
  if (!Number.isFinite(correctIndex)) return null;
  correctIndex = Math.trunc(correctIndex);
  if (correctIndex < 0 || correctIndex >= options.length) return null;

  // Ensure stable, valid shape
  p.question = question;
  p.options = options;
  p.correctIndex = correctIndex;
  p.type = p.type || 'quiz';
  return p;
}

function parseAndNormalizeQuizJson(jsonStr, { puzzleId = null } = {}) {
  try {
    const parsed = JSON.parse(jsonStr);
    return normalizeQuizPuzzle(parsed, { puzzleId });
  } catch (_) {
    return null;
  }
}

function safeParseJsonFromModelOutput(rawText) {
  const cleaned = String(rawText ?? '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt to salvage: parse the first JSON object or array embedded in the text.
    const objStart = cleaned.indexOf('{');
    const objEnd = cleaned.lastIndexOf('}');
    if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
      const candidate = cleaned.slice(objStart, objEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
        // fall through
      }
    }

    const arrStart = cleaned.indexOf('[');
    const arrEnd = cleaned.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      const candidate = cleaned.slice(arrStart, arrEnd + 1);
      try {
        return JSON.parse(candidate);
      } catch (_) {
        // fall through
      }
    }

    throw e;
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
    const validator = await import('./puzzle_validator.js');

    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);

    // Get participants
    const participants = await env.DB.prepare(
      'SELECT rp.*, u.username, u.total_score FROM room_participants rp JOIN users u ON rp.user_id = u.id WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC'
    )
      .bind(roomId)
      .all();

    // Per-user current puzzle: use room_participants.current_puzzle_index first.
    // This prevents repeats (especially after wrong answers) because each answer advances the participant.
    let currentPuzzle = null;
    let currentPuzzleIndex = null;
    let globalCurrentPuzzle = null;
    let globalCurrentPuzzleIndex = room.current_puzzle_index ?? null;

    if (room.status === 'active') {
      const me = await env.DB.prepare(
        'SELECT current_puzzle_index FROM room_participants WHERE room_id = ? AND user_id = ?'
      )
        .bind(roomId, user.id)
        .first();

      // If participant index is missing (older rooms), compute first unanswered index.
      if (me && me.current_puzzle_index != null) {
        currentPuzzleIndex = Number(me.current_puzzle_index);
      } else {
        const answeredPuzzles = await env.DB.prepare(
          'SELECT DISTINCT puzzle_index FROM room_results WHERE room_id = ? AND user_id = ?'
        )
          .bind(roomId, user.id)
          .all();
        const answered = new Set(answeredPuzzles.results.map(r => r.puzzle_index));
        for (let i = 0; i < room.puzzle_count; i++) {
          if (!answered.has(i)) {
            currentPuzzleIndex = i;
            break;
          }
        }
        if (currentPuzzleIndex === null) {
          currentPuzzleIndex = room.puzzle_count; // finished
        }
      }

      // Load user's current puzzle if within range
      if (Number.isFinite(currentPuzzleIndex) && currentPuzzleIndex < room.puzzle_count) {
        let puzzleRow = await env.DB.prepare(
          'SELECT id, puzzle_json, solved_by FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        )
          .bind(roomId, currentPuzzleIndex)
          .first();

        // If the puzzle row doesn't exist yet (fast players / background fill), generate it on-demand.
        if (!puzzleRow) {
          console.warn('[ON-DEMAND PUZZLE] Missing room_puzzles row; generating now', {
            roomId,
            puzzleIndex: currentPuzzleIndex,
            lang: room.language,
            difficulty: room.difficulty,
          });
          try {
            const repaired = normalizeQuizPuzzle(
              await generatePuzzleWithRetry(env, room.language || 'ar', room.difficulty || 1)
            );
            if (repaired) {
              await env.DB.prepare(
                'INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)'
              ).bind(roomId, currentPuzzleIndex, JSON.stringify(repaired)).run();
              puzzleRow = await env.DB.prepare(
                'SELECT id, puzzle_json, solved_by FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
              ).bind(roomId, currentPuzzleIndex).first();
            }
          } catch (e) {
            console.error('[ON-DEMAND PUZZLE] Failed to generate', String(e?.message || e));
          }
        }

        if (puzzleRow) {
          const normalized = parseAndNormalizeQuizJson(puzzleRow.puzzle_json);

          const isInvalid = !normalized || !validator.validatePuzzle(normalized, room.language || 'ar').valid;

          // If we ever end up with a bad puzzle in a room (from old data/fallbacks/mixed scripts), repair in-place.
          if (isInvalid) {
            console.warn('[REPAIR PUZZLE] Invalid stored puzzle; regenerating', {
              roomId,
              puzzleIndex: currentPuzzleIndex,
              roomLang: room.language,
              roomDifficulty: room.difficulty,
            });
            try {
              const repaired = normalizeQuizPuzzle(
                await generatePuzzleWithRetry(env, room.language || 'ar', room.difficulty || 1)
              );
              if (repaired) {
                await env.DB.prepare('UPDATE room_puzzles SET puzzle_json = ? WHERE id = ?')
                  .bind(JSON.stringify(repaired), puzzleRow.id)
                  .run();
                currentPuzzle = repaired;
              }
            } catch (e) {
              console.error('[REPAIR PUZZLE] Failed to regenerate puzzle', e);
            }
          } else {
            currentPuzzle = normalized;
          }

          // Add solved_by info if available
          if (puzzleRow.solved_by) {
            const solver = await env.DB.prepare('SELECT username FROM users WHERE id = ?')
              .bind(puzzleRow.solved_by)
              .first();
            if (solver) {
              currentPuzzle._solvedBy = solver.username;
            }
          }
          // Never leak correctIndex in status payloads.
          currentPuzzle = toPublicPuzzle(currentPuzzle);
        }
      }

      // Also compute global puzzle for reference (used by timer/host flows)
      if (globalCurrentPuzzleIndex != null && globalCurrentPuzzleIndex < room.puzzle_count) {
        const globalRow = await env.DB.prepare(
          'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        )
          .bind(roomId, globalCurrentPuzzleIndex)
          .first();
        if (globalRow) {
          const globalNormalized = parseAndNormalizeQuizJson(globalRow.puzzle_json);
          if (globalNormalized) {
            globalCurrentPuzzle = toPublicPuzzle(globalNormalized);
          }
        }
      }
    }

    return jsonResponse({
      room,
      participants: participants.results,
      // Per-user puzzle (authoritative for "no-repeat" progression)
      currentPuzzle,
      currentPuzzleIndex,
      // Extra fields for debugging/admin
      globalCurrentPuzzle,
      globalCurrentPuzzleIndex,
    });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Set ready status (no auto-start; host must start manually)
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

    // Check if all participants are ready (informational only)
    const participants = await env.DB.prepare('SELECT is_ready FROM room_participants WHERE room_id = ?')
      .bind(roomId)
      .all();
    const allReady = participants.results.every((p) => p.is_ready);

    // Do NOT auto-start; only host triggers start via /rooms/start
    return jsonResponse({ success: true, allReady });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}

// Start room game
async function startRoomGame(env, roomId, ctx) {
  const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
  if (!room) return;

  // Validate ALL puzzles (DB and AI) before inserting into room_puzzles.
  // This prevents mixed Arabic/English and other corrupted content from being served.
  const validator = await import('./puzzle_validator.js');

  const puzzleSource = room.puzzle_source || 'database';
  const difficulty = room.difficulty || 1;
  const language = room.language || 'ar';
  const puzzleCount = Math.max(room.puzzle_count || 5, 5); // ensure at least 5 puzzles

  // PERF: Keep room start fast. Prefill a small number synchronously, then fill the rest in the background.
  // This avoids blocking /rooms/start on multiple AI generations when DB is low.
  const PREFILL_SYNC_COUNT = Math.min(2, puzzleCount);
  const puzzlesData = [];
  const seenQuestions = new Set();

  const questionHashOf = (normalized) => JSON.stringify({
    q: (normalized?.question || '').trim().toLowerCase(),
    opts: (normalized?.options || []).map(o => String(o).trim().toLowerCase()).sort(),
  });

  const ensurePuzzleId = async (normalized) => {
    if (!normalized || typeof normalized !== 'object') return null;
    if (normalized.puzzleId) return normalized;
    const lang = room.language || 'ar';
    const level = room.difficulty || 1;
    const jsonStr = JSON.stringify(normalized);
    const inserted = await env.DB.prepare(
      'INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)'
    ).bind(level, lang, jsonStr).run();
    normalized.puzzleId = inserted.meta.last_row_id;
    return normalized;
  };

  const pushPuzzle = async (normalized, sourceTag) => {
    if (!normalized) return false;

    const validation = validator.validatePuzzle(normalized, language);
    if (!validation.valid) {
      console.log('[SKIP INVALID]', {
        sourceTag,
        errors: validation.errors,
        q: String(normalized?.question || '').slice(0, 120),
      });
      return false;
    }

    const qh = questionHashOf(normalized);
    if (seenQuestions.has(qh)) {
      console.log('[SKIP DUPLICATE]', { question: normalized.question, sourceTag });
      return false;
    }
    seenQuestions.add(qh);
    const withId = await ensurePuzzleId(normalized);
    if (!withId) return false;
    puzzlesData.push({
      puzzleId: withId.puzzleId ?? null,
      puzzleJson: JSON.stringify(withId),
      source: sourceTag,
    });
    return true;
  };

  // Helpers to fetch puzzles from DB or AI
  const fillFromDatabase = async (limit, sourceTag = 'db_primary') => {
    if (limit <= 0) return;
    const puzzles = await env.DB.prepare(
      'SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT ?'
    ).bind(difficulty, language, Math.max(limit * 5, limit)).all();

    for (const p of puzzles.results || []) {
      if (puzzlesData.length >= limit) break;
      const normalized = parseAndNormalizeQuizJson(p.json, { puzzleId: p.id });
      if (normalized) {
        await pushPuzzle(normalized, sourceTag);
      }
    }

    if (puzzlesData.length < limit) {
      const anyFallback = await env.DB.prepare(
        'SELECT id, json FROM puzzles ORDER BY RANDOM() LIMIT ?'
      ).bind(Math.max(limit * 3, limit)).all();

      for (const p of anyFallback.results || []) {
        if (puzzlesData.length >= limit) break;
        const normalized = parseAndNormalizeQuizJson(p.json, { puzzleId: p.id });
        if (normalized) {
          await pushPuzzle(normalized, sourceTag === 'db_primary' ? 'db_any' : sourceTag);
        }
      }
    }
  };

  const fillFromAI = async (limit, sourceTag = 'ai') => {
    if (limit <= 0) return;
    while (puzzlesData.length < limit) {
      const aiRaw = await generatePuzzleWithRetry(env, language, difficulty);
      const normalized = normalizeQuizPuzzle(aiRaw, { puzzleId: null });
      if (!normalized) {
        console.warn('AI generated invalid puzzle, skipping');
        continue;
      }
      await pushPuzzle(normalized, sourceTag);
    }
  };

  // Prefill synchronously to start the room quickly.
  // Strategy:
  // - If puzzleSource is 'ai': prefer AI first to avoid repeating cached/banked puzzles.
  // - If puzzleSource is 'database': prefer DB first for speed, but validate and skip bad puzzles.
  try {
    if (puzzleSource === 'ai') {
      await fillFromAI(PREFILL_SYNC_COUNT, 'ai_prefill');
      if (puzzlesData.length < PREFILL_SYNC_COUNT) {
        await fillFromDatabase(PREFILL_SYNC_COUNT, 'db_fallback_prefill');
      }
    } else {
      await fillFromDatabase(PREFILL_SYNC_COUNT, 'db_primary');
      if (puzzlesData.length < PREFILL_SYNC_COUNT) {
        await fillFromAI(PREFILL_SYNC_COUNT, 'ai_fallback_prefill');
      }
    }
  } catch (e) {
    console.error('Prefill puzzles failed', e);
  }

  if (puzzlesData.length === 0) {
    // Absolute fallback: try one AI puzzle.
    const aiRaw = await generatePuzzleWithRetry(env, language, difficulty);
    const normalized = normalizeQuizPuzzle(aiRaw, { puzzleId: null });
    if (!normalized) throw new Error('No puzzles available');
    await pushPuzzle(normalized, 'ai_last_resort');
  }

  // Defensive cleanup: remove any previous state for this room
  await env.DB.batch([
    env.DB.prepare('DELETE FROM room_results WHERE room_id = ?').bind(roomId),
    env.DB.prepare('DELETE FROM room_puzzles WHERE room_id = ?').bind(roomId),
  ]);

  // Store the prefilled puzzles (typically 1-2) so clients can immediately fetch next.
  for (let i = 0; i < puzzlesData.length; i++) {
    await env.DB.prepare(
      'INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)'
    ).bind(roomId, i, puzzlesData[i].puzzleJson).run();
  }

  await env.DB.batch([
    env.DB.prepare('UPDATE rooms SET status = ?, current_puzzle_index = 0, started_at = CURRENT_TIMESTAMP WHERE id = ?')
      .bind('active', roomId),
    env.DB.prepare('UPDATE room_participants SET score = 0, puzzles_solved = 0, current_puzzle_index = 0 WHERE room_id = ?')
      .bind(roomId),
  ]);

  // Notify Durable Object to broadcast game start with first puzzle
  const firstPuzzle = toPublicPuzzle(JSON.parse(puzzlesData[0].puzzleJson));
  const doId = env.ROOM_DO.idFromName(roomId.toString());
  const roomObject = env.ROOM_DO.get(doId);
  await roomObject.fetch(new Request('http://room/start-game-event', {
    method: 'POST',
    body: JSON.stringify({
      type: 'start_game',
      puzzle: firstPuzzle,
      puzzleIndex: 0,
      totalPuzzles: puzzleCount,
      roomId: roomId,
      timePerPuzzle: room.time_per_puzzle || 60
    })
  }));

  // Fill remaining puzzles in the background to avoid blocking room start.
  const fillRemaining = async () => {
    try {
      // Build de-duplication set from what we already inserted.
      const existingRows = await env.DB.prepare(
        'SELECT puzzle_index, puzzle_json FROM room_puzzles WHERE room_id = ? ORDER BY puzzle_index ASC'
      ).bind(roomId).all();
      for (const r of existingRows.results || []) {
        try {
          const pj = JSON.parse(r.puzzle_json);
          const normalized = normalizeQuizPuzzle(pj);
          if (normalized) {
            seenQuestions.add(questionHashOf(normalized));
          }
        } catch (_) {
          // ignore
        }
      }

      for (let idx = puzzlesData.length; idx < puzzleCount; idx++) {
        // Avoid generating if already exists (idempotency / retried background).
        const already = await env.DB.prepare(
          'SELECT id FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        ).bind(roomId, idx).first();
        if (already) continue;

        // Prefer AI when configured to reduce repeats; use DB only when room requests it.
        let normalized = null;
        if (puzzleSource !== 'ai') {
          const dbOne = await env.DB.prepare(
            'SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1'
          ).bind(difficulty, language).first();
          if (dbOne?.json) {
            normalized = parseAndNormalizeQuizJson(dbOne.json, { puzzleId: dbOne.id });
          }
        }
        if (!normalized) {
          const aiRaw = await generatePuzzleWithRetry(env, language, difficulty);
          normalized = normalizeQuizPuzzle(aiRaw, { puzzleId: null });
        }
        if (!normalized) continue;

        const pushed = await pushPuzzle(normalized, puzzleSource === 'ai' ? 'ai_fill_bg' : 'bg_fill');
        if (!pushed) {
          idx--;
          continue;
        }
        await env.DB.prepare(
          'INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)'
        ).bind(roomId, idx, puzzlesData[puzzlesData.length - 1].puzzleJson).run();
      }
    } catch (e) {
      console.warn('[BG FILL] Failed to fill remaining puzzles', String(e?.message || e));
    }
  };

  if (ctx?.waitUntil) {
    ctx.waitUntil(fillRemaining());
  } else {
    // Fallback: do not block the start path; best-effort.
    fillRemaining();
  }
}

// Helper to generate puzzle with retry logic for quality
// CRITICAL: Try AI once, then immediately fall back to DB on validation failure
async function generatePuzzleWithRetry(env, language, level, maxRetries = 2) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[PUZZLE GEN] AI attempt ${attempt}/${maxRetries}`);
      const puzzle = await generateAIPuzzle(env, language, level);
      console.log(`[PUZZLE GEN] ✓ AI success on attempt ${attempt}`);
      return puzzle;
    } catch (error) {
      lastError = error;
      const errMsg = String(error?.message || error);
      console.warn(`[PUZZLE GEN] ✗ AI attempt ${attempt} failed:`, errMsg);

      // If validation failed (language mixing or quality), go to DB immediately
      if (errMsg.includes('validation failed') || errMsg.includes('Language mixing')) {
        console.log('[PUZZLE GEN] Validation failure detected - switching to DB fallback NOW');
        break;
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  }

  // Try DB fallback immediately
  console.log(`[PUZZLE GEN] Trying DB fallback for lang=${language}, level=${level}`);

  try {
    const dbOne = await env.DB.prepare(
      'SELECT id, json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1'
    ).bind(level, language).first();

    if (dbOne?.json) {
      const normalized = parseAndNormalizeQuizJson(dbOne.json, { puzzleId: dbOne.id });
      if (normalized) {
        const validator = await import('./puzzle_validator.js');
        const validation = validator.validatePuzzle(normalized, language);
        if (validation.valid) {
          console.log('[PUZZLE GEN] ✓ Using DB fallback puzzle', {
            level,
            language,
            puzzleId: dbOne.id,
          });
          return normalized;
        }
        console.warn('[PUZZLE GEN] DB fallback puzzle invalid', validation.errors);
      }
    }

    // Try any language/level as last resort
    const dbAny = await env.DB.prepare(
      'SELECT id, json FROM puzzles ORDER BY RANDOM() LIMIT 1'
    ).first();
    if (dbAny?.json) {
      const normalized = parseAndNormalizeQuizJson(dbAny.json, { puzzleId: dbAny.id });
      if (normalized) {
        const validator = await import('./puzzle_validator.js');
        const validation = validator.validatePuzzle(normalized, language);
        if (validation.valid) {
          console.log('[PUZZLE GEN] ✓ Using DB any-language fallback', { puzzleId: dbAny.id });
          return normalized;
        }
      }
    }
  } catch (fallbackError) {
    console.warn('[PUZZLE GEN] DB fallback failed', String(fallbackError?.message || fallbackError));
  }

  throw lastError || new Error(`Could not generate or find valid puzzle after ${maxRetries} AI attempts + DB fallback`);
}

// Helper function to generate AI puzzle (Quiz format for competitions)
// With validation and fallback to database
async function generateAIPuzzle(env, language, level) {
  const validator = await import('./puzzle_validator.js');

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
  const aiModel = env?.AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  const geminiApiKey = env?.GEMINI_API_KEY;
  const geminiModel = env?.GEMINI_MODEL || 'gemini-1.5-flash';

  let content = '';
  let aiProvider = 'none';

  // Try Gemini first
  if (geminiApiKey) {
    try {
      const modelPath = String(geminiModel).startsWith('models/')
        ? String(geminiModel)
        : `models/${geminiModel}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiApiKey}`;

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
            temperature: 0.7, // Reduced from 0.9 for more consistent output
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API Error: ${response.status} ${errText}`);
      }

      const data = await response.json();
      content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      aiProvider = 'gemini';
    } catch (e) {
      console.warn('[AI QUIZ] Gemini generation failed; falling back', {
        model: geminiModel,
        error: String(e?.message || e),
      });
      content = '';
    }
  }

  // Try Cloudflare Workers AI
  if (!content && env?.AI) {
    try {
      const out = await env.AI.run(aiModel, {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 900,
      });

      const text =
        out?.response ??
        out?.result ??
        out?.output_text ??
        out?.text ??
        (typeof out === 'string' ? out : JSON.stringify(out));
      content = String(text);
      aiProvider = 'workers-ai';
    } catch (e) {
      console.warn('[AI QUIZ] Workers AI generation failed; falling back', {
        model: aiModel,
        error: String(e?.message || e),
      });
      content = '';
    }
  }

  // Try OpenAI
  if (!content && openaiApiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiApiKey}` },
        body: JSON.stringify({
          model: openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 900,
        }),
      });
      const data = await response.json();
      content = data?.choices?.[0]?.message?.content ?? '';
      aiProvider = 'openai';
    } catch (e) {
      console.warn('[AI QUIZ] OpenAI generation failed', { error: String(e?.message || e) });
      content = '';
    }
  }

  // Try Groq
  if (!content && groqApiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqApiKey}` },
        body: JSON.stringify({
          model: groqModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const data = await response.json();
      content = data?.choices?.[0]?.message?.content ?? '';
      aiProvider = 'groq';
    } catch (e) {
      console.warn('[AI QUIZ] Groq generation failed', { error: String(e?.message || e) });
      content = '';
    }
  }

  if (!content) {
    throw new Error('No AI provider configured');
  }

  // Parse the JSON response
  const parsed = safeParseJsonFromModelOutput(content);

  // --- Strict Arabic enforcement (repair step) ---
  // The validator is zero-tolerance for Arabic/Latin mixing. Some models occasionally emit Latin
  // characters (e.g. acronyms) even when asked for Arabic. We strip Latin script from all
  // user-facing fields BEFORE validation to avoid startGame failures.
  const stripLatin = (value) => {
    if (typeof value !== 'string') return value;
    // Remove ALL Latin letters (a-z, A-Z) and any non-Arabic, non-digit, non-punctuation chars
    let cleaned = value.replace(/[a-zA-Z]/g, '');
    // Also remove common Latin punctuation that might slip through
    cleaned = cleaned.replace(/[\(\)\[\]\{\}]/g, '');
    // Collapse multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  };

  const stripLatinFromPuzzle = (p) => {
    if (!p || typeof p !== 'object') return p;
    const out = Array.isArray(p) ? p.map(stripLatinFromPuzzle) : { ...p };

    const fields = ['question', 'hint', 'explanation', 'startWord', 'endWord', 'category'];
    for (const f of fields) {
      if (typeof out[f] === 'string') out[f] = stripLatin(out[f]);
    }

    if (Array.isArray(out.options)) {
      out.options = out.options.map((o) => stripLatin(String(o ?? ''))).filter(Boolean);
    }

    if (Array.isArray(out.steps)) {
      out.steps = out.steps.map((s) => {
        const step = s && typeof s === 'object' ? { ...s } : s;
        if (step && typeof step === 'object') {
          if (typeof step.word === 'string') step.word = stripLatin(step.word);
          if (Array.isArray(step.options)) {
            step.options = step.options
              .map((o) => stripLatin(String(o ?? '')))
              .filter(Boolean);
          }
        }
        return step;
      });
    }

    return out;
  };

  const candidate = language === 'ar' ? stripLatinFromPuzzle(parsed) : parsed;

  // Validate the puzzle with our validator
  const validation = validator.validatePuzzle(candidate, language);
  const quality = validator.ratePuzzleQuality(candidate, language);

  console.log('[AI PUZZLE GENERATED]', {
    aiProvider,
    language,
    level,
    valid: validation.valid,
    qualityScore: quality,
    errors: validation.errors,
    warnings: validation.warnings,
  });

  // If validation fails, log error and throw
  if (!validation.valid) {
    console.error('[AI PUZZLE VALIDATION FAILED]', {
      aiProvider,
      errors: validation.errors,
      puzzle: parsed
    });
    throw new Error(`AI puzzle validation failed: ${validation.errors.join('; ')}`);
  }

  // If quality score is too low, REJECT the puzzle completely
  if (quality < 85) {
    console.error('[AI PUZZLE REJECTED - LOW QUALITY]', {
      aiProvider,
      qualityScore: quality,
      threshold: 85,
      warnings: validation.warnings,
      question: candidate?.question?.substring(0, 100),
    });
    throw new Error(`AI puzzle quality too low (${quality}/100). Minimum required: 85`);
  }

  // Sanitize the puzzle
  const sanitized = validator.sanitizePuzzle(candidate);

  // Ensure category is set for wonder_link
  if (useWonderLink) {
    sanitized.category = sanitized.category || 'wonder_link';
  }

  // --- Additional safety layer (Validator + Deduplication + Explanation trimming) ---
  // Compute a stable fingerprint for the puzzle to avoid duplicates at scale.
  async function ensurePuzzleHashesTable() {
    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS puzzle_hashes (
          hash TEXT PRIMARY KEY,
          puzzle_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
    } catch (e) {
      // ignore creation errors - D1 may already be configured
    }
  }

  async function computeHexHash(text) {
    try {
      if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
        const data = new TextEncoder().encode(text);
        const buf = await crypto.subtle.digest('SHA-256', data);
        const arr = Array.from(new Uint8Array(buf));
        return arr.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {
      // fallthrough to node fallback
    }

    try {
      const { createHash } = await import('crypto');
      return createHash('sha256').update(text).digest('hex');
    } catch (e) {
      // Last-resort slow JS hash (not cryptographic)
      let h = 2166136261 >>> 0;
      for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return h.toString(16);
    }
  }

  // Enforce extra constraints for wonder_link: linkSteps length and explanation brevity
  if (useWonderLink) {
    const { linkSteps } = sanitized;
    const { min: chainMin, max: chainMax } = linkChainMinMax(level);
    if (!Array.isArray(linkSteps) || linkSteps.length < chainMin || linkSteps.length > chainMax) {
      console.warn('[AI PUZZLE] Rejecting wonder_link: linkSteps length out of bounds', { len: (linkSteps || []).length, chainMin, chainMax });
      throw new Error('Wonder Link chain length invalid');
    }

    // Ensure each step is Arabic (or matches language) and unique
    const stepSet = new Set();
    for (const s of linkSteps) {
      if (typeof s !== 'string' || s.trim().length === 0) {
        throw new Error('Invalid link step content');
      }
      const low = s.trim().toLowerCase();
      if (stepSet.has(low)) {
        throw new Error('Duplicate link step');
      }
      stepSet.add(low);
      const langCheck = validator.validateLanguage(s, language);
      if (!langCheck.valid) {
        throw new Error('Link step language invalid');
      }
    }
  }

  // Trim/normalize explanation to controlled size: max 140 chars per sentence and max 5 sentences
  if (sanitized.explanation && typeof sanitized.explanation === 'string') {
    const parts = sanitized.explanation.split(/\.|\n/).map(p => p.trim()).filter(Boolean);
    const limited = [];
    for (let i = 0; i < Math.min(parts.length, 5); i++) {
      let s = parts[i];
      if (s.length > 140) s = s.slice(0, 137).trim() + '...';
      limited.push(s);
    }
    sanitized.explanation = limited.join('. ');
  }

  // Deduplication: compute a hash from pair + linkSteps/options to avoid near-duplicates
  await ensurePuzzleHashesTable();
  const dedupKeyBase = `${sanitized.pair?.a || ''}||${sanitized.pair?.b || ''}||${JSON.stringify(sanitized.linkSteps || sanitized.options || [])}`;
  const puzzleHash = await computeHexHash(dedupKeyBase);

  const existing = await env.DB.prepare('SELECT puzzle_id FROM puzzle_hashes WHERE hash = ?').bind(puzzleHash).first();
  if (existing && existing.puzzle_id) {
    console.warn('[AI PUZZLE] Duplicate detected - skipping', { puzzleHash });
    throw new Error('Duplicate puzzle');
  }

  // Record hash now to reserve it (if two parallel generators try same idea)
  try {
    await env.DB.prepare('INSERT OR IGNORE INTO puzzle_hashes (hash, puzzle_id) VALUES (?, ?)').bind(puzzleHash, null).run();
  } catch (e) {
    // non-fatal
  }


  return sanitized;
}

// Submit answer (supports both quiz format and legacy steps format)
export async function submitAnswer(request, env, ctx) {
  const user = await getUserFromRequest(request, env);
  if (!user) return errorResponse('Unauthorized', 401);

  const body = await request.json();
  const { roomId, puzzleIndex, answerIndex, steps, timeTaken } = body;
  const safeTimeTaken = Number.isFinite(Number(timeTaken)) ? Number(timeTaken) : 0;

  // Support both formats: answerIndex (new quiz) or steps (legacy)
  if (!roomId || puzzleIndex === undefined) {
    return errorResponse('Missing required fields', 400);
  }
  if (answerIndex === undefined && !Array.isArray(steps)) {
    return errorResponse('Missing answer (answerIndex or steps)', 400);
  }

  try {
    const validator = await import('./puzzle_validator.js');
    const room = await env.DB.prepare('SELECT * FROM rooms WHERE id = ?').bind(roomId).first();
    if (!room) return errorResponse('Room not found', 404);

    if (room.status !== 'active') {
      return errorResponse('Room is not active', 400);
    }

    // Check if player is frozen
    const participant = await env.DB.prepare(
      'SELECT is_frozen, current_puzzle_index FROM room_participants WHERE room_id = ? AND user_id = ?'
    ).bind(roomId, user.id).first();

    if (participant && participant.is_frozen) {
      return errorResponse('You are frozen by the manager', 403);
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

    // Hard guard: if this user already answered this puzzleIndex, do NOT insert again.
    // This avoids repeats caused by client-side index desync and prevents duplicate scoring.
    const existingAnswer = await env.DB.prepare(
      'SELECT is_correct FROM room_results WHERE room_id = ? AND user_id = ? AND puzzle_index = ? LIMIT 1'
    )
      .bind(roomId, user.id, puzzleIndex)
      .first();

    // If the client is using quiz answers, require quiz-shaped puzzles
    const normalizedQuiz = normalizeQuizPuzzle(puzzle);

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

    if (answerIndex !== undefined) {
      if (!normalizedQuiz) {
        console.log('[ERROR] Invalid quiz puzzle format (answerIndex provided)', {
          answerIndex,
          puzzleKeys: Object.keys(puzzle),
        });
        return errorResponse('Invalid puzzle format', 400);
      }
      // New quiz format: compare answerIndex with correctIndex
      isCorrect = Number(answerIndex) === Number(normalizedQuiz.correctIndex);
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

    // If already answered, return next puzzle without modifying DB or scores.
    if (existingAnswer) {
      // PERF: Most duplicates are re-submits of already-answered indices; use participant pointer as fast path.
      const participantCurrent = Number(participant?.current_puzzle_index ?? 0);
      let nextUserPuzzleIndex = null;
      if (Number.isFinite(participantCurrent) && participantCurrent < room.puzzle_count) {
        nextUserPuzzleIndex = participantCurrent;
      } else if (Number.isFinite(participantCurrent) && participantCurrent >= room.puzzle_count) {
        nextUserPuzzleIndex = null;
      } else {
        // Fallback: compute first unanswered.
        const answeredPuzzles = await env.DB.prepare(
          'SELECT DISTINCT puzzle_index FROM room_results WHERE room_id = ? AND user_id = ? ORDER BY puzzle_index ASC'
        ).bind(roomId, user.id).all();

        const answeredIndices = new Set((answeredPuzzles.results || []).map(r => r.puzzle_index));
        for (let i = 0; i < room.puzzle_count; i++) {
          if (!answeredIndices.has(i)) {
            nextUserPuzzleIndex = i;
            break;
          }
        }
      }

      let nextPuzzle = null;
      let gameFinished = false;
      if (nextUserPuzzleIndex === null) {
        gameFinished = true;
      } else {
        const nextPuzzleRow = await env.DB.prepare(
          'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        )
          .bind(roomId, nextUserPuzzleIndex)
          .first();
        if (nextPuzzleRow) {
          nextPuzzle = toPublicPuzzle(JSON.parse(nextPuzzleRow.puzzle_json));
        }
      }

      // Keep participant pointer correct even if client re-submitted.
      await env.DB.prepare(
        'UPDATE room_participants SET current_puzzle_index = ? WHERE room_id = ? AND user_id = ?'
      )
        .bind(gameFinished ? room.puzzle_count : nextUserPuzzleIndex, roomId, user.id)
        .run();

      return jsonResponse({
        success: true,
        alreadyAnswered: true,
        isCorrect: existingAnswer.is_correct === 1,
        isFirstCorrect: false,
        points: 0,
        rank: null,
        correctIndex: normalizedQuiz ? Number(normalizedQuiz.correctIndex) : null,
        nextPuzzle,
        nextPuzzleIndex: gameFinished ? null : nextUserPuzzleIndex,
        gameFinished,
      });
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
      .bind(roomId, user.id, puzzleId, puzzleIndex, isCorrect, safeTimeTaken)
      .run();

    let points = 0;
    let rank = null;

    if (isCorrect) {
      // Calculate points based on speed and if first
      if (isFirstCorrect) {
        // Bonus for being first
        points = Math.max(500, 2000 - Math.floor(safeTimeTaken / 50));
        rank = 1;
      } else {
        // Regular points for correct answer
        points = Math.max(100, 1000 - Math.floor(safeTimeTaken / 100));

        // Get rank (how many solved before this user)
        const fasterCount = await env.DB.prepare(
          'SELECT COUNT(*) AS c FROM room_results WHERE room_id = ? AND puzzle_index = ? AND is_correct = 1 AND time_taken < ?'
        )
          .bind(roomId, puzzleIndex, safeTimeTaken)
          .first();
        rank = fasterCount.c + 1;
      }

      // Update participant score (advance index handled after we compute nextUserPuzzleIndex)
      await env.DB.prepare(
        'UPDATE room_participants SET score = score + ?, puzzles_solved = puzzles_solved + 1 WHERE room_id = ? AND user_id = ?'
      )
        .bind(points, roomId, user.id)
        .run();

      // Notify Durable Object about first solve (do not block answer response)
      if (isFirstCorrect) {
        const doId = env.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env.ROOM_DO.get(doId);
        const req = new Request('http://room/puzzle-solved', {
          method: 'POST',
          body: JSON.stringify({
            type: 'puzzle_solved_first',
            userId: user.id,
            username: user.username,
            puzzleIndex: puzzleIndex,
            timeTaken: safeTimeTaken
          })
        });
        if (ctx?.waitUntil) ctx.waitUntil(roomObject.fetch(req));
        else await roomObject.fetch(req);
      }
    }

    // منطق جديد: كل لاعب ينتقل للسؤال التالي فورًا بعد إجابته
    // لا نحتاج انتظار باقي اللاعبين
    let nextPuzzle = null;
    let nextPuzzleIndex = null;
    let gameFinished = false;

    // Fast path: in normal flow user answers sequentially.
    // If the answer is for their current pointer, we can compute next index without scanning all results.
    const participantCurrent = Number(participant?.current_puzzle_index ?? 0);
    let nextUserPuzzleIndex = null;
    if (Number.isFinite(participantCurrent) && Number(puzzleIndex) === participantCurrent) {
      const candidate = participantCurrent + 1;
      nextUserPuzzleIndex = candidate >= room.puzzle_count ? null : candidate;
    } else {
      // Fallback (rare): compute first unanswered.
      const answeredPuzzles = await env.DB.prepare(
        'SELECT DISTINCT puzzle_index FROM room_results WHERE room_id = ? AND user_id = ? ORDER BY puzzle_index ASC'
      ).bind(roomId, user.id).all();
      const answeredIndices = new Set((answeredPuzzles.results || []).map(r => r.puzzle_index));
      for (let i = 0; i < room.puzzle_count; i++) {
        if (!answeredIndices.has(i)) {
          nextUserPuzzleIndex = i;
          break;
        }
      }
    }

    // إذا لم يجد سؤال غير مُجاب عليه، اللعبة انتهت له
    if (nextUserPuzzleIndex === null) {
      gameFinished = true;
    } else {
      // الحصول على السؤال التالي
      let nextPuzzleRow = await env.DB.prepare(
        'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
      )
        .bind(roomId, nextUserPuzzleIndex)
        .first();

      // If missing (fast answers / bg fill), generate and insert on-demand.
      if (!nextPuzzleRow) {
        console.warn('[ON-DEMAND NEXT] Missing next puzzle row; generating now', {
          roomId,
          puzzleIndex: nextUserPuzzleIndex,
          lang: room.language,
          difficulty: room.difficulty,
        });
        try {
          const generated = normalizeQuizPuzzle(
            await generatePuzzleWithRetry(env, room.language || 'ar', room.difficulty || 1)
          );
          if (generated) {
            // Persist so future status calls return it.
            await env.DB.prepare(
              'INSERT INTO room_puzzles (room_id, puzzle_index, puzzle_json) VALUES (?, ?, ?)'
            ).bind(roomId, nextUserPuzzleIndex, JSON.stringify(generated)).run();
            nextPuzzleRow = { puzzle_json: JSON.stringify(generated) };
          }
        } catch (e) {
          console.error('[ON-DEMAND NEXT] Failed to generate', String(e?.message || e));
        }
      }

      if (nextPuzzleRow?.puzzle_json) {
        // Validate/repair if stored puzzle is corrupted or mixed-script.
        let parsedNext = null;
        try {
          parsedNext = JSON.parse(nextPuzzleRow.puzzle_json);
        } catch (_) {
          parsedNext = null;
        }
        let normalizedNext = parsedNext ? normalizeQuizPuzzle(parsedNext) : null;
        const isInvalidNext = !normalizedNext || !validator.validatePuzzle(normalizedNext, room.language || 'ar').valid;
        if (isInvalidNext) {
          try {
            const repaired = normalizeQuizPuzzle(
              await generatePuzzleWithRetry(env, room.language || 'ar', room.difficulty || 1)
            );
            if (repaired) {
              await env.DB.prepare(
                'UPDATE room_puzzles SET puzzle_json = ? WHERE room_id = ? AND puzzle_index = ?'
              ).bind(JSON.stringify(repaired), roomId, nextUserPuzzleIndex).run();
              normalizedNext = repaired;
            }
          } catch (e) {
            console.error('[REPAIR NEXT] Failed to repair next puzzle', String(e?.message || e));
          }
        }

        if (normalizedNext) {
          // Never leak correctIndex in next puzzle payloads.
          nextPuzzle = toPublicPuzzle(normalizedNext);
        }
      }

      nextPuzzleIndex = nextUserPuzzleIndex;
    }

    // Always advance participant pointer after ANY answer (correct or wrong).
    await env.DB.prepare(
      'UPDATE room_participants SET current_puzzle_index = ? WHERE room_id = ? AND user_id = ?'
    )
      .bind(gameFinished ? room.puzzle_count : nextUserPuzzleIndex, roomId, user.id)
      .run();

    // PERF: Update global current_puzzle_index from participant pointers (avoid scanning room_results).
    // Note: participant.current_puzzle_index points to NEXT puzzle to answer.
    const maxPtr = await env.DB.prepare(
      'SELECT MAX(current_puzzle_index) AS max_ptr FROM room_participants WHERE room_id = ?'
    ).bind(roomId).first();
    if (maxPtr?.max_ptr != null) {
      const computedGlobal = Math.max(0, Number(maxPtr.max_ptr) - 1);
      await env.DB.prepare('UPDATE rooms SET current_puzzle_index = ? WHERE id = ?')
        .bind(computedGlobal, roomId)
        .run();
    }

    // التحقق: هل انتهى الجميع؟ (للإعلان عن نهاية اللعبة عالميًا)
    const allParticipantsCount = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ?'
    ).bind(roomId).first();

    // PERF: Finished = participant pointer >= puzzle_count
    const finishedParticipants = await env.DB.prepare(
      'SELECT COUNT(*) AS c FROM room_participants WHERE room_id = ? AND current_puzzle_index >= ?'
    ).bind(roomId, room.puzzle_count).first();

    // إذا أنهى الجميع، أغلق اللعبة
    if (finishedParticipants.c >= allParticipantsCount.c && room.status !== 'finished') {
      await env.DB.prepare('UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?')
        .bind('finished', roomId)
        .run();

      const doId = env.ROOM_DO.idFromName(roomId.toString());
      const roomObject = env.ROOM_DO.get(doId);
      const req = new Request('http://room/finish-game', {
        method: 'POST',
        body: JSON.stringify({ type: 'finish_game', roomId: roomId })
      });
      if (ctx?.waitUntil) ctx.waitUntil(roomObject.fetch(req));
      else await roomObject.fetch(req);
    }

    return jsonResponse({
      success: true,
      isCorrect,
      isFirstCorrect,
      points,
      rank,
      // Reveal correctIndex only after answering (anti-cheat)
      correctIndex: normalizedQuiz ? Number(normalizedQuiz.correctIndex) : null,
      nextPuzzle,
      nextPuzzleIndex,
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
export async function manualStartGame(request, env, ctx) {
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
    await startRoomGame(env, roomId, ctx);

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

    // Clean up ALL dependent tables to satisfy FK constraints (order matters!)
    await env.DB.prepare('DELETE FROM manager_actions WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM puzzle_reports WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_results WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_puzzles WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_participants WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM room_settings WHERE room_id = ?').bind(roomId).run();
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

    // Clear ALL dependent data (including manager_actions & puzzle_reports)
    await env.DB.prepare('DELETE FROM manager_actions WHERE room_id = ?').bind(roomId).run();
    await env.DB.prepare('DELETE FROM puzzle_reports WHERE room_id = ?').bind(roomId).run();
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

    let nextPuzzle = parseAndNormalizeQuizJson(nextRow.puzzle_json);
    if (!nextPuzzle) {
      console.warn('[REPAIR PUZZLE] Invalid next puzzle; regenerating', {
        roomId,
        puzzleIndex: nextIdx,
      });
      try {
        const repaired = normalizeQuizPuzzle(
          await generatePuzzleWithRetry(env, room.language || 'ar', room.difficulty || 1)
        );
        if (!repaired) return errorResponse('Next puzzle invalid', 500);
        await env.DB.prepare('UPDATE room_puzzles SET puzzle_json = ? WHERE room_id = ? AND puzzle_index = ?')
          .bind(JSON.stringify(repaired), roomId, nextIdx)
          .run();
        nextPuzzle = repaired;
      } catch (e) {
        return errorResponse('Next puzzle invalid', 500);
      }
    }

    // Never leak correctIndex in forced-next payloads.
    const publicNextPuzzle = toPublicPuzzle(nextPuzzle);

    const doId = env.ROOM_DO.idFromName(roomId.toString());
    const roomObject = env.ROOM_DO.get(doId);
    await roomObject.fetch(new Request('http://room/next-puzzle', {
      method: 'POST',
      body: JSON.stringify({
        type: 'next_puzzle',
        puzzle: publicNextPuzzle,
        puzzleIndex: nextIdx,
        roomId: roomId,
        timePerPuzzle: room.time_per_puzzle || 60
      })
    }));

    return jsonResponse({ success: true, nextPuzzle: publicNextPuzzle });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
