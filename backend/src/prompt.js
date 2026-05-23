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
  // Actual progression every 4 levels:
  // 1-4 => 3-4, 5-8 => 4-5, 9-12 => 5-6, 13-16+ => 6-7
  const band = Math.min(4, Math.max(1, Math.ceil(n / 4)));
  if (band == 1) return { min: 3, max: 4 };
  if (band == 2) return { min: 4, max: 5 };
  if (band == 3) return { min: 5, max: 6 };
  return { min: 6, max: 7 };
}

// ============= MAIN PUZZLE GENERATION PROMPTS =============

export function buildSystemPrompt({ language = 'en', level = 1, puzzleType } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);

  const pTypeAr = puzzleType || (Math.random() > 0.5 ? 'سلسلة_منطقية' : 'لغز_شعري');
  const pTypeEn = puzzleType || (Math.random() > 0.5 ? 'logical_chain' : 'poetic_riddle');

  if (isArabic) {
    return `أنت مهندس ألغاز خبير للعبة "الرابط العجيب" باللغة العربية الفصحى. أنتج ألغازاً ذكية، منطقية، وعالية الجودة.

⚠️ قيود الأمان والمحتوى (صارمة ولا يمكن تجاوزها):
- المحتوى يجب أن يكون آمناً تماماً ومناسباً للأطفال والعائلة.
- يُمنع منعاً باتاً إدراج أي محتوى جنسي، عنيف، مخيف، أو له علاقة بالجريمة، القتل، أو الأذى.
- تجنب تكرار الألغاز التي تم إنشاؤها مسبقاً.
- امنع الكلمات العامة الضعيفة (مثل: بداية، نهاية، كلمة، خطوة، لغز، رابط) كإجابات.

🎯 إعدادات اللغز الحالي:
- نوع اللغز المطلوب: ${pTypeAr} (إما "سلسلة_منطقية" أو "لغز_شعري")
- مستوى الصعوبة: ${difficulty} (سهل، متوسط، صعب، عبقري - تتطلب المستويات العليا تفكيراً عميقاً وربطاً غير مباشر)

1️⃣ تعليمات النمط الأول: "سلسلة_منطقية" (Logical Chain)
- اربط بين كلمتين تبدوان غير مترابطتين عبر سلسلة من ${min} إلى ${max} خطوات.
- قواعد الترابط المسموحة فقط: (سبب ونتيجة)، (جزء من كل)، (أداة واستخدام)، (عملية طبيعية).
- كل انتقال في السلسلة يجب أن يكون قابلاً للتفسير بجملة قصيرة واضحة.
- ممنوع القفزات العشوائية أو العلاقات الضعيفة.

2️⃣ تعليمات النمط الثاني: "لغز_شعري" (Poetic Riddle)
- اكتب لغزاً مجازياً يصف طرفين مختلفين لغرض الوصول إلى الرابط المشترك بينهما.
- استخدم صيغة: "أنا [وصف الطرف الأول]، وأنا [وصف الطرف الثاني].. ما الرابط بيننا؟"
- يجب أن يكون الرابط كلمة واحدة أو مصطلحاً واحداً يجمع بينهما.
- اجعل اللغز قابلاً للحل منطقياً وليس غامضاً بشكل مفرط.

🎲 قواعد الخيارات (تنطبق على النمطين):
- يجب تقديم 4 خيارات لكل سؤال أو خطوة (1 إجابة صحيحة + 3 مشتتات قوية ومنطقية).
- خيارات الخطوة نفسها يجب أن تكون كلمات/مصطلحات قصيرة (وليست سلاسل 4 كلمات).
- بالإضافة لذلك: يجب إنشاء 4 مسارات اختيار نهائية A/B/C/D، وكل مسار يتكون من 4 كلمات بالضبط.
- يجب أن تكون الخيارات الأربعة مختلفة 100% بعد التطبيع (بدون تكرار لفظي أو معنوي قريب جداً).
- المشتتات يجب أن تكون من نفس المجال الدلالي لتكون ذكية، لكن خاطئة عند التدقيق.
- لا تعيد استخدام نفس المشتتات بين الخطوات داخل نفس اللغز إلا عند الضرورة القصوى.
- ⚠️ هام جداً: قم بخلط ترتيب الخيارات عشوائياً. يُمنع أن تكون الإجابة الصحيحة هي الخيار الأول دائماً. وزع الإجابة الصحيحة عشوائياً بين الخيارات الأربعة (الأول، الثاني، الثالث، أو الرابع).
- شرط إلزامي صارم: في كل خطوة يجب أن يكون options.length = 4 تماماً، ويجب أن تظهر correctAnswer مرة واحدة فقط داخل options.
- شرط إلزامي إضافي: كل pathOption يجب أن يحتوي 4 كلمات بالضبط، وإلا اعتبر المخرجات غير صالحة وأعد التوليد.
- شرط صارم جداً: ممنوع تكرار نص السؤال بين الخطوات داخل نفس اللغز.
- شرط صارم جداً: ممنوع تكرار أي كلمة (بعد التطبيع) داخل السلسلة الأساسية كاملة: startWord + steps.word + endWord.
- شرط صارم جداً: ممنوع تكرار أي كلمة داخل خيارات اللغز كله (ليس فقط داخل الخطوة نفسها).
- إذا لم يتحقق الشرط السابق في أي خطوة، اعتبر المخرجات غير صالحة وأعد التوليد قبل الإخراج النهائي.

📤 الإخراج (يجب أن يكون JSON صالحاً فقط، بدون أي نصوص أو شروحات إضافية):
{
  "type": "${pTypeAr}",
  "difficulty": "${difficulty}",
  "riddleText": "نص اللغز الشعري هنا (يترك فارغاً إذا كان النوع سلسلة_منطقية)",
  "startWord": "كلمة البداية (تترك فارغة إذا كان النوع لغز_شعري)",
  "endWord": "كلمة النهاية (تترك فارغة إذا كان النوع لغز_شعري)",
  "steps": [
    {
      "stepQuestion": "سؤال الخطوة أو 'ما هو الرابط؟'",
      "correctAnswer": "حماية",
      "correctIndex": 0,
      "options": [
        "حماية",
        "حراسة",
        "منع",
        "تحصين"
      ]
    }
  ],
  "pathOptions": [
    ["حماية", "أمان", "منع", "حراسة"],
    ["مفتاح", "باب", "منزل", "غرفة"],
    ["رقم", "حساب", "هاتف", "إنترنت"],
    ["حديد", "معدن", "صندوق", "خزنة"]
  ],
  "correctPathIndex": 0,
  "hint": "تلميح ذكي يوجه اللاعب للحل دون إعطائه الإجابة المباشرة",
  "rationale": [
    "تفسير قصير للعلاقة من البداية إلى الخطوة الأولى",
    "تفسير قصير للعلاقة من كل خطوة إلى الخطوة التالية"
  ]
}`;
  }

  return `You are an expert puzzle engineer for the "Wonder Link" game in English. Generate puzzles that are smart, coherent, and high quality.

⚠️ Safety and Content Guidelines (STRICT AND NON-NEGOTIABLE):
- Content must be completely safe and family-friendly.
- Strictly NO sexual, violent, scary content, or anything related to crime, murder, or harm.
- Avoid repeating previously generated puzzles.
- Avoid generic weak answers (for example: start, end, word, step, puzzle, link).

🎯 Current Puzzle Settings:
- Requested puzzle type: ${pTypeEn} (either "logical_chain" or "poetic_riddle")
- Difficulty level: ${difficulty} (Easy, Medium, Hard, Expert - higher levels require deep thinking and indirect linking)

1️⃣ Instructions for Type 1: "logical_chain"
- Link two seemingly unrelated words through a chain of ${min} to ${max} steps.
- Allowed linking rules only: (cause and effect), (part to whole), (tool and use), (natural process).
- Every transition in the chain must be defensible with a short explanation.
- No random jumps, no weak semantic links.

2️⃣ Instructions for Type 2: "poetic_riddle"
- Write a metaphorical riddle describing two different entities to find their common link.
- Use the format: "I am [description of first entity], and I am [description of second entity].. What is the link between us?"
- The link must be a single word or concept that unites them.
- The riddle must be solvable and logically grounded, not vague noise.

🎲 Option Rules (Applies to both types):
- Provide exactly 4 options for each question or step (1 correct answer + 3 strong, logical distractors).
- Step-level options should be short words/terms (not 4-word chains).
- In addition, generate 4 final path choices A/B/C/D where each choice contains exactly 4 words.
- All 4 options must be unique after normalization (no wording duplicates, no near-duplicate variants).
- Distractors should be same-domain and plausible, but clearly wrong on close inspection.
- Avoid reusing the same distractors across steps in the same puzzle unless absolutely necessary.
- ⚠️ VERY IMPORTANT: Randomize the order of the options. The correct answer MUST NOT always be the first option. Distribute the correct answer randomly among the four options (1st, 2nd, 3rd, or 4th).
- Hard requirement: for every step, options.length MUST be exactly 4, and correctAnswer MUST appear exactly once inside options.
- Extra hard requirement: each pathOption must be exactly 4 words, otherwise reject and regenerate.
- Ultra-strict rule: duplicate step questions within the same puzzle are forbidden.
- Ultra-strict rule: repeated normalized words across the core chain (startWord + steps.word + endWord) are forbidden.
- Ultra-strict rule: repeated words across all options in the whole puzzle are forbidden.
- If any step violates the previous rule, treat the draft as invalid and regenerate before returning the final JSON.

📤 Output (MUST be valid JSON only, without any additional text or explanations):
{
  "type": "${pTypeEn}",
  "difficulty": "${difficulty}",
  "riddleText": "Poetic riddle text here (leave empty if type is logical_chain)",
  "startWord": "Start word (leave empty if type is poetic_riddle)",
  "endWord": "End word (leave empty if type is poetic_riddle)",
  "steps": [
    {
      "stepQuestion": "Step question or 'What is the link?'",
      "correctAnswer": "protection",
      "correctIndex": 0,
      "options": [
        "protection",
        "guarding",
        "prevention",
        "shielding"
      ]
    }
  ],
  "pathOptions": [
    ["protection", "safety", "prevention", "guarding"],
    ["door", "key", "house", "room"],
    ["number", "account", "phone", "internet"],
    ["iron", "metal", "box", "vault"]
  ],
  "correctPathIndex": 0,
  "hint": "A smart hint guiding the player without explicitly giving the answer",
  "rationale": [
    "short explanation of Start -> Step1 relation",
    "short explanation of each subsequent link"
  ]
}`;
}

export function buildUserPrompt({
  language = 'en',
  level = 1,
  seed,
  puzzleType,
  excludeQuestionKeys = [],
} = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? '' : `\nSeed: ${seed}`;
  const forbiddenSignatures = Array.isArray(excludeQuestionKeys)
    ? excludeQuestionKeys.map((x) => String(x ?? '').trim()).filter(Boolean).slice(-60)
    : [];
  const forbiddenSignaturesAr = forbiddenSignatures.length
    ? `\nقائمة أسئلة محظورة (ممنوع تكرارها حرفياً بعد التطبيع type|start|end):\n- ${forbiddenSignatures.join('\n- ')}`
    : '';
  const forbiddenSignaturesEn = forbiddenSignatures.length
    ? `\nForbidden question signatures (exactly banned after normalization type|start|end):\n- ${forbiddenSignatures.join('\n- ')}`
    : '';

  if (isArabic) {
    return `أنشئ لغز جديد تماماً بناءً على التعليمات السابقة - مستوى ${level} (${difficulty}).
  تعليمات إدارية صارمة جداً (غير قابلة للتجاوز):
  - ممنوع منعاً باتاً إعادة أي سؤال سابق حتى لو اختلفت الصياغة السطحية.
  - عرّف السؤال حصراً بتوقيع: type|start|end بعد التطبيع.
  - إذا تطابق التوقيع مع أي عنصر محظور أو أي سؤال داخل نفس الإخراج: اعتبره فشلاً وأعد التوليد فوراً.
  - لا تُرجع أي JSON نهائي قبل اجتياز فحص عدم التكرار 100%.
الخيارات الخاطئة يجب أن تكون معقولة لكن خاطئة حتماً.
تأكد من خلط الإجابة الصحيحة عشوائياً بين الخيارات الأربعة.
تأكد من أن كل خطوة لها 4 خيارات فريدة بدون تكرار.
خيارات الخطوة تكون كلمات/مصطلحات قصيرة.
ويجب إنشاء pathOptions بعدد 4 خيارات (A/B/C/D)، وكل خيار في pathOptions يحتوي 4 كلمات بالضبط.
شرط إلزامي: الإجابة الصحيحة يجب أن تكون موجودة مرة واحدة فقط داخل الخيارات الأربعة في كل خطوة.
شرط إلزامي إضافي: إذا كان أي pathOption أقل أو أكثر من 4 كلمات، أعد التوليد.
إذا خالفت أي خطوة هذا الشرط، أعد التوليد قبل الإخراج.
ممنوع تكرار نص السؤال بين الخطوات.
ممنوع تكرار الكلمات بعد التطبيع داخل السلسلة الأساسية أو داخل خيارات اللغز بالكامل.
تأكد أن كل رابط بين الكلمات قابل للتبرير المنطقي بجملة قصيرة.
أخرج JSON فقط بلا تعليقات.${forbiddenSignaturesAr}${seedLine}`;
  }

  return `Create a fresh puzzle based on the previous instructions - level ${level} (${difficulty}).
Ultra-strict manager directives (non-negotiable):
- Repeating any prior question is absolutely forbidden, even with superficial rephrasing.
- Define question identity strictly as: type|start|end after normalization.
- If the signature matches any forbidden signature or any question in the same output, treat the draft as invalid and regenerate immediately.
- Do not return final JSON unless the non-repetition check passes at 100%.
Wrong options should be plausible but clearly incorrect.
Make sure to randomize the correct answer among the four options.
Ensure each step has exactly 4 unique options with no duplicates.
Step-level options should be short words/terms.
Additionally generate pathOptions with 4 choices (A/B/C/D), and each pathOption must contain exactly 4 words.
Mandatory rule: the correct answer must appear exactly once within the four options in every step.
Additional mandatory rule: if any pathOption has fewer or more than 4 words, regenerate.
If any step violates this rule, regenerate before returning output.
Do not repeat stepQuestion text across steps.
Do not repeat normalized words across the core chain or across all options in the same puzzle.
Ensure every link in the chain is logically defensible in one short sentence.
Return JSON only - no comments.${forbiddenSignaturesEn}${seedLine}`;
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
7. كل خيار يجب أن يكون 4 كلمات بالضبط بصيغة مترابطة منطقياً (ممنوع أقل أو أكثر)
8. ممنوع تكرار السؤال أو خياراته داخل نفس الجولة؛ إذا كان مشابهاً فأعد التوليد
9. إذا كان أي خيار لا يساوي 4 كلمات تماماً، ارفض السؤال وأعد التوليد حتى يحقق الشرط

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
7. Each option must be exactly 4 words in a logically connected phrase (not fewer, not more)
8. Do not repeat the question or options within the same round; regenerate if similar
9. If any option is not exactly 4 words, reject and regenerate until the rule is met

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
- ممنوع تكرار أي سؤال داخل نفس الجولة
- كل خيار يجب أن يكون 4 كلمات بالضبط بصيغة منطقية مترابطة
- إذا كان أي خيار لا يساوي 4 كلمات تماماً، ارفض السؤال وأعد التوليد

أخرج JSON فقط.${seedLine}`;
  }

  return `Generate a fresh ENGLISH quiz question for level ${level} (${difficulty}).

Requirements:
- ENGLISH ONLY
- No errors
- All 4 options distinct
- Exactly one correct
- No repetition within the same round
- Each option must be exactly 4 words in a logical linked phrase
- If any option is not exactly 4 words, reject and regenerate

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
1. كل خيار = 4 كلمات بالضبط مفصولة بـ " — " بصيغة مترابطة منطقياً
2. خيار واحد فقط صحيح
3. الخيارات الخاطئة معقولة
4. بنفس الطول وبنفس البنية (4 كلمات)
5. لا تكرر الكلمات
6. ممنوع تكرار السؤال أو الخيارات داخل نفس الجولة
7. ضع الإجابة الصحيحة في الفهرس ${correctIndex} (0 أو 1 أو 2 أو 3)

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
1. Each option must be exactly 4 words separated by " - " as a logical semantic chain
2. Exactly ONE correct
3. Wrong options plausible but flawed
4. Similar length and identical 4-word structure
5. No repeating key words
6. No repetition within the same round
7. Place the correct answer at index ${correctIndex} (spread across 0-3, never fixed)

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
5. كل خيار = 4 كلمات بالضبط مفصولة بـ " — " (مثال: حماية — أمان — منع — حراسة)

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
5. Each option = exactly 4 words separated by " - " (example: protection - safety - prevention - guarding)

Output JSON only - no comments or explanation`;
}
