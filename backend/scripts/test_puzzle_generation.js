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
    console.log('✅ User registered and logged in');
    console.log(`   Token: ${TOKEN.substring(0, 20)}...`);
    return data.user.id;
}

async function createRoom() {
    console.log('\n📝 Creating a test room with AI puzzles...');
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
    console.log(`✅ Room created: ID ${data.room.id}`);
    return data.room.id;
}

async function startGame(roomId) {
    console.log(`\n🎮 Starting game for room ${roomId}...`);
    console.log('   ⏳ Generating 2 AI puzzles (watch backend logs for [AI QUIZ] messages)');

    const res = await fetch(`${BASE}/rooms/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId }),
    });
    const data = await res.json();
    console.log(`✅ Game started`);
    console.log(`   Current puzzle: ${data.currentPuzzle?.question || 'N/A'}`);
    return data.currentPuzzle;
}

async function getRoomStatus(roomId) {
    console.log(`\n🔍 Fetching room status for room ${roomId}...`);
    console.log('   ⏳ Fetching puzzles from database (watch backend logs for [FETCH PUZZLE] messages)');

    const res = await fetch(`${BASE}/rooms/status?roomId=${roomId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
        },
    });
    const data = await res.json();

    if (data.currentPuzzle) {
        console.log(`✅ Puzzle fetched from database:`);
        console.log(`   Question: "${data.currentPuzzle.question}"`);
        console.log(`   Options: [${data.currentPuzzle.options.join(', ')}]`);
        console.log(`   Correct Index: ${data.currentPuzzle.correctIndex}`);
        console.log(`   Correct Answer: "${data.currentPuzzle.options[data.currentPuzzle.correctIndex]}"`);
        console.log(`   Category: ${data.currentPuzzle.category || 'N/A'}`);
    } else {
        console.log('⚠️  No current puzzle');
    }

    return data.currentPuzzle;
}

async function submitAnswer(roomId, optionIndex) {
    console.log(`\n✍️ Submitting answer (option ${optionIndex})...`);

    const res = await fetch(`${BASE}/rooms/answer`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            roomId,
            optionIndex
        }),
    });
    const data = await res.json();
    console.log(`✅ Answer submitted: ${data.message || 'Success'}`);
    if (data.isCorrect !== undefined) {
        console.log(`   Is Correct: ${data.isCorrect}`);
    }
    return data;
}

async function runTests() {
    console.log('🚀 Starting Wonder Link Game API Test');
    console.log('='.repeat(50));

    try {
        // Step 1: Register
        await register();

        // Step 2: Create room
        const roomId = await createRoom();

        // Step 3: Start game (generates AI puzzles)
        const firstPuzzle = await startGame(roomId);

        // Step 4: Fetch room status (retrieves from DB)
        await new Promise(r => setTimeout(r, 1000)); // Wait a bit for backend logs
        const fetchedPuzzle = await getRoomStatus(roomId);

        // Step 5: Submit answer
        if (fetchedPuzzle) {
            await submitAnswer(roomId, fetchedPuzzle.correctIndex);
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ Test sequence completed!');
        console.log('\n📊 EXPECTED LOGS IN BACKEND:');
        console.log('  1. [AI QUIZ] - When puzzles are generated');
        console.log('  2. [FETCH PUZZLE] - When puzzles are retrieved from DB');
        console.log('\n📱 EXPECTED CLIENT LOGS IN FLUTTER:');
        console.log('  - ✅ Puzzle loaded: {question}');
        console.log('  - ✅ Correct answer: {answer}');

    } catch (error) {
        console.error('❌ Test error:', error.message);
        if (error.response) {
            const text = await error.response.text();
            console.error('Response:', text);
        }
    }
}

runTests();
