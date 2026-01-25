class GamePuzzle {
  final String startWordAr;
  final String endWordAr;
  final List<PuzzleStep> stepsAr;
  final String? puzzleId;

  final String startWordEn;
  final String endWordEn;
  final List<PuzzleStep> stepsEn;

  final String hintAr;
  final String hintEn;

  GamePuzzle({
    this.puzzleId,
    required this.startWordAr,
    required this.endWordAr,
    required this.stepsAr,
    required this.startWordEn,
    required this.endWordEn,
    required this.stepsEn,
    this.hintAr = "",
    this.hintEn = "",
  });

  factory GamePuzzle.fromJson(Map<String, dynamic> json) {
    return GamePuzzle(
      puzzleId: json['puzzleId']?.toString(),
      startWordAr:
          json['startWordAr'] ??
          json['startWord'] ??
          '', // Fallback to startWord if Ar specific not present
      endWordAr: json['endWordAr'] ?? json['endWord'] ?? '',
      stepsAr:
          (json['stepsAr'] ?? json['steps'] as List?)
              ?.map((s) => PuzzleStep.fromJson(s))
              .toList() ??
          [],
      startWordEn: json['startWordEn'] ?? json['startWord'] ?? '',
      endWordEn: json['endWordEn'] ?? json['endWord'] ?? '',
      stepsEn:
          (json['stepsEn'] ?? json['steps'] as List?)
              ?.map((s) => PuzzleStep.fromJson(s))
              .toList() ??
          [],
      hintAr: json['hintAr'] ?? json['hint'] ?? '',
      hintEn: json['hintEn'] ?? json['hint'] ?? '',
    );
  }
}

class PuzzleStep {
  final String word;
  final List<String> options;

  PuzzleStep({required this.word, required this.options});

  // Helper for simple string list compatibility if needed
  static PuzzleStep fromSimple(String word) =>
      PuzzleStep(word: word, options: []);

  factory PuzzleStep.fromJson(Map<String, dynamic> json) {
    return PuzzleStep(
      word: json['word'] ?? '',
      options: List<String>.from(json['options'] ?? []),
    );
  }
}
