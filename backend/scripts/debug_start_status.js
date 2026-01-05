const BASE = process.env.BASE || 'https://wonder-link-backend.amhmeed31.workers.dev';

async function main() {
    const email = `debugger${Date.now()}@example.com`;
    const username = `debugger_${Date.now()}`;

    let res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            username,
            password: 'TestPass123!',
        }),
    });
    const reg = await res.json();
    if (!res.ok) throw new Error(`register failed: ${res.status} ${JSON.stringify(reg)}`);

    const token = reg.token;
    const authHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    res = await fetch(`${BASE}/rooms`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            name: 'Debug Room',
            puzzleCount: 2,
            timePerPuzzle: 30,
            puzzleSource: 'ai',
            difficulty: 1,
            language: 'ar',
        }),
    });
    const created = await res.json();
    if (!res.ok) throw new Error(`create room failed: ${res.status} ${JSON.stringify(created)}`);

    const roomId = created.room.id;
    console.log('roomId:', roomId);

    res = await fetch(`${BASE}/rooms/start`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ roomId }),
    });
    const startText = await res.text();
    let start;
    try {
        start = JSON.parse(startText);
    } catch (_) {
        start = { raw: startText };
    }
    console.log('\n/rooms/start status:', res.status);
    console.log(JSON.stringify(start, null, 2));

    res = await fetch(`${BASE}/rooms/status?roomId=${roomId}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
    const statusText = await res.text();
    let status;
    try {
        status = JSON.parse(statusText);
    } catch (_) {
        status = { raw: statusText };
    }
    console.log('\n/rooms/status status:', res.status);
    console.log(JSON.stringify(status, null, 2));
}

main().catch((e) => {
    console.error('debug_start_status failed:', e);
    process.exit(1);
});
