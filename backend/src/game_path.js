// game_path.js - New full-path puzzle system
import { jsonResponse, errorResponse } from './utils.js';
import { buildPathPuzzlePrompt } from './path_prompt.js';

export async function generatePathLevel(request, env, headers) {
    const { language = 'ar', level = 1 } = await request.json();
    const isArabic = language === 'ar';

    const geminiApiKey = env?.GEMINI_API_KEY;
    const geminiModel = env?.GEMINI_MODEL || 'gemini-1.5-flash';
    const aiModel = env?.AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';

    const prompt = buildPathPuzzlePrompt({ language, level });
    let content = '';
    let aiProvider = 'none';

    // Try Gemini first
    if (geminiApiKey) {
        try {
            const modelPath = String(geminiModel).startsWith('models/')
                ? String(geminiModel)
                : `models/${geminiModel}`;
            const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${geminiApiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        response_mime_type: "application/json",
                        temperature: 0.8,
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Gemini API Error: ${response.status} ${errText}`);
            }

            const data = await response.json();
            content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            aiProvider = 'gemini';
        } catch (e) {
            console.warn('[PATH PUZZLE] Gemini failed, falling back', String(e?.message || e));
            content = '';
        }
    }

    // Fallback to Workers AI
    if (!content && env?.AI) {
        try {
            const out = await env.AI.run(aiModel, {
                messages: [
                    { role: 'system', content: 'You are a puzzle generator. Return JSON only.' },
                    { role: 'user', content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 1200,
            });

            const text = out?.response || out?.result || out?.text || JSON.stringify(out);
            content = String(text).replace(/```json/g, '').replace(/```/g, '').trim();
            aiProvider = 'workers_ai';
        } catch (e) {
            console.error('[PATH PUZZLE] Workers AI failed:', e);
            return errorResponse('Failed to generate puzzle', 500);
        }
    }

    if (!content) {
        return errorResponse('No AI provider available', 500);
    }

    // Parse and validate
    try {
        let jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        const puzzle = JSON.parse(jsonStr);

        // Validate structure
        if (!puzzle.startWord || !puzzle.endWord || !Array.isArray(puzzle.paths)) {
            throw new Error('Invalid puzzle structure');
        }

        if (puzzle.paths.length !== 4) {
            throw new Error('Must have exactly 4 paths');
        }

        // Ensure each path has 4 steps
        puzzle.paths = puzzle.paths.map((path, idx) => {
            if (!Array.isArray(path.steps) || path.steps.length !== 4) {
                throw new Error(`Path ${path.label || idx} must have exactly 4 steps`);
            }
            return {
                label: path.label || ['A', 'B', 'C', 'D'][idx],
                steps: path.steps,
                isCorrect: path.isCorrect || false,
                explanation: path.explanation || ''
            };
        });

        // Ensure exactly one correct path
        const correctCount = puzzle.paths.filter(p => p.isCorrect).length;
        if (correctCount !== 1) {
            // Fix: mark first as correct if none or multiple
            puzzle.paths.forEach((p, i) => { p.isCorrect = i === 0; });
        }

        const result = {
            startWord: puzzle.startWord,
            endWord: puzzle.endWord,
            paths: puzzle.paths,
            hint: puzzle.hint || (isArabic ? 'فكر بشكل منطقي' : 'Think logically'),
            puzzleId: `path_${level}_${Date.now()}`,
            level,
            aiProvider,
        };

        console.log(`✅ Path puzzle generated: ${result.startWord} → ${result.endWord}`);
        return jsonResponse(result);

    } catch (parseError) {
        console.error('[PATH PUZZLE] Parse error:', parseError.message);
        console.error('Content:', content.substring(0, 500));
        return errorResponse(`Failed to parse puzzle: ${parseError.message}`, 500);
    }
}
