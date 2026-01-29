import { jsonResponse, errorResponse } from './utils.js';

function getPrompt(language) {
  if (language === 'ar') {
    return `انظر للصورة. حدد شيئين مختلفين وواضحين. أنشئ 3 خطوات للربط بينهما بشكل إبداعي.
كل خطوة لها 3 خيارات (1 صحيح + 2 خاطئ).

أعطني JSON فقط بهذا الشكل الدقيق:
{
  "startWord": "الشيء الأول",
  "endWord": "الشيء الثاني",
  "steps": [
    {"word": "خطوة1", "options": ["خطوة1", "خاطئ1", "خاطئ2"]},
    {"word": "خطوة2", "options": ["خطوة2", "خاطئ3", "خاطئ4"]},
    {"word": "خطوة3", "options": ["خطوة3", "خاطئ5", "خاطئ6"]}
  ],
  "hint": "تلميح مفيد",
  "puzzleId": "v1"
}`;
  }

  return `Look at the image. Identify 2 different, clear objects. Create 3 creative steps to link them.
Each step has 3 options (1 correct + 2 wrong).

Give me ONLY JSON in this exact format:
{
  "startWord": "first object",
  "endWord": "second object",
  "steps": [
    {"word": "step1", "options": ["step1", "wrong1", "wrong2"]},
    {"word": "step2", "options": ["step2", "wrong3", "wrong4"]},
    {"word": "step3", "options": ["step3", "wrong5", "wrong6"]}
  ],
  "hint": "helpful hint",
  "puzzleId": "v1"
}`;
}

export async function generatePuzzleFromImage(request, env) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const language = formData.get('language') || 'ar';

    if (!imageFile) {
      return errorResponse('No image provided', 400);
    }

    const geminiApiKey = env?.GEMINI_API_KEY;
    // Use vision-capable model - remove version suffixes
    let geminiModel = env?.GEMINI_MODEL || 'gemini-1.5-flash';
    // Remove -001, -002 etc suffixes that cause 404
    geminiModel = geminiModel.replace(/-\d+$/, '');

    if (!geminiApiKey) {
      return errorResponse('GEMINI_API_KEY not configured', 500);
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    const prompt = getPrompt(language);

    // Simple model name without 'models/' prefix for vision
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

    console.log('📸 Analyzing image with Gemini Vision:', geminiModel);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `${prompt}\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanations.` },
            {
              inline_data: {
                mime_type: imageFile.type || 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      return errorResponse(`Gemini API error: ${response.status}`, 500);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid Gemini response:', JSON.stringify(data));
      return errorResponse('Invalid response from Gemini', 500);
    }

    // Extract JSON from response
    let jsonStr = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', jsonStr.substring(0, 300));

    // Clean up response
    jsonStr = jsonStr
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Extract JSON object
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    // Parse and validate
    const puzzle = JSON.parse(jsonStr);

    if (!puzzle.startWord || !puzzle.endWord || !Array.isArray(puzzle.steps)) {
      throw new Error('Invalid puzzle structure from AI');
    }

    // Ensure valid steps
    puzzle.steps = puzzle.steps
      .map(step => {
        if (!step.word || !Array.isArray(step.options)) return null;

        // Ensure correct answer is in options
        if (!step.options.includes(step.word)) {
          step.options[0] = step.word;
        }

        // Ensure exactly 3 options
        while (step.options.length < 3) {
          step.options.push(`option_${Date.now()}_${Math.random()}`);
        }
        step.options = step.options.slice(0, 3);

        return step;
      })
      .filter(Boolean);

    if (puzzle.steps.length < 2) {
      throw new Error('Not enough valid steps');
    }

    // Set defaults
    puzzle.hint = puzzle.hint || 'Think creatively';
    puzzle.puzzleId = puzzle.puzzleId || `vision_${Date.now()}`;

    console.log('✅ Puzzle generated:', puzzle.startWord, '->', puzzle.endWord);
    return jsonResponse(puzzle);

  } catch (error) {
    console.error('Vision Error:', error.message);
    return errorResponse(`Vision error: ${error.message}`, 500);
  }
}
