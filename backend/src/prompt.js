// prompt.js - prompts for puzzle generation

function difficultyLabel(level) {
  const n = Number(level) || 1;
  return n <= 3 ? 'Easy' : n <= 6 ? 'Medium' : 'Hard';
}

function stepsMinMax(level) {
  const n = Number(level) || 1;
  // User-facing design: 2-5 steps total, increasing with level.
  if (n <= 3) return { min: 2, max: 3 };
  if (n <= 6) return { min: 3, max: 4 };
  return { min: 4, max: 5 };
}

export function buildSystemPrompt({ language = 'en', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const { min, max } = stepsMinMax(level);

  if (isArabic) {
    // CRITICAL: Enforce PURE ARABIC ONLY - NO MIXING WHATSOEVER
    return `You generate puzzles for the game "Wonder Link" in PURE ARABIC ONLY.

⚠️ CRITICAL REQUIREMENTS (MUST OBEY):

1️⃣ ARABIC PURITY - NO EXCEPTIONS:
   - EVERY single word MUST be 100% Arabic Modern Standard Arabic (MSA)
   - ZERO English letters, abbreviations, or Romanized words
   - NO mixing Arabic with Latin letters (a, b, c, d, etc.)
   - NO transliteration (e.g., "2" for ع)
   - If you cannot write it in Arabic, DO NOT include it
   - All options, all steps, all hints: PURE ARABIC

2️⃣ CHARACTER VALIDATION:
   - Use only valid Arabic Unicode (U+0600 to U+06FF)
   - NO corrupted characters
   - NO garbled text
   - NO weird symbols or encoding errors
   - Test: Each character should be readable Arabic

3️⃣ PUZZLE REQUIREMENTS:
   - Puzzle goal: Connect two Arabic words via ${min}-${max} logical steps
   - Difficulty: ${difficulty} (level ${level})
   - All words must be common, everyday, readable Arabic
   - startWord/endWord: Real objects/concepts, NOT meta words
   - FORBIDDEN words: بداية, نهاية, كلمة, خطوة, لغز, سؤال, جواب, إجابة, رابط
   - Each step relates to BOTH previous and next (meaning/cause/use/part-whole)
   - Avoid generic words: شيء, حاجة, مفهوم, فكرة

4️⃣ OPTIONS FORMAT:
   - Exactly 3 options per step [correct + 2 distractors]
   - options MUST contain step.word exactly
   - No duplicates within a step
   - Distractors must be plausible Arabic words in same domain
   - All three options MUST be pure Arabic

5️⃣ HINT REQUIREMENT:
   - One general Arabic hint
   - Helps without revealing solution
   - Pure Arabic only

OUTPUT STRICTLY:
Return ONLY valid JSON (no Markdown, no extra text):
{
  "startWord": "كلمة عربية",
  "endWord": "كلمة عربية أخرى",
  "steps": [
    { "word": "كلمة عربية", "options": ["خيار عربي", "خيار عربي", "خيار عربي"] }
  ],
  "hint": "تلميح باللغة العربية النقية"
}`;
  }

  return `You generate puzzles for the game "Wonder Link" in ENGLISH.

Puzzle goal: connect two semantically distant words via a chain of clear, logical intermediate steps.

Level: ${level}
Difficulty: ${difficulty}
Steps (steps.length): ${min}-${max}

Hard constraints:
- startWord/endWord must be real concepts/objects, not UI/meta words (e.g., "start", "end", "word", "step", "puzzle", "question", "answer").
- Each step must relate to BOTH the previous and next step (meaning/cause/use/part-whole/shared domain).
- Avoid trivial links (pure synonym-only, single-letter changes, overly generic words like "thing/concept").
- Avoid proper nouns and sensitive topics.

Options for each step:
- Exactly 3 options: [correct word + 2 plausible distractors].
- options MUST include step.word exactly.
- No duplicates; do not include startWord/endWord in options (unless it is the correct step.word; avoid that).
- Distractors should match the domain and part-of-speech (convincing, not random).

Hint:
- A general hint that helps without revealing any solution word.

Output:
- Return ONLY valid JSON (no Markdown, no extra text).
- Do not add extra keys beyond:
{
  "startWord": "...",
  "endWord": "...",
  "steps": [
    { "word": "...", "options": ["...", "...", "..."] }
  ],
  "hint": "..."
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
Avoid UI/meta words like: بداية/نهاية/خطوة/لغز.${seedLine}`;
  }

  return `Create a fresh, non-repetitive ENGLISH puzzle for level ${level} (${difficulty}).
Use common everyday words; prefer single-word steps (max 2 words).
Steps length must be within ${min}-${max}.
Make the link non-obvious but fair and logically defensible; distractors must be plausible, not random.${seedLine}`;
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

القواعد الصارمة (يجب تطبيقها بدون استثناء):
1. السؤال والخيارات بالعربية الفصحى النقية فقط - بدون خلط بأحرف إنجليزية أبداً
2. تجنب الأخطاء الإملائية والنحوية - استخدم همزة وتشكيل صحيح
3. السؤال يجب أن يكون واضح ومفهوم تماماً، وليس غامض
4. الخيارات الأربعة مختلفة تماماً ولا تكرار
5. الخيار الصحيح يجب أن يكون فيه (في الفهرس المحدد بـ correctIndex)
6. الخيارات الأخرى معقولة وليست عشوائية ولا سخيفة
7. التلميح يساعد بلطف بدون كشف الإجابة
8. correctIndex يجب أن يكون 0 أو 1 أو 2 أو 3 فقط

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

تذكر القواعس الحتمية:
- أي خلط بالإنجليزية = رفض صريح ❌
- أي أخطاء إملائية = رفض صريح ❌
- كل الخيارات يجب أن تكون مختلفة تماماً
- السؤال يجب أن يكون واضح جداً وليس غامض
- الخيار الصحيح يجب أن يكون واحد من الأربعة

اكتب السؤال بجودة عالية جداً. تجنب التكرار من الأسئلة السابقة.${seedLine}`;
  }

  return `Generate a fresh, high-quality ENGLISH quiz question for level ${level} (${difficulty}).

Strict requirements:
- No language mixing - ENGLISH ONLY ✓
- No spelling or grammar errors ✓
- All 4 options must be distinct ✓
- Question must be clear and unambiguous ✓
- Exactly one correct answer ✓

Create a unique, engaging question. Do not repeat previous topics.${seedLine}`;
}

// ============= WONDER LINK QUIZ (pair-link multiple-choice) =============

export function buildLinkQuizSystemPrompt({ language = 'ar', level = 1 } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);

  if (isArabic) {
    return `أنت منشئ لغز "الرابط العجيب" في لعبة متعددة لاعبين سريعة. الهدف: اكتشاف الرابط المخفي بين عنصرين عربيين.

المطلوب: سؤال واحد مع 4 خيارات اختيار من متعدد.

المستوى: ${level}
درجة الصعوبة: ${difficulty}

القواعد الصارمة (إلزامية):
1. السؤال والخيارات بالعربية الفصحى النقية - بدون إنجليزية أبداً
2. بدون أخطاء إملائية أو نحوية
3. صيغة السؤال: "ما الرابط بين \"العنصر الأول\" و\"العنصر الثاني\"؟"
4. اختر عنصرين عربيين يوميين واضحين (ليسا أسماء علم)
5. الرابط يجب أن يكون منطقياً وليس عشوائياً
6. الخيارات الأربعة واضحة ومختلفة تماماً
7. الخيار الصحيح يجب أن يكون في المكان المحدد بـ correctIndex
8. التلميح يساعد بدون كشف الإجابة
9. التفسير يشرح لماذا هذا هو الرابط الصحيح

الإخراج: JSON صحيح فقط بدون نص إضافي:
{
  "question": "ما الرابط بين \"باب خشبي\" و\"شجرة\"؟",
  "options": ["الخيار الأول", "الخيار الثاني", "الخيار الثالث", "الخيار الرابع"],
  "correctIndex": 0,
  "hint": "تلميح موجز",
  "category": "wonder_link",
  "pair": { "a": "باب خشبي", "b": "شجرة" },
  "explanation": "شرح الرابط المنطقي"
}`;
  }

  return `You create fast-paced multiplayer "Wonder Link" multiple-choice questions in ENGLISH.

Task: Ask for the link between two everyday items. Provide 4 options with exactly one correct.

Level: ${level}
Difficulty: ${difficulty}

Hard Requirements (must follow):
1. Question and all options in ENGLISH only - no other languages
2. Proper spelling and grammar throughout
3. Question format: "What is the link between \"Item A\" and \"Item B\"?"
4. Pick two concrete, everyday concepts (no proper nouns)
5. The link must be logical and interesting
6. All 4 options must be distinct and plausible
7. Exactly one correct answer at the specified correctIndex
8. Hint should help without revealing the answer
9. Explanation clarifies why the link is valid

Output ONLY valid JSON:
{
  "question": "What is the link between \"wooden door\" and \"tree\"?",
  "options": ["Option1", "Option2", "Option3", "Option4"],
  "correctIndex": 0,
  "hint": "Brief hint",
  "category": "wonder_link",
  "pair": { "a": "wooden door", "b": "tree" },
  "explanation": "Why this link is correct"
}`;
}

export function buildLinkQuizUserPrompt({ language = 'ar', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? '' : `\nرقم الاختلاف: ${seed}`;

  if (isArabic) {
    return `أنشئ لغز رابط عجيب جديد بالعربية الفصحى فقط، المستوى ${level} (${difficulty}).

القواعد الحتمية:
✗ أي إنجليزية = رفض
✗ أي أخطاء = رفض
✓ عربي فصيح نقي
✓ رابط منطقي وذكي
✓ خيارات واضحة ومختلفة

ولّد لغز جديد، تجنب التكرار.${seedLine}`;
  }

  return `Generate a fresh "Wonder Link" MCQ in ENGLISH for level ${level} (${difficulty}).

Strict rules:
✗ NO other languages - ENGLISH ONLY
✗ NO spelling errors
✓ Logical, interesting link
✓ 4 distinct, plausible options
✓ One correct answer

Create a unique puzzle, avoid repetition.${seedLine}`;
}
