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
            // 1. Generate Level Endpoint (Gemini)
            if (path === '/api/generate') {
                if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
                return await generateLevel(request, env, corsHeaders);
            }

            // 2. Submit Solution Endpoint
            if (path === '/api/submit') {
                if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
                return await submitSolution(request, env, corsHeaders);
            }

            // 3. User Progress Endpoint
            if (path === '/api/user') {
                // Simple logic to get or create user
                const { username } = await request.json();
                // Database logic stub...
                return new Response(JSON.stringify({ message: "User logic placeholder", username }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });
        } catch (e) {
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
        }
    },
};

// --- Helper Functions ---

async function generateLevel(request, env, headers) {
    const { lang = 'ar' } = await request.json();
    const geminiKey = 'AIzaSyBoAP_hZwOJY4rRIwxRJ8sgwWFE1WYGLlM';

    if (!geminiKey) {
        return new Response(JSON.stringify({ error: "Gemini Key not configured" }), { status: 500, headers });
    }

    // Prompt for Gemini
    const prompt = `Generate a "Wonder Link" puzzle in ${lang === 'ar' ? 'Arabic' : 'English'}. 
  Output strict JSON format only: 
  { "startWord": "Word1", "endWord": "Word2", "validSteps": ["step1", "step2", "step3"], "hint": "short hint" }`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

    const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    // Clean JSON string (remove markdown blocks if present)
    let cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Store in D1 (Stub)
    // await env.DB.prepare('INSERT INTO puzzles ...').run();

    return new Response(cleanJson, { headers: { ...headers, 'Content-Type': 'application/json' } });
}

async function submitSolution(request, env, headers) {
    // Logic to validate with DB or AI
    return new Response(JSON.stringify({ success: true, message: "Mock validation success" }), { headers: { ...headers, 'Content-Type': 'application/json' } });
}
