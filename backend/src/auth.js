// auth.js – authentication related handlers for the Worker
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CORS_HEADERS, jsonResponse, errorResponse, JWT_SECRET } from './utils.js';

/** Register a new user */
export async function register(request, env) {
  const { username, email, password } = await request.json();
  if (!username || !email || !password) {
    return errorResponse('Missing fields', 400);
  }

  if (!env || !env.DB) {
    console.error('Register handler: DB binding is not configured (env.DB is missing)');
    return errorResponse('Server misconfiguration: database not available', 500);
  }

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first();
  if (existing) return errorResponse('Email already in use', 409);

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await env.DB.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .bind(username, email, passwordHash)
      .run();
    const newUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();
    const token = jwt.sign({ id: newUser.id, email: newUser.email }, env.JWT_SECRET || JWT_SECRET, { expiresIn: '30d' });
    return jsonResponse({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email } }, 201);
  } catch (e) {
    console.error('Register handler error:', e);
    return errorResponse(e.message || 'Internal Server Error', 500);
  }
}

/** Login existing user */
export async function login(request, env) {
  try {
    if (!env || !env.DB) {
      console.error('Login handler: DB binding is not configured (env.DB is missing)');
      return errorResponse('Server misconfiguration: database not available', 500);
    }
    const { email, password } = await request.json();
    if (!email || !password) return errorResponse('Missing fields', 400);

    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) return errorResponse('Invalid credentials', 401);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return errorResponse('Invalid credentials', 401);

    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET || JWT_SECRET, { expiresIn: '30d' });
    return jsonResponse({ token, user: { id: user.id, username: user.username, email: user.email, total_score: user.total_score } });
  } catch (e) {
    console.error('Login handler error:', e);
    return errorResponse(e.message || 'Internal Server Error', 500);
  }
}

/** Extract user from Authorization header */
export async function getUserFromRequest(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    if (!env || !env.DB) {
      console.error('getUserFromRequest: DB binding missing');
      return null;
    }
    const decoded = jwt.verify(token, env.JWT_SECRET || JWT_SECRET);
    return await env.DB.prepare('SELECT id, username, email, total_score, current_level_id FROM users WHERE id = ?')
      .bind(decoded.id)
      .first();
  } catch (e) {
    console.error('getUserFromRequest jwt verify error:', e);
    return null;
  }
}

/** Update profile (currently only username) */
export async function updateProfile(request, env, userId) {
  const { username } = await request.json();
  await env.DB.prepare('UPDATE users SET username = ? WHERE id = ?')
    .bind(username, userId)
    .run();
  return jsonResponse({ success: true });
}

/** Delete account and its progress */
export async function deleteAccount(request, env, userId) {
  await env.DB.prepare('DELETE FROM progress WHERE user_id = ?')
    .bind(userId)
    .run();
  await env.DB.prepare('DELETE FROM users WHERE id = ?')
    .bind(userId)
    .run();
  return jsonResponse({ success: true });
}

/** Reset password without auth (via verified OTP on client) */
export async function resetPassword(request, env) {
  const { email, newPassword } = await request.json();
  if (!email || !newPassword) return errorResponse('Missing fields', 400);

  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (!user) return errorResponse('User not found', 404);

  const passwordHash = await bcrypt.hash(newPassword, 10);
  try {
    await env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(passwordHash, user.id).run();
    return jsonResponse({ success: true });
  } catch (e) {
    return errorResponse(e.message, 500);
  }
}
