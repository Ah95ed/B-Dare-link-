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
