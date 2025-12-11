
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Cloudflare Worker for Wonder Link Game
 * API for Authentication, Game Logic, and Persistence.
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const JWT_SECRET = "CHANGE_ME_IN_PROD_TO_A_REAL_SECRET_KEY"; // In prod use env.JWT_SECRET

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS });
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // --- AUTH ENDPOINTS ---

            if (path === '/auth/register' && request.method === 'POST') {
                return await register(request, env);
            }

            if (path === '/auth/login' && request.method === 'POST') {
                return await login(request, env);
            }

            if (path === '/auth/me') {
                const user = await getUserFromRequest(request, env);
                if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });
                
                if (request.method === 'GET') {
                    return new Response(JSON.stringify(user), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
                }
                
                if (request.method === 'PUT') { // Update profile
                    return await updateProfile(request, env, user.id);
                }

                if (request.method === 'DELETE') { // Delete account
                    return await deleteAccount(request, env, user.id);
                }
            }

            // --- PROGRESS ENDPOINTS ---

            if (path === '/progress') {
                const user = await getUserFromRequest(request, env);
                if (!user) return new Response('Unauthorized', { status: 401, headers: CORS_HEADERS });

                if (request.method === 'GET') {
                    // Get all progress or summary
                    const { results } = await env.DB.prepare('SELECT * FROM progress WHERE user_id = ?').bind(user.id).all();
                    return new Response(JSON.stringify(results), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
                }

                if (request.method === 'POST') {
                    // Save progress: { level, score, stars }
                    const body = await request.json();
                    const { level, score, stars } = body;
                    
                    // Upsert progress
                    const existing = await env.DB.prepare('SELECT id FROM progress WHERE user_id = ? AND level = ?').bind(user.id, level).first();
                    
                    if (existing) {
                        await env.DB.prepare('UPDATE progress SET score = max(score, ?), stars = max(stars, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
                            .bind(score, stars, existing.id).run();
                    } else {
                        await env.DB.prepare('INSERT INTO progress (user_id, level, score, stars) VALUES (?, ?, ?, ?)')
                            .bind(user.id, level, score, stars).run();
                    }
                    
                    // Update user total score/level logic if needed
                    await env.DB.prepare('UPDATE users SET total_score = total_score + ? WHERE id = ?').bind(score, user.id).run();

                    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
                }
            }


            // --- GAME LOGIC (Old endpoints preserved) ---

            if (path === '/generate-level' || path === '/api/generate') {
                if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS_HEADERS });
                return await generateLevel(request, env, CORS_HEADERS);
            }

            if (path === '/puzzle' && request.method === 'GET') {
               // ... (Simpler inline version of previous logic)
               const level = url.searchParams.get('level');
               const lang = url.searchParams.get('lang') || 'en';
               const row = await env.DB.prepare('SELECT json FROM puzzles WHERE level = ? AND lang = ? LIMIT 1').bind(Number(level), lang).first();
               if (!row) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS_HEADERS });
               return new Response(row.json, { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
            }

             if (path === '/puzzles' && request.method === 'GET') {
                 const rows = await env.DB.prepare('SELECT id, level, lang, created_at FROM puzzles ORDER BY level').all();
                 return new Response(JSON.stringify(rows.results), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
             }

             if (path === '/cache' && request.method === 'POST') {
                 const body = await request.json();
                 await env.DB.prepare('INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)').bind(body.level, body.lang, body.json).run();
                 return new Response(JSON.stringify({ ok: true }), { status: 201, headers: CORS_HEADERS });
             }

            return new Response('Not Found', { status: 404, headers: CORS_HEADERS });

        } catch (e) {
            console.error(e);
            return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
        }
    },
};

// --- AUTH HELPERS ---

async function register(request, env) {
    const { username, email, password } = await request.json();
    if (!username || !email || !password) return new Response('Missing fields', { status: 400, headers: CORS_HEADERS });

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return new Response('Email already in use', { status: 409, headers: CORS_HEADERS });

    const passwordHash = await bcrypt.hash(password, 10);
    
    try {
        const result = await env.DB.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
            .bind(username, email, passwordHash).run();
        
        // Return token
        // We need to fetch the ID we just inserted. D1 execute result doesn't always strictly return it easily depending on driver, 
        // but let's query it back or use result.meta.last_row_id if available (often is in D1).
        // Safest is to query by email again.
        const newUser = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        const token = jwt.sign({ id: newUser.id, email: newUser.email }, env.JWT_SECRET || JWT_SECRET, { expiresIn: '30d' });

        return new Response(JSON.stringify({ token, user: { id: newUser.id, username: newUser.username, email: newUser.email } }), 
            { status: 201, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: CORS_HEADERS });
    }
}

async function login(request, env) {
    const { email, password } = await request.json();
    const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return new Response('Invalid credentials', { status: 401, headers: CORS_HEADERS });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, env.JWT_SECRET || JWT_SECRET, { expiresIn: '30d' });
    return new Response(JSON.stringify({ token, user: { id: user.id, username: user.username, email: user.email, total_score: user.total_score } }), 
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

async function getUserFromRequest(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET || JWT_SECRET);
        return await env.DB.prepare('SELECT id, username, email, total_score, current_level_id FROM users WHERE id = ?').bind(decoded.id).first();
    } catch (e) {
        return null;
    }
}

async function updateProfile(request, env, userId) {
    const body = await request.json();
    const { username } = body; // Allow updating username for now
    await env.DB.prepare('UPDATE users SET username = ? WHERE id = ?').bind(username, userId).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

async function deleteAccount(request, env, userId) {
    await env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(userId).run();
    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run();
    return new Response(JSON.stringify({ success: true }), { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } });
}

// --- GAME LOGIC (Restored from previous helper) ---
async function generateLevel(request, env, headers) {
    const { language = 'ar', level = 1 } = await request.json();
    const isArabic = language === 'ar';
    const apiKey = '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'; // Hardcoded for demo/user ctx
    const model = 'llama-3.1-8b-instant';

    if (env.DB) {
        // Try to get a random cached puzzle for this level/language
        const cached = await env.DB.prepare(
            'SELECT * FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1'
        ).bind(level, language).first();
        
        // Only use cache if we have at least 3 different puzzles cached
        const count = await env.DB.prepare(
            'SELECT COUNT(*) as total FROM puzzles WHERE level = ? AND lang = ?'
        ).bind(level, language).first();
        
        if (cached && count && count.total >= 3) {
            return new Response(cached.json, { headers: { ...headers, 'Content-Type': 'application/json' } });
        }
    }

    const systemPrompt = isArabic 
        ? `أنت محرك ألعاب "الرابط العجيب". مهمتك توليد ألغاز ربط الكلمات بالعربية.

المستوى: ${level}
الصعوبة: ${level <= 3 ? 'سهل' : level <= 6 ? 'متوسط' : 'صعب'}

قواعد اللعبة:
1. اختر كلمة بداية وكلمة نهاية مرتبطتان منطقياً
2. أنشئ 3-5 خطوات وسيطة تربط بينهما بشكل منطقي
3. كل خطوة يجب أن تكون مرتبطة بالخطوة السابقة واللاحقة
4. لكل خطوة، وفر 4 خيارات: الإجابة الصحيحة + 3 خيارات خاطئة مقنعة

مثال جيد:
البداية: "شمس" → النهاية: "ليل"
الخطوات: شمس → ضوء → نهار → غروب → ليل

مثال سيء (تجنبه):
البداية: "قلم" → النهاية: "سيارة" (لا علاقة منطقية)

تعليمات الخيارات:
- الخيارات الخاطئة يجب أن تكون معقولة لكن غير صحيحة
- تجنب الخيارات العشوائية تماماً
- اجعل الخيارات من نفس الفئة (مثلاً: إذا الإجابة "أحمر"، الخيارات الأخرى ألوان)

صيغة JSON المطلوبة:
{
  "startWord": "كلمة البداية",
  "endWord": "كلمة النهاية",
  "steps": [
    {
      "word": "الكلمة الصحيحة",
      "options": ["الكلمة الصحيحة", "خيار خاطئ 1", "خيار خاطئ 2", "خيار خاطئ 3"]
    }
  ],
  "hint": "تلميح مفيد للاعب"
}

ملاحظة: اخلط ترتيب الخيارات عشوائياً. أرجع JSON فقط بدون أي نص إضافي.`
        : `You are the game engine for "Wonder Link". Generate word connection puzzles in English.

Level: ${level}
Difficulty: ${level <= 3 ? 'Easy' : level <= 6 ? 'Medium' : 'Hard'}

Game Rules:
1. Choose a start word and end word that are logically connected
2. Create 3-5 intermediate steps that connect them logically
3. Each step must relate to both the previous and next step
4. For each step, provide 4 options: the correct answer + 3 convincing wrong answers

Good Example:
Start: "Sun" → End: "Night"
Steps: Sun → Light → Day → Sunset → Night

Bad Example (avoid):
Start: "Pen" → End: "Car" (no logical connection)

Option Instructions:
- Wrong options should be plausible but incorrect
- Avoid completely random options
- Keep options in the same category (e.g., if answer is "Red", other options should be colors)

Required JSON format:
{
  "startWord": "starting word",
  "endWord": "ending word",
  "steps": [
    {
      "word": "correct word",
      "options": ["correct word", "wrong option 1", "wrong option 2", "wrong option 3"]
    }
  ],
  "hint": "helpful hint for the player"
}

Note: Shuffle the options randomly. Return ONLY valid JSON, no extra text.`;

    // Add randomness to generate unique puzzles each time
    const seed = Math.floor(Math.random() * 10000);
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ 
            model, 
            messages: [
                {role:'system', content: systemPrompt}, 
                {role:'user', content: `Generate a unique ${isArabic ? 'creative Arabic' : 'creative English'} word connection puzzle for level ${level}. Make it challenging but fair. Ensure all steps are logically connected. Puzzle ID: ${seed}`}
            ],
            temperature: 0.9, // Increased for more variety
            max_tokens: 1000
        })
    });
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();

    // Cache it (but allow multiple puzzles per level)
    if (env.DB) {
        try { 
            await env.DB.prepare('INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)').bind(level, language, jsonStr).run(); 
        } catch(e){
            console.log('Cache insert failed:', e);
        }
    }

    return new Response(jsonStr, { headers: { ...headers, 'Content-Type': 'application/json' } });
}
