// game.js – game logic handlers for the Worker
import { jsonResponse, errorResponse } from './utils.js';

/** Generate a new puzzle level using Gemini AI (or cache) */
export async function generateLevel(request, env, headers) {
  const { language = 'ar', level = 1 } = await request.json();
  const isArabic = language === 'ar';
  const apiKey = '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'; // Demo key – replace in prod
  const model = 'llama-3.1-8b-instant';

  // Try cached puzzle first (need at least 3 cached variants)
  if (env.DB) {
    const cached = await env.DB.prepare(
      'SELECT * FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1'
    ).bind(level, language).first();
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
2. أنشئ 3-5 خطوات وسيطة تربط بينها بشكل منطقي
3. كل خطوة يجب أن تكون مرتبطة بالخطوة السابقة واللاحقة
4. لكل خطوة، وفر 4 خيارات: الإجابة الصحيحة + 3 خيارات خاطئة مقنعة

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
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate a unique ${isArabic ? 'creative Arabic' : 'creative English'} word connection puzzle for level ${level}. Make it challenging but fair. Ensure all steps are logically connected. Puzzle ID: ${seed}` }
      ],
      temperature: 0.9,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  const content = data.choices[0].message.content;
  const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();

  // Cache the generated puzzle (allow multiple per level)
  if (env.DB) {
    try {
      await env.DB.prepare('INSERT INTO puzzles (level, lang, json) VALUES (?, ?, ?)')
        .bind(level, language, jsonStr)
        .run();
    } catch (e) {
      console.log('Cache insert failed:', e);
    }
  }

  return new Response(jsonStr, { headers: { ...headers, 'Content-Type': 'application/json' } });
}

/** Validate a submitted solution against stored puzzle */
export async function submitSolution(request, env, headers) {
  // Expected payload: { language: 'ar'|'en', level: number, steps: [{word:string}] }
  const { language = 'ar', level = 1, steps } = await request.json();
  if (!Array.isArray(steps) || steps.length === 0) {
    return errorResponse('Missing or invalid steps', 400);
  }

  // Retrieve stored puzzle JSON
  const row = await env.DB.prepare('SELECT json FROM puzzles WHERE level = ? AND lang = ? LIMIT 1')
    .bind(Number(level), language)
    .first();
  if (!row) {
    return errorResponse('Puzzle not found', 404);
  }
  let puzzle;
  try {
    puzzle = JSON.parse(row.json);
  } catch (e) {
    return errorResponse('Corrupted puzzle data', 500);
  }

  const correctSteps = puzzle.steps.map(s => s.word);
  const userSteps = steps.map(s => (typeof s === 'object' ? s.word : s));

  const isCorrect = JSON.stringify(correctSteps) === JSON.stringify(userSteps);

  return jsonResponse({ success: true, correct: isCorrect, expected: correctSteps, provided: userSteps }, 200);
}
