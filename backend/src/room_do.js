// room_do.js – Durable Object for Group Rooms
import { CORS_HEADERS } from './utils.js';

function toPublicPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') return puzzle;
  const copy = Array.isArray(puzzle) ? puzzle.slice() : { ...puzzle };
  delete copy.correctIndex;
  return copy;
}

export class GroupRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.roomData = null; // Keeping this as it was in the original and not explicitly removed
    this.messages = [];
    this.hostId = null; // creator user id
    this.lastEvent = null; // last broadcast event for HTTP polling
    this.gameState = {
      isStarted: false,
      currentPuzzleIndex: 0,
      readyUsers: {}, // userId -> boolean
      puzzleEndsAt: null,
      totalPuzzles: 0,
    };

    this.roomId = null;
    this.timePerPuzzle = 60; // default seconds

    // Load state from storage
    this.state.blockConcurrencyWhile(async () => {
      let storedHost = await this.state.storage.get('hostId');
      if (storedHost) this.hostId = storedHost;

      let storedState = await this.state.storage.get('gameState');
      if (storedState) this.gameState = storedState;

      let storedMessages = await this.state.storage.get('messages');
      if (storedMessages) this.messages = storedMessages;

      let storedLastEvent = await this.state.storage.get('lastEvent');
      if (storedLastEvent) this.lastEvent = storedLastEvent;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.includes('/events')) {
      const payload = this.lastEvent || { type: 'noop' };
      return new Response(JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname.includes('/chat-event')) {
      const data = await request.json();
      const chatMsg = data?.message;
      if (chatMsg) {
        this.messages.push(chatMsg);
        if (this.messages.length > 100) this.messages.shift();
        await this.state.storage.put('messages', this.messages);
        this.broadcast({ type: 'chat', message: chatMsg });
      }
      return new Response('OK');
    }

    if (url.pathname.includes('/delete-event')) {
      const data = await request.json();
      this.broadcast({ type: 'room_deleted' });
      await this.state.storage.deleteAll();
      this.sessions.forEach(s => {
        try { s.ws.close(1001, 'Deleted'); } catch (e) { }
      });
      this.sessions = [];
      return new Response('OK');
    }

    if (url.pathname.includes('/reopen')) {
      this.gameState = {
        ...this.gameState,
        status: 'waiting',
        isStarted: false,
        currentPuzzleIndex: 0,
        totalPuzzles: 0,
        currentPuzzle: null,
        solvedBy: null,
        puzzleEndsAt: null,
        readyUsers: {},
      };
      this.lastEvent = { type: 'room_reopened' };
      await this.state.storage.put('gameState', this.gameState);
      await this.state.storage.put('lastEvent', this.lastEvent);
      this.broadcast({ type: 'room_reopened', gameState: this.gameState });
      return new Response('OK');
    }

    // Handle game start event from competitions.js
    if (url.pathname.includes('/start-game-event')) {
      const data = await request.json();
      // set room context and timing
      this.roomId = data.roomId ?? this.roomId;
      this.timePerPuzzle = data.timePerPuzzle ?? this.timePerPuzzle;
      this.gameState.status = 'active';
      this.gameState.currentPuzzleIndex = data.puzzleIndex || 0;
      this.gameState.totalPuzzles = data.totalPuzzles || 5;
      this.gameState.currentPuzzle = toPublicPuzzle(data.puzzle);
      this.gameState.solvedBy = null;
      this.gameState.timePerPuzzle = this.timePerPuzzle;
      this.gameState.puzzleEndsAt = Date.now() + (this.timePerPuzzle * 1000);
      await this.state.storage.put('gameState', this.gameState);
      // schedule alarm for auto-advance
      await this.state.storage.setAlarm(new Date(this.gameState.puzzleEndsAt));

      // Broadcast game start with puzzle to all players
      this.broadcast({
        type: 'game_started',
        gameState: this.gameState,
        puzzle: toPublicPuzzle(data.puzzle),
        puzzleIndex: data.puzzleIndex,
        totalPuzzles: data.totalPuzzles
      });
      // Broadcast timer info
      this.broadcast({
        type: 'timer_started',
        endsAt: this.gameState.puzzleEndsAt,
        durationSec: this.timePerPuzzle,
      });
      return new Response('OK');
    }

    // Handle puzzle solved event
    if (url.pathname.includes('/puzzle-solved')) {
      const data = await request.json();
      this.gameState.solvedBy = data.userId;
      await this.state.storage.put('gameState', this.gameState);
      this.broadcast({
        type: 'puzzle_solved_first',
        userId: data.userId,
        username: data.username,
        puzzleIndex: data.puzzleIndex,
        timeTaken: data.timeTaken
      });
      return new Response('OK');
    }

    // Handle next puzzle event
    if (url.pathname.includes('/next-puzzle')) {
      const data = await request.json();
      // update room context and timing
      this.roomId = data.roomId ?? this.roomId;
      this.timePerPuzzle = data.timePerPuzzle ?? this.timePerPuzzle;
      this.gameState.currentPuzzleIndex = data.puzzleIndex;
      this.gameState.currentPuzzle = toPublicPuzzle(data.puzzle);
      this.gameState.solvedBy = null;
      this.gameState.timePerPuzzle = this.timePerPuzzle;
      this.gameState.puzzleEndsAt = Date.now() + (this.timePerPuzzle * 1000);
      await this.state.storage.put('gameState', this.gameState);
      // schedule next alarm
      await this.state.storage.setAlarm(new Date(this.gameState.puzzleEndsAt));
      this.broadcast({
        type: 'new_puzzle',
        puzzle: toPublicPuzzle(data.puzzle),
        puzzleIndex: data.puzzleIndex,
        gameState: this.gameState
      });
      // Broadcast timer info
      this.broadcast({
        type: 'timer_started',
        endsAt: this.gameState.puzzleEndsAt,
        durationSec: this.timePerPuzzle,
      });
      return new Response('OK');
    }

    // Handle game finish event
    if (url.pathname.includes('/finish-game')) {
      const data = await request.json();
      this.roomId = data.roomId ?? this.roomId;
      this.gameState.status = 'finished';
      await this.state.storage.put('gameState', this.gameState);
      // Optionally include final leaderboard
      let leaderboard = [];
      if (this.roomId) {
        try {
          const rows = await this.env.DB.prepare(
            `SELECT rp.user_id, u.username, rp.score, rp.puzzles_solved
             FROM room_participants rp JOIN users u ON rp.user_id = u.id
             WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC`
          ).bind(this.roomId).all();
          leaderboard = rows.results;
        } catch (e) {
          // ignore leaderboard errors
        }
      }
      this.broadcast({
        type: 'game_finished',
        gameState: this.gameState,
        leaderboard,
      });
      return new Response('OK');
    }

    // Filter by action
    if (url.pathname.includes('/ws')) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }

      // Capture room context from query params
      const qsRoomId = url.searchParams.get('roomId');
      if (qsRoomId) {
        this.roomId = qsRoomId;
      }

      // Ensure hostId matches the actual room owner in DB.
      // This keeps client-side host controls consistent with backend authorization.
      if ((!this.hostId || String(this.hostId).length === 0) && this.roomId) {
        try {
          const row = await this.env.DB.prepare('SELECT created_by FROM rooms WHERE id = ?')
            .bind(this.roomId)
            .first();
          if (row?.created_by !== null && row?.created_by !== undefined) {
            this.hostId = String(row.created_by);
            await this.state.storage.put('hostId', this.hostId);
          }
        } catch (e) {
          // If DB lookup fails, fall back to legacy behavior in handleSession.
        }
      }

      const userId = request.headers.get('X-User-Id');
      const username = request.headers.get('X-User-Name');

      if (!userId || !username) {
        return new Response('Missing Identity Headers', { status: 400 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleSession(server, userId, username);

      const responseHeaders = new Headers();
      const protocol = request.headers.get('Sec-WebSocket-Protocol');
      if (protocol) {
        // Only return the first protocol (bearer) to avoid duplicate header error
        const parts = protocol.split(',').map(p => p.trim());
        if (parts.length > 0) {
          responseHeaders.set('Sec-WebSocket-Protocol', parts[0]);
        }
      }

      return new Response(null, {
        status: 101,
        webSocket: client,
        headers: responseHeaders
      });
    }

    return new Response('Not Found', { status: 404 });
  }

  // Durable Object alarm handler to auto-advance when timer expires
  async alarm() {
    try {
      // Ensure we have room context and active game
      if (!this.roomId || this.gameState.status !== 'active') return;
      const now = Date.now();
      const endsAt = this.gameState.puzzleEndsAt ?? now;
      if (now < endsAt) {
        // Not yet time; reschedule just in case
        await this.state.storage.setAlarm(new Date(endsAt));
        return;
      }

      // Read current room state from DB
      const room = await this.env.DB.prepare('SELECT id, current_puzzle_index, puzzle_count, status FROM rooms WHERE id = ?').bind(this.roomId).first();
      if (!room || room.status !== 'active') return;
      const current = room.current_puzzle_index ?? 0;
      const total = room.puzzle_count ?? (this.gameState.totalPuzzles || 0);

      if (current < total - 1) {
        // Advance to next puzzle
        const nextIndex = current + 1;
        const nextRow = await this.env.DB.prepare('SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?').bind(this.roomId, nextIndex).first();
        if (!nextRow) return;
        const nextPuzzle = JSON.parse(nextRow.puzzle_json);

        await this.env.DB.prepare('UPDATE rooms SET current_puzzle_index = ? WHERE id = ?').bind(nextIndex, this.roomId).run();
        this.gameState.currentPuzzleIndex = nextIndex;
        this.gameState.currentPuzzle = toPublicPuzzle(nextPuzzle);
        this.gameState.solvedBy = null;
        this.gameState.timePerPuzzle = this.timePerPuzzle;
        this.gameState.puzzleEndsAt = Date.now() + (this.timePerPuzzle * 1000);
        await this.state.storage.put('gameState', this.gameState);
        await this.state.storage.setAlarm(new Date(this.gameState.puzzleEndsAt));

        // Broadcast next puzzle and new timer
        this.broadcast({ type: 'new_puzzle', puzzle: toPublicPuzzle(nextPuzzle), puzzleIndex: nextIndex, gameState: this.gameState });
        this.broadcast({ type: 'timer_started', endsAt: this.gameState.puzzleEndsAt, durationSec: this.timePerPuzzle });
      } else {
        // Finish game
        await this.env.DB.prepare('UPDATE rooms SET status = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?').bind('finished', this.roomId).run();
        this.gameState.status = 'finished';
        await this.state.storage.put('gameState', this.gameState);

        let leaderboard = [];
        try {
          const rows = await this.env.DB.prepare(
            `SELECT rp.user_id, u.username, rp.score, rp.puzzles_solved
             FROM room_participants rp JOIN users u ON rp.user_id = u.id
             WHERE rp.room_id = ? ORDER BY rp.score DESC, rp.puzzles_solved DESC`
          ).bind(this.roomId).all();
          leaderboard = rows.results;
        } catch (e) { }
        this.broadcast({ type: 'game_finished', gameState: this.gameState, leaderboard });
      }
    } catch (e) {
      // swallow errors
    }
  }

  async handleSession(ws, userId, username) {
    console.log(`User ${username} (${userId}) attempting to connect`);
    ws.accept();

    // De-duplicate existing sessions for this user if any (cleanup old or ghost connections)
    this.sessions = this.sessions.filter(s => s.userId !== userId);

    // Safety: ensure userId is a string for comparisons
    userId = userId.toString();

    // If hostId wasn't loaded from DB for any reason, fall back to first-join.
    if (!this.hostId) {
      this.hostId = userId;
      await this.state.storage.put('hostId', this.hostId);
      console.log(`Host assigned (fallback): ${userId}`);
    }

    const session = { ws, userId, username };
    this.sessions.push(session);

    const getParticipants = () => {
      return this.sessions.map(s => ({
        userId: s.userId,
        username: s.username,
        isReady: !!this.gameState.readyUsers[s.userId]
      }));
    };
    this.getParticipants = getParticipants; // Make it available to handleMessage

    // Send current state to new participant
    ws.send(JSON.stringify({
      type: 'init',
      messages: this.messages.slice(-50),
      gameState: this.gameState,
      hostId: this.hostId,
      participants: getParticipants()
    }));

    // Broadcast join
    this.broadcast({
      type: 'user_joined',
      userId,
      username,
      hostId: this.hostId,
      participants: getParticipants()
    });

    ws.onmessage = async (msg) => {
      try {
        console.log(`Received message from ${userId}: ${msg.data}`);
        const data = JSON.parse(msg.data);
        await this.handleMessage(session, data);
      } catch (err) {
        console.error(`Error handling message: ${err.message}`);
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    };

    ws.onclose = () => {
      console.log(`Connection closed for user ${userId}`);
      this.sessions = this.sessions.filter(s => s !== session);

      this.broadcast({
        type: 'user_left',
        userId,
        username,
        hostId: this.hostId,
        participants: getParticipants()
      });
    };
  }

  async handleMessage(session, data) {
    const userId = session.userId;
    const username = session.username;

    switch (data.type) {
      case 'chat':
        const chatMsg = {
          id: crypto.randomUUID(),
          userId,
          username,
          text: data.text,
          timestamp: Date.now()
        };
        this.messages.push(chatMsg);
        if (this.messages.length > 100) this.messages.shift();
        await this.state.storage.put('messages', this.messages);
        this.broadcast({ type: 'chat', message: chatMsg });
        break;

      case 'toggle_ready':
        this.gameState.readyUsers[userId] = !!data.isReady;
        await this.state.storage.put('gameState', this.gameState);
        this.broadcast({
          type: 'ready_status',
          userId,
          isReady: this.gameState.readyUsers[userId],
          participants: this.getParticipants()
        });
        break;

      case 'kick_user':
        if (session.userId !== this.hostId) {
          throw new Error('Only host can kick users');
        }
        const targetSession = this.sessions.find(s => s.userId === data.targetUserId);
        if (targetSession) {
          targetSession.ws.send(JSON.stringify({ type: 'kicked' }));
          targetSession.ws.close(1000, 'Kicked by host');
        }
        break;

      case 'start_game':
        if (session.userId !== this.hostId) {
          throw new Error('Only host can manually start game');
        }
        await this.startGame();
        break;

      case 'solve_puzzle':
        if (this.gameState.solvedBy === null) {
          this.gameState.solvedBy = session.userId;
          this.broadcast({
            type: 'puzzle_solved_first',
            userId: session.userId,
            username: session.username,
            puzzleIndex: data.puzzleIndex
          });
        }
        break;

      case 'next_puzzle':
        this.gameState.currentPuzzleIndex = data.puzzleIndex;
        this.gameState.currentPuzzle = toPublicPuzzle(data.puzzle);
        this.gameState.solvedBy = null;
        await this.state.storage.put('gameState', this.gameState);
        this.broadcast({
          type: 'new_puzzle',
          puzzle: toPublicPuzzle(data.puzzle),
          puzzleIndex: data.puzzleIndex,
          gameState: this.gameState
        });
        break;

      case 'finish_game':
        this.gameState.status = 'finished';
        this.broadcast({ type: 'game_finished', gameState: this.gameState });
        break;
    }
  }

  async startGame() {
    this.gameState.status = 'active';
    this.gameState.currentPuzzleIndex = 0;
    this.gameState.solvedBy = null;
    this.broadcast({ type: 'game_started', gameState: this.gameState });
  }

  broadcast(message) {
    const data = JSON.stringify(message);
    this.lastEvent = message;
    this.state.storage.put('lastEvent', message);
    this.sessions.forEach(s => {
      try {
        s.ws.send(data);
      } catch (e) {
        // Ignore disconnected
      }
    });
  }
}
