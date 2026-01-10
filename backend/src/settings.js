/**
 * Room Settings and Advanced Features API
 * - Room settings management
 * - Hints system
 * - Bad puzzle reporting
 */

import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { getUserFromRequest } from './auth.js';

// Get room settings (public - anyone in room can see)
export async function getRoomSettings(request, env) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');

    if (!roomId) {
        return errorResponse('Missing roomId parameter', 400);
    }

    try {
        // Get room info (to verify it exists)
        const room = await env.DB.prepare('SELECT id, created_by FROM rooms WHERE id = ?').bind(roomId).first();
        if (!room) {
            return errorResponse('Room not found', 404);
        }

        // Get room settings
        const settings = await env.DB.prepare(`
      SELECT * FROM room_settings WHERE room_id = ?
    `).bind(roomId).first();

        if (!settings) {
            // Return default settings if not found
            return jsonResponse({
                hints_enabled: true,
                hints_per_player: 3,
                hint_penalty_percent: 10,
                allow_report_bad_puzzle: true,
                auto_advance_seconds: 2,
                shuffle_options: true,
                show_rankings_live: true,
                allow_skip_puzzle: false,
                min_time_per_puzzle: 5,
            });
        }

        return jsonResponse(settings);
    } catch (e) {
        console.error('[GET ROOM SETTINGS ERROR]', e);
        return errorResponse('Failed to get room settings', 500);
    }
}

// Update room settings (only room creator/admin can modify)
export async function updateRoomSettings(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const {
        roomId,
        hints_enabled,
        hints_per_player,
        hint_penalty_percent,
        allow_report_bad_puzzle,
        auto_advance_seconds,
        shuffle_options,
        show_rankings_live,
        allow_skip_puzzle,
        min_time_per_puzzle,
    } = body;

    if (!roomId) {
        return errorResponse('Missing roomId', 400);
    }

    try {
        // Verify user is room creator
        const room = await env.DB.prepare('SELECT created_by, status FROM rooms WHERE id = ?').bind(roomId).first();
        if (!room) {
            return errorResponse('Room not found', 404);
        }
        if (room.created_by !== user.id) {
            return errorResponse('Only room creator can modify settings', 403);
        }
        // Only allow modifications before game starts
        if (room.status !== 'waiting') {
            return errorResponse('Cannot modify settings after game starts', 400);
        }

        // Check if settings exist
        const existing = await env.DB.prepare(
            'SELECT id FROM room_settings WHERE room_id = ?'
        ).bind(roomId).first();

        const updateFields = [];
        const values = [];

        if (hints_enabled !== undefined) {
            updateFields.push('hints_enabled = ?');
            values.push(hints_enabled ? 1 : 0);
        }
        if (hints_per_player !== undefined) {
            const hintCount = Math.max(0, Math.min(5, Number(hints_per_player)));
            updateFields.push('hints_per_player = ?');
            values.push(hintCount);
        }
        if (hint_penalty_percent !== undefined) {
            const penalty = Math.max(0, Math.min(100, Number(hint_penalty_percent)));
            updateFields.push('hint_penalty_percent = ?');
            values.push(penalty);
        }
        if (allow_report_bad_puzzle !== undefined) {
            updateFields.push('allow_report_bad_puzzle = ?');
            values.push(allow_report_bad_puzzle ? 1 : 0);
        }
        if (auto_advance_seconds !== undefined) {
            const delay = Math.max(0, Math.min(10, Number(auto_advance_seconds)));
            updateFields.push('auto_advance_seconds = ?');
            values.push(delay);
        }
        if (shuffle_options !== undefined) {
            updateFields.push('shuffle_options = ?');
            values.push(shuffle_options ? 1 : 0);
        }
        if (show_rankings_live !== undefined) {
            updateFields.push('show_rankings_live = ?');
            values.push(show_rankings_live ? 1 : 0);
        }
        if (allow_skip_puzzle !== undefined) {
            updateFields.push('allow_skip_puzzle = ?');
            values.push(allow_skip_puzzle ? 1 : 0);
        }
        if (min_time_per_puzzle !== undefined) {
            const minTime = Math.max(1, Math.min(60, Number(min_time_per_puzzle)));
            updateFields.push('min_time_per_puzzle = ?');
            values.push(minTime);
        }

        if (updateFields.length === 0) {
            return errorResponse('No settings to update', 400);
        }

        updateFields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(roomId);

        if (existing) {
            await env.DB.prepare(`
        UPDATE room_settings 
        SET ${updateFields.join(', ')}
        WHERE room_id = ?
      `).bind(...values).run();
        } else {
            // Create new settings with defaults
            await env.DB.prepare(`
        INSERT INTO room_settings (
          room_id, hints_enabled, hints_per_player, hint_penalty_percent,
          allow_report_bad_puzzle, auto_advance_seconds, shuffle_options,
          show_rankings_live, allow_skip_puzzle, min_time_per_puzzle
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
                roomId,
                hints_enabled ?? true,
                hints_per_player ?? 3,
                hint_penalty_percent ?? 10,
                allow_report_bad_puzzle ?? true,
                auto_advance_seconds ?? 2,
                shuffle_options ?? true,
                show_rankings_live ?? true,
                allow_skip_puzzle ?? false,
                min_time_per_puzzle ?? 5
            ).run();
        }

        return jsonResponse({ success: true, message: 'Settings updated' });
    } catch (e) {
        console.error('[UPDATE ROOM SETTINGS ERROR]', e);
        return errorResponse('Failed to update room settings', 500);
    }
}

// Get hint for current puzzle
export async function getHint(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { roomId, puzzleIndex } = body;

    if (!roomId || puzzleIndex === undefined) {
        return errorResponse('Missing roomId or puzzleIndex', 400);
    }

    try {
        // Check if hints are enabled in this room
        const settings = await env.DB.prepare(
            'SELECT hints_enabled, hints_per_player FROM room_settings WHERE room_id = ?'
        ).bind(roomId).first();

        if (!settings || !settings.hints_enabled) {
            return errorResponse('Hints are not enabled in this room', 400);
        }

        // Get player's hint status
        const participant = await env.DB.prepare(
            'SELECT hints_used, hints_available FROM room_participants WHERE room_id = ? AND user_id = ?'
        ).bind(roomId, user.id).first();

        if (!participant) {
            return errorResponse('You are not in this room', 403);
        }

        if (participant.hints_available <= 0) {
            return errorResponse('No hints available', 400);
        }

        // Get the puzzle and extract hint
        const puzzle = await env.DB.prepare(
            'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        ).bind(roomId, puzzleIndex).first();

        if (!puzzle) {
            return errorResponse('Puzzle not found', 404);
        }

        const puzzleData = JSON.parse(puzzle.puzzle_json);
        const hint = puzzleData.hint || 'No hint available';

        // Deduct a hint
        await env.DB.prepare(
            'UPDATE room_participants SET hints_used = hints_used + 1, hints_available = hints_available - 1 WHERE room_id = ? AND user_id = ?'
        ).bind(roomId, user.id).run();

        // Broadcast hint event to room (optional - for showing hint count updates)
        const doId = env.ROOM_DO.idFromName(roomId.toString());
        const roomObject = env.ROOM_DO.get(doId);
        await roomObject.fetch(new Request('http://room/hint-event', {
            method: 'POST',
            body: JSON.stringify({
                type: 'hint_used',
                userId: user.id,
                puzzleIndex,
                username: user.username,
            })
        })).catch(() => { }); // Ignore if DO is not available

        return jsonResponse({
            hint,
            hintsRemaining: participant.hints_available - 1,
        });
    } catch (e) {
        console.error('[GET HINT ERROR]', e);
        return errorResponse('Failed to get hint', 500);
    }
}

// Report a bad puzzle
export async function reportBadPuzzle(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { roomId, puzzleIndex, reportType, details } = body;

    if (!roomId || puzzleIndex === undefined || !reportType) {
        return errorResponse('Missing required fields', 400);
    }

    const validReportTypes = [
        'bad_wording',
        'wrong_answer',
        'unclear',
        'offensive',
        'duplicate',
        'other'
    ];

    if (!validReportTypes.includes(reportType)) {
        return errorResponse('Invalid report type', 400);
    }

    try {
        // Verify user is in room
        const participant = await env.DB.prepare(
            'SELECT id FROM room_participants WHERE room_id = ? AND user_id = ?'
        ).bind(roomId, user.id).first();

        if (!participant) {
            return errorResponse('You are not in this room', 403);
        }

        // Check if reporting is allowed
        const settings = await env.DB.prepare(
            'SELECT allow_report_bad_puzzle FROM room_settings WHERE room_id = ?'
        ).bind(roomId).first();

        if (settings && !settings.allow_report_bad_puzzle) {
            return errorResponse('Reporting is disabled in this room', 400);
        }

        // Get the puzzle JSON for reference
        const puzzle = await env.DB.prepare(
            'SELECT puzzle_json FROM room_puzzles WHERE room_id = ? AND puzzle_index = ?'
        ).bind(roomId, puzzleIndex).first();

        const puzzleJson = puzzle?.puzzle_json || null;

        // Insert report
        await env.DB.prepare(`
      INSERT INTO puzzle_reports (
        room_id, puzzle_index, puzzle_json, user_id, report_type, details
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(roomId, puzzleIndex, puzzleJson, user.id, reportType, details || null).run();

        return jsonResponse({
            success: true,
            message: 'Report submitted successfully',
        });
    } catch (e) {
        console.error('[REPORT BAD PUZZLE ERROR]', e);
        return errorResponse('Failed to submit report', 500);
    }
}

// Get puzzle reports for a room (admin/creator only)
export async function getPuzzleReports(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user) return errorResponse('Unauthorized', 401);

    const url = new URL(request.url);
    const roomId = url.searchParams.get('roomId');

    if (!roomId) {
        return errorResponse('Missing roomId', 400);
    }

    try {
        // Verify user is room creator
        const room = await env.DB.prepare(
            'SELECT created_by FROM rooms WHERE id = ?'
        ).bind(roomId).first();

        if (!room) {
            return errorResponse('Room not found', 404);
        }

        if (room.created_by !== user.id) {
            return errorResponse('Only room creator can view reports', 403);
        }

        // Get all reports for this room
        const reports = await env.DB.prepare(`
      SELECT 
        r.id, r.puzzle_index, r.report_type, r.details, r.reported_at,
        u.username
      FROM puzzle_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.room_id = ?
      ORDER BY r.reported_at DESC
    `).bind(roomId).all();

        return jsonResponse({
            total: reports.results?.length || 0,
            reports: reports.results || [],
        });
    } catch (e) {
        console.error('[GET PUZZLE REPORTS ERROR]', e);
        return errorResponse('Failed to get reports', 500);
    }
}
