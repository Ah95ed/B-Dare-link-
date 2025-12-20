// room_do.js – Durable Object for Group Rooms
import { CORS_HEADERS } from './utils.js';

export class GroupRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.roomData = null;
    this.messages = [];
    this.hostId = null; // creator user id
    this.gameState = {
      status: 'waiting',
      currentPuzzleIndex: 0,
      solvedBy: null, 
      lastPuzzleId: null,
      readyUsers: {}, // userId -> boolean
    };
  }

  async fetch(request) {
    const url = new URL(request.url);

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
        responseHeaders.set('Sec-WebSocket-Protocol', protocol);
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

    // First one to join is the host if not already set
    if (!this.hostId) {
      this.hostId = userId;
      console.log(`Host assigned: ${userId}`);
    }

    // De-duplicate existing sessions for this user if any
    this.sessions = this.sessions.filter(s => s.userId !== userId);
    
    const session = { ws, userId, username };
    this.sessions.push(session);

    const getParticipants = () => {
      return this.sessions.map(s => ({ 
        userId: s.userId, 
        username: s.username,
        isReady: !!this.gameState.readyUsers[s.userId]
      }));
    };

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

      case 'toggle_ready':
        this.gameState.readyUsers[session.userId] = data.isReady;
        this.broadcast({
          type: 'ready_status',
          userId: session.userId,
          isReady: data.isReady,
          participants: this.sessions.map(s => ({ 
            userId: s.userId, 
            username: s.username,
            isReady: !!this.gameState.readyUsers[s.userId]
          }))
        });

        // Check if all are ready to start
        const allReady = this.sessions.length >= 2 && this.sessions.every(s => this.gameState.readyUsers[s.userId]);
        if (allReady && this.gameState.status === 'waiting') {
          await this.startGame();
        }
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
