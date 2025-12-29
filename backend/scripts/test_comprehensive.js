import fetch from 'node-fetch';
import fs from 'fs';
import { execSync } from 'child_process';

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
            name: 'Test Room with Logging',
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

async function main() {
    console.log('🎮 COMPREHENSIVE API & LOGGING TEST\n');

    try {
        console.log('1. Registering user...');
        await register();
        console.log('   ✅ Registered\n');

        console.log('2. Creating room...');
        const roomId = await createRoom();
        console.log(`   ✅ Room ${roomId} created\n`);

        console.log('3. Starting game (AI puzzle generation)...');
        console.log('   📝 Generating 2 puzzles from AI\n');
        await startGame(roomId);
        console.log('   ✅ Game started - Puzzles generated\n');

        console.log('⏳ Waiting for backend processing...\n');
        await new Promise(r => setTimeout(r, 1500));

        console.log('4. Fetching room status...');
        const status1 = await getRoomStatus(roomId);
        console.log('   ✅ Status fetched\n');

        if (status1.currentPuzzle) {
            const q = status1.currentPuzzle;
            console.log(`📌 Current Puzzle:`);
            console.log(`   Question: "${q.question || q.startWord}"`);
            if (q.options) console.log(`   Options: [${q.options.join(', ')}]`);
            console.log('');
        }

        console.log('5. Fetching status again (to trigger [FETCH PUZZLE] log)...\n');
        const status2 = await getRoomStatus(roomId);
        console.log('   ✅ Status fetched again\n');

        console.log('=====================================');
        console.log('✅ API TEST SEQUENCE COMPLETE');
        console.log('=====================================\n');

        console.log('📋 WHAT TO VERIFY:\n');
        console.log('✓ Check Backend Logs:');
        console.log('  - Look for [AI QUIZ] entries when game started');
        console.log('  - Look for [FETCH PUZZLE] entries when status fetched\n');

        console.log('✓ Check Flutter Debug Console:');
        console.log('  - Look for "✅ Puzzle loaded:" entries');
        console.log('  - Look for "✅ Correct answer:" entries\n');

        console.log('✓ Check Database:');
        console.log(`  - Room ID: ${roomId}`);
        console.log(`  - Should have 2 puzzles in room_puzzles table\n`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Response:', await error.response.text());
        }
    }
}

main();
