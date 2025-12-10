import '../models/game_level.dart';
import '../models/game_puzzle.dart';

class LevelData {
  static final List<GameLevel> levels = List.generate(10, (levelIndex) {
    return GameLevel(
      id: levelIndex + 1,
      puzzles: List.generate(5, (puzzleIndex) {
        return _generatePuzzle(levelIndex, puzzleIndex);
      }),
    );
  });

  static GamePuzzle _generatePuzzle(int levelIndex, int puzzleIndex) {
    // Sample Data Bank
    final samples = [
      _PuzzleParams("ماء", "ثلج", ["تبريد"], "Water", "Ice", ["Freeze"]),
      _PuzzleParams("شمس", "نور", ["اشعاع"], "Sun", "Light", ["Radiation"]),
      _PuzzleParams("نملة", "مستعمرة", ["عمل"], "Ant", "Colony", ["Work"]),
      _PuzzleParams(
        "بذرة",
        "شجرة",
        ["ماء", "تراب"],
        "Seed",
        "Tree",
        ["Water", "Soil"],
      ),
      _PuzzleParams("ليل", "نهار", ["فجر"], "Night", "Day", ["Dawn"]),
    ];

    // Pick based on indices to look deterministic
    final sample = samples[(levelIndex * 5 + puzzleIndex) % samples.length];

    return GamePuzzle(
      startWordAr: sample.startAr,
      endWordAr: sample.endAr,
      startWordEn: sample.startEn,
      endWordEn: sample.endEn,
      solutionStepsAr: sample.stepsAr,
      solutionStepsEn: sample.stepsEn,
    );
  }
}

class _PuzzleParams {
  final String startAr, endAr;
  final List<String> stepsAr;
  final String startEn, endEn;
  final List<String> stepsEn;

  _PuzzleParams(
    this.startAr,
    this.endAr,
    this.stepsAr,
    this.startEn,
    this.endEn,
    this.stepsEn,
  );
}
