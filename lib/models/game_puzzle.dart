class GamePuzzle {
  final String startWordAr;
  final String endWordAr;
  final List<PuzzleStep> stepsAr;

  final String startWordEn;
  final String endWordEn;
  final List<PuzzleStep> stepsEn;

  final String hintAr;
  final String hintEn;

  GamePuzzle({
    required this.startWordAr,
    required this.endWordAr,
    required this.stepsAr,
    required this.startWordEn,
    required this.endWordEn,
    required this.stepsEn,
    this.hintAr = "",
    this.hintEn = "",
  });
}

class PuzzleStep {
  final String word;
  final List<String> options;

  PuzzleStep({required this.word, required this.options});

  // Helper for simple string list compatibility if needed
  static PuzzleStep fromSimple(String word) =>
      PuzzleStep(word: word, options: []);
}
