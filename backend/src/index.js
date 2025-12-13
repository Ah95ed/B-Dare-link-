// index.js – Cloudflare Worker entry point (modularized)
import { CORS_HEADERS, errorResponse } from './utils.js';
import { register, login, getUserFromRequest, updateProfile, deleteAccount } from './auth.js';
import { getProgress, saveProgress } from './progress.js';
import { generateLevel, submitSolution } from './game.js';

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

      // No route matched
      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    } catch (e) {
      console.error(e);
      return errorResponse(e.message, 500);
    }
  },
};
