class GameRound {
  final String startWord;
  final String endWord;
  final List<String> steps;
  final bool isCompleted;

  GameRound({
    required this.startWord,
    required this.endWord,
    this.steps = const [],
    this.isCompleted = false,
  });

  GameRound copyWith({
    String? startWord,
    String? endWord,
    List<String>? steps,
    bool? isCompleted,
  }) {
    return GameRound(
      startWord: startWord ?? this.startWord,
      endWord: endWord ?? this.endWord,
      steps: steps ?? this.steps,
      isCompleted: isCompleted ?? this.isCompleted,
    );
  }
}
