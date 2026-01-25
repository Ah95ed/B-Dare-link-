import 'package:flutter/material.dart';
import 'dart:io';
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

  // Session-persistent set to prevent puzzle repetition across levels
  // This is loaded from SharedPreferences on startup and persisted on updates
  final Set<String> _sessionSeenPuzzleKeys = {};
  static const String _seenPuzzleKeysStorageKey = 'seen_puzzle_keys';

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
  int _timeLimit = 60;
  int get timeLimit => _timeLimit;
  bool _isTimerRunning = false;
  bool get isTimerRunning => _isTimerRunning;

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
  bool _isLevelComplete = false;
  bool get isLevelComplete => _isLevelComplete;

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

  static final Set<String> _bannedMetaWordsAr = {
    'بداية',
    'نهاية',
    'كلمة',
    'خطوة',
    'لغز',
    'سؤال',
    'جواب',
    'إجابة',
    'رابط',
    'سلسلة',
    'مستوى',
    'مرحلة',
  };

  static final Set<String> _bannedMetaWordsEn = {
    'start',
    'end',
    'word',
    'step',
    'puzzle',
    'question',
    'answer',
    'chain',
    'level',
    'stage',
    'new',
  };

  bool _isMetaWord(String w) {
    final word = w.trim();
    if (word.isEmpty) return true;
    final lower = word.toLowerCase();
    return _bannedMetaWordsAr.contains(word) ||
        _bannedMetaWordsEn.contains(lower);
  }

  bool _isValidPuzzle(GamePuzzle p) {
    final start = _isArabic ? p.startWordAr : p.startWordEn;
    final end = _isArabic ? p.endWordAr : p.endWordEn;
    if (_isMetaWord(start) || _isMetaWord(end)) return false;
    if (start.trim() == end.trim()) return false;
    final steps = _isArabic ? p.stepsAr : p.stepsEn;
    if (steps.isEmpty) return false;
    for (final s in steps) {
      if (_isMetaWord(s.word)) return false;
      if (s.options.length != 3) return false;
      if (!s.options.contains(s.word)) return false;
    }
    return true;
  }

  // Persistence
  int _unlockedLevelId = 1;
  int get unlockedLevelId => _unlockedLevelId;

  GameProvider() {
    _loadProgress();
  }

  Future<void> _loadProgress() async {
    final prefs = await SharedPreferences.getInstance();
    _unlockedLevelId = prefs.getInt('unlockedLevelId') ?? 1;

    // Load persisted seen puzzle keys
    final savedKeys = prefs.getStringList(_seenPuzzleKeysStorageKey);
    if (savedKeys != null) {
      _sessionSeenPuzzleKeys.addAll(savedKeys);
    }

    notifyListeners();
  }

  Future<void> _saveSeenPuzzleKeys() async {
    final prefs = await SharedPreferences.getInstance();
    // Keep only the last 500 keys to avoid unlimited storage growth
    final keysToSave = _sessionSeenPuzzleKeys.toList();
    if (keysToSave.length > 500) {
      keysToSave.removeRange(0, keysToSave.length - 500);
    }
    await prefs.setStringList(_seenPuzzleKeysStorageKey, keysToSave);
  }

  Future<void> _saveProgress(
    int levelId, {
    int? completedLevelId,
    int starsEarned = 0,
  }) async {
    if (levelId > _unlockedLevelId) {
      _unlockedLevelId = levelId;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt('unlockedLevelId', _unlockedLevelId);

      if (completedLevelId != null) {
        final key = 'stars_level_$completedLevelId';
        final prev = prefs.getInt(key) ?? 0;
        if (starsEarned > prev) {
          await prefs.setInt(key, starsEarned);
        }
      }

      // Sync with cloud
      if (_authProvider != null && _authProvider!.isAuthenticated) {
        final syncLevel = completedLevelId ?? (levelId - 1);
        final starsToSync = completedLevelId == null
            ? starsEarned
            : (prefs.getInt('stars_level_$completedLevelId') ?? starsEarned);
        await _authProvider!.syncProgress(syncLevel, _score, starsToSync);
      }

      notifyListeners();
    }
  }

  // Game State (Lives/Score)
  int _lives = 3;
  int _score = 0;
  bool _isGameOver = false;

  // Level scoring (simple stars system)
  int _mistakesThisLevel = 0;
  int _puzzlesSolvedThisLevel = 0;

  int get lives => _lives;
  int get score => _score;
  bool get isGameOver => _isGameOver;

  int _timeLimitForLevel(int levelId) {
    // Progressive time limits based on level ranges
    if (levelId <= 10) return 60; // Beginner: 60 seconds
    if (levelId <= 20) return 55; // Early: 55 seconds
    if (levelId <= 30) return 50; // Intermediate: 50 seconds
    if (levelId <= 40) return 45; // Advanced: 45 seconds
    if (levelId <= 50) return 40; // Expert: 40 seconds
    if (levelId <= 75) return 35; // Master: 35 seconds
    return 30; // Legend: 30 seconds
  }

  int _desiredPuzzlesForLevel(int levelId) {
    // Progressive puzzle count based on level ranges
    if (levelId <= 10) return 3; // Beginner: 3 puzzles
    if (levelId <= 30) return 4; // Intermediate: 4 puzzles
    if (levelId <= 50) return 5; // Advanced: 5 puzzles
    return 6; // Expert+: 6 puzzles
  }

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
            "Puzzle #${i + 1}: ${isArabic ? p.startWordAr : p.startWordEn} -> ${isArabic ? p.endWordAr : p.endWordEn} [Steps: ${steps.length}] (id: ${p.puzzleId})",
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
    _isLevelComplete = false;
    _mistakesThisLevel = 0;
    _puzzlesSolvedThisLevel = 0;
    notifyListeners();

    // If level has no puzzles, we must generate them
    if (level.puzzles.isEmpty) {
      debugPrint("Fetching puzzles for Level ${level.id}...");
      List<GamePuzzle> generatedPuzzles = [];
      // Fetch a small number quickly; backend will return cached puzzles when available.
      final int desiredCount = _desiredPuzzlesForLevel(level.id);
      const int maxAttempts = 8; // keep loading fast
      int attempts = 0;
      final seenKeys = _sessionSeenPuzzleKeys; // Use session-persistent set

      while (generatedPuzzles.length < desiredCount && attempts < maxAttempts) {
        final remaining = desiredCount - generatedPuzzles.length;
        final batchSize = remaining >= 3 ? 3 : remaining;
        attempts++;

        final futures = List.generate(
          batchSize,
          (_) => _apiService.generateLevel(isArabic, level.id),
        );

        final results = await Future.wait(futures);
        for (final newLevelData in results) {
          if (newLevelData == null || newLevelData.puzzles.isEmpty) continue;

          final p = newLevelData.puzzles.first;
          if (!_isValidPuzzle(p)) continue;

          final key = (p.puzzleId != null && p.puzzleId!.isNotEmpty)
              ? p.puzzleId!
              : (isArabic
                    ? '${p.startWordAr}|${p.endWordAr}|${p.stepsAr.map((s) => s.word).join(',')}'
                    : '${p.startWordEn}|${p.endWordEn}|${p.stepsEn.map((s) => s.word).join(',')}');

          if (seenKeys.add(key)) {
            generatedPuzzles.add(p);
          }

          if (generatedPuzzles.length >= desiredCount) break;
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

      // Persist seen puzzle keys to prevent repetition after app restart
      _saveSeenPuzzleKeys();
    } else {
      _currentLevel = level;
    }

    _currentPuzzleIndex = 0;
    _loadPuzzle();
    _lives = 3;
    _score = 0;
    _isGameOver = false;
    _errorMessage = null;
    _isLevelComplete = false;
    _timeLimit = _timeLimitForLevel(level.id);

    _isLoading = false;
    notifyListeners();
  }

  void _loadPuzzle() {
    final puzzle = currentPuzzle;
    if (puzzle != null) {
      _errorMessage = null;
      _timeLimit = _timeLimitForLevel(_currentLevel?.id ?? 1);
      _currentRound = GameRound(
        startWord: _isArabic ? puzzle.startWordAr : puzzle.startWordEn,
        endWord: _isArabic ? puzzle.endWordAr : puzzle.endWordEn,
      );
      _startTimer(); // Start timer when puzzle loads
    }
  }

  void decrementLives() {
    if (_lives > 0) {
      _mistakesThisLevel++;
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
      _puzzlesSolvedThisLevel++;
      _currentPuzzleIndex++;
      _loadPuzzle();
      notifyListeners();
    } else {
      // Level Complete
      _puzzlesSolvedThisLevel++;
      incrementScore(500);
      _stopTimer();
      final starsEarned = _calculateStarsForLevel();
      await _saveProgress(
        _currentLevel!.id + 1,
        completedLevelId: _currentLevel!.id,
        starsEarned: starsEarned,
      );
      // Mark completion and move index past the last puzzle so currentPuzzle becomes null.
      _isLevelComplete = true;
      _currentPuzzleIndex = _currentLevel!.puzzles.length;
      _currentRound = null;
      _errorMessage = null;
      notifyListeners();
    }
  }

  int _calculateStarsForLevel() {
    if (_puzzlesSolvedThisLevel <= 0) return 1;
    if (_mistakesThisLevel == 0) return 3;
    if (_mistakesThisLevel <= 2) return 2;
    return 1;
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
    _timeLeft = _timeLimit;
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

    // Auto-advance to avoid getting stuck on the same puzzle after timeout.
    // If the player is out of lives, keep the game over state on the same screen.
    if (_isGameOver) {
      _stopTimer();
      return;
    }

    // Give the user a brief moment to see the timeout message.
    Future.delayed(const Duration(milliseconds: 900), () {
      if (_isGameOver || _isLevelComplete) return;
      advancePuzzle();
    });
  }

  Future<bool> generatePuzzleFromImage(File image, bool isArabic) async {
    _isLoading = true;
    notifyListeners();

    try {
      final puzzle = await _apiService.generatePuzzleFromImage(image, isArabic);
      if (puzzle != null && _isValidPuzzle(puzzle)) {
        // Create a temporary level for this unique puzzle
        final tempPuzzles = [puzzle];
        _currentLevel = GameLevel(
          id: 999,
          puzzles: tempPuzzles,
        ); // ID 999 for custom
        _currentPuzzleIndex = 0;
        _loadPuzzle();
        _lives = 3;
        _score = 0;
        _isGameOver = false;
        _errorMessage = null;
        _isLevelComplete = false;
        _timeLimit = 60; // Standard minute for special puzzle

        _isLoading = false;
        notifyListeners();
        return true;
      }

      _errorMessage = isArabic
          ? "فشل في توليد لغز من الصورة"
          : "Failed to generate puzzle from image";
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  @override
  void dispose() {
    _authProvider = null;
    _timer?.cancel();
    super.dispose();
  }
}
