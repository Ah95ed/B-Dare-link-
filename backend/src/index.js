/**
 * Cloudflare Worker for Wonder Link Game
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS Headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // 1. Generate Level Endpoint (Groq)
            // Accepts: { language: 'ar' | 'en' }
            if (path === '/generate-level' || path === '/api/generate') {
                if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
                return await generateLevel(request, env, corsHeaders);
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
        }
    },
};

// --- Helper Functions ---

async function generateLevel(request, env, headers) {
    const { language = 'ar', level = 1 } = await request.json();
    const isArabic = language === 'ar';
    
    // In production, use env.GROQ_API_KEY
    const apiKey = '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';
    const model = 'llama-3.1-8b-instant';

    if (!apiKey) {
        return new Response(JSON.stringify({ error: "Groq Key not configured" }), { status: 500, headers });
    }

    // Difficulty Logic
    let difficultyParams = "simple, concrete concepts";
    if (level > 5) difficultyParams = "abstract, slightly harder concepts";
    if (level > 15) difficultyParams = "very abstract, creative, lateral thinking";

    const systemPrompt = `You are the game engine for "Wonder Link" (الرابط العجيب).
Generate a puzzle connecting two concepts with ${isArabic ? 'Arabic' : 'English'} words.
DIFFICULTY: ${difficultyParams}.

Output STRICT JSON format ONLY. 
Structure:
{
  "startWord": "String",
  "endWord": "String",
  "steps": [
    {
      "word": "CorrectStepWord",
      "options": ["CorrectStepWord", "Distractor1", "Distractor2", "Distractor3"]
    },
    ...
  ],
  "hint": "String"
}

Rules:
1. "steps" must be an array of 3-5 objects.
2. Each step links logically to the previous one and leads to the end.
3. "options" must contain 4 distinct words: the correct "word" and 3 plausible distractors.
4. The correct "word" MUST be one of the options.
5. Distractors should be related to the concept but clearly NOT the next step in the link.
6. Shuffle the options array so the correct answer is RANDOMLY placed (not always first).
6. For Arabic, use Fusha.`;

    const userPrompt = `Generate a level ${level} puzzle in ${isArabic ? 'Arabic' : 'English'}.`;

    const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

    // 1. Check Cache (D1)
    if (env.DB) {
       try {
         const cached = await env.DB.prepare('SELECT * FROM puzzles WHERE level = ? AND lang = ? LIMIT 1').bind(level, language).first();
         if (cached) return new Response(cached.json, { headers: { ...headers, 'Content-Type': 'application/json' } });
       } catch (e) {
         // Ignore DB errors and proceed to generation (e.g., table not created yet)
         console.error("DB Read Error:", e);
       }
    }

    try {
        const response = await fetch(groqUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.7,
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
             throw new Error(JSON.stringify(data));
        }

        const content = data.choices[0].message.content;
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();

        // 2. Save to Cache (D1)
        if (env.DB) {
           try {
             await env.DB.prepare('INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)').bind(level, language, jsonStr).run();
           } catch (e) {
             console.error("DB Write Error:", e);
           }
        }

        return new Response(jsonStr, { headers: { ...headers, 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: headers }); // Fixed headers variable in catch
    }
}
