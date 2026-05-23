// solo_bank_ai.js — توليد ألغاز سلسلة السولو (logical_chain) عبر Gemini / Workers AI / OpenAI / Groq
import { linkChainMinMax } from './prompt.js';
import { normalizeChainPuzzleForClient } from './puzzle_normalize.js';
import { difficultyBandForLevel } from './puzzle_db.js';

const WEAK_META_WORDS_AR = new Set([
  'كلمة',
  'كلمات',
  'خطوة',
  'خطوات',
  'ربط',
  'رابط',
  'علاقة',
  'شيء',
  'اشياء',
  'عام',
  'بداية',
  'نهاية',
  'حل',
]);

const WEAK_META_WORDS_EN = new Set([
  'word',
  'words',
  'step',
  'steps',
  'link',
  'relation',
  'thing',
  'generic',
  'start',
  'end',
  'answer',
]);

const ABSTRACT_UNCLEAR_WORDS_AR = new Set([
  'نغم',
  'لحن',
  'همس',
  'صدى',
  'حلم',
  'سر',
  'قدر',
  'روح',
  'خيال',
  'وهم',
  'نغمه',
  'لحنه',
  'احساس',
  'مشاعر',
  'ذكري',
  'ذكرى',
  'الهام',
]);

const ABSTRACT_UNCLEAR_WORDS_EN = new Set([
  'melody',
  'whisper',
  'echo',
  'dream',
  'secret',
  'fate',
  'spirit',
  'fantasy',
  'illusion',
  'feeling',
  'emotion',
  'memory',
  'inspiration',
]);

function normalizeQualityWord(word, language) {
  let w = String(word ?? '').trim().toLowerCase();
  if (language === 'ar') {
    // Normalize Arabic variants to reduce false negatives in checks.
    w = w
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/[إأآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه');
  }
  return w.replace(/\s+/g, ' ');
}

function extractJsonObjectSubstring(text) {
  const s = String(text ?? '');
  const objStart = s.indexOf('{');
  const objEnd = s.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    return s.slice(objStart, objEnd + 1);
  }
  return s.trim();
}

/**
 * يحاول إصلاح JSON الشائع الاعتلال من نماذج اللغة (أحرف تحكم غير مهربة داخل النصوص).
 */
function safeParseJsonFromModelOutput(rawText) {
  const cleaned0 = String(rawText ?? '')
    .replace(/^\uFEFF/, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const candidate0 = extractJsonObjectSubstring(cleaned0);

  const strategies = [
    (s) => s,
    (s) => s.replace(/\u2028|\u2029/g, ' '),
    (s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' '),
    (s) =>
      s
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim(),
  ];

  let lastErr = null;
  for (const prep of strategies) {
    for (const base of [candidate0, cleaned0]) {
      const s = prep(base);
      if (!s) continue;
      try {
        return JSON.parse(s);
      } catch (e) {
        lastErr = e;
      }
    }
  }
  throw lastErr ?? new Error('invalid_json');
}

function stripLatin(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/[a-zA-Z]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripLatinFromChainPuzzle(p) {
  if (!p || typeof p !== 'object') return p;
  const out = { ...p };
  for (const f of ['startWord', 'endWord', 'hint', 'riddleText']) {
    if (typeof out[f] === 'string') out[f] = stripLatin(out[f]);
  }
  if (Array.isArray(out.steps)) {
    out.steps = out.steps.map((s) => {
      if (!s || typeof s !== 'object') return s;
      const step = { ...s };
      if (typeof step.word === 'string') step.word = stripLatin(step.word);
      if (typeof step.correctAnswer === 'string') {
        step.correctAnswer = stripLatin(step.correctAnswer);
      }
      if (typeof step.answer === 'string') step.answer = stripLatin(step.answer);
      if (Array.isArray(step.options)) {
        step.options = step.options
          .map((o) => stripLatin(String(o ?? '')))
          .filter(Boolean);
      }
      return step;
    });
  }
  return out;
}

function validateSoloChainSteps(puzzle) {
  const steps = puzzle?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return 'no_steps';
  for (let i = 0; i < steps.length; i++) {
    const st = steps[i];
    if (!st || typeof st !== 'object') return `bad_step_${i}`;
    const w = String(st.word ?? st.correctAnswer ?? st.answer ?? '').trim();
    const opts = Array.isArray(st.options) ? st.options.map((o) => String(o).trim()) : [];
    if (opts.length !== 4) return `step_${i}_need_4_options`;
    if (!w || !opts.includes(w)) return `step_${i}_word_not_in_options`;
    const normalizedOptions = opts.map((o) => o.toLowerCase());
    if (new Set(normalizedOptions).size !== 4) return `step_${i}_duplicate_options`;
    const exactCorrectCount = opts.filter((o) => o === w).length;
    if (exactCorrectCount !== 1) return `step_${i}_word_must_appear_once`;
  }
  return null;
}

function isWeakMetaWord(word, language) {
  const w = String(word ?? '').trim().toLowerCase();
  if (!w) return true;
  return language === 'ar' ? WEAK_META_WORDS_AR.has(w) : WEAK_META_WORDS_EN.has(w);
}

function validateLogicalChainQuality(puzzle, language) {
  const lang = language === 'en' ? 'en' : 'ar';
  const start = String(puzzle?.startWord ?? '').trim();
  const end = String(puzzle?.endWord ?? '').trim();
  if (!start || !end || start === end) return 'bad_start_end';
  if (isWeakMetaWord(start, lang) || isWeakMetaWord(end, lang)) return 'weak_start_or_end';

  const steps = Array.isArray(puzzle?.steps) ? puzzle.steps : [];
  if (!steps.length) return 'no_steps';
  if (steps.length < 3) return 'chain_too_short_for_reasoning';

  const chainWords = [start, ...steps.map((s) => String(s?.word ?? '').trim()), end]
    .map((x) => x.toLowerCase())
    .filter(Boolean);
  if (chainWords.length < 3) return 'short_chain';
  if (new Set(chainWords).size !== chainWords.length) return 'duplicate_chain_words';
  for (const w of chainWords) {
    if (isWeakMetaWord(w, lang)) return 'weak_chain_word';
    const n = normalizeQualityWord(w, lang);
    if (lang === 'ar' ? ABSTRACT_UNCLEAR_WORDS_AR.has(n) : ABSTRACT_UNCLEAR_WORDS_EN.has(n)) {
      return 'abstract_or_unclear_chain_word';
    }
    if (n.length < 2 || n.length > 28) return 'bad_chain_word_length';
  }

  const optionSeenAcrossSteps = new Map();
  const normalizedChainWords = new Set(chainWords.map((w) => normalizeQualityWord(w, lang)));
  for (let i = 0; i < steps.length; i++) {
    const q = String(steps[i]?.stepQuestion ?? '').trim();
    if (!q || q.length < 12) return `weak_step_question_${i}`;
    const prev = i === 0 ? start : String(steps[i - 1]?.word ?? '').trim();
    const next = i === steps.length - 1 ? end : String(steps[i + 1]?.word ?? '').trim();
    if (!q.includes(prev) || !q.includes(next)) return `step_question_must_reference_neighbors_${i}`;
    const opts = Array.isArray(steps[i]?.options)
      ? steps[i].options.map((o) => String(o ?? '').trim()).filter(Boolean)
      : [];
    if (opts.length !== 4) return `bad_options_count_${i}`;
    const correct = String(steps[i]?.word ?? '').trim();
    if (!correct) return `missing_correct_word_${i}`;
    const normCorrect = normalizeQualityWord(correct, lang);
    const normSet = new Set(opts.map((o) => normalizeQualityWord(o, lang)));
    if (normSet.size !== 4) return `duplicate_options_inside_step_${i}`;
    let wrongCount = 0;
    for (const o of opts) {
      const n = normalizeQualityWord(o, lang);
      if (isWeakMetaWord(n, lang)) return `weak_option_word_${i}`;
      if (lang === 'ar' ? ABSTRACT_UNCLEAR_WORDS_AR.has(n) : ABSTRACT_UNCLEAR_WORDS_EN.has(n)) {
        return `abstract_or_unclear_option_${i}`;
      }
      if (n.length < 2 || n.length > 28) return `bad_option_length_${i}`;
      if (n !== normCorrect && normalizedChainWords.has(n)) {
        return `option_reuses_chain_word_${i}`;
      }
      if (n !== normCorrect) wrongCount += 1;
      // Keep option granularity near the correct word, but with language-aware tolerance.
      const lenRatio = n.length / Math.max(1, normCorrect.length);
      const minRatio = lang === 'ar' ? 0.3 : 0.4;
      const maxRatio = lang === 'ar' ? 3.2 : 2.6;
      if (lenRatio < minRatio || lenRatio > maxRatio) return `option_length_outlier_${i}`;
      const prevStep = optionSeenAcrossSteps.get(n);
      if (prevStep != null && prevStep !== i) {
        return `repeated_option_across_steps_${i}`;
      }
      optionSeenAcrossSteps.set(n, i);
    }
    if (wrongCount !== 3) return `bad_wrong_options_count_${i}`;
  }

  if (Array.isArray(puzzle?.rationale) && puzzle.rationale.length > 0) {
    if (puzzle.rationale.length < steps.length) return 'short_rationale';
    for (let i = 0; i < steps.length; i++) {
      const line = String(puzzle.rationale[i] ?? '').trim();
      if (!line || line.length < 14) return `weak_rationale_${i}`;
    }
  }
  return null;
}

function looksLikeSoloChainObject(obj) {
  if (!obj || typeof obj !== 'object') return false;
  const ty = String(obj.type || 'logical_chain').toLowerCase();
  if (ty === 'quiz' || ty === 'spot_diff' || ty === 'spotdiff') return false;
  if (!Array.isArray(obj.steps) || obj.steps.length === 0) return false;
  const s = String(obj.startWord ?? obj.start ?? obj.from ?? '').trim();
  const e = String(obj.endWord ?? obj.end ?? obj.to ?? '').trim();
  return s.length > 0 && e.length > 0 && s !== e;
}

const DOMAINS_AR = [
  'الطبيعة والظواهر الجوية',
  'الزراعة والغذاء',
  'العلوم والفيزياء',
  'الأحياء وجسم الإنسان',
  'الفضاء والفلك',
  'التكنولوجيا والاتصالات',
  'الصناعة والمواد',
  'الرياضة والصحة',
  'الفنون والموسيقى',
  'التاريخ والحضارات',
  'الجغرافيا والبيئة',
  'الاقتصاد وريادة الأعمال',
  'الحياة اليومية والمنزل',
  'الذكاء الاصطناعي وتعلم الآلة',
  'الإنترنت والشبكات',
  'الأمن السيبراني وحماية البيانات',
  'الحوسبة السحابية ومراكز البيانات',
  'الهواتف الذكية والأجهزة المحمولة',
  'الواقع الافتراضي والمعزز',
  'الروبوتات والأتمتة',
  'إنترنت الأشياء والمنازل الذكية',
  'العملات الرقمية والبلوكتشين',
  'الطاقة المتجددة والنقل الكهربائي',
  'استكشاف الفضاء والمركبات الذكية',
  'التكنولوجيا الحيوية والصحية',
  'الألعاب الإلكترونية ومنصات البث',
  'وسائل التواصل الاجتماعي وصُنّاع المحتوى',
  'التعليم الإلكتروني والمحتوى الرقمي',
  'التجارة الإلكترونية والدفع الرقمي',
  'النقل الذكي والمدن المستدامة',
  'البيئة وتغيّر المناخ',
];
const DOMAINS_EN = [
  'nature and weather',
  'agriculture and food',
  'science and physics',
  'biology and human body',
  'space and astronomy',
  'technology and communication',
  'industry and materials',
  'sports and health',
  'arts and music',
  'history and civilizations',
  'geography and environment',
  'economy and entrepreneurship',
  'daily life and home',
  'artificial intelligence and machine learning',
  'internet and computer networks',
  'cybersecurity and data protection',
  'cloud computing and data centers',
  'smartphones and mobile devices',
  'virtual and augmented reality',
  'robotics and automation',
  'internet of things and smart homes',
  'cryptocurrency and blockchain',
  'renewable energy and electric mobility',
  'space exploration and smart vehicles',
  'biotech and digital health',
  'video games and streaming platforms',
  'social media and content creators',
  'online learning and digital content',
  'e-commerce and digital payments',
  'smart transport and sustainable cities',
  'climate change and sustainability',
];
const LINK_TYPES_AR = [
  'سبب → نتيجة',
  'جزء ↔ كل',
  'أداة → استخدام',
  'تحوّل طبيعي / تحوّل صناعي',
  'مرحلة زمنية متتابعة',
  'وظيفة → غرض',
];
const LINK_TYPES_EN = [
  'cause → effect',
  'part ↔ whole',
  'tool → usage',
  'natural / industrial transformation',
  'sequential time stage',
  'function → purpose',
];
// Soft anti-repetition list: rotated by seed so the same canonical example
// (e.g. rain→plant water cycle) doesn't get reproduced every time.
// We do NOT forbid the water cycle topic itself — it IS a valid Wonder Link
// pattern. We only avoid copying the exact canonical chain words when not needed.
const FORBIDDEN_AR = [];
const FORBIDDEN_EN = [];

function pickRotated(arr, n, offset = 0) {
  return arr[((Number(n) || 0) + offset) % arr.length];
}

function buildSoloLogicalChainPrompts(language, level, forcedDifficulty, seed) {
  const lang = language === 'en' ? 'en' : 'ar';
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const { min, max } = linkChainMinMax(L);
  const band = difficultyBandForLevel(L);
  const diffHint =
    forcedDifficulty != null
      ? `حقل difficulty في JSON يجب أن يكون الرقم ${forcedDifficulty} بالضبط (1–5).`
      : `حقل difficulty رقم صحيح 1–5 يعكس صعوبة السلسلة (غالباً مناسب للمستوى ≈ ${band}).`;

  const seedNum =
    Number(String(seed ?? '').replace(/\D/g, '').slice(-9)) ||
    Math.floor(Math.random() * 1e9);

  const domains = lang === 'ar' ? DOMAINS_AR : DOMAINS_EN;
  const linkPool = lang === 'ar' ? LINK_TYPES_AR : LINK_TYPES_EN;
  const forbidden = lang === 'ar' ? FORBIDDEN_AR : FORBIDDEN_EN;
  const domain = pickRotated(domains, seedNum, 0);
  const altDomain = pickRotated(domains, seedNum, 7);
  const forcedLinkA = pickRotated(linkPool, seedNum, 0);
  const forcedLinkB = pickRotated(linkPool, seedNum, 3);

  if (lang === 'ar') {
    return {
      system: `أنت مولّد ألغاز لعبة "الرابط العجيب" — نمط واحد فقط: logical_chain.
المخرجات: JSON صالح فقط بدون Markdown وبدون أي نص خارج JSON.

قواعد صارمة:
- المحتوى آمن ومناسب للعائلة.
- type يجب أن يكون بالضبط: "logical_chain".
- ممنوع: pathOptions، correctPathIndex، لغز_شعري، poetic_riddle، quiz.
- startWord و endWord كلمتان عربيتان مختلفتان وغير فارغتين.
- steps: مصفوفة بطول من ${min} إلى ${max} عنصرًا.
- كل عنصر في steps يحتوي:
  - "word": الكلمة الصحيحة للخطوة.
  - "options": مصفوفة بطول 4 بالضبط، وكل عنصر نص قصير، وتتضمن نفس نص "word" حرفيًا مرة واحدة.
  - "stepQuestion": سؤال واضح يذكر طرفي الحلقة (قبل/بعد) ويطلب الحلقة الوسطى.
- لا تكرر نفس كلمة (بعد تقليم المسافات) في: startWord + كل step.word + endWord.
- الترابط المنطقي إلزامي: كل خطوة يجب أن تكون جسرًا مباشرًا بين الكلمة السابقة واللاحقة (سبب/نتيجة أو جزء/كل أو أداة/استخدام أو تحول طبيعي).
- الحد الأدنى لطول السلسلة المنطقية 3 خطوات فعلية (ليس خطوتين فقط).
- امنع الكلمات العامة الضعيفة مثل: كلمة، خطوة، رابط، شيء.
- تجنّب الكلمات المجرّدة/الشعرية غير القابلة للتحقق كسلسلة منطقية (مثل: نغم، همس، صدى، حلم، روح) إلا إذا كان السياق علميًا مباشرًا وواضحًا جدًا.
- جودة الخيارات إلزامية:
  1) الخيارات الأربعة متقاربة دلاليًا (نفس المجال تقريبًا).
  2) خيار واحد فقط صحيح منطقيًا ضمن سياق الحلقة.
  3) الخيارات الخاطئة plausible لكنها لا تُكمل السلسلة بشكل صحيح.
  4) ممنوع المشتتات البعيدة جدًا عن المجال.
  5) ممنوع إعادة استخدام نفس الخيار النصّي في خطوات مختلفة داخل نفس اللغز.
  6) ممنوع استخدام كلمات السلسلة نفسها (start/end/step words) كمشتتات في خطوات أخرى.
  7) ممنوع الكلمات المجردة غير القابلة للتحقق المنطقي (مثل: نغم، همس، شعور، ذكرى...) إلا إذا كانت ضمن سياق علمي مباشر.
  8) قبل الإخراج نفّذ تدقيق ذاتي: إذا لم تستطع شرح كل حلقة بجملة سببية واضحة ومباشرة، ارفض اللغز وأعد البناء.
  9) في stepQuestion يجب ذكر طرفي الحلقة صراحةً (الكلمة السابقة والكلمة اللاحقة).
- ${diffHint}
- أضف "hint" نصيًا قصيرًا مفيدًا.
- أضف "puzzleId" فريدًا نصيًا (مثلاً solo-ar-L${L}-...).
- أضف "rationale": مصفوفة شرح مختصر (سطر لكل خطوة) يوضح لماذا الحلقة منطقية.

روح اللعبة (إلزامية):
- اللعبة اسمها "الرابط العجيب": اربط بين كلمتين تبدوان متباعدتين تمامًا في الذهن (من مجالين مختلفين) عبر سلسلة منطقية واضحة من 3 إلى 6 حلقات بحيث يقول اللاعب: "آه! منطقي".
- مثال ذهبي يجب الاحتذاء بأسلوبه: «بحر → بخار → غيوم → مطر → نبات → خروف» (سبب/نتيجة + تحول طبيعي).
- كل حلقتين متجاورتين يجب أن تكون بينهما علاقة مباشرة قابلة للشرح بجملة واحدة قصيرة (سبب ينتج عنه التالي، أو جزء من كل، أو أداة لاستخدام، أو تحوّل طبيعي/صناعي).
- اختر startWord و endWord بحيث يبدوان للوهلة الأولى **غير مرتبطين** (مثل: بحر/خروف، رمل/حاسوب، شمس/سيارة)، لكن السلسلة تجعل الرابط واضحًا.

مبادئ التصميم:
- التنوّع إلزامي: لا تكرر نفس الموضوع أو نفس البناء بين الألغاز.
- الموضوع المقترح لهذا اللغز: ${domain} (يمكن مزجه مع: ${altDomain}).
- نوّع أنواع الروابط بين الخطوات. أمثلة مسموحة: ${linkPool.join('، ')}.
- يفضّل أن تظهر داخل السلسلة على الأقل النوعان: «${forcedLinkA}» و«${forcedLinkB}».
- استخدم العربية الفصحى الواضحة (لا عامية، لا حروف لاتينية، لا رموز غريبة).
${forbidden.length ? `- ممنوع نسخ هذه الكلمات في هذا التوليد: ${forbidden.join('، ')}.` : '- اختر مفردات سلسلتك بحرية، فقط نوّع بين الألغاز.'}

المثال الذهبي (روح اللعبة — كلمتان متباعدتان تبدوان غير مرتبطتين):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"بحر",
  "endWord":"خروف",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"بحر\\" بـ \\"غيوم\\"؟","word":"بخار","options":["بخار","ثلج","ضباب","رمل"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"بخار\\" بـ \\"مطر\\"؟","word":"غيوم","options":["غيوم","ريح","شمس","قمر"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"غيوم\\" بـ \\"نبات\\"؟","word":"مطر","options":["مطر","ثلج","برد","صقيع"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"مطر\\" بـ \\"خروف\\"؟","word":"نبات","options":["نبات","حصى","رمل","غبار"]}
  ],
  "hint":"تتبّع رحلة الماء حتى تصل إلى غذاء الحيوان.",
  "rationale":["ماء البحر يتحول إلى بخار.","البخار يتجمّع كغيوم.","الغيوم تنزل مطرًا.","المطر ينبت العشب الذي يأكله الخروف."]
}

مثال مقبول (مختصر):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"مطر",
  "endWord":"نبات",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"مطر\\" بـ \\"تربة\\"؟","word":"ماء","options":["ماء","نار","حديد","زجاج"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"ماء\\" بـ \\"نبات\\"؟","word":"تربة","options":["تربة","خشب","بلاستيك","هواء"]}
  ],
  "hint":"فكر في شروط النمو.",
  "rationale":["المطر يمد التربة بالماء.","التربة المناسبة تساعد النبات على النمو."]
}

مثال آخر مقبول (تكنولوجيا):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"رمل",
  "endWord":"حاسوب",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"رمل\\" بـ \\"شريحة\\"؟","word":"سيليكون","options":["سيليكون","ذهب","نحاس","حديد"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"سيليكون\\" بـ \\"دارة\\"؟","word":"شريحة","options":["شريحة","لوح","مسمار","سلك"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"شريحة\\" بـ \\"حاسوب\\"؟","word":"دارة","options":["دارة","شاشة","مفتاح","بطارية"]}
  ],
  "hint":"كيف يتحوّل عنصر طبيعي إلى آلة معقدة؟",
  "rationale":["السيليكون يُستخرج من الرمل.","تُصنع الشريحة الإلكترونية من السيليكون.","الشريحة جزء أساسي من دارة الحاسوب."]
}

مثال مقبول (غذاء وزراعة):
{
  "type":"logical_chain",
  "difficulty":2,
  "startWord":"قمح",
  "endWord":"خبز",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"قمح\\" بـ \\"عجين\\"؟","word":"دقيق","options":["دقيق","أرز","ذرة","شوفان"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"دقيق\\" بـ \\"فرن\\"؟","word":"عجين","options":["عجين","حلوى","لبن","سكر"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"عجين\\" بـ \\"خبز\\"؟","word":"فرن","options":["فرن","ثلاجة","قلاية","غسالة"]}
  ],
  "hint":"رحلة الحبة من الحقل إلى المائدة.",
  "rationale":["يُطحن القمح ليصبح دقيقًا.","الدقيق يُخلط بالماء ليتحول إلى عجين.","العجين يُخبز في الفرن لينتج الخبز."]
}

مثال مقبول (فلك):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"شمس",
  "endWord":"فصول",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"شمس\\" بـ \\"إشعاع\\"؟","word":"حرارة","options":["حرارة","ظلام","ثلج","ضباب"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"حرارة\\" بـ \\"مدار\\"؟","word":"إشعاع","options":["إشعاع","رياح","مغناطيس","صوت"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"إشعاع\\" بـ \\"فصول\\"؟","word":"مدار","options":["مدار","قمر","نجم","مذنب"]}
  ],
  "hint":"العلاقة بين زاوية الأرض ومسارها.",
  "rationale":["الشمس مصدر الحرارة.","الحرارة تنتقل بالإشعاع.","ميل المدار يتسبب في تعاقب الفصول."]
}

مثال مقبول (جسم الإنسان):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"غذاء",
  "endWord":"طاقة",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"غذاء\\" بـ \\"جلوكوز\\"؟","word":"هضم","options":["هضم","تنفّس","نظر","سمع"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"هضم\\" بـ \\"خلية\\"؟","word":"جلوكوز","options":["جلوكوز","ملح","حديد","ماغنيسيوم"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"جلوكوز\\" بـ \\"طاقة\\"؟","word":"خلية","options":["خلية","عظم","شعر","ظفر"]}
  ],
  "hint":"كيف يستفيد الجسم من الغذاء؟",
  "rationale":["الهضم يحلل الغذاء.","الجلوكوز ينتج عن هضم الكربوهيدرات.","الخلايا تحول الجلوكوز إلى طاقة."]
}

مثال مقبول (تاريخ وحضارات):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"بردى",
  "endWord":"كتاب",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"بردى\\" بـ \\"كتابة\\"؟","word":"ورق","options":["ورق","حجر","نسيج","فخار"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"ورق\\" بـ \\"مطبعة\\"؟","word":"كتابة","options":["كتابة","رسم","نحت","غناء"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"كتابة\\" بـ \\"كتاب\\"؟","word":"مطبعة","options":["مطبعة","ناسخ","صف حروف","ورشة طباعة"]}
  ],
  "hint":"رحلة المعرفة من النبات إلى الكتاب.",
  "rationale":["نبات البردى صُنع منه أول ورق.","الكتابة على الورق نقلت المعرفة.","المطبعة جعلت الكتب متاحة على نطاق واسع."]
}

مثال مقبول (رياضة وصحة):
{
  "type":"logical_chain",
  "difficulty":2,
  "startWord":"تمرين",
  "endWord":"لياقة",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"تمرين\\" بـ \\"قلب\\"؟","word":"حركة","options":["حركة","إحماء","جري","تمدد"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"حركة\\" بـ \\"عضلات\\"؟","word":"قلب","options":["قلب","معدة","رئة","كبد"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"قلب\\" بـ \\"لياقة\\"؟","word":"عضلات","options":["عضلات","جلد","شعر","أسنان"]}
  ],
  "hint":"كيف يتحول المجهود البدني إلى لياقة؟",
  "rationale":["الحركة هي أساس التمرين.","القلب يضخ الدم بقوة أثناء الحركة.","تقوية العضلات والقلب ترفع اللياقة."]
}

مثال مقبول (اقتصاد):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"فكرة",
  "endWord":"شركة",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"فكرة\\" بـ \\"تمويل\\"؟","word":"تخطيط","options":["تخطيط","بحث سوق","نموذج أولي","استراتيجية"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تخطيط\\" بـ \\"منتج\\"؟","word":"تمويل","options":["تمويل","إنفاق","هدر","ادخار"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تمويل\\" بـ \\"شركة\\"؟","word":"منتج","options":["منتج","شعار","عملاء","شعار تجاري"]}
  ],
  "hint":"كيف تتحول الفكرة إلى عمل قائم؟",
  "rationale":["التخطيط الجيد يحول الفكرة إلى مشروع.","التمويل يساعد على تنفيذ المشروع.","المنتج هو ما تقدمه الشركة للسوق."]
}

مثال مقبول (ذكاء اصطناعي):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"بيانات",
  "endWord":"توصية",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"بيانات\\" بـ \\"تدريب\\"؟","word":"معالجة","options":["معالجة","حذف","نسيان","طباعة"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"معالجة\\" بـ \\"نموذج\\"؟","word":"تدريب","options":["تدريب","تنظيف","ترميز","تصنيف"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تدريب\\" بـ \\"توصية\\"؟","word":"نموذج","options":["نموذج","قاعدة","سلك","مفتاح"]}
  ],
  "hint":"كيف يقترح الذكاء الاصطناعي محتوى مناسبًا لك؟",
  "rationale":["تُعالَج البيانات لتنظيفها وتصنيفها.","التدريب على البيانات ينتج نموذجًا.","النموذج يقدم توصيات للمستخدم."]
}

مثال مقبول (الأمن السيبراني):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"كلمة سر",
  "endWord":"حساب آمن",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"كلمة سر\\" بـ \\"تحقق\\"؟","word":"تشفير","options":["تشفير","مشاركة","نسخ","نشر"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تشفير\\" بـ \\"موافقة\\"؟","word":"تحقق","options":["تحقق","تجاهل","حذف","إخفاء"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تحقق\\" بـ \\"حساب آمن\\"؟","word":"موافقة","options":["موافقة","رفض","انتظار","تأجيل"]}
  ],
  "hint":"خطوات تسجيل دخول آمن.",
  "rationale":["التشفير يحمي كلمة السر.","التحقق يثبت أن المستخدم حقيقي.","الموافقة بعد التحقق تفتح حسابًا آمنًا."]
}

مثال مقبول (إنترنت الأشياء):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"مستشعر",
  "endWord":"منزل ذكي",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"مستشعر\\" بـ \\"خادم\\"؟","word":"شبكة","options":["شبكة","بوابة","موجّه","ناقل"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"شبكة\\" بـ \\"تطبيق\\"؟","word":"خادم","options":["خادم","وسيط","مخزن مؤقت","منفذ"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"خادم\\" بـ \\"منزل ذكي\\"؟","word":"تطبيق","options":["تطبيق","واجهة تحكم","لوحة متابعة","عميل ويب"]}
  ],
  "hint":"كيف يصبح المنزل ذكيًا؟",
  "rationale":["المستشعر يجمع بيانات ويرسلها عبر الشبكة.","الخادم يستقبل البيانات ويعالجها.","التطبيق يتحكم بالأجهزة بناءً عليها."]
}

مثال مقبول (طاقة متجددة):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"شمس",
  "endWord":"سيارة كهربائية",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"شمس\\" بـ \\"شحن\\"؟","word":"خلية شمسية","options":["خلية شمسية","فحم","ديزل","غاز"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"خلية شمسية\\" بـ \\"بطارية\\"؟","word":"شحن","options":["شحن","تفريغ","إذابة","تجميد"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"شحن\\" بـ \\"سيارة كهربائية\\"؟","word":"بطارية","options":["بطارية","حزمة طاقة","خلية ليثيوم","وحدة تخزين"]}
  ],
  "hint":"كيف تتحول الطاقة الشمسية إلى حركة؟",
  "rationale":["الخلية الشمسية تحوّل ضوء الشمس إلى كهرباء.","الكهرباء تشحن البطارية.","البطارية تشغل السيارة الكهربائية."]
}

مثال مقبول (بلوكتشين):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"معاملة",
  "endWord":"عملة رقمية",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"معاملة\\" بـ \\"كتلة\\"؟","word":"تحقق","options":["تحقق","حذف","تجاهل","طباعة"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تحقق\\" بـ \\"سلسلة\\"؟","word":"كتلة","options":["كتلة","ورقة","صحيفة","غيمة"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"كتلة\\" بـ \\"عملة رقمية\\"؟","word":"سلسلة","options":["سلسلة","شجرة","نهر","حصاة"]}
  ],
  "hint":"كيف تُسجَّل الحوالة بشكل آمن وموزّع؟",
  "rationale":["التحقق يثبت صحة المعاملة.","الكتلة تجمع المعاملات الموثوقة.","سلسلة الكتل تشكّل سجل العملة الرقمية."]
}

مثال مقبول (ألعاب وبث):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"لاعب",
  "endWord":"جمهور",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"لاعب\\" بـ \\"تسجيل\\"؟","word":"بطولة","options":["بطولة","مباراة","تصفيات","موسم"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"بطولة\\" بـ \\"منصة بث\\"؟","word":"تسجيل","options":["تسجيل","رسم","نحت","طباعة"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"تسجيل\\" بـ \\"جمهور\\"؟","word":"منصة بث","options":["منصة بث","صحيفة","ساعة","مكتبة"]}
  ],
  "hint":"كيف تصل المباراة الإلكترونية إلى المشاهدين؟",
  "rationale":["تجمع البطولة اللاعبين والمنافسين.","التسجيل يلتقط أحداث البطولة.","منصة البث تنشر التسجيل للجمهور."]
}

مثال مقبول (تجارة إلكترونية):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"متجر",
  "endWord":"تسليم",
  "steps":[
    {"stepQuestion":"ما الحلقة التي تربط \\"متجر\\" بـ \\"دفع\\"؟","word":"طلب","options":["طلب","سلة","فاتورة","عرض سعر"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"طلب\\" بـ \\"شحن\\"؟","word":"دفع","options":["دفع","تجاهل","انتظار","تأجيل"]},
    {"stepQuestion":"ما الحلقة التي تربط \\"دفع\\" بـ \\"تسليم\\"؟","word":"شحن","options":["شحن","حفظ","تخزين","تجميد"]}
  ],
  "hint":"رحلة المنتج من المتجر إلى يدك.",
  "rationale":["إنشاء الطلب يبدأ من المتجر.","الدفع يؤكد الطلب.","الشحن ينقله ليتم التسليم."]
}

خرائط ربط مرجعية تغطي كل المجالات (للاسترشاد بالمنطق فقط، لا تنسخ الكلمات حرفيًا):
- الطبيعة والظواهر الجوية: جبل → جليد → ذوبان → نهر → سد.
- الزراعة والغذاء: بذرة → إنبات → شتلة → حصاد → طبق.
- العلوم والفيزياء: قوة → تسارع → حركة → احتكاك → حرارة.
- الأحياء وجسم الإنسان: هواء → أكسجين → رئة → دم → خلية.
- الفضاء والفلك: نجم → جاذبية → مدار → كوكب → سنة.
- التكنولوجيا والاتصالات: إشارة → مودم → راوتر → شبكة → رسالة.
- الصناعة والمواد: خام → صهر → سبيكة → تشكيل → منتج.
- الرياضة والصحة: مشي → نبض → دوران دم → تحمّل → عافية.
- الفنون والموسيقى: فكرة → لحن → توزيع → تسجيل → أغنية.
- التاريخ والحضارات: نقش → مخطوط → ترجمة → طباعة → مكتبة.
- الجغرافيا والبيئة: غابة → تبخر → سحاب → أمطار → تنوع حيوي.
- الاقتصاد وريادة الأعمال: مشكلة → حل → نموذج أولي → سوق → شركة ناشئة.
- الحياة اليومية والمنزل: مطبخ → وصفة → طبخ → وجبة → ضيافة.
- الذكاء الاصطناعي وتعلم الآلة: بيانات خام → وسم → تدريب → تقييم → تنبؤ.
- الإنترنت والشبكات: عميل → DNS → عنوان IP → خادم → استجابة.
- الأمن السيبراني وحماية البيانات: هوية → مصادقة → صلاحية → تدقيق → حماية.
- الحوسبة السحابية ومراكز البيانات: طلب → موازن حمل → حاوية → قاعدة بيانات → خدمة.
- الهواتف الذكية والأجهزة المحمولة: كاميرا → معالجة صورة → تطبيق → مشاركة → تفاعل.
- الواقع الافتراضي والمعزز: مستشعر حركة → تتبع → مشهد ثلاثي → تفاعل → محاكاة.
- الروبوتات والأتمتة: مستشعر → متحكم → خوارزمية → محرك → مهمة.
- إنترنت الأشياء والمنازل الذكية: حساس حرارة → منصة سحابية → قاعدة قواعد → أمر → ترموستات.
- العملات الرقمية والبلوكتشين: محفظة → توقيع → بث معاملة → تأكيد → رصيد.
- الطاقة المتجددة والنقل الكهربائي: رياح → توربين → مولد → بطارية → حافلة كهربائية.
- استكشاف الفضاء والمركبات الذكية: قمر صناعي → ملاحة → تموضع → قيادة ذاتية → مسار.
- التكنولوجيا الحيوية والصحية: عينة → تحليل جيني → تشخيص → بروتوكول علاج → تعافٍ.
- الألعاب الإلكترونية ومنصات البث: لعبة → جلسة تنافس → لقطة مميزة → بث مباشر → مجتمع.
- وسائل التواصل الاجتماعي وصُنّاع المحتوى: فكرة محتوى → تصوير → تحرير → نشر → متابعة.
- التعليم الإلكتروني والمحتوى الرقمي: هدف تعلّم → درس تفاعلي → تدريب → اختبار → إتقان.
- التجارة الإلكترونية والدفع الرقمي: سلة → بوابة دفع → تأكيد → تجهيز → توصيل.
- النقل الذكي والمدن المستدامة: مستشعر مرور → تحليل كثافة → إشارة متكيفة → انسياب → خفض انبعاث.
- البيئة وتغيّر المناخ: انبعاثات → احتباس حراري → موجة حر → جفاف → إدارة مياه.

أمثلة دقيقة إضافية (قريبة للعقل اليومي والعلمي):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"مطبخ",
  "endWord":"بطارية هاتف",
  "steps":[
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"مطبخ\\" بـ \\"غاز\\"؟","word":"نفايات عضوية","options":["نفايات عضوية","أدوات مائدة","بهارات","أطباق"]},
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"نفايات عضوية\\" بـ \\"كهرباء\\"؟","word":"غاز","options":["غاز","بخار ماء","هواء ساخن","أكسجين"]},
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"غاز\\" بـ \\"شحن\\"؟","word":"كهرباء","options":["كهرباء","إضاءة","حرارة","مقاومة"]},
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"كهرباء\\" بـ \\"بطارية هاتف\\"؟","word":"شحن","options":["شحن","تخزين سحابي","مزامنة","إشعار"]}
  ],
  "hint":"اتبع مسار تحويل مخلفات الطعام إلى طاقة مفيدة.",
  "rationale":["مخلفات المطبخ العضوية يمكن جمعها.","المخلفات العضوية تُنتج غازًا حيويًا.","الغاز الحيوي يستخدم لتوليد كهرباء.","الكهرباء تُستخدم في شحن بطارية الهاتف."]
}

{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"ازدحام",
  "endWord":"هواء أنظف",
  "steps":[
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"ازدحام\\" بـ \\"توقيت الإشارات\\"؟","word":"حساسات مرور","options":["حساسات مرور","لوحات إعلانية","مقاعد انتظار","كاميرا سيلفي"]},
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"حساسات مرور\\" بـ \\"انسياب\\"؟","word":"توقيت الإشارات","options":["توقيت الإشارات","إضاءة الشوارع","رصف الطريق","أرصفة"]},
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"توقيت الإشارات\\" بـ \\"انبعاثات أقل\\"؟","word":"انسياب","options":["انسياب","توقف كامل","تحويلة ثابتة","صف انتظار"]},
    {"stepQuestion":"ما الحلقة المنطقية التي تربط \\"انسياب\\" بـ \\"هواء أنظف\\"؟","word":"انبعاثات أقل","options":["انبعاثات أقل","ضوضاء أعلى","سرعة قصوى","استهلاك أكبر"]}
  ],
  "hint":"فكر كيف تؤثر إدارة المرور على جودة الهواء.",
  "rationale":["الازدحام يُقاس بحساسات المرور.","توقيت الإشارات الذكي يحسن الانسياب.","الانسياب يقلل التوقف المتكرر واستهلاك الوقود.","انخفاض الانبعاثات يعني هواء أنظف."]
}

أمثلة مرفوضة:
- خيارات بعيدة جدًا عن المجال مثل ["ماء","حاسوب","صاروخ","كمان"].
- سلسلة عشوائية بدون منطق متّصل بين خطوتين متتاليتين.
- إعادة استخدام مثال "مطر→نبات" أو دورة الماء كمحتوى لهذا التوليد.
`,
      user: `أنشئ لغز سلسلة جديدًا بالكامل. مستوى اللاعب في اللعبة: ${L}.
Seed: ${seed}
الموضوع المستهدف: ${domain} (يمكن مزجه مع ${altDomain}).
ابتكر startWord و endWord من هذا المجال بشكل غير بديهي وأنشئ سلسلة منطقية تربطهما.
لا تستخدم في هذا اللغز أيًّا من الكلمات: ${forbidden.join('، ')}.
تأكد أن الخيارات الأربعة في كل خطوة مختلفة بعد تقليم المسافات، وأن الإجابة الصحيحة موجودة ضمنها.
وتأكد أن السؤال في stepQuestion مرتبط بالكلمتين المحيطتين بالحلقة بشكل صريح.`,
    };
  }

  return {
    system: `You generate puzzles for "Wonder Link" — ONLY type "logical_chain".
Output: valid JSON only. No Markdown. No text outside JSON.

Strict rules:
- Family-safe content.
- type must be exactly "logical_chain".
- Forbidden: pathOptions, correctPathIndex, poetic_riddle, quiz, spot puzzles.
- startWord and endWord: two different non-empty English words.
- steps: array length between ${min} and ${max}.
- Each step must include:
  - "word": the correct intermediate word.
  - "options": array of exactly 4 short strings; must include "word" literally once.
  - "stepQuestion": explicit question that mentions the two surrounding terms and asks for the middle link.
- Do not repeat any normalized word across startWord + every step.word + endWord.
- Logical coherence is mandatory: each step must be a direct bridge between previous and next term (cause/effect, part/whole, tool/use, natural transformation).
- Minimum logical chain length is 3 actual steps (not only 2).
- Avoid weak generic words like: word, step, link, thing.
- Avoid abstract/poetic chain words that are hard to verify logically (e.g. melody, whisper, echo, dream, spirit) unless the puzzle context makes them concrete and explicit.
- Distractor quality is mandatory:
  1) all 4 options are semantically close (same topical field),
  2) exactly one option is correct in that step context,
  3) wrong options are plausible but still wrong,
  4) avoid absurdly unrelated distractors.
  5) Do not reuse the same option text across different steps in the same puzzle.
  6) Do not reuse chain words (start/end/other step words) as distractors in other steps.
  7) Avoid abstract words that are hard to verify logically (e.g. melody, whisper, feeling, memory) unless made concrete by explicit technical context.
  8) Self-audit before output: if any step cannot be justified with one direct causal/functional sentence, reject and rebuild.
  9) Each stepQuestion must explicitly mention both neighboring terms around that step.
- ${forcedDifficulty != null ? `Field difficulty must be exactly the integer ${forcedDifficulty} (1–5).` : `Field difficulty is an integer 1–5 matching puzzle hardness (often ~${band} for this player level).`}
- Include a helpful short "hint".
- Include a unique string "puzzleId" (e.g. solo-en-L${L}-...).
- Include "rationale": one concise explanation line per step.

Game spirit (mandatory):
- "Wonder Link" connects two words that look unrelated through a clear logical chain (3–6 hops) so the player says "ah, makes sense!".
- Golden example to imitate (style only): "sea → vapor → clouds → rain → plant → sheep".
- Each consecutive pair must be directly connected (cause/effect, part/whole, tool/use, natural/industrial transformation).
- Pick startWord and endWord that look unrelated at first glance (e.g. sea/sheep, sand/computer, sun/car), but become obvious through the chain.

Design principles:
- Diversity is mandatory; do NOT keep using the same theme for every puzzle.
- Suggested theme for THIS puzzle: ${domain} (you may blend with: ${altDomain}).
- Vary link kinds across steps. Allowed kinds: ${linkPool.join(', ')}.
- At least include both link kinds: "${forcedLinkA}" and "${forcedLinkB}".
- Use clear standard English (no slang, no Arabic, no random symbols).
${forbidden.length ? `- DO NOT reuse these words: ${forbidden.join(', ')}.` : '- Choose your chain words freely; just keep variety across puzzles.'}

Golden example (game spirit — distant words connected through a chain):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"sea",
  "endWord":"sheep",
  "steps":[
    {"stepQuestion":"Which link connects \\"sea\\" and \\"clouds\\"?","word":"vapor","options":["vapor","ice","fog","sand"]},
    {"stepQuestion":"Which link connects \\"vapor\\" and \\"rain\\"?","word":"clouds","options":["clouds","wind","sun","moon"]},
    {"stepQuestion":"Which link connects \\"clouds\\" and \\"plant\\"?","word":"rain","options":["rain","snow","hail","frost"]},
    {"stepQuestion":"Which link connects \\"rain\\" and \\"sheep\\"?","word":"plant","options":["plant","gravel","sand","dust"]}
  ],
  "hint":"Follow the journey of water until it becomes animal food.",
  "rationale":["Seawater turns into vapor.","Vapor gathers into clouds.","Clouds release rain.","Rain grows plants that the sheep eats."]
}

Accepted mini-example:
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"rain",
  "endWord":"plant",
  "steps":[
    {"stepQuestion":"Which link connects \\"rain\\" and \\"soil\\"?","word":"water","options":["water","metal","engine","planet"]},
    {"stepQuestion":"Which link connects \\"water\\" and \\"plant\\"?","word":"soil","options":["soil","glass","fuel","plastic"]}
  ],
  "hint":"Think growth conditions.",
  "rationale":["Rain provides water.","Suitable soil supports plant growth."]
}

Another accepted example (technology):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"sand",
  "endWord":"computer",
  "steps":[
    {"stepQuestion":"Which link connects \\"sand\\" and \\"chip\\"?","word":"silicon","options":["silicon","gold","copper","iron"]},
    {"stepQuestion":"Which link connects \\"silicon\\" and \\"circuit\\"?","word":"chip","options":["chip","brick","wire","button"]},
    {"stepQuestion":"Which link connects \\"chip\\" and \\"computer\\"?","word":"circuit","options":["circuit","screen","switch","battery"]}
  ],
  "hint":"How a natural element becomes a complex device.",
  "rationale":["Silicon is extracted from sand.","Chips are built from silicon.","Chips form the circuits of a computer."]
}

Accepted example (food/agriculture):
{
  "type":"logical_chain",
  "difficulty":2,
  "startWord":"wheat",
  "endWord":"bread",
  "steps":[
    {"stepQuestion":"Which link connects \\"wheat\\" and \\"dough\\"?","word":"flour","options":["flour","rice","corn","oat"]},
    {"stepQuestion":"Which link connects \\"flour\\" and \\"oven\\"?","word":"dough","options":["dough","cake","milk","sugar"]},
    {"stepQuestion":"Which link connects \\"dough\\" and \\"bread\\"?","word":"oven","options":["oven","fridge","fryer","washer"]}
  ],
  "hint":"From the field to the table.",
  "rationale":["Wheat is milled to flour.","Flour mixed with water becomes dough.","Dough baked in an oven becomes bread."]
}

Accepted example (astronomy):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"sun",
  "endWord":"seasons",
  "steps":[
    {"stepQuestion":"Which link connects \\"sun\\" and \\"radiation\\"?","word":"heat","options":["heat","darkness","ice","fog"]},
    {"stepQuestion":"Which link connects \\"heat\\" and \\"orbit\\"?","word":"radiation","options":["radiation","wind","magnet","sound"]},
    {"stepQuestion":"Which link connects \\"radiation\\" and \\"seasons\\"?","word":"orbit","options":["orbit","moon","star","comet"]}
  ],
  "hint":"How Earth's tilt and motion produce seasons.",
  "rationale":["The sun supplies heat.","Heat travels via radiation.","The tilted orbit drives the seasons."]
}

Accepted example (human body):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"food",
  "endWord":"energy",
  "steps":[
    {"stepQuestion":"Which link connects \\"food\\" and \\"glucose\\"?","word":"digestion","options":["digestion","breathing","sight","hearing"]},
    {"stepQuestion":"Which link connects \\"digestion\\" and \\"cell\\"?","word":"glucose","options":["glucose","salt","iron","calcium"]},
    {"stepQuestion":"Which link connects \\"glucose\\" and \\"energy\\"?","word":"cell","options":["cell","bone","hair","nail"]}
  ],
  "hint":"How the body fuels itself.",
  "rationale":["Digestion breaks down food.","Glucose comes from carbohydrates.","Cells convert glucose into energy."]
}

Accepted example (history):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"papyrus",
  "endWord":"book",
  "steps":[
    {"stepQuestion":"Which link connects \\"papyrus\\" and \\"writing\\"?","word":"paper","options":["paper","stone","fabric","clay"]},
    {"stepQuestion":"Which link connects \\"paper\\" and \\"press\\"?","word":"writing","options":["writing","drawing","carving","singing"]},
    {"stepQuestion":"Which link connects \\"writing\\" and \\"book\\"?","word":"press","options":["press","typesetter","printer","print house"]}
  ],
  "hint":"From a plant to mass-produced knowledge.",
  "rationale":["Papyrus was the early form of paper.","Writing on paper preserved knowledge.","The press made books widely available."]
}

Accepted example (sports/health):
{
  "type":"logical_chain",
  "difficulty":2,
  "startWord":"exercise",
  "endWord":"fitness",
  "steps":[
    {"stepQuestion":"Which link connects \\"exercise\\" and \\"heart\\"?","word":"motion","options":["motion","warmup","jogging","stretching"]},
    {"stepQuestion":"Which link connects \\"motion\\" and \\"muscles\\"?","word":"heart","options":["heart","stomach","lung","liver"]},
    {"stepQuestion":"Which link connects \\"heart\\" and \\"fitness\\"?","word":"muscles","options":["muscles","skin","hair","teeth"]}
  ],
  "hint":"How effort builds fitness.",
  "rationale":["Motion is the basis of exercise.","The heart pumps faster during motion.","Strong muscles and heart raise fitness."]
}

Accepted example (economy):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"idea",
  "endWord":"company",
  "steps":[
    {"stepQuestion":"Which link connects \\"idea\\" and \\"funding\\"?","word":"plan","options":["plan","market research","prototype","strategy"]},
    {"stepQuestion":"Which link connects \\"plan\\" and \\"product\\"?","word":"funding","options":["funding","spending","waste","saving"]},
    {"stepQuestion":"Which link connects \\"funding\\" and \\"company\\"?","word":"product","options":["product","logo","customers","brand"]}
  ],
  "hint":"How a thought becomes a business.",
  "rationale":["A solid plan turns ideas into projects.","Funding makes the plan executable.","A product is what the company sells."]
}

Accepted example (artificial intelligence):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"data",
  "endWord":"recommendation",
  "steps":[
    {"stepQuestion":"Which link connects \\"data\\" and \\"training\\"?","word":"processing","options":["processing","deletion","forgetting","printing"]},
    {"stepQuestion":"Which link connects \\"processing\\" and \\"model\\"?","word":"training","options":["training","cleaning","encoding","labeling"]},
    {"stepQuestion":"Which link connects \\"training\\" and \\"recommendation\\"?","word":"model","options":["model","wire","switch","brick"]}
  ],
  "hint":"How AI suggests content tailored to you.",
  "rationale":["Data must be processed and cleaned.","Training on processed data builds a model.","The model produces user recommendations."]
}

Accepted example (cybersecurity):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"password",
  "endWord":"secure account",
  "steps":[
    {"stepQuestion":"Which link connects \\"password\\" and \\"verification\\"?","word":"encryption","options":["encryption","sharing","copying","posting"]},
    {"stepQuestion":"Which link connects \\"encryption\\" and \\"approval\\"?","word":"verification","options":["verification","ignore","delete","hide"]},
    {"stepQuestion":"Which link connects \\"verification\\" and \\"secure account\\"?","word":"approval","options":["approval","rejection","waiting","postpone"]}
  ],
  "hint":"Steps of a secure login.",
  "rationale":["Encryption protects the password.","Verification confirms the user identity.","Approval after verification opens the account."]
}

Accepted example (internet of things):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"sensor",
  "endWord":"smart home",
  "steps":[
    {"stepQuestion":"Which link connects \\"sensor\\" and \\"server\\"?","word":"network","options":["network","gateway","router","bus"]},
    {"stepQuestion":"Which link connects \\"network\\" and \\"app\\"?","word":"server","options":["server","proxy","cache","endpoint"]},
    {"stepQuestion":"Which link connects \\"server\\" and \\"smart home\\"?","word":"app","options":["app","tile","print","speaker"]}
  ],
  "hint":"How a home becomes smart.",
  "rationale":["Sensors collect and send data over the network.","The server receives and processes that data.","An app uses the server to control devices."]
}

Accepted example (renewable energy):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"sun",
  "endWord":"electric car",
  "steps":[
    {"stepQuestion":"Which link connects \\"sun\\" and \\"charging\\"?","word":"solar cell","options":["solar cell","coal","diesel","gas"]},
    {"stepQuestion":"Which link connects \\"solar cell\\" and \\"battery\\"?","word":"charging","options":["charging","discharge","melting","freezing"]},
    {"stepQuestion":"Which link connects \\"charging\\" and \\"electric car\\"?","word":"battery","options":["battery","power pack","cell module","accumulator"]}
  ],
  "hint":"From sunlight to motion.",
  "rationale":["Solar cells turn sunlight into electricity.","Electricity charges the battery.","The battery powers the electric car."]
}

Accepted example (blockchain):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"transaction",
  "endWord":"cryptocurrency",
  "steps":[
    {"stepQuestion":"Which link connects \\"transaction\\" and \\"block\\"?","word":"verification","options":["verification","deletion","ignore","print"]},
    {"stepQuestion":"Which link connects \\"verification\\" and \\"chain\\"?","word":"block","options":["block","leaf","newspaper","cloud"]},
    {"stepQuestion":"Which link connects \\"block\\" and \\"cryptocurrency\\"?","word":"chain","options":["chain","tree","river","stone"]}
  ],
  "hint":"How transfers are recorded securely and distributed.",
  "rationale":["Verification confirms the transaction.","A block aggregates verified transactions.","The chain of blocks forms the cryptocurrency ledger."]
}

Accepted example (gaming/streaming):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"player",
  "endWord":"audience",
  "steps":[
    {"stepQuestion":"Which link connects \\"player\\" and \\"recording\\"?","word":"tournament","options":["tournament","match","qualifier","season"]},
    {"stepQuestion":"Which link connects \\"tournament\\" and \\"streaming platform\\"?","word":"recording","options":["recording","capture","broadcast feed","match archive"]},
    {"stepQuestion":"Which link connects \\"recording\\" and \\"audience\\"?","word":"streaming platform","options":["streaming platform","newspaper","clock","library"]}
  ],
  "hint":"How an esports match reaches viewers.",
  "rationale":["A tournament gathers competing players.","Recordings capture the tournament's events.","The streaming platform delivers the recording to the audience."]
}

Accepted example (e-commerce):
{
  "type":"logical_chain",
  "difficulty":3,
  "startWord":"store",
  "endWord":"delivery",
  "steps":[
    {"stepQuestion":"Which link connects \\"store\\" and \\"payment\\"?","word":"order","options":["order","cart","invoice","quotation"]},
    {"stepQuestion":"Which link connects \\"order\\" and \\"shipping\\"?","word":"payment","options":["payment","ignore","wait","postpone"]},
    {"stepQuestion":"Which link connects \\"payment\\" and \\"delivery\\"?","word":"shipping","options":["shipping","saving","storage","freezing"]}
  ],
  "hint":"The journey of a product to your hand.",
  "rationale":["An order is created in the store.","Payment confirms the order.","Shipping carries it to delivery."]
}

Reference chain maps covering all domains (logic style only; do not copy words literally):
- nature and weather: mountain -> ice -> meltwater -> river -> dam.
- agriculture and food: seed -> germination -> seedling -> harvest -> meal.
- science and physics: force -> acceleration -> motion -> friction -> heat.
- biology and human body: air -> oxygen -> lung -> blood -> cell.
- space and astronomy: star -> gravity -> orbit -> planet -> year.
- technology and communication: signal -> modem -> router -> network -> message.
- industry and materials: ore -> smelting -> alloy -> shaping -> product.
- sports and health: walking -> pulse -> circulation -> endurance -> wellness.
- arts and music: idea -> melody -> arrangement -> recording -> song.
- history and civilizations: inscription -> manuscript -> translation -> printing -> library.
- geography and environment: forest -> evaporation -> cloud -> rainfall -> biodiversity.
- economy and entrepreneurship: problem -> solution -> prototype -> market -> startup.
- daily life and home: kitchen -> recipe -> cooking -> meal -> hosting.
- artificial intelligence and machine learning: raw data -> labeling -> training -> evaluation -> prediction.
- internet and computer networks: client -> DNS -> IP address -> server -> response.
- cybersecurity and data protection: identity -> authentication -> authorization -> audit -> protection.
- cloud computing and data centers: request -> load balancer -> container -> database -> service.
- smartphones and mobile devices: camera -> image processing -> app -> sharing -> engagement.
- virtual and augmented reality: motion sensor -> tracking -> 3D scene -> interaction -> simulation.
- robotics and automation: sensor -> controller -> algorithm -> actuator -> task.
- internet of things and smart homes: temperature sensor -> cloud platform -> rule engine -> command -> thermostat.
- cryptocurrency and blockchain: wallet -> signature -> transaction broadcast -> confirmation -> balance.
- renewable energy and electric mobility: wind -> turbine -> generator -> battery -> electric bus.
- space exploration and smart vehicles: satellite -> navigation -> positioning -> autonomous driving -> route.
- biotech and digital health: sample -> genomic analysis -> diagnosis -> treatment protocol -> recovery.
- video games and streaming platforms: game -> competitive session -> highlight clip -> livestream -> community.
- social media and content creators: content idea -> filming -> editing -> publishing -> followers.
- online learning and digital content: learning goal -> interactive lesson -> practice -> assessment -> mastery.
- e-commerce and digital payments: cart -> payment gateway -> confirmation -> fulfillment -> delivery.
- smart transport and sustainable cities: traffic sensor -> density analysis -> adaptive signal -> flow -> lower emissions.
- climate change and sustainability: emissions -> greenhouse effect -> heatwave -> drought -> water management.

Additional high-precision examples (close to everyday/scientific reasoning):
{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"kitchen",
  "endWord":"phone battery",
  "steps":[
    {"stepQuestion":"Which logical link best connects \\"kitchen\\" and \\"biogas\\"?","word":"organic waste","options":["organic waste","tableware","spices","plates"]},
    {"stepQuestion":"Which logical link best connects \\"organic waste\\" and \\"electricity\\"?","word":"biogas","options":["biogas","steam","hot air","oxygen"]},
    {"stepQuestion":"Which logical link best connects \\"biogas\\" and \\"charging\\"?","word":"electricity","options":["electricity","lighting","heat","resistance"]},
    {"stepQuestion":"Which logical link best connects \\"electricity\\" and \\"phone battery\\"?","word":"charging","options":["charging","cloud sync","backup","notification"]}
  ],
  "hint":"Follow how food waste can become useful energy.",
  "rationale":["Kitchen organic waste can be collected.","Organic waste can generate biogas.","Biogas can be converted into electricity.","Electricity is used to charge a phone battery."]
}

{
  "type":"logical_chain",
  "difficulty":4,
  "startWord":"traffic jam",
  "endWord":"cleaner air",
  "steps":[
    {"stepQuestion":"Which logical link best connects \\"traffic jam\\" and \\"signal timing\\"?","word":"traffic sensors","options":["traffic sensors","billboards","benches","selfie camera"]},
    {"stepQuestion":"Which logical link best connects \\"traffic sensors\\" and \\"flow\\"?","word":"signal timing","options":["signal timing","street lights","pavement","sidewalk"]},
    {"stepQuestion":"Which logical link best connects \\"signal timing\\" and \\"lower emissions\\"?","word":"flow","options":["flow","full stop","fixed detour","queue"]},
    {"stepQuestion":"Which logical link best connects \\"flow\\" and \\"cleaner air\\"?","word":"lower emissions","options":["lower emissions","higher noise","top speed","higher fuel use"]}
  ],
  "hint":"Think how smart traffic management affects air quality.",
  "rationale":["Traffic conditions are captured by sensors.","Adaptive signal timing improves flow.","Smoother flow reduces stop-and-go fuel burn.","Lower emissions lead to cleaner air."]
}
Rejected patterns:
- Random options unrelated to the domain.
- Reusing the canonical example chain (rain/water/soil/plant) in this generation.
- Disconnected steps where moving between two consecutive words requires hidden hops.
`,
    user: `Create one fresh chain puzzle. Player level in-game: ${L}.
Seed: ${seed}
Target theme: ${domain} (may blend with ${altDomain}).
Invent startWord and endWord from this theme in a non-obvious way and connect them with a coherent logical chain.
Do NOT use any of these words in this puzzle: ${forbidden.join(', ')}.
Ensure 4 distinct options per step (after trim) and the correct word appears exactly once in options.
Ensure each stepQuestion explicitly matches the neighboring terms around the target step.`,
  };
}

function applyStrictStepQuestions(puzzle, language) {
  const lang = language === 'en' ? 'en' : 'ar';
  const out = { ...puzzle };
  if (!Array.isArray(out.steps)) return out;

  const start = String(out.startWord ?? '').trim();
  const end = String(out.endWord ?? '').trim();
  out.steps = out.steps.map((raw, i) => {
    const step = raw && typeof raw === 'object' ? { ...raw } : raw;
    if (!step || typeof step !== 'object') return step;
    const prev = i === 0 ? start : String(out.steps[i - 1]?.word ?? '').trim();
    const next = i === out.steps.length - 1 ? end : String(out.steps[i + 1]?.word ?? '').trim();
    step.stepQuestion =
      lang === 'ar'
        ? `ما الحلقة المنطقية التي تربط "${prev}" بـ "${next}"؟`
        : `Which logical link best connects "${prev}" and "${next}"?`;
    return step;
  });
  return out;
}

function applyStrictRationale(puzzle, language) {
  const lang = language === 'en' ? 'en' : 'ar';
  const out = { ...puzzle };
  if (!Array.isArray(out.steps)) return out;
  const start = String(out.startWord ?? '').trim();
  const end = String(out.endWord ?? '').trim();
  out.rationale = out.steps.map((_, i) => {
    const prev = i === 0 ? start : String(out.steps[i - 1]?.word ?? '').trim();
    const curr = String(out.steps[i]?.word ?? '').trim();
    const next = i === out.steps.length - 1 ? end : String(out.steps[i + 1]?.word ?? '').trim();
    return lang === 'ar'
      ? `الحلقة "${curr}" تربط "${prev}" بـ "${next}" ضمن نفس السياق المنطقي.`
      : `"${curr}" bridges "${prev}" and "${next}" in one coherent logical context.`;
  });
  return out;
}

async function callGeminiJson(env, systemPrompt, userPrompt, temperature) {
  const key = env.GEMINI_API_KEY;
  if (!key) return '';
  const geminiModel = env.GEMINI_MODEL || 'gemini-2.0-flash';
  const modelPath = String(geminiModel).startsWith('models/')
    ? String(geminiModel)
    : `models/${geminiModel}`;
  const maxOut = Math.min(8192, Math.max(256, Number(env.GEMINI_MAX_OUTPUT_TOKENS) || 900));
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${key}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      generationConfig: {
        response_mime_type: 'application/json',
        temperature,
        maxOutputTokens: maxOut,
      },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Gemini API Error: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callWorkersAiJson(env, systemPrompt, userPrompt, temperature) {
  if (!env?.AI) return '';
  const aiModel = env.AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';
  const out = await env.AI.run(aiModel, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: Math.min(2048, Math.max(256, Number(env.GEMINI_MAX_OUTPUT_TOKENS) || 900)),
  });
  const text =
    out?.response ??
    out?.result ??
    out?.output_text ??
    out?.text ??
    (typeof out === 'string' ? out : JSON.stringify(out));
  return String(text || '');
}

async function callOpenAiJson(env, systemPrompt, userPrompt, temperature) {
  const openaiApiKey = env?.OPENAI_API_KEY;
  if (!openaiApiKey) return '';
  const openaiModel = env?.OPENAI_MODEL || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: openaiModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 900,
      response_format: { type: 'json_object' },
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`OpenAI Error: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function callGroqJson(env, systemPrompt, userPrompt, temperature) {
  const groqApiKey = env?.GROQ_API_KEY;
  if (!groqApiKey) return '';
  const groqModel = env?.GROQ_MODEL || 'llama-3.1-8b-instant';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: 1000,
    }),
  });
  if (!response.ok) {
    const t = await response.text();
    throw new Error(`Groq Error: ${response.status} ${t}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

async function generateChainJsonText(env, language, level, forcedDifficulty, seed) {
  const { system, user } = buildSoloLogicalChainPrompts(language, level, forcedDifficulty, seed);
  const temp = Math.min(1, Math.max(0.2, Number(env.SOLO_BANK_AI_TEMPERATURE) || 0.55));

  let content = '';
  try {
    content = await callGeminiJson(env, system, user, temp);
  } catch (e) {
    console.warn('[solo_bank_ai] Gemini failed:', String(e?.message || e));
    content = '';
  }

  if (!content) {
    try {
      content = await callWorkersAiJson(env, system, user, temp);
    } catch (e) {
      console.warn('[solo_bank_ai] Workers AI failed:', String(e?.message || e));
      content = '';
    }
  }

  if (!content) {
    try {
      content = await callOpenAiJson(env, system, user, temp);
    } catch (e) {
      console.warn('[solo_bank_ai] OpenAI failed:', String(e?.message || e));
      content = '';
    }
  }

  if (!content) {
    try {
      content = await callGroqJson(env, system, user, temp);
    } catch (e) {
      console.warn('[solo_bank_ai] Groq failed:', String(e?.message || e));
      content = '';
    }
  }

  if (!content) {
    console.warn('[solo_bank_ai] No AI provider available, using offline fallback generator.');
    const fallback = buildOfflineFallbackPuzzle(language, level, forcedDifficulty, seed);
    return JSON.stringify(fallback);
  }

  return content;
}

function coerceLogicalChainAfterNormalize(p) {
  if (!p || typeof p !== 'object') return p;
  const out = { ...p };
  out.type = 'logical_chain';
  delete out.pathOptions;
  delete out.correctPathIndex;
  delete out.riddleText;
  return out;
}

function seededIndex(seed, modulo, offset = 0) {
  const s = String(seed ?? '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  const n = Math.abs((h + offset * 1013904223) | 0);
  return modulo > 0 ? n % modulo : 0;
}

function buildOfflineFallbackPuzzle(language, level, forcedDifficulty, seed) {
  const lang = language === 'en' ? 'en' : 'ar';
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const band = difficultyBandForLevel(L);
  const difficulty = forcedDifficulty ?? band;

  const templatesAr = [
    {
      startWord: 'بحر',
      endWord: 'خروف',
      chain: ['بخار', 'غيوم', 'مطر', 'نبات'],
      hint: 'اتبع دورة الماء حتى تصل لغذاء الحيوان.',
      rationale: ['ماء البحر يتبخر فيصير بخارًا.', 'البخار يتكاثف ويكوّن الغيوم.', 'الغيوم تنزل مطرًا.', 'المطر يساعد النبات على النمو الذي يأكله الخروف.'],
      distractors: [
        ['ضباب', 'ندى', 'رذاذ'],
        ['سحب ركامية', 'رياح', 'صقيع'],
        ['برد', 'ثلج', 'رذاذ'],
        ['عشب', 'أعلاف', 'مرعى'],
      ],
    },
    {
      startWord: 'رمل',
      endWord: 'حاسوب',
      chain: ['سيليكون', 'شريحة', 'دارة'],
      hint: 'فكر في تصنيع الإلكترونيات من المواد الخام.',
      rationale: ['الرمل مصدر رئيسي للسيليكون.', 'السيليكون يدخل في تصنيع الشرائح.', 'الشرائح تبنى ضمن الدارات الإلكترونية للحاسوب.'],
      distractors: [
        ['فحم', 'نحاس', 'حديد'],
        ['لوحة إلكترونية', 'معالج', 'ترانزستور'],
        ['ناقل', 'مقاومة', 'مكثف'],
      ],
    },
    {
      startWord: 'قمح',
      endWord: 'خبز',
      chain: ['دقيق', 'عجين', 'فرن'],
      hint: 'رحلة الطعام من الحقل إلى المائدة.',
      rationale: ['القمح يطحن ليصبح دقيقًا.', 'الدقيق يعجن مع الماء فيتكون العجين.', 'العجين يخبز في الفرن فيتحول إلى خبز.'],
      distractors: [
        ['سميد', 'نخالة', 'طحين ذرة'],
        ['خليط', 'خميرة', 'عجينة'],
        ['تنور', 'مخبز', 'صاج'],
      ],
    },
  ];

  const templatesEn = [
    {
      startWord: 'sea',
      endWord: 'sheep',
      chain: ['vapor', 'clouds', 'rain', 'plant'],
      hint: 'Follow the water cycle to animal food.',
      rationale: ['Seawater evaporates into vapor.', 'Vapor condenses into clouds.', 'Clouds produce rain.', 'Rain helps plants grow, and sheep feed on plants.'],
      distractors: [
        ['mist', 'steam', 'dew'],
        ['storm front', 'wind', 'fog'],
        ['hail', 'snow', 'drizzle'],
        ['grass', 'fodder', 'pasture'],
      ],
    },
    {
      startWord: 'sand',
      endWord: 'computer',
      chain: ['silicon', 'chip', 'circuit'],
      hint: 'Think manufacturing flow from raw material to electronics.',
      rationale: ['Sand is a major source of silicon.', 'Silicon is used to manufacture chips.', 'Chips are core parts of computer circuits.'],
      distractors: [
        ['coal', 'copper', 'iron'],
        ['processor', 'wafer', 'transistor'],
        ['bus', 'resistor', 'capacitor'],
      ],
    },
    {
      startWord: 'wheat',
      endWord: 'bread',
      chain: ['flour', 'dough', 'oven'],
      hint: 'Track how grain turns into food.',
      rationale: ['Wheat is milled into flour.', 'Flour mixed with water becomes dough.', 'Dough baked in an oven becomes bread.'],
      distractors: [
        ['bran', 'semolina', 'cornmeal'],
        ['mixture', 'starter', 'batter'],
        ['bakery', 'tandoor', 'grill'],
      ],
    },
  ];

  const templates = lang === 'ar' ? templatesAr : templatesEn;
  const picked = templates[seededIndex(seed, templates.length)];
  const chainWords = [picked.startWord, ...picked.chain, picked.endWord].map((w) =>
    normalizeQualityWord(w, lang),
  );
  const used = new Set();

  const steps = picked.chain.map((word, i) => {
    const pool = (picked.distractors[i] || []).filter((d) => {
      const n = normalizeQualityWord(d, lang);
      return n && !chainWords.includes(n) && !used.has(n);
    });
    const wrong = pool.slice(0, 3);
    while (wrong.length < 3) {
      const filler = lang === 'ar' ? `خيار${i + 1}${wrong.length + 1}` : `option${i + 1}${wrong.length + 1}`;
      const n = normalizeQualityWord(filler, lang);
      if (!used.has(n) && !chainWords.includes(n)) wrong.push(filler);
    }
    for (const d of wrong) used.add(normalizeQualityWord(d, lang));

    const options = [word, ...wrong];
    const rot = seededIndex(seed, options.length, i + 1);
    const rotated = options.slice(rot).concat(options.slice(0, rot));
    return {
      stepQuestion: '',
      word,
      options: rotated,
    };
  });

  return {
    type: 'logical_chain',
    difficulty,
    startWord: picked.startWord,
    endWord: picked.endWord,
    steps,
    hint: picked.hint,
    rationale: picked.rationale,
    puzzleId: `solo-offline-${lang}-L${L}-${Date.now()}-${seededIndex(seed, 9999)}`,
  };
}

/**
 * يولّد لغز سلسلة واحداً جاهزاً للإدراج في D1 (بعد التحقق والتطبيع).
 */
export async function generateOneSoloChainPuzzle(env, { level, language, difficulty = null }) {
  const lang = language === 'en' ? 'en' : 'ar';
  const L = Math.max(1, Math.min(100, Number(level) || 1));
  const forcedDifficulty = Number.isFinite(Number(difficulty))
    ? Math.max(1, Math.min(5, Number(difficulty)))
    : null;

  const maxAttempts = Math.min(
    8,
    Math.max(1, Number(env.SOLO_BANK_AI_PARSE_RETRIES) || 4),
  );

  let lastErr = 'unknown';
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const seed = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}_${attempt}`;
      const raw = await generateChainJsonText(env, lang, L, forcedDifficulty, seed);
      let parsed = safeParseJsonFromModelOutput(raw);
      if (lang === 'ar') {
        parsed = stripLatinFromChainPuzzle(parsed);
      }
      let p = normalizeChainPuzzleForClient(parsed);
      p = coerceLogicalChainAfterNormalize(p);
      p = applyStrictStepQuestions(p, lang);
      p = applyStrictRationale(p, lang);

      if (!looksLikeSoloChainObject(p)) {
        throw new Error('AI output is not a valid solo chain puzzle shape');
      }

      const stepErr = validateSoloChainSteps(p);
      if (stepErr) {
        throw new Error(`AI puzzle failed validation: ${stepErr}`);
      }
      const qualityErr = validateLogicalChainQuality(p, lang);
      if (qualityErr) {
        throw new Error(`AI puzzle failed logical quality: ${qualityErr}`);
      }

      const band = difficultyBandForLevel(L);
      p.difficulty = forcedDifficulty ?? p.difficulty ?? band;
      if (!p.puzzleId) {
        p.puzzleId = `solo-ai-${L}-${lang}-${Date.now()}-${attempt}`;
      }

      return p;
    } catch (e) {
      lastErr = String(e?.message || e);
      console.warn(`[solo_bank_ai] attempt ${attempt + 1}/${maxAttempts} failed:`, lastErr);
    }
  }

  throw new Error(lastErr);
}
