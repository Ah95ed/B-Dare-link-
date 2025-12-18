// room_do.js – Durable Object for Group Rooms
import { CORS_HEADERS } from './utils.js';

export class GroupRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.roomData = null;
    this.messages = [];
    this.gameState = {
      status: 'waiting',
      currentPuzzleIndex: 0,
      solvedBy: null, // userId of who solved it first
      lastPuzzleId: null,
    };
  }

  async fetch(request) {
    const url = new URL(request.url);

    // Filter by action
    if (url.pathname === '/ws') {
      if (request.headers.get('Upgrade') !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      await this.handleSession(server, url.searchParams.get('userId'), url.searchParams.get('username'));

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not Found', { status: 404 });
  }

  async handleSession(ws, userId, username) {
    ws.accept();

    const session = { ws, userId, username };
    this.sessions.push(session);

    // Send current state to new participant
    ws.send(JSON.stringify({
      type: 'init',
      messages: this.messages.slice(-50),
      gameState: this.gameState,
      participants: this.sessions.map(s => ({ userId: s.userId, username: s.username }))
    }));

    // Broadcast join
    this.broadcast({
      type: 'user_joined',
      userId,
      username,
      participants: this.sessions.map(s => ({ userId: s.userId, username: s.username }))
    });

    ws.onmessage = async (msg) => {
      try {
        const data = JSON.parse(msg.data);
        await this.handleMessage(session, data);
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    };

    ws.onclose = () => {
      this.sessions = this.sessions.filter(s => s !== session);
      this.broadcast({
        type: 'user_left',
        userId,
        username,
        participants: this.sessions.map(s => ({ userId: s.userId, username: s.username }))
      });
    };
  }

  async handleMessage(session, data) {
    switch (data.type) {
      case 'chat':
        const msg = {
          type: 'chat',
          userId: session.userId,
          username: session.username,
          text: data.text,
          timestamp: Date.now()
        };
        this.messages.push(msg);
        this.broadcast(msg);
        break;

      case 'start_game':
        this.gameState.status = 'active';
        this.gameState.currentPuzzleIndex = 0;
        this.gameState.solvedBy = null;
        this.broadcast({ type: 'game_started', gameState: this.gameState });
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
        this.gameState.currentPuzzleIndex = data.nextIndex;
        this.gameState.solvedBy = null;
        this.broadcast({ type: 'new_puzzle', gameState: this.gameState });
        break;
      
      case 'finish_game':
        this.gameState.status = 'finished';
        this.broadcast({ type: 'game_finished', gameState: this.gameState });
        break;
    }
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
