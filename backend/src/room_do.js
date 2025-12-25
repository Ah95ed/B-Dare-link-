// room_do.js – Durable Object for Group Rooms
import { CORS_HEADERS } from './utils.js';

export class GroupRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.roomData = null; // Keeping this as it was in the original and not explicitly removed
    this.messages = [];
    this.hostId = null; // creator user id
    this.gameState = {
      isStarted: false,
      currentPuzzleIndex: 0,
      readyUsers: {}, // userId -> boolean
    };

    // Load state from storage
    this.state.blockConcurrencyWhile(async () => {
      let storedHost = await this.state.storage.get('hostId');
      if (storedHost) this.hostId = storedHost;
      
      let storedState = await this.state.storage.get('gameState');
      if (storedState) this.gameState = storedState;

      let storedMessages = await this.state.storage.get('messages');
      if (storedMessages) this.messages = storedMessages;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.includes('/delete-event')) {
      const data = await request.json();
      this.broadcast({ type: 'room_deleted' });
      await this.state.storage.deleteAll();
      this.sessions.forEach(s => {
        try { s.ws.close(1001, 'Deleted'); } catch(e) {}
      });
      this.sessions = [];
      return new Response('OK');
    }

    // Handle game start event from competitions.js
    if (url.pathname.includes('/start-game-event')) {
      const data = await request.json();
      this.gameState.status = 'active';
      this.gameState.currentPuzzleIndex = data.puzzleIndex || 0;
      this.gameState.totalPuzzles = data.totalPuzzles || 5;
      this.gameState.currentPuzzle = data.puzzle;
      this.gameState.solvedBy = null;
      await this.state.storage.put('gameState', this.gameState);
      
      // Broadcast game start with puzzle to all players
      this.broadcast({
        type: 'game_started',
        gameState: this.gameState,
        puzzle: data.puzzle,
        puzzleIndex: data.puzzleIndex,
        totalPuzzles: data.totalPuzzles
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
      this.gameState.currentPuzzleIndex = data.puzzleIndex;
      this.gameState.currentPuzzle = data.puzzle;
      this.gameState.solvedBy = null;
      await this.state.storage.put('gameState', this.gameState);
      this.broadcast({
        type: 'new_puzzle',
        puzzle: data.puzzle,
        puzzleIndex: data.puzzleIndex,
        gameState: this.gameState
      });
      return new Response('OK');
    }

    // Handle game finish event
    if (url.pathname.includes('/finish-game')) {
      this.gameState.status = 'finished';
      await this.state.storage.put('gameState', this.gameState);
      this.broadcast({
        type: 'game_finished',
        gameState: this.gameState
      });
      return new Response('OK');
    }

    // Filter by action
    if (url.pathname.includes('/ws')) {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
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

  async handleSession(ws, userId, username) {
    console.log(`User ${username} (${userId}) attempting to connect`);
    ws.accept();

    // De-duplicate existing sessions for this user if any (cleanup old or ghost connections)
    this.sessions = this.sessions.filter(s => s.userId !== userId);
    
    // Safety: ensure userId is a string for comparisons
    userId = userId.toString();

    // First one to join is the host if not already set
    if (!this.hostId) {
      this.hostId = userId;
      await this.state.storage.put('hostId', this.hostId);
      console.log(`Host assigned: ${userId}`);
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
      
      // If host left, assign new host if anyone left
      if (this.hostId === userId && this.sessions.length > 0) {
        this.hostId = this.sessions[0].userId;
        console.log(`Host reassigned to: ${this.hostId}`);
      }

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
        this.gameState.currentPuzzle = data.puzzle;
        this.gameState.solvedBy = null;
        await this.state.storage.put('gameState', this.gameState);
        this.broadcast({ 
          type: 'new_puzzle', 
          puzzle: data.puzzle,
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
    this.sessions.forEach(s => {
      try {
        s.ws.send(data);
      } catch (e) {
        // Ignore disconnected
      }
    });
  }
}
