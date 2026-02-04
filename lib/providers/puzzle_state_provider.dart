import 'package:flutter/foundation.dart';

/// PuzzleStateProvider - Manages puzzle state independently
/// This is the core game logic provider that only emits notifications
/// when puzzle/score state changes, not for chat or participant updates
class PuzzleStateProvider with ChangeNotifier {
  // Puzzle state
  Map<String, dynamic>? _currentPuzzle;
  int _currentPuzzleIndex = 0;
  int _currentStepIndex = 0;
  List<String> _completedSteps = [];

  // Game progress
  int _score = 0;
  int _puzzlesSolved = 0;
  int _totalPuzzles = 5;

  // Timing
  DateTime? _puzzleStartTime;
  DateTime? _puzzleEndsAt;
  int _timePerPuzzleSeconds = 30;

  // Answer state
  int? _selectedAnswerIndex;
  bool? _lastAnswerCorrect;
  int? _correctAnswerIndex;

  // Game flow
  bool _gameStarted = false;
  bool _gameFinished = false;
  bool _isAdvancingToNextPuzzle = false;

  // Getters
  Map<String, dynamic>? get currentPuzzle => _currentPuzzle;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  int get currentStepIndex => _currentStepIndex;
  List<String> get completedSteps => _completedSteps;

  int get score => _score;
  int get puzzlesSolved => _puzzlesSolved;
  int get totalPuzzles => _totalPuzzles;

  DateTime? get puzzleStartTime => _puzzleStartTime;
  DateTime? get puzzleEndsAt => _puzzleEndsAt;
  int get timePerPuzzleSeconds => _timePerPuzzleSeconds;

  int? get selectedAnswerIndex => _selectedAnswerIndex;
  bool? get lastAnswerCorrect => _lastAnswerCorrect;
  int? get correctAnswerIndex => _correctAnswerIndex;

  bool get gameStarted => _gameStarted;
  bool get gameFinished => _gameFinished;
  bool get isAdvancingToNextPuzzle => _isAdvancingToNextPuzzle;

  /// Set next puzzle from payload
  void setNextPuzzle({required Map<String, dynamic> puzzle, int? puzzleIndex}) {
    if (puzzleIndex != null) _currentPuzzleIndex = puzzleIndex;
    _currentStepIndex = 0;
    _completedSteps = [];

    final startWord = puzzle['startWord']?.toString();
    if (startWord != null && startWord.isNotEmpty) {
      _completedSteps.add(startWord);
    }

    _currentPuzzle = _normalizePuzzle(Map<String, dynamic>.from(puzzle));
    _puzzleStartTime = DateTime.now();
    _puzzleEndsAt = null;

    // Reset answer state
    _selectedAnswerIndex = null;
    _lastAnswerCorrect = null;
    _correctAnswerIndex = null;

    notifyListeners();
  }

  /// Update game state from initialization
  void initializeGame({
    required Map<String, dynamic> gameState,
    required int totalPuzzles,
  }) {
    _totalPuzzles = totalPuzzles;
    _score = (gameState['score'] as num?)?.toInt() ?? 0;
    _puzzlesSolved = (gameState['puzzles_solved'] as num?)?.toInt() ?? 0;
    _currentPuzzleIndex =
        (gameState['current_puzzle_index'] as num?)?.toInt() ?? 0;
    _timePerPuzzleSeconds =
        (gameState['time_per_puzzle'] as num?)?.toInt() ?? 30;
    _gameStarted = gameState['status']?.toString() == 'active';

    notifyListeners();
  }

  /// Start the game
  void startGame() {
    _gameStarted = true;
    _gameFinished = false;
    notifyListeners();
  }

  /// End the game
  void endGame() {
    _gameFinished = true;
    _gameStarted = false;
    notifyListeners();
  }

  /// Update score (call only when answer is correct)
  void addScore(int points) {
    _score += points;
    _puzzlesSolved++;
    notifyListeners();
  }

  /// Update selected answer
  void setSelectedAnswer(int answerIndex) {
    _selectedAnswerIndex = answerIndex;
    notifyListeners();
  }

  /// Update answer result
  void setAnswerResult({required bool isCorrect, required int? correctIndex}) {
    _lastAnswerCorrect = isCorrect;
    _correctAnswerIndex = correctIndex;
    notifyListeners();
  }

  /// Schedule advance to next puzzle
  void scheduleAdvanceToNextPuzzle() {
    _isAdvancingToNextPuzzle = true;
    notifyListeners();
  }

  /// Complete advance to next puzzle
  void completeAdvanceToNextPuzzle() {
    _isAdvancingToNextPuzzle = false;
    notifyListeners();
  }

  /// Add step to Wonder Link puzzle
  void addStep(String step) {
    if (!_completedSteps.contains(step)) {
      _completedSteps.add(step);
      notifyListeners();
    }
  }

  /// Set current step index
  void setCurrentStepIndex(int index) {
    _currentStepIndex = index;
    notifyListeners();
  }

  /// Normalize puzzle for display
  Map<String, dynamic> _normalizePuzzle(Map<String, dynamic> puzzle) {
    final normalized = Map<String, dynamic>.from(puzzle);
    normalized['question'] = normalized['question'] ?? 'سؤال غير متوفر';
    normalized['options'] = (normalized['options'] as List?) ?? <dynamic>[];
    normalized['type'] = normalized['type'] ?? 'quiz';
    return normalized;
  }

  /// Reset puzzle state
  void reset() {
    _currentPuzzle = null;
    _currentPuzzleIndex = 0;
    _currentStepIndex = 0;
    _completedSteps = [];
    _score = 0;
    _puzzlesSolved = 0;
    _selectedAnswerIndex = null;
    _lastAnswerCorrect = null;
    _correctAnswerIndex = null;
    _gameStarted = false;
    _gameFinished = false;
    _isAdvancingToNextPuzzle = false;
    notifyListeners();
  }
}
