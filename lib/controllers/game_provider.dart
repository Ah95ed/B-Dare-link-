import 'package:flutter/material.dart';
import '../models/game_round.dart';
import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum GameMode { multipleChoice, gridPath, dragDrop, fillBlank }

class GameProvider extends ChangeNotifier {
  final CloudflareApiService _apiService = CloudflareApiService();
  GameRound? _currentRound;
  bool _isLoading = false;
  String? _errorMessage;

  GameRound? get currentRound => _currentRound;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Game Modes
  GameMode _selectedMode = GameMode.multipleChoice;
  GameMode get selectedMode => _selectedMode;

  void setGameMode(GameMode mode) {
    _selectedMode = mode;
    notifyListeners();
  }

  // Level & Puzzle State
  GameLevel? _currentLevel;
  GameLevel? get currentLevel => _currentLevel;

  // Puzzle Tracking
  int _currentPuzzleIndex = 0;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  int get totalPuzzles => _currentLevel?.puzzles.length ?? 0;

  GamePuzzle? get currentPuzzle {
    if (_currentLevel == null ||
        _currentPuzzleIndex >= _currentLevel!.puzzles.length) {
      return null;
    }
    return _currentLevel!.puzzles[_currentPuzzleIndex];
  }

  bool _isArabic = false;

  // Persistence
  int _unlockedLevelId = 1;
  int get unlockedLevelId => _unlockedLevelId;

  GameProvider() {
    _loadProgress();
  }

  Future<void> _loadProgress() async {
    final prefs = await SharedPreferences.getInstance();
    _unlockedLevelId = prefs.getInt('unlockedLevelId') ?? 1;
    notifyListeners();
  }

  Future<void> _saveProgress(int levelId) async {
    if (levelId > _unlockedLevelId) {
      _unlockedLevelId = levelId;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('unlockedLevelId', _unlockedLevelId);
      notifyListeners();
    }
  }

  // Game State (Lives/Score)
  int _lives = 3;
  int _score = 0;
  bool _isGameOver = false;

  int get lives => _lives;
  int get score => _score;
  bool get isGameOver => _isGameOver;

  void startNewGame(String start, String end) {
    // Legacy support or specific mode
    _currentRound = GameRound(startWord: start, endWord: end);
    _currentLevel = null;
    _errorMessage = null;
    notifyListeners();
  }

  Future<void> generateNewLevel(bool isArabic) async {
    _isLoading = true;
    notifyListeners();

    final level = await _apiService.generateLevel(isArabic);
    if (level != null) {
      loadLevel(level, isArabic);
    } else {
      _errorMessage = "Failed to generate level. Check backend connection.";
    }

    _isLoading = false;
    notifyListeners();
  }

  // Debug: Generate 20 puzzles for verification
  Future<void> debugGeneratePuzzles(bool isArabic) async {
    _isLoading = true;
    notifyListeners();

    debugPrint("--- STARTING 20 PUZZLE GENERATION TEST ---");
    for (int i = 0; i < 20; i++) {
      try {
        final level = await _apiService.generateLevel(isArabic);
        if (level != null && level.puzzles.isNotEmpty) {
          final p = level.puzzles.first;
          debugPrint(
            "Puzzle #${i + 1}: ${isArabic ? p.startWordAr : p.startWordEn} -> ${isArabic ? p.endWordAr : p.endWordEn} [Steps: ${isArabic ? p.solutionStepsAr.length : p.solutionStepsEn.length}]",
          );
        } else {
          debugPrint("Puzzle #${i + 1}: FAILED");
        }
      } catch (e) {
        debugPrint("Puzzle #${i + 1}: ERROR - $e");
      }
    }
    debugPrint("--- TEST COMPLETE ---");

    _isLoading = false;
    notifyListeners();
  }

  void loadLevel(GameLevel level, bool isArabic) {
    _currentLevel = level;
    _currentPuzzleIndex = 0;
    _isArabic = isArabic;
    _loadPuzzle();
    _lives = 3;
    _score = 0;
    _isGameOver = false;
    _errorMessage = null;
    notifyListeners();
  }

  void _loadPuzzle() {
    final puzzle = currentPuzzle;
    if (puzzle != null) {
      _currentRound = GameRound(
        startWord: _isArabic ? puzzle.startWordAr : puzzle.startWordEn,
        endWord: _isArabic ? puzzle.endWordAr : puzzle.endWordEn,
      );
    }
  }

  void decrementLives() {
    if (_lives > 0) {
      _lives--;
      if (_lives == 0) {
        _isGameOver = true;
      }
      notifyListeners();
    }
  }

  void incrementScore(int amount) {
    _score += amount;
    notifyListeners();
  }

  Future<void> advancePuzzle() async {
    if (_currentLevel == null) return;

    if (_currentPuzzleIndex < _currentLevel!.puzzles.length - 1) {
      _currentPuzzleIndex++;
      _loadPuzzle();
      notifyListeners();
    } else {
      // Level Complete
      incrementScore(500);
      await _saveProgress(_currentLevel!.id + 1);
      // Reset round to show completion state or just clear it
      _currentRound = null;
      _errorMessage = "Level Complete!";
      notifyListeners();
    }
  }

  // Validates user input
  Future<void> validateChain(List<String> userSteps) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await Future.delayed(const Duration(milliseconds: 500));

      final puzzle = currentPuzzle;
      if (puzzle != null) {
        List<String> solution = _isArabic
            ? puzzle.solutionStepsAr
            : puzzle.solutionStepsEn;

        bool isCorrect = true;
        if (userSteps.length != solution.length) {
          isCorrect = false;
        } else {
          for (int i = 0; i < solution.length; i++) {
            if (userSteps[i].trim().toLowerCase() !=
                solution[i].toLowerCase()) {
              isCorrect = false;
              break;
            }
          }
        }

        if (!isCorrect) {
          _errorMessage = _isArabic ? "الإجابة غير صحيحة" : "Incorrect Answer";
          decrementLives();
          _isLoading = false;
          notifyListeners();
          return;
        } else {
          // Correct Chain
          incrementScore(50);
          await advancePuzzle(); // Using await to ensure UI updates after logic
        }
      } else {
        // Free play mode logic fallbacks if needed, or error
      }
    } catch (e) {
      _errorMessage = "Error validating link";
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Simple local check
  bool checkStep(String step, int stepIndex, bool isArabic) {
    final puzzle = currentPuzzle;
    if (puzzle == null) return false;
    List<String> solution = isArabic
        ? puzzle.solutionStepsAr
        : puzzle.solutionStepsEn;
    if (stepIndex < 0 || stepIndex >= solution.length) return false;
    return solution[stepIndex] == step;
  }

  void resetGame() {
    _currentRound = null;
    _errorMessage = null;
    notifyListeners();
  }
}
