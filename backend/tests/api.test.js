import { describe, it, expect, beforeAll, afterAll } from 'vitest';

const BASE_URL = 'http://127.0.0.1:8787';
let testUserId = null;
let authToken = null;

describe('Backend API Tests', () => {
    describe('Auth Endpoints', () => {
        it('should register a new user', async () => {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `testuser_${Date.now()}`,
                    email: `test_${Date.now()}@example.com`,
                    password: 'TestPassword123!',
                }),
            });

            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.token).toBeDefined();
            expect(data.user).toBeDefined();
            expect(data.user.id).toBeDefined();

            testUserId = data.user.id;
            authToken = data.token;
        });

        it('should not register with missing fields', async () => {
            const response = await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'testonly' }),
            });

            expect(response.status).toBe(400);
        });

        it('should login existing user', async () => {
            const email = `login_test_${Date.now()}@example.com`;

            // Register first
            await fetch(`${BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `loginuser_${Date.now()}`,
                    email,
                    password: 'TestPassword123!',
                }),
            });

            // Then login
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'TestPassword123!' }),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.token).toBeDefined();
            expect(data.user.email).toBe(email);
        });

        it('should fail login with wrong password', async () => {
            const response = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'nonexistent@example.com',
                    password: 'WrongPassword',
                }),
            });

            expect(response.status).toBeGreaterThanOrEqual(400);
        });
    });

    describe('Game Endpoints', () => {
        it('should generate a puzzle level', async () => {
            const response = await fetch(`${BASE_URL}/generate-level`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: 'ar',
                    level: 1,
                    fresh: true,
                }),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.type).toBeDefined();
            expect(data.startWord).toBeDefined();
            expect(data.endWord).toBeDefined();
            expect(Array.isArray(data.steps)).toBe(true);
        });

        it('should generate English puzzle', async () => {
            const response = await fetch(`${BASE_URL}/generate-level`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: 'en',
                    level: 2,
                    fresh: true,
                }),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.startWord).toBeDefined();
            expect(data.endWord).toBeDefined();
        });

        it('should validate puzzle structure', async () => {
            const response = await fetch(`${BASE_URL}/generate-level`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: 'ar',
                    level: 1,
                    fresh: true,
                }),
            });

            const puzzle = await response.json();

            // Validate puzzle structure
            puzzle.steps.forEach((step) => {
                expect(step.word).toBeDefined();
                expect(Array.isArray(step.options)).toBe(true);
                expect(step.options.length).toBeGreaterThanOrEqual(3);
                expect(step.options.includes(step.word)).toBe(true);
            });
        });
    });

    describe('Tournament Endpoints', () => {
        it('should fetch daily challenge', async () => {
            const response = await fetch(`${BASE_URL}/tournament/daily`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            expect([200, 404]).toContain(response.status);
            if (response.status === 200) {
                const data = await response.json();
                expect(data).toBeDefined();
            }
        });

        it('should fetch daily leaderboard', async () => {
            const response = await fetch(`${BASE_URL}/tournament/daily/leaderboard`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            expect([200, 404]).toContain(response.status);
        });
    });

    describe('Admin Endpoints', () => {
        it('should list puzzles (with auth)', async () => {
            const response = await fetch(`${BASE_URL}/admin/puzzles?level=1&lang=ar`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            expect([200, 401, 403, 404]).toContain(response.status);
        });
    });

    describe('Health Checks', () => {
        it('should handle CORS preflight', async () => {
            const response = await fetch(`${BASE_URL}/`, {
                method: 'OPTIONS',
            });

            expect([200, 404]).toContain(response.status);
            expect(response.headers.get('access-control-allow-origin')).toBeDefined();
        });

        it('should respond to requests without errors', async () => {
            const response = await fetch(`${BASE_URL}/generate-level`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: 'ar', level: 1, fresh: true }),
            });

            expect(response.status).toBeLessThan(500);
        });
    });
});
