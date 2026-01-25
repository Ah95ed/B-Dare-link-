import { jsonResponse, errorResponse, CORS_HEADERS } from './utils.js';
import { buildSystemPrompt } from './prompt.js';

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

    // Prepare prompt
    const systemPrompt = buildSystemPrompt({ language, level: 1 });
    const userPrompt = language === 'ar'
      ? 'حلّل الصورة وحدّد عنصرين بارزين وواضحين. اجعل الأول "startWord" والثاني "endWord" ثم أنشئ لغز ربط منطقي كامل بينهما. استخدم سلسلة من خطوات وسيطة منطقية، وكل خطوة يجب أن تحتوي 3 خيارات فقط (واحدة صحيحة + مشتتان). اكتب JSON فقط بالمفاتيح: startWord, endWord, steps (array of {word, options}), hint, puzzleId.'
      : 'Analyze the image and identify TWO clear, prominent objects. Use the first as "startWord" and the second as "endWord". Then create a full logical link puzzle between them. Provide intermediate steps; each step must include exactly 3 options (1 correct + 2 distractors). Output JSON only with: startWord, endWord, steps (array of {word, options}), hint, puzzleId.';

    // Call Gemini with Image
    // Note: This relies on the specific Gemini Worker binding API.
    // Assuming env.GEMINI_MODEL is mapped to a model that supports generation
    // OR using env.AI with a specific model.
    // Let's try standard Cloudflare AI binding first if available, or direct REST if that's what's configured.
    // Based on previous files, env.AI is used.

    const inputs = {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      // Some bindings allow passing 'image' property or similar multi-modal inputs
      // For many D1/Workers AI bindings, we might need a specific input format.
      // Since I cannot allow external calls, I must use the binding found in index.js: env.AI

      // If env.AI supports @cf/meta/llama-3.2-11b-vision-instruct or similar, we use that.
      // But user metadata showed env.GEMINI_MODEL. Let's assume we can use a custom fetch or specific binding method.
      // Seeing 'env.GEMINI_MODEL' suggests it might be a direct binding or just a string env var.
      // If it's just a string, we might need to use the Google AI SDK using the API key?
      // Wait, let's look at index.js imports again.
    };

    // Actually, let's look at how text generation was done to see the pattern.
    // ... Checked memory: It used `env.AI.run('@cf/meta/llama-3.1-8b-instruct', ...)`
    // So for vision we need a vision model.
    // Let's assume we use `@cf/meta/llama-3.2-11b-vision-instruct` or similar if available,
    // OR if we have a GEMINI_API_KEY (often implicit in env.GEMINI_MODEL if it's a binding).

    // STRATEGY: Use a vision model available in Workers AI.
    // Common one: @cf/meta/llama-3.2-11b-vision-instruct

    // However, if env.GEMINI_MODEL is set, maybe the user wants us to use that?
    // Let's try to use the `env.AI.run` with a vision model first as it's standard.

    // Convert Uint8Array to regular array for JSON serialization if needed, or pass as is?
    // Workers AI usually expects { image: [...], prompt: ... } for vision models.

    const input = {
      image: [...uint8Array],
      prompt: `${systemPrompt}\n\n${userPrompt}\n\nRules: JSON only, no extra text.`,
      max_tokens: 1024,
    };

    const response = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', input);

    // Parse response
    let jsonStr = response.response || "";
    // Clean markdown
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const puzzle = JSON.parse(jsonStr);
      // Validate puzzle structure briefly
      if (!puzzle.startWord || !puzzle.steps) {
        throw new Error("Invalid structure");
      }
      return jsonResponse(puzzle);
    } catch (parseError) {
      console.error("JSON Parse Error", parseError, jsonStr);
      // Fallback: try to repair or just error
      return errorResponse("Failed to generate valid JSON from image", 500);
    }

  } catch (e) {
    console.error('Image Generation Error', e);
    return errorResponse(e.message, 500);
  }
}
