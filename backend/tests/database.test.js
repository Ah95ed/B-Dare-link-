import { describe, it, expect } from 'vitest';

describe('Database Connection Test', () => {
    it('should verify database schema exists', async () => {
        const response = await fetch('http://127.0.0.1:8787/generate-level', {
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

        // If database is working, we should get a valid puzzle response
        expect(data).toBeDefined();
        expect(typeof data === 'object').toBe(true);
    });

    it('should handle invalid requests gracefully', async () => {
        const response = await fetch('http://127.0.0.1:8787/generate-level', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                language: 'invalid',
                level: 'not_a_number',
            }),
        });

        expect([200, 400]).toContain(response.status);
    });

    it('should support both Arabic and English', async () => {
        const languages = ['ar', 'en'];

        for (const lang of languages) {
            const response = await fetch('http://127.0.0.1:8787/generate-level', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    language: lang,
                    level: 1,
                    fresh: true,
                }),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.startWord).toBeDefined();
            expect(data.endWord).toBeDefined();
        }
    });
});
