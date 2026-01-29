import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:async';
import '../models/game_round.dart';
import '../models/game_level.dart';
import '../models/game_puzzle.dart';
import '../services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../providers/auth_provider.dart';
import '../constants/app_constants.dart';
import '../constants/app_strings.dart';

export '../core/states/game_state.dart';

/// Enum for different game modes
enum GameMode { multipleChoice, gridPath, dragDrop, fillBlank }

/// Provider for managing game state and operations
/// Follows Single Responsibility and Clean Code principles
class GameProvider extends ChangeNotifier {
  final CloudflareApiService _apiService;

  // Dependencies
  AuthProvider? _authProvider;

  // State Variables
  GameRound? _currentRound;
  GameLevel? _currentLevel;
  Timer? _timer;

  // Game Configuration
  bool _isLoading = false;
  bool _isGameOver = false;
  bool _isLevelComplete = false;
  bool _requiresAuthToAdvance = false;
  bool _isTimerRunning = false;
  bool _isArabic = false;
  bool _restoreInProgress = false;

  // Game Progress
  int _lives = AppConstants.initialLives;
  int _score = 0;
  int _timeLeft = AppConstants.beginnerTimeLimit;
  int _timeLimit = AppConstants.beginnerTimeLimit;
  int _currentPuzzleIndex = 0;
  int _unlockedLevelId = 1;
  int _mistakesThisLevel = 0;
  int _puzzlesSolvedThisLevel = 0;
  int? _lastSyncedUserId;

  // Error Handling
  String? _errorMessage;

  // Game Mode
  GameMode _selectedMode = GameMode.multipleChoice;

  // Puzzle Deduplication
  final Set<String> _sessionSeenPuzzleKeys = {};
  static const String _seenPuzzleKeysStorageKey = 'seen_puzzle_keys';

  // Banned words for validation
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

  // ============ Getters ============

  GameRound? get currentRound => _currentRound;
  GameLevel? get currentLevel => _currentLevel;
  bool get isLoading => _isLoading;
  bool get isGameOver => _isGameOver;
  bool get isLevelComplete => _isLevelComplete;
  bool get requiresAuthToAdvance => _requiresAuthToAdvance;
  bool get isTimerRunning => _isTimerRunning;
  String? get errorMessage => _errorMessage;
  GameMode get selectedMode => _selectedMode;
  int get lives => _lives;
  int get score => _score;
  int get timeLeft => _timeLeft;
  int get timeLimit => _timeLimit;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  int get totalPuzzles => _currentLevel?.puzzles.length ?? 0;
  int get unlockedLevelId => _unlockedLevelId;

  GamePuzzle? get currentPuzzle {
    if (_currentLevel == null ||
        _currentPuzzleIndex >= _currentLevel!.puzzles.length) {
      return null;
    }
    return _currentLevel!.puzzles[_currentPuzzleIndex];
  }

  // ============ Constructor ============

  GameProvider({CloudflareApiService? apiService})
    : _apiService = apiService ?? CloudflareApiService() {
    _loadProgress();
  }

  // ============ Initialization ============

  /// Update auth provider for cloud sync
  void updateAuthProvider(AuthProvider auth) {
    _authProvider = auth;
    if (auth.isAuthenticated && auth.userId != null) {
      if (_lastSyncedUserId != auth.userId) {
        _lastSyncedUserId = auth.userId;
        _restoreProgressFromServer(auth);
      }
    }
  }

  /// Load game progress from local storage
  Future<void> _loadProgress() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _unlockedLevelId = prefs.getInt('unlockedLevelId') ?? 1;

      final savedKeys = prefs.getStringList(_seenPuzzleKeysStorageKey);
      if (savedKeys != null) {
        _sessionSeenPuzzleKeys.addAll(savedKeys);
      }
    } catch (e) {
      debugPrint('Error loading progress: $e');
    }
    notifyListeners();
  }

  /// Restore progress from server
  Future<void> _restoreProgressFromServer(AuthProvider auth) async {
    if (_restoreInProgress) return;
    _restoreInProgress = true;

    try {
      final progress = await auth.fetchProgress();
      if (progress.isEmpty) return;

      int maxLevel = _unlockedLevelId;
      final prefs = await SharedPreferences.getInstance();

      for (final item in progress) {
        if (item is! Map) continue;

        final level = _parseIntValue(item['level']);
        final stars = _parseIntValue(item['stars']);

        if (level != null && level > maxLevel) {
          maxLevel = level;

          if (stars != null) {
            final completedLevel = level > 1 ? level - 1 : level;
            final key = 'stars_level_$completedLevel';
            final prev = prefs.getInt(key) ?? 0;
            if (stars > prev) {
              await prefs.setInt(key, stars);
            }
          }
        }
      }

      if (maxLevel > _unlockedLevelId) {
        _unlockedLevelId = maxLevel;
        await prefs.setInt('unlockedLevelId', _unlockedLevelId);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('${AppStrings.failedToRestoreProgress}: $e');
    } finally {
      _restoreInProgress = false;
    }
  }

  // ============ Game Mode ============

  /// Set the current game mode
  void setGameMode(GameMode mode) {
    if (_selectedMode != mode) {
      _selectedMode = mode;
      notifyListeners();
    }
  }

  // ============ Level Loading ============

  /// Start a new game with specific words
  void startNewGame(String start, String end) {
    _currentRound = GameRound(startWord: start, endWord: end);
    _currentLevel = null;
    _errorMessage = null;
    notifyListeners();
  }

  /// Generate a new level
  Future<void> generateNewLevel(bool isArabic) async {
    _setLoading(true);
    try {
      final level = await _apiService.generateLevel(isArabic, _unlockedLevelId);
      if (level != null) {
        await loadLevel(level, isArabic);
      } else {
        _errorMessage = AppStrings.failedToGenerateLevel;
      }
    } catch (e) {
      _errorMessage = 'Error: $e';
    } finally {
      _setLoading(false);
    }
  }

  /// Load a level and prepare puzzles
  Future<void> loadLevel(GameLevel level, bool isArabic) async {
    _setLoading(true);
    _isArabic = isArabic;
    _resetLevelState();

    try {
      if (level.puzzles.isEmpty) {
        final puzzles = await _generatePuzzles(level.id, isArabic);
        if (puzzles.isEmpty) {
          _errorMessage = AppStrings.failedToLoadLevelData;
          return;
        }
        _currentLevel = GameLevel(id: level.id, puzzles: puzzles);
        await _saveSeenPuzzleKeys();
      } else {
        _currentLevel = level;
      }

      _currentPuzzleIndex = 0;
      _loadPuzzle();
      _resetGameState();
    } catch (e) {
      _errorMessage = 'Error loading level: $e';
    } finally {
      _setLoading(false);
    }
  }

  // ============ Puzzle Management ============

  /// Load the current puzzle
  void _loadPuzzle() {
    final puzzle = currentPuzzle;
    if (puzzle != null) {
      _errorMessage = null;
      _timeLimit = _timeLimitForLevel(_currentLevel?.id ?? 1);
      _currentRound = GameRound(
        startWord: _isArabic ? puzzle.startWordAr : puzzle.startWordEn,
        endWord: _isArabic ? puzzle.endWordAr : puzzle.endWordEn,
      );
      _startTimer();
    }
  }

  /// Generate puzzles for a level
  Future<List<GamePuzzle>> _generatePuzzles(int levelId, bool isArabic) async {
    final puzzles = <GamePuzzle>[];
    final desiredCount = _desiredPuzzlesForLevel(levelId);
    int attempts = 0;

    while (puzzles.length < desiredCount &&
        attempts < AppConstants.maxGenerationAttempts) {
      attempts++;
      final remaining = desiredCount - puzzles.length;
      final batchSize = remaining >= AppConstants.maxBatchSize
          ? AppConstants.maxBatchSize
          : remaining;

      try {
        final futures = List.generate(
          batchSize,
          (_) => _apiService.generateLevel(isArabic, levelId),
        );

        final results = await Future.wait(futures);
        for (final levelData in results) {
          if (levelData?.puzzles.isEmpty ?? true) continue;

          final puzzle = levelData!.puzzles.first;
          if (!_isValidPuzzle(puzzle)) continue;

          final key = _generatePuzzleKey(puzzle, isArabic);
          if (_sessionSeenPuzzleKeys.add(key)) {
            puzzles.add(puzzle);
          }

          if (puzzles.length >= desiredCount) break;
        }
      } catch (e) {
        debugPrint('Error generating puzzle batch: $e');
      }
    }

    return puzzles;
  }

  /// Generate a puzzle key for deduplication
  String _generatePuzzleKey(GamePuzzle puzzle, bool isArabic) {
    if (puzzle.puzzleId != null && puzzle.puzzleId!.isNotEmpty) {
      return puzzle.puzzleId!;
    }

    if (isArabic) {
      final steps = puzzle.stepsAr.map((s) => s.word).join(',');
      return '${puzzle.startWordAr}|${puzzle.endWordAr}|$steps';
    } else {
      final steps = puzzle.stepsEn.map((s) => s.word).join(',');
      return '${puzzle.startWordEn}|${puzzle.endWordEn}|$steps';
    }
  }

  // ============ Puzzle Validation ============

  /// Check if a puzzle is valid
  bool _isValidPuzzle(GamePuzzle puzzle) {
    final start = _isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final end = _isArabic ? puzzle.endWordAr : puzzle.endWordEn;

    if (_isMetaWord(start) || _isMetaWord(end)) return false;
    if (start.trim() == end.trim()) return false;

    final steps = _isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    if (steps.isEmpty) return false;

    for (final step in steps) {
      if (_isMetaWord(step.word)) return false;
      if (step.options.length != 3) return false;
      if (!step.options.contains(step.word)) return false;
    }

    return true;
  }

  /// Check if a word is a banned meta word
  bool _isMetaWord(String word) {
    final trimmed = word.trim();
    if (trimmed.isEmpty) return true;

    return _bannedMetaWordsAr.contains(trimmed) ||
        _bannedMetaWordsEn.contains(trimmed.toLowerCase());
  }

  /// Validate user's answer chain
  Future<void> validateChain(List<String> userSteps) async {
    _setLoading(true);
    _errorMessage = null;

    try {
      await Future.delayed(AppConstants.debounceDelay);

      final puzzle = currentPuzzle;
      if (puzzle == null) return;

      final steps = _isArabic ? puzzle.stepsAr : puzzle.stepsEn;

      if (!_isChainCorrect(userSteps, steps)) {
        _errorMessage = _isArabic
            ? AppStrings.incorrectAnswerAr
            : AppStrings.incorrectAnswer;
        decrementLives();
        return;
      }

      incrementScore(AppConstants.stepScore);
      await advancePuzzle();
    } catch (e) {
      _errorMessage = AppStrings.failedToValidateLink;
    } finally {
      if (currentPuzzle == null) {
        _stopTimer();
      }
      _setLoading(false);
    }
  }

  /// Check if user's chain is correct
  bool _isChainCorrect(List<String> userSteps, List<dynamic> steps) {
    if (userSteps.length != steps.length) return false;

    for (int i = 0; i < steps.length; i++) {
      if (userSteps[i].trim().toLowerCase() != steps[i].word.toLowerCase()) {
        return false;
      }
    }

    return true;
  }

  /// Check a single step
  bool checkStep(String stepWord, int stepIndex, bool isArabic) {
    final puzzle = currentPuzzle;
    if (puzzle == null) return false;

    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    if (stepIndex < 0 || stepIndex >= steps.length) return false;

    return steps[stepIndex].word == stepWord;
  }

  // ============ Game Actions ============

  /// Decrement lives
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

  /// Increment score
  void incrementScore(int amount) {
    _score += amount;
    notifyListeners();
  }

  /// Advance to next puzzle
  Future<void> advancePuzzle() async {
    if (_currentLevel == null) return;

    if (_currentPuzzleIndex < _currentLevel!.puzzles.length - 1) {
      _puzzlesSolvedThisLevel++;
      _currentPuzzleIndex++;
      _loadPuzzle();
      notifyListeners();
    } else {
      await _completeLevel();
    }
  }

  /// Complete current level
  Future<void> _completeLevel() async {
    _puzzlesSolvedThisLevel++;
    incrementScore(AppConstants.levelBaseScore);
    _stopTimer();

    final starsEarned = _calculateStarsForLevel();
    final requiresAuth =
        (_currentLevel!.id >= AppConstants.authRequiredLevel) &&
        !(_authProvider?.isAuthenticated ?? false);

    _requiresAuthToAdvance = requiresAuth;

    if (!requiresAuth) {
      await _saveProgress(
        _currentLevel!.id + 1,
        completedLevelId: _currentLevel!.id,
        starsEarned: starsEarned,
      );
    }

    _isLevelComplete = true;
    _currentPuzzleIndex = _currentLevel!.puzzles.length;
    _currentRound = null;
    _errorMessage = null;
    notifyListeners();
  }

  /// Calculate stars earned for level
  int _calculateStarsForLevel() {
    if (_puzzlesSolvedThisLevel <= 0) return AppConstants.passStars;
    if (_mistakesThisLevel == 0) return AppConstants.perfectStars;
    if (_mistakesThisLevel <= 2) return AppConstants.goodStars;
    return AppConstants.passStars;
  }

  /// Reset game
  void resetGame() {
    _currentRound = null;
    _errorMessage = null;
    notifyListeners();
  }

  // ============ Game Generation from Image ============

  /// Generate puzzle from image
  Future<bool> generatePuzzleFromImage(File image, bool isArabic) async {
    _setLoading(true);

    try {
      final puzzle = await _apiService.generatePuzzleFromImage(image, isArabic);
      if (puzzle != null && _isValidPuzzle(puzzle)) {
        _currentLevel = GameLevel(id: 999, puzzles: [puzzle]);
        _currentPuzzleIndex = 0;
        _loadPuzzle();
        _resetGameState();
        return true;
      }

      _errorMessage = AppStrings.failedToGeneratePuzzleFromImage;
      return false;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _setLoading(false);
    }
  }

  // ============ Timer Management ============

  /// Start game timer
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

  /// Stop game timer
  void _stopTimer() {
    _timer?.cancel();
    _isTimerRunning = false;
  }

  /// Handle timeout
  void _handleTimeout() {
    decrementLives();
    _errorMessage = _isArabic
        ? AppStrings.timeoutMessageAr
        : AppStrings.timeoutMessage;
    notifyListeners();

    if (_isGameOver) {
      _stopTimer();
      return;
    }

    Future.delayed(AppConstants.timeoutMessageDuration, () {
      if (_isGameOver || _isLevelComplete) return;
      advancePuzzle();
    });
  }

  // ============ Progress Persistence ============

  /// Save progress to local storage and sync to cloud
  Future<void> _saveProgress(
    int levelId, {
    int? completedLevelId,
    int starsEarned = 0,
  }) async {
    if (levelId <= _unlockedLevelId) return;

    try {
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
      if (_authProvider?.isAuthenticated ?? false) {
        final syncLevel = completedLevelId ?? (levelId - 1);
        await _authProvider!.syncProgress(syncLevel, _score, starsEarned);
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error saving progress: $e');
    }
  }

  /// Save seen puzzle keys to storage
  Future<void> _saveSeenPuzzleKeys() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      var keysToSave = _sessionSeenPuzzleKeys.toList();

      if (keysToSave.length > AppConstants.maxSeenPuzzleKeys) {
        keysToSave.removeRange(
          0,
          keysToSave.length - AppConstants.maxSeenPuzzleKeys,
        );
      }

      await prefs.setStringList(_seenPuzzleKeysStorageKey, keysToSave);
    } catch (e) {
      debugPrint('Error saving puzzle keys: $e');
    }
  }

  // ============ Configuration ============

  /// Get time limit for level
  int _timeLimitForLevel(int levelId) {
    if (levelId <= AppConstants.beginnerMaxLevel) {
      return AppConstants.beginnerTimeLimit;
    }
    if (levelId <= AppConstants.earlyMaxLevel) {
      return AppConstants.earlyTimeLimit;
    }
    if (levelId <= AppConstants.intermediateMaxLevel) {
      return AppConstants.intermediateTimeLimit;
    }
    if (levelId <= AppConstants.advancedMaxLevel) {
      return AppConstants.advancedTimeLimit;
    }
    if (levelId <= AppConstants.expertMaxLevel) {
      return AppConstants.expertTimeLimit;
    }
    if (levelId <= AppConstants.masterMaxLevel) {
      return AppConstants.masterTimeLimit;
    }
    return AppConstants.legendTimeLimit;
  }

  /// Get desired puzzle count for level
  int _desiredPuzzlesForLevel(int levelId) {
    if (levelId <= AppConstants.beginnerMaxLevel) {
      return AppConstants.beginnerPuzzleCount;
    }
    if (levelId <= AppConstants.intermediateMaxLevel) {
      return AppConstants.intermediatePuzzleCount;
    }
    if (levelId <= AppConstants.advancedMaxLevel) {
      return AppConstants.advancedPuzzleCount;
    }
    return AppConstants.expertPuzzleCount;
  }

  // ============ Helpers ============

  /// Parse integer value from dynamic type
  int? _parseIntValue(dynamic value) {
    if (value is int) return value;
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value);
    return null;
  }

  /// Set loading state
  void _setLoading(bool isLoading) {
    _isLoading = isLoading;
    notifyListeners();
  }

  /// Reset level state
  void _resetLevelState() {
    _isLevelComplete = false;
    _requiresAuthToAdvance = false;
    _mistakesThisLevel = 0;
    _puzzlesSolvedThisLevel = 0;
  }

  /// Reset game state (lives/score)
  void _resetGameState() {
    _lives = AppConstants.initialLives;
    _score = 0;
    _isGameOver = false;
    _errorMessage = null;
    _isLevelComplete = false;
  }

  // ============ Lifecycle ============

  @override
  void dispose() {
    _timer?.cancel();
    _authProvider = null;
    super.dispose();
  }
}
