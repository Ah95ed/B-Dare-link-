import '../constants/app_constants.dart';

/// Encapsulates game state variables for cleaner management
class GameState {
  // Game Configuration
  bool isLoading = false;
  bool isGameOver = false;
  bool isLevelComplete = false;
  bool requiresAuthToAdvance = false;
  bool isTimerRunning = false;
  bool isArabic = false;
  bool restoreInProgress = false;

  // Game Progress
  int lives = AppConstants.initialLives;
  int score = 0;
  int timeLeft = AppConstants.beginnerTimeLimit;
  int timeLimit = AppConstants.beginnerTimeLimit;
  int currentPuzzleIndex = 0;
  int unlockedLevelId = 1;
  int mistakesThisLevel = 0;
  int puzzlesSolvedThisLevel = 0;
  int? lastSyncedUserId;

  // Error Handling
  String? errorMessage;

  /// Reset level-specific state
  void resetLevelState() {
    score = 0;
    lives = AppConstants.initialLives;
    timeLeft = timeLimit;
    currentPuzzleIndex = 0;
    mistakesThisLevel = 0;
    puzzlesSolvedThisLevel = 0;
    isGameOver = false;
    isLevelComplete = false;
    errorMessage = null;
  }

  /// Reset all game state
  void resetGameState() {
    resetLevelState();
    isLoading = false;
    requiresAuthToAdvance = false;
    isTimerRunning = false;
  }

  /// Create a copy of the state
  GameState copy() {
    return GameState()
      ..isLoading = isLoading
      ..isGameOver = isGameOver
      ..isLevelComplete = isLevelComplete
      ..requiresAuthToAdvance = requiresAuthToAdvance
      ..isTimerRunning = isTimerRunning
      ..isArabic = isArabic
      ..restoreInProgress = restoreInProgress
      ..lives = lives
      ..score = score
      ..timeLeft = timeLeft
      ..timeLimit = timeLimit
      ..currentPuzzleIndex = currentPuzzleIndex
      ..unlockedLevelId = unlockedLevelId
      ..mistakesThisLevel = mistakesThisLevel
      ..puzzlesSolvedThisLevel = puzzlesSolvedThisLevel
      ..lastSyncedUserId = lastSyncedUserId
      ..errorMessage = errorMessage;
  }
}
