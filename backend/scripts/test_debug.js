import fetch from 'node-fetch';

const BASE = process.env.BASE || 'https://wonder-link-backend.amhmeed31.workers.dev';

let TOKEN = '';

async function register() {
    const uniqueEmail = `tester${Date.now()}@example.com`;
    const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: uniqueEmail,
            username: `tester_${Date.now()}`,
            password: 'TestPass123!'
        }),
    });
    const data = await res.json();
    TOKEN = data.token;
    return data.user.id;
}

async function createRoom() {
    const res = await fetch(`${BASE}/rooms`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Test Wonder Link Room',
            puzzleCount: 2,
            timePerPuzzle: 30,
            puzzleSource: 'ai',
            difficulty: 1,
            language: 'ar'
        }),
    });
    const data = await res.json();
    return data.room.id;
}

async function startGame(roomId) {
    const res = await fetch(`${BASE}/rooms/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId }),
    });
    return res.json();
}

async function getRoomStatus(roomId) {
    const res = await fetch(`${BASE}/rooms/status?roomId=${roomId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        },
    });
    return res.json();
}

async function runTests() {
    try {
        console.log('Registering user...');
        await register();

        console.log('Creating room...');
        const roomId = await createRoom();
        console.log(`Room ID: ${roomId}`);

        console.log('Starting game...');
        const startResponse = await startGame(roomId);
        console.log('\n✅ START GAME RESPONSE:');
        console.log(JSON.stringify(startResponse, null, 2));

        await new Promise(r => setTimeout(r, 1000));

        console.log('\n📡 Fetching room status...');
        const statusResponse = await getRoomStatus(roomId);
        console.log('\n✅ GET STATUS RESPONSE:');
        console.log(JSON.stringify(statusResponse, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

runTests();
