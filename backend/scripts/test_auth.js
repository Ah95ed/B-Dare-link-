const fetch = require('node-fetch');

const BASE = process.env.BASE || 'https://wonder-link-backend.amhmeed31.workers.dev';

async function register(email, username, password) {
    const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    const body = await res.text();
    console.log('REGISTER', res.status, body);
    try { console.log('-> JSON:', JSON.parse(body)); } catch (e) { }
}

async function login(email, password) {
    const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const body = await res.text();
    console.log('LOGIN', res.status, body);
    try { console.log('-> JSON:', JSON.parse(body)); } catch (e) { }
}

(async () => {
    const testEmail = process.argv[2] || 'tester@example.com';
    const testUser = process.argv[3] || 'tester';
    const testPass = process.argv[4] || 'TestPass123!';

    await register(testEmail, testUser, testPass);
    await login(testEmail, testPass);
})();
