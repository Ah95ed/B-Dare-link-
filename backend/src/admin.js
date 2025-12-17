// admin.js – simple admin endpoints for managing stored puzzles
import { jsonResponse, errorResponse } from './utils.js';
import { getUserFromRequest } from './auth.js';
import { generateLevel as generateLevelHandler } from './game.js';

export async function listPuzzles(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const url = new URL(request.url);
    const level = url.searchParams.get('level');
    const lang = url.searchParams.get('lang');

    let q = 'SELECT id, level, lang, json, created_at FROM puzzles';
    const binds = [];
    const clauses = [];
    if (level) {
        clauses.push('level = ?');
        binds.push(Number(level));
    }
    if (lang) {
        clauses.push('lang = ?');
        binds.push(lang);
    }
    if (clauses.length) q += ' WHERE ' + clauses.join(' AND ');
    q += ' ORDER BY created_at DESC LIMIT 200';

    const rows = await env.DB.prepare(q).bind(...binds).all();
    const out = rows.results.map(r => ({ id: r.id, level: r.level, lang: r.lang, puzzle: JSON.parse(r.json), created_at: r.created_at }));
    return jsonResponse(out, 200);
}

export async function deletePuzzle(request, env) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const { id, puzzleId } = await request.json();
    if (!id && !puzzleId) return errorResponse('Missing id or puzzleId', 400);

    try {
        if (id) {
            await env.DB.prepare('DELETE FROM puzzles WHERE id = ?').bind(id).run();
        } else {
            await env.DB.prepare('DELETE FROM puzzles WHERE json LIKE ?').bind(`%"puzzleId":"${puzzleId}"%`).run();
        }
        return jsonResponse({ success: true }, 200);
    } catch (e) {
        return errorResponse(e.message, 500);
    }
}

export async function regeneratePuzzle(request, env, headers) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const body = await request.json();
    const { level = 1, language = 'ar' } = body;

    // Delegate to existing generateLevel handler by constructing a Request
    const fakeReq = new Request('https://internal/generate-level', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, language }),
    });

    return await generateLevelHandler(fakeReq, env, headers || {});
}

export async function generateBulkPuzzles(request, env, headers) {
    const user = await getUserFromRequest(request, env);
    if (!user || user.id !== 1) return errorResponse('Unauthorized', 401);

    const geminiApiKey = env?.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return errorResponse('GEMINI_API_KEY not configured', 500);
    }

    // Languages: Arabic, English, French, Spanish, German
    const languages = [
        { code: 'ar', name: 'Arabic' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' }
    ];

    const puzzlesPerLanguage = 20; // 20 per language = 100 total
    const level = 1; // Default level
    let totalGenerated = 0;
    let totalSaved = 0;
    const errors = [];

    const systemPrompt = `You are a puzzle generator for "Wonder Link" game. Generate word connection puzzles in JSON format.

Each puzzle connects two semantically distant words via logical intermediate steps.

Requirements:
- Return ONLY valid JSON array of puzzles (no markdown, no code blocks, just pure JSON)
- Each puzzle must have: startWord, endWord, steps[], hint, puzzleId
- Each step must have: word, options[] (exactly 3 options including the correct word)
- All words must be in the target language
- Avoid meta words like "start", "end", "word", "step", "puzzle", "question", "answer"
- Steps should be 2-4 words long
- Make logical connections between consecutive words (each step relates to both previous and next)
- Distractors should be plausible and match the domain

Output format (return ONLY the JSON array, nothing else):
[
  {
    "startWord": "word1",
    "endWord": "word2",
    "steps": [
      {"word": "step1", "options": ["step1", "distractor1", "distractor2"]},
      {"word": "step2", "options": ["step2", "distractor3", "distractor4"]}
    ],
    "hint": "A helpful hint without revealing solution words",
    "puzzleId": "1765700778307-762269"
  }
]`;

    for (const lang of languages) {
        const userPrompt = `Generate exactly ${puzzlesPerLanguage} unique word connection puzzles in ${lang.name} (${lang.code}).

Each puzzle must:
- Connect two semantically distant but logically linkable words
- Have 2-4 intermediate steps (each step connects to both previous and next)
- Each step has exactly 3 options: [correct_word, distractor1, distractor2]
- Include a helpful hint in ${lang.name} that guides without revealing solution
- Use common, everyday words in ${lang.name}
- Avoid proper nouns, sensitive topics, and meta words
- Ensure puzzleId is unique (format: timestamp-randomnumber)

Example for Arabic:
{
  "startWord": "رجل",
  "endWord": "مرج",
  "steps": [
    {"word": "حمل", "options": ["حمل", "رجل", "مزرعة"]},
    {"word": "زراعة", "options": ["زراعة", "ساونا", "حمل"]},
    {"word": "مناخ", "options": ["مناخ", "رجل", "زراعة"]}
  ],
  "hint": "المرج هو مجال للري",
  "puzzleId": "1765700778307-762269"
}

Return ONLY a JSON array with exactly ${puzzlesPerLanguage} puzzles. No other text.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${geminiApiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: systemPrompt },
                            { text: userPrompt }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192,
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                errors.push(`${lang.name}: HTTP ${response.status} - ${errorText}`);
                continue;
            }

            const data = await response.json();
            let content = '';
            
            if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                content = data.candidates[0].content.parts[0].text;
            } else {
                errors.push(`${lang.name}: No content in response`);
                continue;
            }

            // Clean JSON from markdown code blocks
            content = content.replace(/```json/g, '').replace(/```/g, '').trim();
            
            // Try to extract JSON array
            let puzzles = [];
            try {
                puzzles = JSON.parse(content);
                if (!Array.isArray(puzzles)) {
                    puzzles = [puzzles];
                }
            } catch (parseError) {
                // Try to find JSON array in the text
                const jsonMatch = content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    puzzles = JSON.parse(jsonMatch[0]);
                } else {
                    errors.push(`${lang.name}: Failed to parse JSON - ${parseError.message}`);
                    continue;
                }
            }

            // Validate and save puzzles
            for (const puzzle of puzzles) {
                if (!puzzle.startWord || !puzzle.endWord || !Array.isArray(puzzle.steps)) {
                    continue;
                }

                // Ensure puzzleId exists
                if (!puzzle.puzzleId) {
                    puzzle.puzzleId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
                }

                // Normalize steps - ensure each has exactly 3 options
                puzzle.steps = puzzle.steps.map(step => {
                    if (!step.options || step.options.length !== 3) {
                        // Ensure correct word is in options
                        const options = step.options || [];
                        if (!options.includes(step.word)) {
                            options.push(step.word);
                        }
                        // Fill to 3
                        while (options.length < 3) {
                            options.push(step.word);
                        }
                        // Trim to 3
                        step.options = options.slice(0, 3);
                    }
                    return step;
                });

                const puzzleJson = JSON.stringify(puzzle);

                try {
                    await env.DB.prepare('INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)')
                        .bind(level, lang.code, puzzleJson)
                        .run();
                    totalSaved++;
                } catch (dbError) {
                    errors.push(`${lang.name} puzzle ${puzzle.puzzleId}: DB error - ${dbError.message}`);
                }
            }

            totalGenerated += puzzles.length;
        } catch (error) {
            errors.push(`${lang.name}: ${error.message}`);
        }
    }

    return jsonResponse({
        success: true,
        totalGenerated,
        totalSaved,
        errors: errors.length > 0 ? errors : undefined
    }, 200);
}