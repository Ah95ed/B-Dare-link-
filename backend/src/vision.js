import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { buildSystemPrompt } from './prompt.js';

// License agreement flag - set once per deployment
let licenseAgreed = false;

async function agreeLicenseIfNeeded(env) {
  if (!licenseAgreed) {
    try {
      // Submit agreement to use llama-3.2-11b-vision-instruct
      await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
        prompt: 'agree',
        max_tokens: 1,
      });
      licenseAgreed = true;
      console.log('✅ License agreement accepted for vision model');
    } catch (e) {
      console.error('License agreement error:', e);
      // Continue anyway - might already be agreed
      licenseAgreed = true;
    }
  }
}

export async function generatePuzzleFromImage(request, env) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const language = formData.get('language') || 'ar';

    if (!imageFile) {
      return errorResponse('No image provided', 400);
    }

    // Convert image to ArrayBuffer/Uint8Array
    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Simplified prompt for better JSON output
    const userPrompt = language === 'ar'
      ? `انظر للصورة. حدد شيئين مختلفين. 
أنشئ 3 خطوات للربط بينهما.
كل خطوة لها 3 خيارات (1 صحيح + 2 خاطئ).

أعطني JSON فقط بهذا الشكل:
{
  "startWord": "الشيء الأول",
  "endWord": "الشيء الثاني",
  "steps": [
    {"word": "خطوة1", "options": ["خطوة1", "خاطئ1", "خاطئ2"]},
    {"word": "خطوة2", "options": ["خطوة2", "خاطئ3", "خاطئ4"]},
    {"word": "خطوة3", "options": ["خطوة3", "خاطئ5", "خاطئ6"]}
  ],
  "hint": "تلميح مفيد",
  "puzzleId": "vision_${Date.now()}"
}`
      : `Look at the image. Identify 2 different objects.
Create 3 steps to link them.
Each step has 3 options (1 correct + 2 wrong).

Give me ONLY JSON in this format:
{
  "startWord": "first object",
  "endWord": "second object",
  "steps": [
    {"word": "step1", "options": ["step1", "wrong1", "wrong2"]},
    {"word": "step2", "options": ["step2", "wrong3", "wrong4"]},
    {"word": "step3", "options": ["step3", "wrong5", "wrong6"]}
  ],
  "hint": "helpful hint",
  "puzzleId": "vision_${Date.now()}"
}`;

    // Ensure license is agreed before using the model
    await agreeLicenseIfNeeded(env);

    const input = {
      image: [...uint8Array],
      prompt: `${userPrompt}\n\nIMPORTANT: Return ONLY valid JSON. No explanations, no markdown, no extra text.`,
      max_tokens: 800,
    };

    const response = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', input);

    // Parse response with better error handling
    let jsonStr = response.response || response.text || "";

    console.log('Raw AI Response:', jsonStr);

    // Try to extract JSON from response
    // Remove markdown code blocks
    jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Try to find JSON object in the text
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    jsonStr = jsonStr.trim();

    try {
      const puzzle = JSON.parse(jsonStr);

      // Validate and fix structure
      if (!puzzle.startWord || !puzzle.endWord || !puzzle.steps) {
        throw new Error("Missing required fields");
      }

      // Ensure steps array exists and has valid format
      if (!Array.isArray(puzzle.steps) || puzzle.steps.length < 2) {
        throw new Error("Invalid steps array");
      }

      // Fix each step to ensure 3 options
      puzzle.steps = puzzle.steps.map(step => {
        if (!step.word || !Array.isArray(step.options)) {
          return null;
        }

        // Ensure correct word is in options
        if (!step.options.includes(step.word)) {
          step.options[0] = step.word;
        }

        // Fill to 3 options if needed
        while (step.options.length < 3) {
          step.options.push(`option_${Math.random().toString(36).substr(2, 5)}`);
        }

        // Limit to 3 options
        step.options = step.options.slice(0, 3);

        return step;
      }).filter(Boolean);

      // Ensure we have at least 2 valid steps
      if (puzzle.steps.length < 2) {
        throw new Error("Not enough valid steps");
      }

      // Set defaults
      puzzle.hint = puzzle.hint || (language === 'ar' ? 'فكر بشكل إبداعي' : 'Think creatively');
      puzzle.puzzleId = puzzle.puzzleId || `vision_${Date.now()}`;

      console.log('✅ Valid puzzle generated:', JSON.stringify(puzzle));
      return jsonResponse(puzzle);

    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError.message);
      console.error("Received text:", jsonStr);

      return errorResponse(
        `Failed to generate valid puzzle from image. AI returned: ${jsonStr.substring(0, 200)}`,
        500
      );
    }

  } catch (e) {
    console.error('Image Generation Error', e);
    return errorResponse(e.message, 500);
  }
}
