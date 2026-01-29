// prompt.js - Enhanced prompts for puzzle generation with advanced anti-repetition and diversity

function difficultyLabel(level) {
  const n = Number(level) || 1;
  if (n <= 10) return 'Easy';
  if (n <= 30) return 'Medium';
  if (n <= 50) return 'Hard';
  return 'Expert';
}

function stepsMinMax(level) {
  const n = Number(level) || 1;
  if (n <= 10) return { min: 2, max: 3 };   // Beginner: 2-3 steps
  if (n <= 30) return { min: 3, max: 4 };   // Intermediate: 3-4 steps
  if (n <= 50) return { min: 4, max: 5 };   // Advanced: 4-5 steps
  return { min: 5, max: 6 };                 // Expert+: 5-6 steps
}

export function linkChainMinMax(level) {
  const n = Number(level) || 1;
  if (n <= 10) return { min: 3, max: 4 };   // Beginner
  if (n <= 30) return { min: 4, max: 5 };   // Intermediate
  if (n <= 50) return { min: 5, max: 6 };   // Advanced
  return { min: 6, max: 7 };                 // Expert+
}

// ============= MAIN PUZZLE GENERATION PROMPTS =============

export function buildSystemPrompt({ language = 'en', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);

  if (isArabic) {
    return `أنت منشئ ألغاز محترف للعبة "الرابط العجيب" باللغة العربية الفصحى فقط.

🎯 المهمة الأساسية:
ربط كلمتين تبدوان غير مترابطتين عبر سلسلة منطقية من ${min}-${max} خطوات.

⚡ قواعد الترابط المنطقي:
- سبب نتيجة (مثال: نار دخان)
- جزء كل (مثال: إطار سيارة)
- أداة استخدام (مثال: قلم كتابة)
- عملية طبيعية (مثال: بحر تبخر غيوم)

🎲 متطلبات الخيارات:
- 3 خيارات لكل خطوة (الصحيح + 2 مشتتات)
- الخيار الصحيح يجب أن يكون موجوداً

📤 الإخراج (JSON فقط):
{
  "startWord": "كلمة البداية",
  "endWord": "كلمة النهاية",
  "steps": [
    { "word": "خطوة 1", "options": ["خطوة 1", "مشتت 1", "مشتت 2"] }
  ],
  "hint": "تلميح يوجه"
}`;
  }

  return `You are an expert puzzle designer for "Wonder Link" game in ENGLISH.

CORE MISSION:
Connect two seemingly unrelated words through a chain of ${min}-${max} logically connected steps.

LOGICAL TRANSITION TYPES:
- Cause to Effect
- Part to Whole
- Tool to Use
- Natural Process
- Material to Product

QUALITY REQUIREMENTS:
- Level: ${level} | Difficulty: ${difficulty}
- Steps: ${min}-${max} words
- Common everyday vocabulary
- Each transition must be universally understood

OUTPUT (JSON only):
{
  "startWord": "...",
  "endWord": "...",
  "steps": [
    { "word": "...", "options": ["...", "...", "..."] }
  ],
  "hint": "General guidance"
}`;
}

export function buildUserPrompt({ language = 'en', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);
  const seedLine = seed == null ? '' : `\nSeed: ${seed}`;

  if (isArabic) {
    return `أنشئ لغز جديد تماماً - مستوى ${level} (${difficulty}).
استخدم كلمات عربية فصحى بسيطة.
الرابط يجب أن يكون غير متوقع لكن منطقي.
الخيارات الخاطئة معقولة لكن خاطئة.
أخرج JSON فقط بلا تعليقات.${seedLine}`;
  }

  return `Create a fresh puzzle for level ${level} (${difficulty}).
Use common everyday words.
The link should be non-obvious but logically sound.
Wrong options should be plausible but incorrect.
Return JSON only - no comments.${seedLine}`;
}

export function expectedStepsMinMax(level) {
  return stepsMinMax(level);
}

// ============= QUIZ COMPETITION MODE =============

export function buildQuizSystemPrompt({ language = 'ar', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const correctIndex = Math.floor(Math.random() * 4); // distribute correct answer index fairly

  if (isArabic) {
    return `أنت منشئ أسئلة محترف بالعربية الفصحى.

المطلوب: سؤال واحد مع 4 خيارات.

المستوى: ${level}
الصعوبة: ${difficulty}
موضع الإجابة الصحيحة هذه المرة: ${correctIndex} (0 أو 1 أو 2 أو 3)

القواعد:
1. عربية فصحى نقية 100%
2. بدون أخطاء
3. السؤال واضح
4. 4 خيارات مختلفة
5. خيار واحد فقط صحيح
6. يجب وضع الإجابة الصحيحة في الفهرس ${correctIndex} وعدم تثبيتها دائماً عند 0

الإخراج JSON فقط:
{
  "question": "نص السؤال",
  "options": ["خ1", "خ2", "خ3", "خ4"],
  "correctIndex": ${correctIndex},
  "hint": "تلميح",
  "category": "category"
}`;
  }

  return `You are creating high-quality trivia questions in ENGLISH.

Generate ONE question with exactly 4 multiple choice options.

Level: ${level}
Difficulty: ${difficulty}

Requirements:
1. ENGLISH only
2. Proper spelling and grammar
3. Question must be clear
4. All 4 options must be distinct
5. Exactly one correct answer
6. Place the correct answer at index ${correctIndex} (0-3) and do not always use 0

Output JSON only:
{
  "question": "Question text",
  "options": ["Opt1", "Opt2", "Opt3", "Opt4"],
  "correctIndex": ${correctIndex},
  "hint": "Brief hint",
  "category": "cat"
}`;
}

export function buildQuizUserPrompt({ language = 'ar', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? '' : `\nSeed: ${seed}`;

  if (isArabic) {
    return `أنشئ سؤال جديد بالعربية الفصحى - مستوى ${level} (${difficulty}).

متطلبات:
- عربية فصحى فقط
- لا توجد أخطاء
- جميع الخيارات مختلفة
- خيار واحد فقط صحيح
- لا تكرر

أخرج JSON فقط.${seedLine}`;
  }

  return `Generate a fresh ENGLISH quiz question for level ${level} (${difficulty}).

Requirements:
- ENGLISH ONLY
- No errors
- All 4 options distinct
- Exactly one correct
- No repetition

Output JSON only.${seedLine}`;
}

// ============= WONDER LINK QUIZ (Advanced Link Questions) =============

export function buildLinkQuizSystemPrompt({ language = 'ar', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = linkChainMinMax(level);
  const correctIndex = Math.floor(Math.random() * 4); // ensure correct answer not fixed at first position

  if (isArabic) {
    return `أنت خبير ألغاز الرابط العجيب بالعربية الفصحى.

المهمة: ربط مفهومين (A و B) عبر ${min}-${max} خطوات.

أنواع الروابط:
- سبب نتيجة
- عملية طبيعية
- تحويل مواد
- أداة استخدام
- جزء كل

صيغة السؤال الثابتة:
"ما الرابط بين \"أ\" و\"ب\"؟"

متطلبات الخيارات:
1. كل خيار = ${min}-${max} كلمات مفصولة بـ " → "
2. خيار واحد فقط صحيح
3. الخيارات الخاطئة معقولة
4. بنفس الطول
5. لا تكرر الكلمات
 6. ضع الإجابة الصحيحة في الفهرس ${correctIndex} (0 أو 1 أو 2 أو 3)

التلميح: يشير للمجال دون كشف الكلمات

الإخراج JSON فقط:
{
  "question": "ما الرابط...",
  "options": ["السلسلة1", "السلسلة2", "السلسلة3", "السلسلة4"],
  "correctIndex": ${correctIndex},
  "hint": "التلميح",
  "category": "wonder_link",
  "pair": { "a": "كلمة", "b": "كلمة" },
  "linkSteps": ["خطوة1", "خطوة2"],
  "domain": "المجال",
  "explanation": "الشرح"
}`;
  }

  return `You are an expert "Wonder Link" puzzle creator in ENGLISH.

Task: Create a question linking two concepts (A and B) through ${min}-${max} logical steps.

Connection Types:
- Cause to Effect
- Natural Process
- Transformation
- Tool to Use
- Part to Whole

Question Format (fixed):
"What is the link between \"A\" and \"B\"?"

Option Requirements (4 total):
1. Each = ${min}-${max} words separated by " → "
2. Exactly ONE correct
3. Wrong options plausible but flawed
4. Similar length
5. No repeating key words
6. Place the correct answer at index ${correctIndex} (spread across 0-3, never fixed)

Hint: Points to domain/type, not vocabulary

Output JSON only:
{
  "question": "What is the link...",
  "options": ["chain1", "chain2", "chain3", "chain4"],
  "correctIndex": ${correctIndex},
  "hint": "Hint text",
  "category": "wonder_link",
  "pair": { "a": "word", "b": "word" },
  "linkSteps": ["step1", "step2"],
  "domain": "Domain",
  "explanation": "Explanation"
}`;
}

export function buildLinkQuizUserPrompt({ language = 'ar', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = linkChainMinMax(level);

  // Diversity factors to prevent repetition
  const diversityFactors = {
    arDomains: ['دورات طبيعية', 'تحويل وتصنيع', 'صحة وجسم', 'تكنولوجيا', 'فن وثقافة', 'اقتصاد وتجارة', 'جغرافيا', 'تاريخ'],
    enDomains: ['Natural cycles', 'Transformation', 'Body and health', 'Technology', 'Art and culture', 'Commerce', 'Geography', 'History'],
  };

  // Calculate correct answer position - NEVER always first
  const correctPos = seed ? (seed.charCodeAt(0) % 4) : Math.floor(Math.random() * 4);
  const selectedDomain = isArabic
    ? diversityFactors.arDomains[seed ? seed.charCodeAt(0) % diversityFactors.arDomains.length : 0]
    : diversityFactors.enDomains[seed ? seed.charCodeAt(0) % diversityFactors.enDomains.length : 0];

  if (isArabic) {
    return `أنشئ سؤال "الرابط العجيب" جديد - مستوى ${level} (${difficulty})

تحذير من التكرار (حرج جداً):
- اختر طرفين مختلفين تماماً إذا بدا مشابهاً
- غيّر المجال إذا كان السابق عنه
- الخيارات الخاطئة يجب أن تكون خادعة ومعقولة
- لا تستخدم نفس الكلمات من الأسئلة السابقة

المجال المقترح هذه المرة: ${selectedDomain}
موضع الإجابة الصحيحة: ${correctPos} (0=أول، 1=ثاني، 2=ثالث، 3=رابع)

متطلبات إلزامية:
1. عربية فصحى 100% فقط
2. بدون أخطاء إملائية
3. رابط منطقي عالمي الفهم
4. 4 خيارات متساوية الطول
5. كل خيار = ${min}-${max} كلمات مفصولة بـ " → "

أخرج JSON فقط - بلا تعليقات`;
  }

  return `Generate a completely FRESH "Wonder Link" question - level ${level} (${difficulty})

CRITICAL anti-repetition:
- Pick completely different A and B words if similar to recent
- Vary the domain - do NOT repeat same category
- Wrong options must be plausible and deceptive
- NEVER reuse words/phrases from recent puzzles

Suggested domain: ${selectedDomain}
Correct answer MUST be at position: ${correctPos} (0=first, 1=second, 2=third, 3=fourth)

STRICT requirements:
1. ENGLISH 100% ONLY
2. Perfect spelling and grammar throughout
3. Link must be logical and universally understood
4. 4 options, equal length - exactly ONE correct
5. Each option = ${min}-${max} words separated PRECISELY by " → "

Output JSON only - no comments or explanation`;
}
