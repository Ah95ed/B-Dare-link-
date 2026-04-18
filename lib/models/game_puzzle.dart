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

  final String? type;
  final String? difficulty;
  final String? riddleTextAr;
  final String? riddleTextEn;
  final List<String>? pathOptions;
  final int? correctPathIndex;

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
    this.type,
    this.difficulty,
    this.riddleTextAr,
    this.riddleTextEn,
    this.pathOptions,
    this.correctPathIndex,
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
      type: json['type']?.toString(),
      difficulty: json['difficulty']?.toString(),
      riddleTextAr: json['riddleTextAr'] ?? json['riddleText']?.toString(),
      riddleTextEn: json['riddleTextEn'] ?? json['riddleText']?.toString(),
      pathOptions: (json['pathOptions'] as List?)
          ?.map((e) => e.toString())
          .where((e) => e.trim().isNotEmpty)
          .toList(),
      correctPathIndex: json['correctPathIndex'] is int
          ? json['correctPathIndex'] as int
          : int.tryParse(json['correctPathIndex']?.toString() ?? ''),
    );
  }
}

class PuzzleStep {
  final String word;
  final List<String> options;
  final String? stepQuestion;

  PuzzleStep({required this.word, required this.options, this.stepQuestion});

  // Helper for simple string list compatibility if needed
  static PuzzleStep fromSimple(String word) =>
      PuzzleStep(word: word, options: []);

  factory PuzzleStep.fromJson(Map<String, dynamic> json) {
    final raw =
        json['word']?.toString() ??
        json['correctAnswer']?.toString() ??
        json['answer']?.toString() ??
        '';
    final word = raw.trim();
    return PuzzleStep(
      word: word,
      options: List<String>.from(
        (json['options'] as List?)?.map((o) => o.toString()) ?? const [],
      ),
      stepQuestion: json['stepQuestion']?.toString(),
    );
  }
}
