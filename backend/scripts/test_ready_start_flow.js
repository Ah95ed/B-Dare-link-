// Automated ready/start flow test
// Creates host+player accounts, joins room, sets ready, verifies no autostart,
// then host starts game and verifies puzzle appears. Requires public backend URL.

const BASE_URL = process.env.WONDER_BASE_URL || 'https://wonder-link-backend.amhmeed31.workers.dev';

async function jsonFetch(path, { method = 'GET', token, body } = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let parsed;
    try {
        parsed = text ? JSON.parse(text) : {};
    } catch (e) {
        parsed = { parseError: e.message, raw: text };
    }
    if (!res.ok) {
        throw new Error(`${method} ${path} failed ${res.status}: ${text}`);
    }
    return parsed;
}

function randEmail(prefix) {
    const suffix = Math.random().toString(36).slice(2, 8);
    return `${prefix}+${suffix}@example.com`;
}

async function registerAndLogin(prefix) {
    const email = randEmail(prefix);
    const password = 'Test1234!';
    await jsonFetch('/auth/register', {
        method: 'POST',
        body: { email, password, username: prefix },
    });
    const login = await jsonFetch('/auth/login', {
        method: 'POST',
        body: { email, password },
    });
    return { token: login.token, user: login.user, email };
}

async function main() {
    console.log('BASE_URL', BASE_URL);
    const host = await registerAndLogin('host');
    const player = await registerAndLogin('player');

    console.log('Host user', host.user);
    console.log('Player user', player.user);

    // Host creates room
    const roomResp = await jsonFetch('/rooms', {
        method: 'POST',
        token: host.token,
        body: { name: 'AutoTest Room', puzzleSource: 'ai', puzzleCount: 5, timePerPuzzle: 20 },
    });
    const room = roomResp.room;
    console.log('Room created', room);

    // Player joins via code
    await jsonFetch('/rooms/join', {
        method: 'POST',
        token: player.token,
        body: { code: room.code },
    });
    console.log('Player joined');

    // Both ready
    await jsonFetch('/rooms/ready', {
        method: 'POST',
        token: host.token,
        body: { roomId: room.id, isReady: true },
    });
    await jsonFetch('/rooms/ready', {
        method: 'POST',
        token: player.token,
        body: { roomId: room.id, isReady: true },
    });
    console.log('Both marked ready');

    // Check status should still be waiting (no auto-start)
    const statusBefore = await jsonFetch(`/rooms/status?roomId=${room.id}`, {
        token: host.token,
    });
    if (statusBefore.room.status !== 'waiting') {
        throw new Error(`Expected waiting before manual start, got ${statusBefore.room.status}`);
    }
    console.log('Status before start is waiting as expected');

    // Host starts manually
    await jsonFetch('/rooms/start', {
        method: 'POST',
        token: host.token,
        body: { roomId: room.id },
    });
    console.log('Host started game');

    // Check status should be active with puzzle
    const statusAfter = await jsonFetch(`/rooms/status?roomId=${room.id}`, {
        token: host.token,
    });
    if (statusAfter.room.status !== 'active') {
        throw new Error(`Expected active after start, got ${statusAfter.room.status}`);
    }
    if (!statusAfter.currentPuzzle) {
        throw new Error('Expected currentPuzzle after start');
    }
    console.log('Status after start is active with puzzle present');

    console.log('✅ Flow passed');
}

main().catch((e) => {
    console.error('❌ Flow failed', e);
    process.exit(1);
});
