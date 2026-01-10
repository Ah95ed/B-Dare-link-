// manager_permissions.js - Manager permissions and actions

// Helper to check if user is manager or co-manager
export async function isManager(env, roomId, userId) {
    const participant = await env.DB.prepare(
        `SELECT role FROM room_participants WHERE room_id = ? AND user_id = ? AND is_kicked = FALSE`
    ).bind(roomId, userId).first();

    return participant && (participant.role === 'manager' || participant.role === 'co_manager');
}

// Helper to check if user is the main manager (not co-manager)
export async function isMainManager(env, roomId, userId) {
    const participant = await env.DB.prepare(
        `SELECT role FROM room_participants WHERE room_id = ? AND user_id = ?`
    ).bind(roomId, userId).first();

    return participant && participant.role === 'manager';
}

// Log manager action for transparency
async function logManagerAction(env, roomId, managerUserId, actionType, targetUserId = null, details = null) {
    await env.DB.prepare(
        `INSERT INTO manager_actions (room_id, manager_user_id, action_type, target_user_id, details, created_at)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
        roomId,
        managerUserId,
        actionType,
        targetUserId,
        details ? JSON.stringify(details) : null
    ).run();
}

// Kick player from room (manager only)
export async function kickPlayer(request, env) {
    try {
        const { roomId, userId, targetUserId } = await request.json();

        if (!roomId || !userId || !targetUserId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is manager
        const manager = await isMainManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only manager can kick players' }), { status: 403 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT manager_can_kick_players FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        if (settings && !settings.manager_can_kick_players) {
            return new Response(JSON.stringify({ error: 'Kicking players is disabled' }), { status: 403 });
        }

        // Cannot kick yourself
        if (userId === targetUserId) {
            return new Response(JSON.stringify({ error: 'Cannot kick yourself' }), { status: 400 });
        }

        // Kick the player
        await env.DB.prepare(
            `UPDATE room_participants SET is_kicked = TRUE WHERE room_id = ? AND user_id = ?`
        ).bind(roomId, targetUserId).run();

        // Log action
        await logManagerAction(env, roomId, userId, 'kick', targetUserId);

        return new Response(JSON.stringify({ success: true, message: 'Player kicked' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[KICK PLAYER ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Freeze/Unfreeze player (manager only)
export async function freezePlayer(request, env) {
    try {
        const { roomId, userId, targetUserId, freeze } = await request.json();

        if (!roomId || !userId || !targetUserId || freeze === undefined) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is manager
        const manager = await isManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only manager can freeze players' }), { status: 403 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT manager_can_freeze_players FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        if (settings && !settings.manager_can_freeze_players) {
            return new Response(JSON.stringify({ error: 'Freezing players is disabled' }), { status: 403 });
        }

        // Update freeze status
        await env.DB.prepare(
            `UPDATE room_participants SET is_frozen = ? WHERE room_id = ? AND user_id = ?`
        ).bind(freeze ? 1 : 0, roomId, targetUserId).run();

        // Log action
        await logManagerAction(env, roomId, userId, freeze ? 'freeze' : 'unfreeze', targetUserId);

        return new Response(JSON.stringify({
            success: true,
            message: freeze ? 'Player frozen' : 'Player unfrozen'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[FREEZE PLAYER ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Reset all scores (manager only)
export async function resetScores(request, env) {
    try {
        const { roomId, userId } = await request.json();

        if (!roomId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is manager
        const manager = await isMainManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only manager can reset scores' }), { status: 403 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT manager_can_reset_scores FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        if (settings && !settings.manager_can_reset_scores) {
            return new Response(JSON.stringify({ error: 'Resetting scores is disabled' }), { status: 403 });
        }

        // Reset all scores
        await env.DB.prepare(
            `UPDATE room_participants SET score = 0, puzzles_solved = 0 WHERE room_id = ?`
        ).bind(roomId).run();

        // Log action
        await logManagerAction(env, roomId, userId, 'reset_scores');

        return new Response(JSON.stringify({ success: true, message: 'All scores reset' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[RESET SCORES ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Skip current puzzle (manager only)
export async function skipPuzzle(request, env) {
    try {
        const { roomId, userId } = await request.json();

        if (!roomId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is manager
        const manager = await isManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only manager can skip puzzles' }), { status: 403 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT manager_can_skip_puzzle FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        if (settings && !settings.manager_can_skip_puzzle) {
            return new Response(JSON.stringify({ error: 'Skipping puzzles is disabled' }), { status: 403 });
        }

        // Get current puzzle index
        const room = await env.DB.prepare(
            `SELECT current_puzzle_index, puzzle_count FROM rooms WHERE id = ?`
        ).bind(roomId).first();

        if (!room) {
            return new Response(JSON.stringify({ error: 'Room not found' }), { status: 404 });
        }

        const nextIndex = room.current_puzzle_index + 1;

        // Check if there are more puzzles
        if (nextIndex >= room.puzzle_count) {
            return new Response(JSON.stringify({ error: 'No more puzzles to skip' }), { status: 400 });
        }

        // Update to next puzzle
        await env.DB.prepare(
            `UPDATE rooms SET current_puzzle_index = ? WHERE id = ?`
        ).bind(nextIndex, roomId).run();

        // Log action
        await logManagerAction(env, roomId, userId, 'skip_puzzle', null, {
            from_index: room.current_puzzle_index,
            to_index: nextIndex
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Puzzle skipped',
            newIndex: nextIndex
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[SKIP PUZZLE ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Change difficulty mid-game (manager only)
export async function changeDifficulty(request, env) {
    try {
        const { roomId, userId, newDifficulty } = await request.json();

        if (!roomId || !userId || !newDifficulty) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Validate difficulty
        const difficulty = parseInt(newDifficulty);
        if (isNaN(difficulty) || difficulty < 1 || difficulty > 10) {
            return new Response(JSON.stringify({ error: 'Difficulty must be between 1 and 10' }), { status: 400 });
        }

        // Check if user is manager
        const manager = await isManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only manager can change difficulty' }), { status: 403 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT manager_can_change_difficulty FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        if (settings && !settings.manager_can_change_difficulty) {
            return new Response(JSON.stringify({ error: 'Changing difficulty is disabled' }), { status: 403 });
        }

        // Update difficulty
        await env.DB.prepare(
            `UPDATE rooms SET difficulty = ? WHERE id = ?`
        ).bind(difficulty, roomId).run();

        // Log action
        await logManagerAction(env, roomId, userId, 'change_difficulty', null, {
            new_difficulty: difficulty
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Difficulty updated',
            newDifficulty: difficulty
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[CHANGE DIFFICULTY ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Transfer manager role to another player (main manager only)
export async function transferManager(request, env) {
    try {
        const { roomId, userId, newManagerUserId } = await request.json();

        if (!roomId || !userId || !newManagerUserId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is THE main manager
        const manager = await isMainManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only the main manager can transfer role' }), { status: 403 });
        }

        // Check if target user is in the room
        const targetParticipant = await env.DB.prepare(
            `SELECT id FROM room_participants WHERE room_id = ? AND user_id = ? AND is_kicked = FALSE`
        ).bind(roomId, newManagerUserId).first();

        if (!targetParticipant) {
            return new Response(JSON.stringify({ error: 'Target user not in room' }), { status: 404 });
        }

        // Transfer: old manager becomes co_manager, new user becomes manager
        await env.DB.batch([
            env.DB.prepare(
                `UPDATE room_participants SET role = 'co_manager' WHERE room_id = ? AND user_id = ?`
            ).bind(roomId, userId),
            env.DB.prepare(
                `UPDATE room_participants SET role = 'manager' WHERE room_id = ? AND user_id = ?`
            ).bind(roomId, newManagerUserId),
            env.DB.prepare(
                `UPDATE rooms SET created_by = ? WHERE id = ?`
            ).bind(newManagerUserId, roomId)
        ]);

        // Log action
        await logManagerAction(env, roomId, userId, 'transfer_manager', newManagerUserId);

        return new Response(JSON.stringify({
            success: true,
            message: 'Manager role transferred'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[TRANSFER MANAGER ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Promote player to co-manager (main manager only)
export async function promoteToCoManager(request, env) {
    try {
        const { roomId, userId, targetUserId } = await request.json();

        if (!roomId || !userId || !targetUserId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is main manager
        const manager = await isMainManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only main manager can promote' }), { status: 403 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT allow_co_managers FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        if (settings && !settings.allow_co_managers) {
            return new Response(JSON.stringify({ error: 'Co-managers are disabled' }), { status: 403 });
        }

        // Promote to co-manager
        await env.DB.prepare(
            `UPDATE room_participants SET role = 'co_manager' WHERE room_id = ? AND user_id = ?`
        ).bind(roomId, targetUserId).run();

        // Log action
        await logManagerAction(env, roomId, userId, 'promote_co_manager', targetUserId);

        return new Response(JSON.stringify({
            success: true,
            message: 'Player promoted to co-manager'
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[PROMOTE CO-MANAGER ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Get manager action logs
export async function getManagerLogs(request, env) {
    try {
        const url = new URL(request.url);
        const roomId = url.searchParams.get('roomId');
        const userId = url.searchParams.get('userId');

        if (!roomId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check if user is manager
        const manager = await isManager(env, roomId, userId);
        if (!manager) {
            return new Response(JSON.stringify({ error: 'Only managers can view logs' }), { status: 403 });
        }

        // Get logs
        const logs = await env.DB.prepare(
            `SELECT ma.*, 
              mu.username as manager_name,
              tu.username as target_name
       FROM manager_actions ma
       LEFT JOIN users mu ON ma.manager_user_id = mu.id
       LEFT JOIN users tu ON ma.target_user_id = tu.id
       WHERE ma.room_id = ?
       ORDER BY ma.created_at DESC
       LIMIT 50`
        ).bind(roomId).all();

        return new Response(JSON.stringify({
            success: true,
            logs: logs.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[GET MANAGER LOGS ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}

// Get detailed stats (manager only if settings restrict)
export async function getDetailedStats(request, env) {
    try {
        const url = new URL(request.url);
        const roomId = url.searchParams.get('roomId');
        const userId = url.searchParams.get('userId');

        if (!roomId || !userId) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
        }

        // Check settings
        const settings = await env.DB.prepare(
            `SELECT show_detailed_stats_to_all FROM room_settings WHERE room_id = ?`
        ).bind(roomId).first();

        // If restricted to managers only, check permission
        if (settings && !settings.show_detailed_stats_to_all) {
            const manager = await isManager(env, roomId, userId);
            if (!manager) {
                return new Response(JSON.stringify({ error: 'Only managers can view detailed stats' }), { status: 403 });
            }
        }

        // Get detailed stats
        const participants = await env.DB.prepare(
            `SELECT rp.*, u.username, u.email,
              COUNT(rr.id) as total_attempts,
              SUM(CASE WHEN rr.is_correct THEN 1 ELSE 0 END) as correct_answers,
              AVG(rr.time_taken) as avg_time
       FROM room_participants rp
       LEFT JOIN users u ON rp.user_id = u.id
       LEFT JOIN room_results rr ON rr.room_id = rp.room_id AND rr.user_id = rp.user_id
       WHERE rp.room_id = ? AND rp.is_kicked = FALSE
       GROUP BY rp.id, u.username, u.email
       ORDER BY rp.score DESC`
        ).bind(roomId).all();

        return new Response(JSON.stringify({
            success: true,
            stats: participants.results || []
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error('[GET DETAILED STATS ERROR]', e);
        return new Response(JSON.stringify({ error: String(e.message) }), { status: 500 });
    }
}
