import 'dart:async';
import 'package:flutter/foundation.dart';

/// Handles competition game logic and state management
class CompetitionGameManager with ChangeNotifier {
  // Puzzle state
  Map<String, dynamic>? _currentPuzzle;
  int _currentPuzzleIndex = 0;
  int _currentStepIndex = 0;
  List<String> _completedSteps = [];

  // Game state
  bool _gameStarted = false;
  bool _gameFinished = false;
  int _score = 0;
  int _puzzlesSolved = 0;

  // Timing
  DateTime? _puzzleEndsAt;
  Timer? _advanceAfterAnswerTimer;

  // Answer state
  int? _selectedAnswerIndex;
  bool? _lastAnswerCorrect;
  int? _correctAnswerIndex;

  // Getters
  Map<String, dynamic>? get currentPuzzle => _currentPuzzle;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  int get currentStepIndex => _currentStepIndex;
  List<String> get completedSteps => _completedSteps;
  bool get gameStarted => _gameStarted;
  bool get gameFinished => _gameFinished;
  int get score => _score;
  int get puzzlesSolved => _puzzlesSolved;
  DateTime? get puzzleEndsAt => _puzzleEndsAt;
  int? get selectedAnswerIndex => _selectedAnswerIndex;
  bool? get lastAnswerCorrect => _lastAnswerCorrect;
  int? get correctAnswerIndex => _correctAnswerIndex;

  /// Initialize puzzle with normalized data
  void initializePuzzle(Map<String, dynamic> puzzle, [int? puzzleIndex]) {
    if (puzzleIndex != null) _currentPuzzleIndex = puzzleIndex;
    _currentStepIndex = 0;
    _completedSteps = [];

    final startWord = puzzle['startWord']?.toString();
    if (startWord != null && startWord.isNotEmpty) {
      _completedSteps.add(startWord);
    }

    _currentPuzzle = puzzle;
    _puzzleEndsAt = null;
    _selectedAnswerIndex = null;
    _lastAnswerCorrect = null;
    _correctAnswerIndex = null;

    notifyListeners();
  }

  /// Submit answer for current step
  Future<void> submitAnswer(String selectedWord) async {
    try {
      _selectedAnswerIndex =
          _currentPuzzle?['steps'][_currentStepIndex]['options'].indexOf(
            selectedWord,
          );

      final correct =
          selectedWord == _currentPuzzle?['steps'][_currentStepIndex]['word'];
      _lastAnswerCorrect = correct;

      if (correct) {
        _completedSteps.add(selectedWord);
        _currentStepIndex++;

        if (_currentStepIndex >= (_currentPuzzle?['steps']?.length ?? 0)) {
          // Puzzle completed
          _puzzlesSolved++;
          _score += 10;
        }
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error submitting answer: $e');
    }
  }

  /// Move to next puzzle
  void moveToNextPuzzle(Map<String, dynamic> nextPuzzle) {
    _currentPuzzleIndex++;
    initializePuzzle(nextPuzzle, _currentPuzzleIndex);
    notifyListeners();
  }

  /// Mark game as finished
  void finishGame() {
    _gameFinished = true;
    _advanceAfterAnswerTimer?.cancel();
    notifyListeners();
  }

  /// Start game
  void startGame() {
    _gameStarted = true;
    _gameFinished = false;
    _score = 0;
    _puzzlesSolved = 0;
    notifyListeners();
  }

  /// Reset game state
  void resetGame() {
    _gameStarted = false;
    _gameFinished = false;
    _currentPuzzleIndex = 0;
    _currentStepIndex = 0;
    _completedSteps = [];
    _score = 0;
    _puzzlesSolved = 0;
    _currentPuzzle = null;
    _selectedAnswerIndex = null;
    _lastAnswerCorrect = null;
    _correctAnswerIndex = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _advanceAfterAnswerTimer?.cancel();
    super.dispose();
  }
}
