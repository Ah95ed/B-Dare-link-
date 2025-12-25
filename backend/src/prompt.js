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
    // Keep prompts in English to avoid encoding issues, but require Arabic content.
    return `You generate puzzles for the game "Wonder Link" in ARABIC.

Puzzle goal: connect two semantically distant Arabic words via a chain of clear, logical intermediate steps.

Level: ${level}
Difficulty: ${difficulty}
Steps (steps.length): ${min}-${max}

Hard constraints:
- All words must be Arabic (Modern Standard Arabic), common and readable.
- startWord/endWord must be real concepts/objects, not UI/meta words.
- Do NOT use any of these words anywhere: "بداية", "نهاية", "كلمة", "خطوة", "لغز", "سؤال", "جواب", "إجابة", "رابط", "سلسلة", "مستوى", "مرحلة".
- Each step must relate to BOTH the previous and next step (meaning/cause/use/part-whole/shared domain).
- Avoid trivial links (pure synonym-only, single-letter changes, overly generic words like "شيء/حاجة/مفهوم").
- Avoid proper nouns and sensitive topics.

Examples of the desired logic (do NOT reuse the same words; make new ones):
- "بحر" -> "بخار" -> "غيوم" -> "مطر" -> "عشب" -> "خروف"
- "ثلج" -> "برد" -> "معطف" -> "شتاء" -> "مدفأة"

Options for each step:
- Exactly 3 options: [correct word + 2 plausible distractors].
- options MUST include step.word exactly.
- No duplicates; do not include startWord/endWord in options (unless it is the correct step.word; avoid that).
- Distractors should match the domain and part-of-speech (convincing, not random).

Hint:
- A general hint (Arabic) that helps without revealing any solution word.

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
    return `You are a quiz master generating fun trivia questions in ARABIC for a speed-based multiplayer game.

Generate ONE question with 4 multiple choice options.

Level: ${level}
Difficulty: ${difficulty}

Requirements:
- Question must be in Arabic (Modern Standard Arabic)
- Question should be interesting, engaging, and suitable for all ages
- Categories: general knowledge, science, geography, history, culture, logic puzzles, riddles
- Exactly 4 options, only ONE is correct
- Options should be plausible (not obviously wrong)
- correctIndex is 0-3 indicating which option is correct
- Include a short hint that helps without giving away the answer

Topics to cover (vary randomly):
- ألغاز ذكاء وتفكير
- معلومات عامة
- جغرافيا وعواصم
- تاريخ وحضارات
- علوم وطبيعة
- رياضيات وأرقام
- ثقافة عربية وإسلامية

Output ONLY valid JSON:
{
  "question": "نص السؤال بالعربية",
  "options": ["خيار1", "خيار2", "خيار3", "خيار4"],
  "correctIndex": 0,
  "hint": "تلميح مساعد",
  "category": "الفئة"
}`;
  }

  return `You are a quiz master generating fun trivia questions in ENGLISH for a speed-based multiplayer game.

Generate ONE question with 4 multiple choice options.

Level: ${level}
Difficulty: ${difficulty}

Requirements:
- Question should be interesting, engaging, and suitable for all ages
- Categories: general knowledge, science, geography, history, culture, logic puzzles, riddles
- Exactly 4 options, only ONE is correct
- Options should be plausible (not obviously wrong)
- correctIndex is 0-3 indicating which option is correct
- Include a short hint

Output ONLY valid JSON:
{
  "question": "Question text",
  "options": ["Option1", "Option2", "Option3", "Option4"],
  "correctIndex": 0,
  "hint": "Helpful hint",
  "category": "Category"
}`;
}

export function buildQuizUserPrompt({ language = 'ar', level = 1, seed } = {}) {
  const isArabic = language === 'ar';
  const difficulty = difficultyLabel(level);
  const seedLine = seed == null ? '' : `\nVariation seed: ${seed}`;

  if (isArabic) {
    return `Generate a fresh, unique ARABIC quiz question for level ${level} (${difficulty}).
Make it engaging and fun! Don't repeat common questions.
The question should challenge players but be fair.
Shuffle the correct answer position randomly.${seedLine}`;
  }

  return `Generate a fresh, unique ENGLISH quiz question for level ${level} (${difficulty}).
Make it engaging and fun! Don't repeat common questions.
The question should challenge players but be fair.
Shuffle the correct answer position randomly.${seedLine}`;
}
