import 'package:flutter/material.dart';
import 'dart:async'; // Added for Timer
import '../models/game_round.dart';
import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_provider.dart';

enum GameMode { multipleChoice, gridPath, dragDrop, fillBlank }

class GameProvider extends ChangeNotifier {
  final CloudflareApiService _apiService = CloudflareApiService();
  AuthProvider? _authProvider;

  void updateAuthProvider(AuthProvider auth) {
    _authProvider = auth;
    // Load progress from cloud if logged in
    if (auth.isAuthenticated) {
      // We might want to merge or overwrite local progress
      // For now, let's just fetch cloud progress
    }
  }

  GameRound? _currentRound;
  bool _isLoading = false;
  String? _errorMessage;

  // Timer State
  int _timeLeft = 60;
  int get timeLeft => _timeLeft;
  bool _isTimerRunning = false;
  // We need to import dart:async for Timer, but I'll assume it's available or add import if needed.
  // Actually, I should check imports first. 'dart:async' is often auto-imported or core, but better safe.

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

      // Sync with cloud
      if (_authProvider != null && _authProvider!.isAuthenticated) {
        await _authProvider!.syncProgress(
          _unlockedLevelId,
          _score,
          0,
        ); // stars not yet tracked
      }

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

    // Use unlockedLevelId as default for generic generation
    final level = await _apiService.generateLevel(isArabic, _unlockedLevelId);
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
        // Just using level 1 for debug
        final level = await _apiService.generateLevel(isArabic, 1);
        if (level != null && level.puzzles.isNotEmpty) {
          final p = level.puzzles.first;
          final steps = isArabic ? p.stepsAr : p.stepsEn;
          debugPrint(
            "Puzzle #${i + 1}: ${isArabic ? p.startWordAr : p.startWordEn} -> ${isArabic ? p.endWordAr : p.endWordEn} [Steps: ${steps.length}]",
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

  Future<void> loadLevel(GameLevel level, bool isArabic) async {
    _isLoading = true;
    _isArabic = isArabic;
    notifyListeners();

    // If level has no puzzles, we must generate them
    if (level.puzzles.isEmpty) {
      debugPrint("Fetching puzzles for Level ${level.id}...");
      List<GamePuzzle> generatedPuzzles = [];
      // Generate 5 puzzles for the level
      for (int i = 0; i < 5; i++) {
        final newLevelData = await _apiService.generateLevel(
          isArabic,
          level.id,
        );
        if (newLevelData != null && newLevelData.puzzles.isNotEmpty) {
          generatedPuzzles.add(newLevelData.puzzles.first);
        }
      }

      if (generatedPuzzles.isEmpty) {
        _errorMessage = "Failed to load level data.";
        _isLoading = false;
        notifyListeners();
        return;
      }

      // Update the level with new puzzles
      _currentLevel = GameLevel(id: level.id, puzzles: generatedPuzzles);
    } else {
      _currentLevel = level;
    }

    _currentPuzzleIndex = 0;
    _loadPuzzle();
    _lives = 3;
    _score = 0;
    _isGameOver = false;
    _errorMessage = null;

    _isLoading = false;
    notifyListeners();
  }

  void _loadPuzzle() {
    final puzzle = currentPuzzle;
    if (puzzle != null) {
      _currentRound = GameRound(
        startWord: _isArabic ? puzzle.startWordAr : puzzle.startWordEn,
        endWord: _isArabic ? puzzle.endWordAr : puzzle.endWordEn,
      );
      _startTimer(); // Start timer when puzzle loads
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
      _stopTimer();
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
        final steps = _isArabic ? puzzle.stepsAr : puzzle.stepsEn;

        bool isCorrect = true;
        if (userSteps.length != steps.length) {
          isCorrect = false;
        } else {
          for (int i = 0; i < steps.length; i++) {
            if (userSteps[i].trim().toLowerCase() !=
                steps[i].word.toLowerCase()) {
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
          incrementScore(1);
          await advancePuzzle(); // Using await to ensure UI updates after logic
        }
      } else {
        // Free play mode logic fallbacks if needed, or error
      }
    } catch (e) {
      _errorMessage = "Error validating link";
    } finally {
      if (currentPuzzle == null) {
        _stopTimer();
      } else {
        // Restart timer? Or continue? Usually continuous pressure is good, or reset on wrong attempt.
        // Let's keep it running unless completed.
        // However, if advancePuzzle was called, timer is handled there (restarts for next).
      }
      _isLoading = false;
      notifyListeners();
    }
  }

  // Simple local check
  bool checkStep(String stepWord, int stepIndex, bool isArabic) {
    final puzzle = currentPuzzle;
    if (puzzle == null) return false;

    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;

    if (stepIndex < 0 || stepIndex >= steps.length) return false;
    return steps[stepIndex].word == stepWord;
  }

  void resetGame() {
    _currentRound = null;
    _errorMessage = null;
    notifyListeners();
  }

  Timer? _timer;

  void _startTimer() {
    _timer?.cancel();
    _timeLeft = 60; // 60 seconds per puzzle
    _isTimerRunning = true;
    notifyListeners();

    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 0) {
        _timeLeft--;
        notifyListeners();
      } else {
        _timer?.cancel();
        _isTimerRunning = false;
        _handleTimeout();
      }
    });
  }

  void _stopTimer() {
    _timer?.cancel();
    _isTimerRunning = false;
  }

  void _handleTimeout() {
    decrementLives();
    _errorMessage = _isArabic ? "انتهى الوقت!" : "Time's Up!";
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
