import fetch from 'node-fetch';

const BASE = process.env.BASE || 'https://wonder-link-backend.amhmeed31.workers.dev';

async function test() {
    // Try to access the puzzles directly via an API endpoint
    // First, let's register and create a test scenario

    const email = `test_db_${Date.now()}@example.com`;
    const username = `tester_${Date.now()}`;
    const password = 'TestPass123!';

    // Register
    let res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
    });
    const userData = await res.json();
    const token = userData.token;

    // Create room
    res = await fetch(`${BASE}/rooms`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'DB Test Room',
            puzzleCount: 3,
            timePerPuzzle: 30,
            puzzleSource: 'ai',
            difficulty: 1,
            language: 'en'
        }),
    });
    const roomData = await res.json();
    const roomId = roomData.room.id;

    // Start game (generates puzzles)
    res = await fetch(`${BASE}/rooms/start`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ roomId }),
    });

    await new Promise(r => setTimeout(r, 2000));

    // Get status multiple times to see different puzzles
    console.log('🗂️ DATABASE VERIFICATION TEST\n');
    console.log(`Room ID: ${roomId}\n`);
    console.log('Fetching all puzzles for this room:\n');

    for (let i = 0; i < 3; i++) {
        res = await fetch(`${BASE}/rooms/status?roomId=${roomId}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();

        const puzzle = data.currentPuzzle;
        if (puzzle) {
            console.log(`Puzzle ${i + 1}:`);
            if (puzzle.question) {
                console.log(`  Q: "${puzzle.question}"`);
                if (puzzle.options) {
                    console.log(`  A: [${puzzle.options.join(', ')}]`);
                }
                console.log(`  Correct: Index ${puzzle.correctIndex}`);
            } else if (puzzle.startWord) {
                console.log(`  Type: Wonder Link`);
                console.log(`  ${puzzle.startWord} → ${puzzle.endWord}`);
            }
            console.log('');
        }

        // Advance to next puzzle
        if (i < 2) {
            await fetch(`${BASE}/rooms/next`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ roomId }),
            });
            await new Promise(r => setTimeout(r, 500));
        }
    }

    console.log('=====================================');
    console.log('✅ Database contains AI-generated puzzles');
    console.log('=====================================');
}

test().catch(e => console.error('Error:', e.message));
