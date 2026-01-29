// New prompt for full-path puzzle system
// Each puzzle has 4 complete paths (A, B, C, D), each with 4 steps

export function buildPathPuzzlePrompt({ language = 'ar', level = 1 } = {}) {
    const isArabic = language === 'ar';

    if (isArabic) {
        return `أنت منشئ ألغاز محترف للعبة "الرابط العجيب".

🎯 المهمة:
أنشئ لغزاً يربط بين كلمتين عبر 4 مسارات مختلفة، واحد فقط صحيح.

📋 البنية المطلوبة:
- كلمة بداية وكلمة نهاية
- 4 مسارات (A, B, C, D)
- كل مسار يحتوي على 4 خطوات بالضبط
- مسار واحد فقط صحيح ومنطقي
- 3 مسارات خاطئة لكن تبدو معقولة

✅ المسار الصحيح:
- يجب أن يربط بشكل منطقي ومتسلسل
- كل خطوة تؤدي للتي تليها بشكل طبيعي
- أنواع الروابط: سبب←نتيجة، عملية طبيعية، مادة←منتج، جزء←كل

❌ المسارات الخاطئة:
- يجب أن تبدو منطقية للوهلة الأولى
- لكن لا توصل للكلمة النهائية
- أو تحتوي على قفزات غير منطقية

📝 متطلبات اللغة:
- عربية فصحى نقية 100%
- كلمات يومية مألوفة
- بدون كلمات محظورة: (بداية، نهاية، كلمة، خطوة، لغز)

مثال:
{
  "startWord": "البحر",
  "endWord": "القمح",
  "paths": [
    {
      "label": "A",
      "steps": ["تبخر", "غيوم", "مطر", "تربة"],
      "isCorrect": true,
      "explanation": "دورة الماء الطبيعية التي تروي الأرض"
    },
    {
      "label": "B",
      "steps": ["ملح", "أسماك", "صيد", "سوق"],
      "isCorrect": false,
      "explanation": "لا يوصل للقمح"
    },
    {
      "label": "C",
      "steps": ["أمواج", "شاطئ", "رمال", "صحراء"],
      "isCorrect": false,
      "explanation": "يبتعد عن الزراعة"
    },
    {
      "label": "D",
      "steps": ["أعماق", "ضغط", "معادن", "صخور"],
      "isCorrect": false,
      "explanation": "لا علاقة له بالنباتات"
    }
  ],
  "hint": "فكر في دورة الماء الطبيعية",
  "difficulty": 1
}

📤 أعط JSON فقط، بدون أي نص إضافي:`;
    }

    return `You are an expert puzzle designer for "Wonder Link" game.

🎯 MISSION:
Create a puzzle linking two words via 4 different paths, only one correct.

📋 REQUIRED STRUCTURE:
- Start word and end word
- 4 paths (A, B, C, D)
- Each path contains exactly 4 steps
- Only 1 path is correct and logical
- 3 paths are wrong but seem plausible

✅ CORRECT PATH:
- Must connect logically and sequentially
- Each step naturally leads to the next
- Types: cause→effect, natural process, material→product, part→whole

❌ WRONG PATHS:
- Should seem logical at first glance
- But don't reach the end word
- Or contain illogical jumps

📝 LANGUAGE:
- Pure English
- Common everyday words
- No meta words: (start, end, word, step, puzzle)

Example:
{
  "startWord": "Ocean",
  "endWord": "Wheat",
  "paths": [
    {
      "label": "A",
      "steps": ["Evaporation", "Clouds", "Rain", "Soil"],
      "isCorrect": true,
      "explanation": "Natural water cycle that irrigates land"
    },
    {
      "label": "B",
      "steps": ["Salt", "Fish", "Fishing", "Market"],
      "isCorrect": false,
      "explanation": "Doesn't lead to wheat"
    },
    {
      "label": "C",
      "steps": ["Waves", "Beach", "Sand", "Desert"],
      "isCorrect": false,
      "explanation": "Moves away from agriculture"
    },
    {
      "label": "D",
      "steps": ["Depths", "Pressure", "Minerals", "Rocks"],
      "isCorrect": false,
      "explanation": "No relation to plants"
    }
  ],
  "hint": "Think about the natural water cycle",
  "difficulty": 1
}

📤 OUTPUT JSON only, no extra text:`;
}
