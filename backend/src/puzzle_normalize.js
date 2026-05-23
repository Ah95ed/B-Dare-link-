/**
 * يوحّد شكل لغز السلسلة (logical_chain) القادم من D1/AI ليتوافق مع عميل Flutter.
 * - word من correctAnswer / answer إن وُجدت
 * - options مصفوفة دائماً
 */
export function normalizeChainPuzzleForClient(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') return puzzle;
  const out = { ...puzzle };
  const st = String(out.startWord ?? out.start ?? out.from ?? '').trim();
  const en = String(out.endWord ?? out.end ?? out.to ?? '').trim();
  if (st) out.startWord = st;
  if (en) out.endWord = en;
  if (!Array.isArray(out.steps)) return out;
  out.steps = out.steps.map((step) => {
    if (!step || typeof step !== 'object') return step;
    const s = { ...step };
    const w = s.word ?? s.correctAnswer ?? s.answer;
    if (w != null && String(w).trim()) {
      s.word = String(w).trim();
    }
    if (!Array.isArray(s.options)) s.options = [];
    return s;
  });
  return out;
}

/** هل JSON من بنك السولو (سلسلة منطقية)؟ */
export function jsonLooksLikeLogicalChain(jsonStr) {
  try {
    const o = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
    const ty = String(o?.type || 'logical_chain').toLowerCase();
    if (ty === 'quiz' || ty === 'spot_diff' || ty === 'spotdiff') return false;
    if (!Array.isArray(o?.steps) || o.steps.length === 0) return false;
    const s = String(o.startWord ?? o.start ?? o.from ?? '').trim();
    const e = String(o.endWord ?? o.end ?? o.to ?? '').trim();
    return s.length > 0 && e.length > 0 && s !== e;
  } catch {
    return false;
  }
}

/** تطبيع سلسلة السولو للتخزين في غرفة الجماعي (مع الإجابات للتحقق على السيرفر). */
export function normalizeLogicalChainForRoom(raw, { puzzleId = null } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const p = normalizeChainPuzzleForClient({ ...raw, type: 'logical_chain' });
  const start = String(p.startWord ?? '').trim();
  const end = String(p.endWord ?? '').trim();
  if (!start || !end || start === end) return null;
  if (!Array.isArray(p.steps) || p.steps.length < 2) return null;

  const steps = [];
  for (let i = 0; i < p.steps.length; i++) {
    const st = p.steps[i];
    if (!st || typeof st !== 'object') return null;
    const word = String(st.word ?? st.correctAnswer ?? st.answer ?? '').trim();
    const opts = Array.isArray(st.options)
      ? st.options.map((o) => String(o ?? '').trim()).filter(Boolean)
      : [];
    if (!word || opts.length !== 4 || !opts.includes(word)) return null;
    const prev = i === 0 ? start : String(steps[i - 1].word ?? '').trim();
    const nextWord =
      i === p.steps.length - 1
        ? end
        : String(
            p.steps[i + 1]?.word ?? p.steps[i + 1]?.correctAnswer ?? p.steps[i + 1]?.answer ?? '',
          ).trim();
    const stepQuestion =
      String(st.stepQuestion ?? '').trim() ||
      `ما الحلقة المنطقية التي تربط "${prev}" بـ "${nextWord}"؟`;
    steps.push({
      stepQuestion,
      word,
      options: opts,
    });
  }

  const out = {
    type: 'logical_chain',
    startWord: start,
    endWord: end,
    steps,
    hint: typeof p.hint === 'string' ? p.hint.trim() : '',
    difficulty: p.difficulty,
  };
  if (puzzleId != null) out.puzzleId = puzzleId;
  if (Array.isArray(p.rationale)) out.rationale = p.rationale;
  return out;
}

/** إخفاء الإجابات الصحيحة قبل إرسال اللغز للعميل. */
export function logicalChainPuzzleForClient(puzzle) {
  if (!puzzle || typeof puzzle !== 'object') return puzzle;
  const copy = { ...puzzle };
  delete copy.correctIndex;
  if (Array.isArray(copy.steps)) {
    copy.steps = copy.steps.map((st) => {
      if (!st || typeof st !== 'object') return st;
      const { word, correctAnswer, answer, ...rest } = st;
      return rest;
    });
  }
  return copy;
}

export function logicalChainQuestionHash(puzzle) {
  const steps = Array.isArray(puzzle?.steps) ? puzzle.steps : [];
  return JSON.stringify({
    t: 'logical_chain',
    s: String(puzzle?.startWord ?? '').trim().toLowerCase(),
    e: String(puzzle?.endWord ?? '').trim().toLowerCase(),
    w: steps.map((x) => String(x?.word ?? '').trim().toLowerCase()).join('|'),
  });
}

export function shuffleLogicalChainStepOptions(puzzle) {
  if (!puzzle || puzzle.type !== 'logical_chain' || !Array.isArray(puzzle.steps)) {
    return puzzle;
  }
  const steps = puzzle.steps.map((st) => {
    if (!st || !Array.isArray(st.options) || st.options.length < 2) return st;
    const opts = st.options.map((o) => String(o));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return { ...st, options: opts };
  });
  return { ...puzzle, steps };
}
