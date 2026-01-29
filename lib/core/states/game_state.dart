/// Enum for different game modes
enum GameMode { multipleChoice, gridPath, dragDrop, fillBlank }

/// Sealed class for game states following OOP best practices
sealed class GameState {
  const GameState();
}

/// Initial state when app first loads
class GameStateInitial extends GameState {
  const GameStateInitial();
}

/// Loading state during puzzle generation
class GameStateLoading extends GameState {
  const GameStateLoading();
}

/// Active game state with puzzle loaded
class GameStateActive extends GameState {
  final int currentLevel;
  final int currentPuzzleIndex;
  final int lives;
  final int score;
  final int timeLeft;

  const GameStateActive({
    required this.currentLevel,
    required this.currentPuzzleIndex,
    required this.lives,
    required this.score,
    required this.timeLeft,
  });
}

/// Level completed state
class GameStateLevelComplete extends GameState {
  final int level;
  final int starsEarned;
  final int finalScore;

  const GameStateLevelComplete({
    required this.level,
    required this.starsEarned,
    required this.finalScore,
  });
}

/// Game over state (lives exhausted)
class GameStateGameOver extends GameState {
  final int finalScore;
  final int level;

  const GameStateGameOver({required this.finalScore, required this.level});
}

/// Error state with error message
class GameStateError extends GameState {
  final String message;
  final Exception? exception;

  const GameStateError(this.message, [this.exception]);
}
