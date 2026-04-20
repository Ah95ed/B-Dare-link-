// index.js – Cloudflare Worker entry point (modularized)
import { CORS_HEADERS, errorResponse } from './utils.js';
import { register, login, updateProfile, deleteAccount, resetPassword } from './auth.js';
import { getProgress, saveProgress } from './progress.js';
import { requireAuth } from './middleware/auth_middleware.js';
import { requiresAuth } from './middleware/route_guard.js';
import { generateLevel, submitSolution } from './game.js';
import {
  getSoloLevelPack,
  refillSoloBank,
  runAutoSoloBankTopUp,
  soloBankPublicGenerate,
  soloBankPublicStatus,
} from './solo_bank.js';
import { generatePathLevel } from './game_path.js';
import {
  listPuzzles,
  deletePuzzle,
  regeneratePuzzle,
  generateBulkPuzzles,
  importPuzzles,
} from './admin.js';
import { getDailyChallenge, submitDailyScore, getDailyLeaderboard, getWeeklyStandings } from './tournament.js';
import { generatePuzzleFromImage } from './vision.js';
import { generateSpotDiffPuzzle } from './spot_diff.js';
import { cleanupPuzzlesEndpoint, runPuzzleCleanup } from './cleanup.js';
import {
  createRoom,
  joinRoom,
  sendRoomChat,
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
import {
  getRoomSettings,
  updateRoomSettings,
  getHint,
  reportBadPuzzle,
  getPuzzleReports,
} from './settings.js';
import {
  kickPlayer,
  freezePlayer,
  resetScores,
  skipPuzzle,
  changeDifficulty,
  transferManager,
  promoteToCoManager,
  getManagerLogs,
  getDetailedStats,
} from './manager_permissions.js';
import { GroupRoom } from './room_do.js';
import { SOLO_BANK_GENERATOR_PAGE_HTML } from './solo_bank_generator_html.js';

function escapeHtmlAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export { GroupRoom };

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/solo-bank-tools' && request.method === 'GET') {
      const key = env.SOLO_BANK_WEB_KEY ?? '';
      const html = SOLO_BANK_GENERATOR_PAGE_HTML.replace(
        '__INJECT_KEY__',
        escapeHtmlAttr(key),
      );
      return new Response(html, {
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    if (path === '/solo-bank/generate' && request.method === 'POST') {
      return await soloBankPublicGenerate(request, env, CORS_HEADERS, ctx);
    }

    if (path === '/solo-bank/status' && request.method === 'GET') {
      return await soloBankPublicStatus(request, env);
    }

    try {
      const shouldAuth = requiresAuth(path, request.method);
      const authContext = shouldAuth ? await requireAuth(request, env) : null;
      if (shouldAuth && authContext?.response) return authContext.response;
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
        const user = authContext?.user;
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
        const { user, response } = await requireAuth(request, env);
        if (!user) return response;
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
      // New: Path-based puzzle system
      if (path === '/api/generate-path' && request.method === 'POST') {
        return await generatePathLevel(request, env, CORS_HEADERS);
      }
      if ((path === '/submit-solution' || path === '/api/submit') && request.method === 'POST') {
        return await submitSolution(request, env, CORS_HEADERS);
      }
      if (
        (path === '/api/solo/level-pack' || path === '/solo/level-pack') &&
        request.method === 'POST'
      ) {
        return await getSoloLevelPack(request, env, CORS_HEADERS);
      }

      // ---------- Vision (Reality Mode) ----------
      if (path === '/api/generate-from-image' && request.method === 'POST') {
        return await generatePuzzleFromImage(request, env);
      }

      // ---------- Spot the Difference (AI Images) ----------
      if (
        (path === '/api/generate-spot-diff' ||
          path === '/generate-spot-diff') &&
        request.method === 'POST'
      ) {
        return await generateSpotDiffPuzzle(request, env);
      }

      // ---------- List Available Gemini Models (disabled) ----------
      if (
        (path === '/api/list-gemini-models' || path === '/list-gemini-models') &&
        request.method === 'GET'
      ) {
        return errorResponse(
          'Gemini model listing is disabled on this deployment.',
          503,
        );
      }

      // ---------- Test Gemini Text Generation (disabled) ----------
      if (
        (path === '/api/test-gemini-text' || path === '/test-gemini-text') &&
        request.method === 'GET'
      ) {
        return errorResponse(
          'Gemini test endpoint is disabled on this deployment.',
          503,
        );
      }

      // ---------- Admin ----------
      if (path.startsWith('/admin/puzzles')) {
        if (request.method === 'GET') return await listPuzzles(request, env);
        if (request.method === 'DELETE') return await deletePuzzle(request, env);
        if (request.method === 'POST' && path === '/admin/puzzles') {
          return await importPuzzles(request, env);
        }
      }
      if (path === '/admin/puzzles/cleanup' && request.method === 'POST') {
        return await cleanupPuzzlesEndpoint(request, env);
      }
      if (path === '/admin/puzzles/regenerate' && request.method === 'POST') {
        return await regeneratePuzzle(request, env, CORS_HEADERS);
      }
      if (path === '/admin/puzzles/generate-bulk' && request.method === 'POST') {
        return await generateBulkPuzzles(request, env, CORS_HEADERS);
      }
      if (path === '/admin/solo-bank/refill' && request.method === 'POST') {
        return await refillSoloBank(request, env, CORS_HEADERS, ctx);
      }

      // ---------- Tournaments ----------
      if (path === '/tournament/daily' && request.method === 'GET') {
        return await getDailyChallenge(request, env);
      }
      if (path === '/tournament/daily/submit' && request.method === 'POST') {
        return await submitDailyScore(request, env);
      }
      if (path === '/tournament/daily/leaderboard' && request.method === 'GET') {
        return await getDailyLeaderboard(request, env);
      }
      if (path === '/tournament/weekly' && request.method === 'GET') {
        return await getWeeklyStandings(request, env);
      }
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
      if (url.pathname.startsWith('/rooms/') && url.pathname.endsWith('/events') && request.method === 'GET') {
        const parts = url.pathname.split('/').filter(Boolean);
        const roomId = parts.length >= 3 ? parts[1] : null;
        if (!roomId) return errorResponse('roomId required', 400);

        const user = await getUserFromRequest(request, env);
        if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });

        const id = env.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env.ROOM_DO.get(id);
        return roomObject.fetch(new Request('http://room/events', { method: 'GET' }));
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
      if (path === '/rooms/chat' && request.method === 'POST') {
        return await sendRoomChat(request, env);
      }
      if (path === '/rooms/answer' && request.method === 'POST') {
        return await submitAnswer(request, env, ctx);
      }
      if (path === '/rooms/leaderboard' && request.method === 'GET') {
        return await getLeaderboard(request, env);
      }
      if (path === '/rooms/start' && request.method === 'POST') {
        return await manualStartGame(request, env, ctx);
      }
      if (path === '/rooms/reopen' && request.method === 'POST') {
        return await reopenRoom(request, env);
      }
      if (path === '/rooms/next' && request.method === 'POST') {
        return await forceNextPuzzle(request, env);
      }

      // ---------- Room Settings & Features ----------
      if (path === '/rooms/settings' && request.method === 'GET') {
        return await getRoomSettings(request, env);
      }
      if (path === '/rooms/settings' && request.method === 'POST') {
        return await updateRoomSettings(request, env);
      }
      if (path === '/rooms/hint' && request.method === 'POST') {
        return await getHint(request, env);
      }
      if (path === '/rooms/report' && request.method === 'POST') {
        return await reportBadPuzzle(request, env);
      }
      if (path === '/rooms/reports' && request.method === 'GET') {
        return await getPuzzleReports(request, env);
      }

      // ---------- Manager Permissions ----------
      if (path === '/manager/kick' && request.method === 'POST') {
        return await kickPlayer(request, env);
      }
      if (path === '/manager/freeze' && request.method === 'POST') {
        return await freezePlayer(request, env);
      }
      if (path === '/manager/reset-scores' && request.method === 'POST') {
        return await resetScores(request, env);
      }
      if (path === '/manager/skip-puzzle' && request.method === 'POST') {
        return await skipPuzzle(request, env);
      }
      if (path === '/manager/change-difficulty' && request.method === 'POST') {
        return await changeDifficulty(request, env);
      }
      if (path === '/manager/transfer' && request.method === 'POST') {
        return await transferManager(request, env);
      }
      if (path === '/manager/promote' && request.method === 'POST') {
        return await promoteToCoManager(request, env);
      }
      if (path === '/manager/logs' && request.method === 'GET') {
        return await getManagerLogs(request, env);
      }
      if (path === '/manager/detailed-stats' && request.method === 'GET') {
        return await getDetailedStats(request, env);
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

  async scheduled(event, env, ctx) {
    const task = (async () => {
      try {
        await runPuzzleCleanup(env, {
          maxPerGroup: Number(env?.PUZZLE_RETENTION_PER_GROUP ?? 1200),
          maxAgeDays: Number(env?.PUZZLE_RETENTION_DAYS ?? 45),
          recentProtect: Number(env?.PUZZLE_RECENT_PROTECT ?? 250),
        });
      } catch (e) {
        console.error('Scheduled puzzle cleanup failed:', e);
      }
      try {
        await runAutoSoloBankTopUp(env);
      } catch (e) {
        console.error('Scheduled solo bank top-up failed:', e);
      }
    })();
    if (ctx?.waitUntil) {
      ctx.waitUntil(task);
    } else {
      await task;
    }
  },
};
