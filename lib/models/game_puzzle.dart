class GamePuzzle {
  final String startWordAr;
  final String endWordAr;
  final String startWordEn;
  final String endWordEn;
  final List<String> solutionStepsAr;
  final List<String> solutionStepsEn;

  const GamePuzzle({
    required this.startWordAr,
    required this.endWordAr,
    required this.startWordEn,
    required this.endWordEn,
    required this.solutionStepsAr,
    required this.solutionStepsEn,
  });
}
