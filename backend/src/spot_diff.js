import { jsonResponse, errorResponse } from './utils.js';

function stripJson(text) {
    let cleaned = String(text || '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    // If text contains JSON markers, extract just the JSON part
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    }

    return cleaned;
}

function buildPlanPrompt({ language, differencesCount, theme, width, height, conflict, stage }) {
    const count = Math.min(Math.max(Number(differencesCount) || 5, 3), 12);
    const safeTheme = theme || (language === 'ar' ? 'مكان كرتوني هادئ وشخصية رئيسية واحدة' : 'a calm cartoon scene with one main character');
    const safeConflict = conflict || (language === 'ar' ? 'الخوف مقابل الجرأة' : 'fear vs courage');
    const safeStage = stage || (language === 'ar' ? 'مرحلة القرار' : 'decision stage');
    const sizeHint = `Image size: ${width}x${height} pixels.`;

    if (language === 'ar') {
        return `أنشئ فكرة لمرحلة "اختلافات ذكية" لصورتين كرتونيتين شبه متطابقتين.
الهدف: ${count} فروق مرئية فقط، خفيفة ومدروسة.
السمة: ${safeTheme}.
الثيمة النفسية: ${safeConflict}.
المرحلة: ${safeStage}.
${sizeHint}

الشروط الصارمة للصورتين:
- نفس الكاميرا، نفس الزاوية، نفس الإضاءة، نفس الخلفية، نفس الألوان الأساسية.
- اختلافات محدودة فقط (عنصر مضاف/محذوف، لون، كسر، تعبير وجه، وضعية يد، عنصر مظلم/مضيء).
- لا تضف نصوص داخل الصورة، ولا شعارات أو علامات مائية.

أعطني JSON فقط بهذا الشكل الدقيق:
{
    "basePrompt": "وصف مفصل للصورة الأولى",
    "variantPrompt": "وصف مفصل للصورة الثانية مع الفروق",
    "differences": [
        {"id": 1, "label": "وصف الفرق", "reason": "دلالة نفسية قصيرة", "x": 0.25, "y": 0.40, "radius": 0.06},
        {"id": 2, "label": "وصف الفرق", "reason": "دلالة نفسية قصيرة", "x": 0.72, "y": 0.58, "radius": 0.05}
    ],
    "decision": {
        "question": "سؤال قرار نهائي لهذه المرحلة",
        "options": [
            {"id": "A", "text": "خيار 1", "trait": "سمة نفسية"},
            {"id": "B", "text": "خيار 2", "trait": "سمة نفسية"}
        ]
    }
}

القيم x و y و radius يجب أن تكون نسبية بين 0 و 1 بالنسبة لأبعاد الصورة.
لا تكتب أي نص خارج JSON.`;
    }

    return `Create a "smart differences" level with two almost identical cartoon images.
Goal: ${count} subtle and deliberate differences only.
Theme: ${safeTheme}.
Psychological conflict: ${safeConflict}.
Stage: ${safeStage}.
${sizeHint}

Strict requirements:
- Same camera angle, same lighting, same background, same main colors.
- Differences must be limited (add/remove item, color shift, crack, facial expression, hand pose, dark vs bright element).
- No text in the image, no watermarks.

Return ONLY JSON in this exact format:
{
    "basePrompt": "detailed description for the first image",
    "variantPrompt": "detailed description for the second image with differences",
    "differences": [
        {"id": 1, "label": "difference description", "reason": "short psychological meaning", "x": 0.25, "y": 0.40, "radius": 0.06},
        {"id": 2, "label": "difference description", "reason": "short psychological meaning", "x": 0.72, "y": 0.58, "radius": 0.05}
    ],
    "decision": {
        "question": "final decision question for this stage",
        "options": [
            {"id": "A", "text": "Option 1", "trait": "Psychological trait"},
            {"id": "B", "text": "Option 2", "trait": "Psychological trait"}
        ]
    }
}

All x, y, radius must be normalized values between 0 and 1.
No extra text outside JSON.`;
}

function normalizeDifferences(differences) {
    if (!Array.isArray(differences)) return [];
    return differences.map((diff, index) => {
        const x = Math.min(Math.max(Number(diff?.x) || 0, 0), 1);
        const y = Math.min(Math.max(Number(diff?.y) || 0, 0), 1);
        const radius = Math.min(Math.max(Number(diff?.radius) || 0.05, 0.02), 0.2);
        return {
            id: Number(diff?.id) || index + 1,
            label: String(diff?.label || ''),
            reason: String(diff?.reason || ''),
            x,
            y,
            radius,
        };
    });
}

async function callGeminiText(env, prompt, model) {
    const geminiApiKey = env?.GEMINI_API_KEY;
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY not configured');

    const preferredModel = (model || env?.GEMINI_TEXT_MODEL || env?.GEMINI_MODEL || 'gemini-2.5-flash')
        .replace(/-\d+$/, '');
    const fallbackModels = [
        preferredModel,
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-2.0-flash-001',
        'gemini-flash-latest',
    ].filter((m, i, arr) => m && arr.indexOf(m) === i);

    let lastError = '';
    for (const geminiModel of fallbackModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            lastError = `model=${geminiModel} status=${response.status} body=${errorText}`;
            console.error('Gemini text error:', lastError);
            if (response.status === 404 || response.status === 403) {
                continue; // try fallback models on 404 or 403
            }
            throw new Error(`gemini_text_http_${response.status} ${lastError}`);
        }

        const data = await response.json();
        const text =
            data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || '').join('') || '';
        if (!text) throw new Error('gemini_text_empty');
        console.log(`Successfully used model: ${geminiModel}`);
        return stripJson(text);
    }

    throw new Error(`gemini_text_all_failed ${lastError}`);
}

async function callGeminiImage(env, prompt) {
    const geminiApiKey = env?.GEMINI_API_KEY;
    const imageModel = env?.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-exp-image-generation';
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY not configured');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${imageModel}:generateContent?key=${geminiApiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 1024,
                responseModalities: ['TEXT', 'IMAGE'],
            },
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error('Gemini image error:', errorText);
        throw new Error(`gemini_image_http_${response.status}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const inlinePart = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
    const base64 = inlinePart?.inlineData?.data || inlinePart?.inline_data?.data;
    if (!base64) throw new Error('gemini_image_empty');
    return base64;
}

export async function generateSpotDiffPuzzle(request, env) {
    try {
        const body = await request.json().catch(() => ({}));
        const language = body.language === 'en' ? 'en' : 'ar';
        const differencesCount = body.differencesCount || 5;
        const theme = body.theme || '';
        const width = Math.min(Math.max(Number(body.width) || 512, 256), 1024);
        const height = Math.min(Math.max(Number(body.height) || 512, 256), 1024);
        const conflict = body.conflict || '';
        const stage = body.stage || '';

        const planPrompt = buildPlanPrompt({ language, differencesCount, theme, width, height, conflict, stage });
        const planJson = await callGeminiText(env, planPrompt, env?.GEMINI_TEXT_MODEL);

        let plan;
        try {
            plan = JSON.parse(planJson);
        } catch (parseError) {
            console.error('JSON parse error:', parseError.message);
            console.error('Received text:', planJson);
            return errorResponse(`Invalid JSON from Gemini: ${parseError.message}`, 500);
        }

        if (!plan?.basePrompt || !plan?.variantPrompt || !Array.isArray(plan?.differences)) {
            return errorResponse('Invalid plan structure from Gemini', 500);
        }

        const normalizedDifferences = normalizeDifferences(plan.differences).slice(0, differencesCount);
        const decision = plan?.decision && typeof plan.decision === 'object' ? plan.decision : null;

        const diffHints = normalizedDifferences
            .map((d) => d.label)
            .filter((t) => t)
            .join(', ');
        const styleSuffix =
            'Style: clean cartoon, bright colors, no text, no watermark. ' +
            'Keep camera angle, lighting, and composition identical.';

        const baseImage = await callGeminiImage(
            env,
            `${plan.basePrompt}\n${styleSuffix}\nNo differences added.`,
        );
        const variantImage = await callGeminiImage(
            env,
            `${plan.variantPrompt}\n${styleSuffix}\nOnly apply these differences: ${diffHints}`,
        );

        return jsonResponse({
            language,
            width,
            height,
            imageA: `data:image/png;base64,${baseImage}`,
            imageB: `data:image/png;base64,${variantImage}`,
            differences: normalizedDifferences,
            conflict: conflict || undefined,
            stage: stage || undefined,
            decision: decision || undefined,
            promptA: plan.basePrompt,
            promptB: plan.variantPrompt,
        });
    } catch (error) {
        console.error('SpotDiff Error:', error.message);
        return errorResponse(`SpotDiff error: ${error.message}`, 500);
    }
}