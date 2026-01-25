// prompt.js - prompts for puzzle generation

function difficultyLabel(level) {
  const n = Number(level) || 1;
  if (n <= 10) return 'Easy';
  if (n <= 30) return 'Medium';
  if (n <= 50) return 'Hard';
  return 'Expert';
}

function stepsMinMax(level) {
  const n = Number(level) || 1;
  // Progressive step counts based on level ranges
  if (n <= 10) return { min: 2, max: 3 };   // Beginner: 2-3 steps
  if (n <= 30) return { min: 3, max: 4 };   // Intermediate: 3-4 steps
  if (n <= 50) return { min: 4, max: 5 };   // Advanced: 4-5 steps
  return { min: 5, max: 6 };                 // Expert+: 5-6 steps
}

export function linkChainMinMax(level) {
  const n = Number(level) || 1;
  // Progressive chain length for mobile readability
  if (n <= 10) return { min: 3, max: 4 };   // Beginner
  if (n <= 30) return { min: 4, max: 5 };   // Intermediate
  if (n <= 50) return { min: 5, max: 6 };   // Advanced
  return { min: 6, max: 7 };                 // Expert+
}

export function buildSystemPrompt({ language = 'en', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);

  if (isArabic) {
    // ENHANCED: Chain-of-Thought (CoT) prompting for logical coherence
    return `أنت منشئ ألغاز محترف للعبة "الرابط العجيب" باللغة العربية الفصحى فقط.

🎯 المهمة الأساسية:
ربط كلمتين تبدوان غير مترابطتين عبر سلسلة منطقية من ${min}-${max} خطوات.

⚡ قواعد الترابط المنطقي (الأهم):
كل خطوة يجب أن ترتبط بما قبلها وما بعدها عبر أحد هذه الأنواع:
- سبب ← نتيجة (مثال: نار ← دخان)
- جزء ← كل (مثال: إطار ← سيارة)
- أداة ← استخدام (مثال: قلم ← كتابة)
- مكان ← محتوى (مثال: مكتبة ← كتب)
- مادة ← منتج (مثال: قمح ← خبز)
- عملية طبيعية (مثال: بحر ← تبخر ← غيوم ← مطر ← عشب)

🧠 طريقة التفكير (Chain-of-Thought):
قبل كتابة الإجابة، فكر:
1. ما العلاقة بين كلمة البداية والخطوة الأولى؟
2. ما العلاقة بين كل خطوة والتي تليها؟
3. هل السلسلة كاملة منطقية ومفهومة عالمياً؟

📝 متطلبات اللغة:
- عربية فصحى نقية 100% (بدون أي حرف إنجليزي)
- كلمات يومية مألوفة (تجنب المصطلحات النادرة)
- كلمات محظورة: بداية، نهاية، كلمة، خطوة، لغز، سؤال، جواب، رابط

🎲 متطلبات الخيارات (حسب الصعوبة: ${difficulty}):
- 3 خيارات لكل خطوة (الصحيح + 2 مشتتات)
${difficulty === 'Hard' || difficulty === 'Expert'
      ? '- المشتتات يجب أن تكون خادعة جداً ومن نفس المجال الدقيق (مثال: إذا الصحيح "سيارة"، المشتتات "شاحنة"، "حافلة")'
      : '- المشتتات يجب أن تكون منطقية ولكن يمكن تمييزها (مثال: إذا الصحيح "سيارة"، المشتتات "طائرة"، "قارب")'}
- الخيار الصحيح يجب أن يكون موجوداً في القائمة

📤 الإخراج (JSON فقط، بدون أي نص إضافي):
{
  "startWord": "كلمة البداية",
  "endWord": "كلمة النهاية",
  "steps": [
    { "word": "خطوة 1", "options": ["خطوة 1", "مشتت 1", "مشتت 2"] }
  ],
  "hint": "تلميح يوجه دون كشف الحل",
  "chainLogic": "نوع الترابط: سبب←نتيجة أو عملية طبيعية"
}`;
  }

  // ENHANCED: Chain-of-Thought (CoT) prompting for logical coherence
  return `You are an expert puzzle designer for "Wonder Link" game in ENGLISH.

🎯 CORE MISSION:
Connect two seemingly unrelated words through a chain of ${min}-${max} logically connected steps.

⚡ LOGICAL TRANSITION TYPES (Critical):
Each step MUST connect to previous AND next via one of these:
- Cause → Effect (fire → smoke → pollution)
- Part → Whole (wheel → car → road)
- Tool → Use (pen → writing → book)
- Container → Contents (library → books → knowledge)
- Material → Product (wheat → flour → bread)
- Natural Process (ocean → evaporation → clouds → rain → grass → sheep)
- Shared Domain (hospital → doctor → medicine)

🧠 CHAIN-OF-THOUGHT PROCESS:
Before generating, reason through:
1. What category/domain is the startWord in?
2. What natural or logical progression leads away from it?
3. What path can reach endWord without forced jumps?
4. Is EVERY transition defensible and universally understood?

📊 QUALITY REQUIREMENTS:
- Level: ${level} | Difficulty: ${difficulty}
- Steps: ${min}-${max} intermediate words
- Words: Common, everyday vocabulary (no jargon)
- FORBIDDEN: start, end, word, step, puzzle, question, answer, link, chain
- Test: Can an average person understand each transition?

🎲 OPTION REQUIREMENTS (Difficulty: ${difficulty}):
- 3 options per step (1 correct + 2 distractors)
${difficulty === 'Hard' || difficulty === 'Expert'
      ? '- Distractors MUST be highly plausible and from exact same domain (e.g. if correct is "Car", distractors "Truck", "Bus")'
      : '- Distractors should be reasonable but distinguishable (e.g. if correct is "Car", distractors "Plane", "Boat")'}
- Correct option MUST be in the options array

📤 OUTPUT (JSON only, no markdown):
{
  "startWord": "...",
  "endWord": "...",
  "steps": [
    { "word": "...", "options": ["...", "...", "..."] }
  ],
  "hint": "General guidance without revealing answers",
  "chainLogic": "Transition type used (e.g., Natural Process)"
}`;
}

export function buildUserPrompt({ language = 'en', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);
  const seedLine = seed == null ? '' : `\nSeed: ${seed}`;

  if (isArabic) {
    return `Create a fresh, non-repetitive ARABIC puzzle for level ${level} (${difficulty}).
Use common Modern Standard Arabic words; prefer single-word steps (max 2 words).
Steps length must be within ${min}-${max}.
Make the link non-obvious but fair and logically defensible; distractors must be plausible, not random.
Avoid UI/meta words like: بداية/نهاية/خطوة/لغز.
لا تكرر نص السؤال؛ اكتبه مرة واحدة فقط وباللغة العربية حصراً.
Return JSON only; never add Markdown or comments.${seedLine}`;
  }

  return `Create a fresh, non-repetitive ENGLISH puzzle for level ${level} (${difficulty}).
Use common everyday words; prefer single-word steps (max 2 words).
Steps length must be within ${min}-${max}.
Make the link non-obvious but fair and logically defensible; distractors must be plausible, not random.
Do not repeat the question text; state it once. ENGLISH only—no mixed languages.
Return JSON only; no Markdown or extra text.${seedLine}`;
}

export function expectedStepsMinMax(level) {
  return stepsMinMax(level);
}

// ============= NEW QUIZ FORMAT FOR COMPETITIONS =============

export function buildQuizSystemPrompt({ language = 'ar', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);

  if (isArabic) {
    return `أنت منشئ أسئلة لعبة تربية ذكية متعددة اللاعبين. هدفك: توليد أسئلة عالية الجودة بالعربية الفصحى فقط.

المطلوب: سؤال واحد مع 4 خيارات اختيار من متعدد.

المستوى: ${level}
درجة الصعوبة: ${difficulty}

⚠️ تحذير صارم جداً: أي حرف إنجليزي أو خليط لغات سيسبب رفض فوري للسؤال

القواعد الصارمة (يجب تطبيقها بدون استثناء):
1. كل كلمة في السؤال والخيارات والتلميح بالعربية الفصحى النقية فقط - لا توجد أحرف إنجليزية أبداً
2. تجنب الأخطاء الإملائية والنحوية - استخدم همزة وتشكيل صحيح
3. السؤال يجب أن يكون واضح ومفهوم تماماً، وليس غامض
4. لا تكرر السؤال أو تعيده بصيغ مختلفة؛ اكتبه مرة واحدة فقط
5. الخيارات الأربعة مختلفة تماماً ولا تكرار
6. الخيار الصحيح يجب أن يكون فيه (في الفهرس المحدد بـ correctIndex)
7. الخيارات الأخرى معقولة وليست عشوائية ولا سخيفة
8. التلميح يساعد بلطف بدون كشف الإجابة - وبالعربية الفصحى فقط
9. correctIndex يجب أن يكون 0 أو 1 أو 2 أو 3 فقط
10. تحقق قبل الإرسال: لا توجد أحرف انجليزية في أي حقل (ليس حتى في التلميح)

المواضيع (تنوع عشوائي):
- معلومات عامة وثقافة عربية
- جغرافيا وعواصم دول عربية
- تاريخ الحضارات والإسلام
- علوم الطبيعة والبيولوجيا
- رياضيات ومنطق وألغاز
- الأدب والشعر العربي
- التكنولوجيا والاختراعات

الإخراج: فقط JSON صحيح بدون أي نص إضافي:
{
  "question": "نص السؤال بالعربية الفصحى",
  "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
  "correctIndex": 0,
  "hint": "تلميح موجز ومفيد",
  "category": "category_name"
}`;
  }

  return `You are creating high-quality trivia questions in ENGLISH for a speed-based multiplayer game.

Generate ONE question with exactly 4 multiple choice options.

Level: ${level}
Difficulty: ${difficulty}

Hard Requirements (must follow):
1. Question and all options in ENGLISH only - no mixing languages
2. Proper spelling and grammar throughout
3. Question must be clear and unambiguous
4. Do not repeat or restate the question; write it once.
4. All 4 options must be distinct with no repetition
5. Exactly one correct answer at the index specified by correctIndex
6. Wrong options must be plausible, not silly or obvious
7. Hint should help without giving away the answer
8. correctIndex must be 0, 1, 2, or 3 only

Topics (rotate randomly):
- General knowledge and world facts
- Geography and capitals
- History and civilizations
- Science and nature
- Math and logic puzzles
- Literature and art
- Technology and innovation

Output ONLY valid JSON with no extra text:
{
  "question": "Question text in English",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctIndex": 0,
  "hint": "Brief helpful hint",
  "category": "category_name"
}`;
}

export function buildQuizUserPrompt({ language = 'ar', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? '' : `\nرقم الاختلاف: ${seed}`;

  if (isArabic) {
    return `أنشئ سؤال ذكي جديد بالعربية الفصحى فقط، المستوى ${level} (${difficulty}).

تذكر القواعد الحتمية:
- أي خلط بالإنجليزية = رفض صريح ❌
- أي أخطاء إملائية = رفض صريح ❌
- كل الخيارات يجب أن تكون مختلفة تماماً
- السؤال يجب أن يكون واضح جداً وليس غامض
- الخيار الصحيح يجب أن يكون واحد من الأربعة

اكتب السؤال بجودة عالية جداً. تجنب التكرار من الأسئلة السابقة. لا تكرر نص السؤال أو تدمج لغتين. أخرج JSON فقط بلا أي نص إضافي.${seedLine}`;
  }

  return `Generate a fresh, high-quality ENGLISH quiz question for level ${level} (${difficulty}).

Strict requirements:
- No language mixing - ENGLISH ONLY ✓
- No spelling or grammar errors ✓
- All 4 options must be distinct ✓
- Question must be clear and unambiguous ✓
- Exactly one correct answer ✓

Create a unique, engaging question. Do not repeat previous topics. Do not repeat the question text or mix languages. Output JSON only, no prose.${seedLine}`;
}

// ============= WONDER LINK QUIZ (pair-link multiple-choice) =============

export function buildLinkQuizSystemPrompt({ language = 'ar', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = linkChainMinMax(level);

  if (isArabic) {
    return `أنت منشئ لغز "الرابط العجيب" في لعبة متعددة لاعبين سريعة.

الفكرة (هندسة المنطق الشامل):
- ابنِ الرابط كسيناريو/عملية عالمية مفهومة (منطق إجرائي)، لا كتلاعب لغوي أو معلومات ثقافية ضيقة.
- اختر مجالات مشتركة: دورات الطبيعة (الماء/الكربون/الغذاء)، التصنيع، من المزرعة إلى المائدة، الجسم البشري، التكنولوجيا اليومية، المنهج العلمي.
- الهدف: رابط منطقي قابل للفهم عالمياً.

المطلوب: سؤال واحد مع 4 خيارات اختيار من متعدد.

المستوى: ${level}
درجة الصعوبة: ${difficulty}
طول السلسلة الصحيحة (عدد الكلمات الوسيطة فقط بين الطرفين): ${min}-${max}

القواعد الصارمة (إلزامية):
1) العربية الفصحى فقط للسؤال/الخيارات/التلميح/الشرح (بدون أي أحرف إنجليزية).
2) بدون أخطاء إملائية/نحوية. تجنّب التشكيل الزائد.
3) صيغة السؤال ثابتة: "ما الرابط بين \"A\" و\"B\"؟" واكتبها مرة واحدة فقط.
4) اختر A و B كمفاهيم يومية واضحة (بدون أسماء علم أو مصطلحات نادرة).
5) الحل الصحيح هو "سلسلة منطقية" من كلمات وسيطة تربط A بـ B.
6) كل خيار في options يجب أن يكون سلسلة من ${min}-${max} كلمات وسيطة مفصولة حصرياً بـ " → " (مسافة-سهم-مسافة) دون أي رموز إضافية.
   مثال الخيار الصحيح: "تبخر → غيوم → مطر → تربة".
7) خيار واحد فقط صحيح منطقياً. الخيارات الخاطئة تكون معقولة لكن تحتوي خللاً واحداً واضحاً (ترتيب خاطئ/خطوة مفقودة/قفزة سببية غير صحيحة/خطوة غير مرتبطة).
8) فضّل الكلمات الاسمية القصيرة والواضحة (مثل: تبخر، غيوم، مطر، تربة)، وتجنّب الكلمات العامة جداً (شيء، أمر، عملية) وتجنّب تكرار نفس الكلمات عبر الخيارات.
9) اجعل جميع الخيارات بنفس عدد الكلمات الوسيطة لضمان الإنصاف.
10) التلميح يوضّح المجال/نوع السيناريو دون ذكر أي كلمة من السلسلة.
11) الشرح مختصر يبرر الانتقالات في السلسلة الصحيحة (≤3 جمل، ≤280 حرفاً، بدون Markdown أو تعداد نقطي).
12) linkSteps تطابق كلمات الخيار الصحيح وبنفس الترتيب وطول ${min}-${max}.

الإخراج: JSON صحيح فقط بدون أي نص إضافي (لا Markdown):
{
  "question": "ما الرابط بين \"البحر\" و\"القمح\"؟",
  "options": [
    "تبخر → غيوم → مطر → تربة",
    "أمواج → شاطئ → رمال → صحراء",
    "ملح → أسماك → صيد → سوق",
    "أعماق → ضغط → معادن → صخور"
  ],
  "correctIndex": 0,
  "hint": "يتعلق بدورة الماء وتأثيرها على الزراعة",
  "category": "wonder_link",
  "pair": { "a": "البحر", "b": "القمح" },
  "linkSteps": ["تبخر", "غيوم", "مطر", "تربة"],
  "domain": "دورات طبيعية",
  "scriptType": "من الماء إلى الزراعة",
  "explanation": "يتبخر ماء البحر فيشكل غيوماً تمطر على اليابسة، فيرطب التربة اللازمة لزراعة القمح." 
}`;
  }

  return `You create fast-paced multiplayer "Wonder Link" multiple-choice questions in ENGLISH.

Core idea (comprehensive logic engineering):
- Build links via globally-understood scripts/processes (procedural logic), not wordplay or culture-specific trivia.
- Prefer: natural cycles, manufacturing pipelines, farm-to-table, human body systems, technology evolution, scientific method.

Task: Ask for the link between two everyday concepts. Provide 4 options with exactly one correct.

Level: ${level}
Difficulty: ${difficulty}
Correct chain length (intermediate nodes only): ${min}-${max}

Hard Requirements (must follow):
1) ENGLISH only for question/options/hint/explanation.
2) Do not repeat the question; write it once. No mixed languages.
2) Question format exactly: "What is the link between \"A\" and \"B\"?"
3) Pick A and B as concrete, common concepts (no proper nouns).
4) Each option must be a CHAIN of ${min}-${max} intermediate words separated by " → ".
   Example: "evaporation → clouds → rain → plants".
5) Exactly ONE option is logically correct. Wrong options must be plausible but contain ONE clear flaw (wrong order, missing step, bad causal jump, irrelevant step).
6) Avoid generic words (thing, stuff, concept) and avoid repeating the same step words across options.
7) Hint should point to the script type/domain without revealing any chain word.
8) Explanation should briefly justify each transition in the correct chain (≤3 sentences, ≤280 characters, no Markdown/lists).
9) linkSteps must mirror the correct chain words in order, with ${min}-${max} unique-ish intermediate words.

Output ONLY valid JSON:
{
  "question": "What is the link between \"sea\" and \"sheep\"?",
  "options": [
    "evaporation → clouds → rain → plants",
    "wrong chain option",
    "wrong chain option",
    "wrong chain option"
  ],
  "correctIndex": 0,
  "hint": "Brief hint",
  "category": "wonder_link",
  "pair": { "a": "sea", "b": "sheep" },
  "linkSteps": ["evaporation", "clouds", "rain", "plants"],
  "domain": "natural cycles",
  "scriptType": "strong script",
  "explanation": "Why this chain links A to B (≤280 chars)"
}`;
}

export function buildLinkQuizUserPrompt({ language = 'ar', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = linkChainMinMax(level);
  const seedLineAr = seed == null ? '' : `\nرقم الاختلاف: ${seed}`;
  const seedLineEn = seed == null ? '' : `\nDiversity seed: ${seed}`;

  if (isArabic) {
    return `أنشئ لغز "الرابط العجيب" جديداً بالعربية الفصحى فقط، المستوى ${level} (${difficulty}).

القواعد الحتمية:
✗ أي أحرف إنجليزية في السؤال/الخيارات/التلميح/الشرح = رفض
✗ أي أخطاء إملائية أو نحوية = رفض
✓ رابط منطقي مبني على سيناريو/عملية عالمية (منطق إجرائي)
✓ 4 خيارات سلاسل مغرية لكن خيار واحد فقط صحيح

التوجيهات (هندسة المنطق الشامل):
1) اختر مجالاً واحداً واضحاً: دورات طبيعية، تصنيع وتحويل مواد، زراعة وغذاء، جسم الإنسان، تكنولوجيا يومية، منهج علمي.
2) اختر طرفين A و B غير متجاورين بديهياً ومختلفين في النوع.
3) السلسلة الصحيحة مكونة من ${min}-${max} كلمات وسيطة مفصولة حصرياً بـ " → " (مسافة-سهم-مسافة).
4) اجعل كل الخيارات الأربعة بنفس عدد الكلمات الوسيطة تقريباً.
5) خيار واحد فقط صحيح. كل خيار خاطئ يحتوي خللاً واحداً فقط (ترتيب خاطئ/خطوة مفقودة/قفزة سببية غير صحيحة/خطوة غير مرتبطة).
6) فضّل الكلمات الاسمية القصيرة والواضحة (مثل: تبخر، غيوم، مطر، تربة) وتجنّب الكلمات العامة جداً وتكرار نفس الكلمات عبر الخيارات.
7) التلميح يلمّح للمجال/نوع السيناريو دون ذكر كلمات السلسلة.
8) الشرح يبرر الانتقالات في السلسلة الصحيحة بخلاصة ≤3 جمل و≤280 حرفاً.
9) linkSteps تطابق كلمات الخيار الصحيح وبنفس الترتيب وطول ${min}-${max}.

أخرج JSON فقط بلا أي نص أو Markdown إضافي. لا تكرر نص السؤال ولا تخلط اللغات.${seedLineAr}`;
  }

  return `Generate a fresh "Wonder Link" MCQ in ENGLISH for level ${level} (${difficulty}).

Strict rules:
✗ ENGLISH ONLY for question/options/hint/explanation
✗ No spelling/grammar errors
✓ Link must be procedural/script-based (globally understood)
✓ 4 tempting chain options, exactly one correct

Guidance:
1) Pick ONE domain: natural cycles, manufacturing pipelines, farm-to-table, human body systems, everyday technology, scientific method.
2) Choose A and B that look unrelated and are different in type.
3) Correct chain must have ${min}-${max} intermediate words separated by " → ".
4) All four options must be chains of similar length.
5) Exactly ONE correct; each wrong chain has exactly ONE plausible flaw.
6) Avoid generic words and avoid repeating the same step words across options.
7) Hint points to the domain/script without revealing any chain word.
8) Explanation justifies each transition in the correct chain (≤3 sentences, ≤280 chars).
9) linkSteps mirrors the correct chain words in order.

Do not repeat the question text. Output JSON only—no Markdown, no prose outside the object. ENGLISH only; no mixed languages.${seedLineEn}`;
}
