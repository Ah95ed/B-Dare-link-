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
            puzzleCount: 1,
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
        console.log('\n🚀 WONDER LINK GAME API TEST');
        console.log('=====================================\n');

        console.log('1️⃣  Registering user...');
        const userId = await register();
        console.log(`   ✅ User created with ID: ${userId}`);

        console.log('\n2️⃣  Creating room with AI puzzles...');
        const roomId = await createRoom();
        console.log(`   ✅ Room created with ID: ${roomId}`);

        console.log('\n3️⃣  Starting game (AI puzzle generation starts here)...');
        const startResponse = await startGame(roomId);
        console.log(`   ✅ Game started`);
        if (!startResponse.success) {
            console.log(`   Error: ${startResponse.error}`);
        }

        console.log('\n⏳ Waiting 2 seconds for backend processing...');
        await new Promise(r => setTimeout(r, 2000));

        console.log('\n4️⃣  Fetching room status and puzzle...');
        const statusResponse = await getRoomStatus(roomId);

        console.log('\n📊 PUZZLE DETAILS:');
        if (statusResponse.currentPuzzle) {
            const puzzle = statusResponse.currentPuzzle;
            console.log(`   Type: ${puzzle.startWord ? 'WONDER LINK (Puzzle Link)' : 'QUIZ'}`);

            if (puzzle.startWord) {
                // Wonder Link format
                console.log(`   Start Word: "${puzzle.startWord}"`);
                console.log(`   End Word: "${puzzle.endWord}"`);
                console.log(`   Steps: ${puzzle.steps?.length || 0}`);
                if (puzzle.steps && puzzle.steps.length > 0) {
                    console.log(`   First Step Word: "${puzzle.steps[0].word}"`);
                    console.log(`   First Step Options: [${puzzle.steps[0].options?.join(', ')}]`);
                }
                console.log(`   Hint: "${puzzle.hint}"`);
                console.log(`   Puzzle ID: ${puzzle.puzzleId}`);
            } else if (puzzle.question) {
                // Quiz format
                console.log(`   Question: "${puzzle.question}"`);
                console.log(`   Options: [${puzzle.options?.join(', ')}]`);
                console.log(`   Correct Index: ${puzzle.correctIndex}`);
                console.log(`   Category: ${puzzle.category}`);
            }
        } else {
            console.log('   ⚠️  No puzzle available');
        }

        console.log('\n=====================================');
        console.log('✅ API TEST COMPLETED SUCCESSFULLY');
        console.log('=====================================\n');
        console.log('📝 NEXT STEPS:');
        console.log('   1. Check Flutter app debug console for puzzle logs');
        console.log('   2. Verify backend logs show [AI QUIZ] generation');
        console.log('   3. Test puzzle submission in the app\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:');
        console.error('   Error:', error.message);
    }
}

runTests();
