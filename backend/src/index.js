// index.js – Cloudflare Worker entry point (modularized)
import { CORS_HEADERS, errorResponse } from './utils.js';
import { register, login, getUserFromRequest, updateProfile, deleteAccount, resetPassword } from './auth.js';
import { getProgress, saveProgress } from './progress.js';
import { generateLevel, submitSolution } from './game.js';
import { listPuzzles, deletePuzzle, regeneratePuzzle, generateBulkPuzzles } from './admin.js';
import {
  createRoom,
  joinRoom,
  getRoomStatus,
  setReady,
  submitAnswer,
  getLeaderboard,
  createCompetition,
  joinCompetition,
  getActiveCompetitions,
  getMyRooms,
  leaveRoom,
  kickUser,
  deleteRoom,
  manualStartGame,
  reopenRoom,
  forceNextPuzzle,
} from './competitions.js';
import { GroupRoom } from './room_do.js';

export { GroupRoom };

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // ---------- Auth ----------
      if (path === '/auth/register' && request.method === 'POST') {
        return await register(request, env);
      }
      if (path === '/auth/login' && request.method === 'POST') {
        return await login(request, env);
      }
      if (path === '/auth/reset' && request.method === 'POST') {
        return await resetPassword(request, env);
      }
      if (path === '/auth/me') {
        const user = await getUserFromRequest(request, env);
        if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
        if (request.method === 'GET') {
          return new Response(JSON.stringify(user), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
        }
        if (request.method === 'PUT') {
          return await updateProfile(request, env, user.id);
        }
        if (request.method === 'DELETE') {
          return await deleteAccount(request, env, user.id);
        }
      }

      // ---------- Progress ----------
      if (path === '/progress') {
        const user = await getUserFromRequest(request, env);
        if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
        if (request.method === 'GET') {
          return await getProgress(request, env);
        }
        if (request.method === 'POST') {
          return await saveProgress(request, env);
        }
      }

      // ---------- Game ----------
      if ((path === '/generate-level' || path === '/api/generate') && request.method === 'POST') {
        return await generateLevel(request, env, CORS_HEADERS);
      }
      if ((path === '/submit-solution' || path === '/api/submit') && request.method === 'POST') {
        return await submitSolution(request, env, CORS_HEADERS);
      }

      // ---------- Admin ----------
      if (path.startsWith('/admin/puzzles')) {
        if (request.method === 'GET') return await listPuzzles(request, env);
        if (request.method === 'DELETE') return await deletePuzzle(request, env);
      }
      if (path === '/admin/puzzles/regenerate' && request.method === 'POST') {
        return await regeneratePuzzle(request, env, CORS_HEADERS);
      }
      if (path === '/admin/puzzles/generate-bulk' && request.method === 'POST') {
        return await generateBulkPuzzles(request, env, CORS_HEADERS);
      }

      // ---------- Competitions & Rooms ----------
      if (path === '/competitions' || path === '/api/competitions/active') {
        if (request.method === 'GET') {
          return await getActiveCompetitions(request, env);
        }
        if (request.method === 'POST') {
          return await createCompetition(request, env);
        }
      }
      if (path === '/competitions/join' || path === '/api/competitions/join') {
        if (request.method === 'POST') {
          return await joinCompetition(request, env);
        }
      }

      // Rooms
      if (path === '/rooms' && request.method === 'POST') {
        return await createRoom(request, env);
      }
      if (path === '/rooms/join' && request.method === 'POST') {
        return await joinRoom(request, env);
      }
      if (url.pathname === '/api/rooms/my' && request.method === 'GET') {
        return getMyRooms(request, env);
      }
      if ((path === '/rooms/status' || url.pathname === '/api/rooms/status') && request.method === 'GET') {
        return await getRoomStatus(request, env);
      }
      if (url.pathname === '/api/rooms/leave' && request.method === 'POST') {
        return await leaveRoom(request, env);
      }
      if (url.pathname === '/api/rooms/kick' && request.method === 'POST') {
        return await kickUser(request, env);
      }
      if (url.pathname === '/api/rooms/delete' && request.method === 'DELETE') {
        return await deleteRoom(request, env);
      }
      if (path === '/rooms/ready' && request.method === 'POST') {
        return await setReady(request, env);
      }
      if (path === '/rooms/answer' && request.method === 'POST') {
        return await submitAnswer(request, env);
      }
      if (path === '/rooms/leaderboard' && request.method === 'GET') {
        return await getLeaderboard(request, env);
      }
      if (path === '/rooms/start' && request.method === 'POST') {
        return await manualStartGame(request, env);
      }
      if (path === '/rooms/reopen' && request.method === 'POST') {
        return await reopenRoom(request, env);
      }
      if (path === '/rooms/next' && request.method === 'POST') {
        return await forceNextPuzzle(request, env);
      }

      // WebSocket for Rooms (Real-time Chat & Game)
      if (path === '/rooms/ws') {
        const roomId = url.searchParams.get('roomId');
        if (!roomId) return errorResponse('roomId required', 400);

        // Ensure user is authorized
        const user = await getUserFromRequest(request, env);
        if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });

        const id = env.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env.ROOM_DO.get(id);

        // Create a new request based on the original one but for the DO
        const doHeaders = new Headers(request.headers);
        doHeaders.set('X-User-Id', user.id.toString());
        doHeaders.set('X-User-Name', user.username);

        const doRequest = new Request(request, {
          headers: doHeaders
        });

        return roomObject.fetch(doRequest);
      }

      // No route matched
      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    } catch (e) {
      console.error(e);
      return errorResponse(e.message, 500);
    }
  },
};
