import 'package:flutter/material.dart';
import 'dart:io';
import 'dart:async';
import 'dart:math';
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
  final Set<String> _sessionSeenQuestionKeys = {};
  int _levelLoadPrepared = 0;
  int _levelLoadTarget = 0;
  static const String _seenPuzzleKeysStorageKey = 'seen_puzzle_keys';
  static const String _seenQuestionKeysStorageKey = 'seen_question_keys';
  static const String _soloGuestIdPrefsKey = 'solo_guest_id';

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

  /// Remote puzzle generation progress (0 = hidden / not loading puzzles).
  int get levelLoadPrepared => _levelLoadPrepared;
  int get levelLoadTarget => _levelLoadTarget;

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

      final savedQuestionKeys = prefs.getStringList(
        _seenQuestionKeysStorageKey,
      );
      if (savedQuestionKeys != null) {
        _sessionSeenQuestionKeys.addAll(savedQuestionKeys);
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
    try {
      final guestId = await _ensureSoloGuestId();
      final token = await _authProvider?.getToken();
      final packResult = await _apiService.fetchSoloLevelPackFromD1(
        isArabic: isArabic,
        levelId: _unlockedLevelId,
        count: 1,
        guestId: guestId,
        authToken: token,
      );
      if (packResult.emptyBank) {
        _errorMessage =
            isArabic ? AppStrings.soloBankEmptyAr : AppStrings.soloBankEmpty;
      } else {
        final level = packResult.level;
        if (level != null && level.puzzles.isNotEmpty) {
          await loadLevel(level, isArabic, showLoadingUi: false);
        } else {
          _errorMessage = AppStrings.failedToGenerateLevel;
        }
      }
    } catch (e) {
      _errorMessage = 'Error: $e';
    } finally {
      notifyListeners();
    }
  }

  /// Load a level and prepare puzzles.
  ///
  /// الألغاز تُجلب من Worker → D1 (`fetchSoloLevelPackFromD1` / `/api/solo/level-pack`).
  /// [showLoadingUi]: إن كان false لا تُظهر شاشة التحميل الكاملة (يفضّل قبل `Navigator.push`).
  Future<void> loadLevel(
    GameLevel level,
    bool isArabic, {
    bool showLoadingUi = true,
  }) async {
    if (showLoadingUi) _setLoading(true);
    _isArabic = isArabic;
    _resetLevelState();

    try {
      final targetPuzzleCount = _desiredPuzzlesForLevel(level.id);

      if (level.puzzles.isEmpty) {
        // Fresh fetch: do not reject rows already in prefs/session (small bank replay);
        // still dedupe within this fetch via batch keys in _generatePuzzles.
        final out = await _generatePuzzles(
          level.id,
          isArabic,
          notifyProgress: showLoadingUi,
          respectSessionDedupe: false,
        );
        if (out.emptyBank) {
          _errorMessage =
              isArabic ? AppStrings.soloBankEmptyAr : AppStrings.soloBankEmpty;
          _currentLevel = GameLevel(id: level.id, puzzles: const []);
        } else if (out.puzzles.isEmpty) {
          _errorMessage = isArabic
              ? 'لم يُحمَّل أي لغز صالح من السيرفر (البنك ليس فارغاً لكن التحليل أو التحقق رفض كل الصفوف). راجع سجل التصحيح والـ D1.'
              : 'No valid puzzles loaded (server had data but parse/validation rejected all). See debug console and D1 JSON shape.';
          _currentLevel = GameLevel(id: level.id, puzzles: const []);
          debugPrint(
            'loadLevel: empty puzzle list, emptyBank=${out.emptyBank} level=${level.id}',
          );
        } else {
          final filled = _padPuzzlesToTarget(
            out.puzzles,
            targetPuzzleCount,
          );
          _currentLevel = GameLevel(id: level.id, puzzles: filled);
        }
      } else {
        final validExisting = level.puzzles
            .where(_isValidPuzzle)
            .where((p) => _tryRegisterPuzzle(p, isArabic))
            .toList();
        final existingLimited = validExisting.take(targetPuzzleCount).toList();

        if (existingLimited.length < targetPuzzleCount) {
          final genOut = await _generatePuzzles(
            level.id,
            isArabic,
            requiredSlots: targetPuzzleCount - existingLimited.length,
            notifyProgress: showLoadingUi,
          );
          if (genOut.emptyBank && existingLimited.isEmpty) {
            _errorMessage =
                isArabic ? AppStrings.soloBankEmptyAr : AppStrings.soloBankEmpty;
            _currentLevel = GameLevel(id: level.id, puzzles: const []);
          } else if (genOut.emptyBank) {
            final filled = _padPuzzlesToTarget(
              existingLimited,
              targetPuzzleCount,
            );
            _currentLevel = GameLevel(id: level.id, puzzles: filled);
            _errorMessage = null;
          } else {
            final merged = <GamePuzzle>[...existingLimited];

            for (final puzzle in genOut.puzzles) {
              if (merged.length >= targetPuzzleCount) break;
              if (!_isValidPuzzle(puzzle)) continue;
              final puzzleKey = _generatePuzzleKey(puzzle, isArabic);
              final questionKey = _generateQuestionKey(puzzle, isArabic);
              final alreadyExists = merged.any(
                (p) =>
                    _generatePuzzleKey(p, isArabic) == puzzleKey ||
                    _generateQuestionKey(p, isArabic) == questionKey,
              );
              if (alreadyExists) continue;
              if (_tryRegisterPuzzle(puzzle, isArabic)) {
                merged.add(puzzle);
              }
            }

            if (merged.isEmpty) {
              _errorMessage = isArabic
                  ? 'لم يُدمَج أي لغز صالح مع الموجود. راجع سجل التصحيح.'
                  : 'No valid merged puzzles. See debug console.';
              _currentLevel = GameLevel(id: level.id, puzzles: const []);
              debugPrint('loadLevel: merged.isEmpty after genOut');
            } else {
              final filled = _padPuzzlesToTarget(
                merged,
                targetPuzzleCount,
              );
              _currentLevel = GameLevel(id: level.id, puzzles: filled);
            }
          }
        } else {
          final filled = _padPuzzlesToTarget(
            existingLimited,
            targetPuzzleCount,
          );
          _currentLevel = GameLevel(id: level.id, puzzles: filled);
        }
      }

      if (_currentLevel != null && _currentLevel!.puzzles.isNotEmpty) {
        await _saveSeenPuzzleKeys();
      }

      final loadErr = _errorMessage;
      final nPuzzles = _currentLevel?.puzzles.length ?? 0;
      _currentPuzzleIndex = 0;
      _loadPuzzle();
      _resetGameState();
      if (loadErr != null && nPuzzles == 0) {
        _errorMessage = loadErr;
      }
      debugPrint(
        'loadLevel done level=${level.id} puzzles=$nPuzzles '
        'loadErr=${loadErr ?? "none"} isLoading=$_isLoading',
      );
      if (loadErr != null && nPuzzles == 0) {
        notifyListeners();
      }
    } catch (e) {
      _errorMessage = 'Error loading level: $e';
    } finally {
      _levelLoadPrepared = 0;
      _levelLoadTarget = 0;
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

  /// جلب ألغاز السولو من D1 عبر Worker (`/api/solo/level-pack`).
  Future<({List<GamePuzzle> puzzles, bool emptyBank})> _generatePuzzles(
    int levelId,
    bool isArabic, {
    int? requiredSlots,
    bool notifyProgress = true,
    /// When false (fresh level shell from server), accept puzzles even if keys
    /// were restored from SharedPreferences; duplicates are still blocked within
    /// this generation run only.
    bool respectSessionDedupe = true,
  }) async {
    final puzzles = <GamePuzzle>[];
    final desiredCount =
        (requiredSlots != null && requiredSlots > 0)
            ? requiredSlots
            : _desiredPuzzlesForLevel(levelId);
    if (desiredCount <= 0) {
      return (puzzles: puzzles, emptyBank: false);
    }

    _levelLoadTarget = desiredCount;
    _levelLoadPrepared = 0;
    if (notifyProgress) notifyListeners();

    final guestId = await _ensureSoloGuestId();
    final token = await _authProvider?.getToken();

    final batchPuzzleKeys = <String>{};
    final batchQuestionKeys = <String>{};

    for (var pass = 0; pass < 3 && puzzles.length < desiredCount; pass++) {
      final need = desiredCount - puzzles.length;
      final packResult = await _apiService.fetchSoloLevelPackFromD1(
        isArabic: isArabic,
        levelId: levelId,
        count: need,
        guestId: guestId,
        authToken: token,
      );
      if (packResult.emptyBank) {
        debugPrint('_generatePuzzles: API emptyBank level=$levelId');
        return (puzzles: puzzles, emptyBank: true);
      }
      final pack = packResult.level;
      if (pack == null || pack.puzzles.isEmpty) {
        debugPrint(
          '_generatePuzzles: null pack or empty list pass=$pass level=$levelId',
        );
        break;
      }

      var accepted = 0;
      var rejected = 0;
      for (final puzzle in pack.puzzles) {
        if (puzzles.length >= desiredCount) break;
        if (!_isValidPuzzle(puzzle)) {
          rejected++;
          continue;
        }
        final registered =
            respectSessionDedupe
                ? _tryRegisterPuzzle(puzzle, isArabic)
                : _tryRegisterPuzzleIgnoringSessionHistory(
                  puzzle,
                  isArabic,
                  batchPuzzleKeys,
                  batchQuestionKeys,
                );
        if (registered) {
          puzzles.add(puzzle);
          accepted++;
          _levelLoadPrepared = puzzles.length;
          if (notifyProgress) notifyListeners();
        }
      }
      if (accepted == 0 && pack.puzzles.isNotEmpty) {
        debugPrint(
          '_generatePuzzles: pass=$pass level=$levelId incoming=${pack.puzzles.length} '
          'rejectedValidation=$rejected accepted=$accepted '
          'respectSessionDedupe=$respectSessionDedupe '
          '(if validation=0 but rows valid, session/prefs dedupe likely skipped all)',
        );
      }
      if (accepted == 0) break;
    }

    return (puzzles: puzzles, emptyBank: false);
  }

  Future<String> _ensureSoloGuestId() async {
    final prefs = await SharedPreferences.getInstance();
    var id = prefs.getString(_soloGuestIdPrefsKey);
    if (id == null || id.length < 8) {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      final rnd = Random.secure();
      id = List.generate(24, (_) => chars[rnd.nextInt(chars.length)]).join();
      await prefs.setString(_soloGuestIdPrefsKey, id);
    }
    return id;
  }

  /// Generate a puzzle key for deduplication
  String _generatePuzzleKey(GamePuzzle puzzle, bool isArabic) {
    // Never use puzzleId for deduplication because it's often random per request.
    // Content-based key ensures repeated puzzles are filtered even with different ids.

    if (isArabic) {
      final steps = puzzle.stepsAr.map((s) => s.word).join(',');
      final type = (puzzle.type ?? 'logical_chain').trim().toLowerCase();
      return '$type|${puzzle.startWordAr}|${puzzle.endWordAr}|$steps';
    } else {
      final steps = puzzle.stepsEn.map((s) => s.word).join(',');
      final type = (puzzle.type ?? 'logical_chain').trim().toLowerCase();
      return '$type|${puzzle.startWordEn}|${puzzle.endWordEn}|$steps';
    }
  }

  String _generateQuestionKey(GamePuzzle puzzle, bool isArabic) {
    final type = (puzzle.type ?? 'logical_chain').trim().toLowerCase();
    if (isArabic) {
      return '$type|${puzzle.startWordAr.trim().toLowerCase()}|${puzzle.endWordAr.trim().toLowerCase()}';
    }
    return '$type|${puzzle.startWordEn.trim().toLowerCase()}|${puzzle.endWordEn.trim().toLowerCase()}';
  }

  bool _tryRegisterPuzzle(GamePuzzle puzzle, bool isArabic) {
    final puzzleKey = _generatePuzzleKey(puzzle, isArabic);
    final questionKey = _generateQuestionKey(puzzle, isArabic);

    if (_sessionSeenPuzzleKeys.contains(puzzleKey)) return false;
    if (_sessionSeenQuestionKeys.contains(questionKey)) return false;

    _sessionSeenPuzzleKeys.add(puzzleKey);
    _sessionSeenQuestionKeys.add(questionKey);
    return true;
  }

  /// Like [_tryRegisterPuzzle] but ignores prior session/prefs keys; still blocks
  /// duplicates within [batchPuzzleKeys] / [batchQuestionKeys] for this generation.
  bool _tryRegisterPuzzleIgnoringSessionHistory(
    GamePuzzle puzzle,
    bool isArabic,
    Set<String> batchPuzzleKeys,
    Set<String> batchQuestionKeys,
  ) {
    final puzzleKey = _generatePuzzleKey(puzzle, isArabic);
    final questionKey = _generateQuestionKey(puzzle, isArabic);

    if (batchPuzzleKeys.contains(puzzleKey)) return false;
    if (batchQuestionKeys.contains(questionKey)) return false;

    batchPuzzleKeys.add(puzzleKey);
    batchQuestionKeys.add(questionKey);
    _sessionSeenPuzzleKeys.add(puzzleKey);
    _sessionSeenQuestionKeys.add(questionKey);
    return true;
  }

  // ============ Puzzle Validation ============

  /// Check if a puzzle is valid
  bool _isValidPuzzle(GamePuzzle puzzle) {
    final isPoetic =
        puzzle.type == 'لغز_شعري' || puzzle.type == 'poetic_riddle';

    if (!isPoetic) {
      final start = _isArabic ? puzzle.startWordAr : puzzle.startWordEn;
      final end = _isArabic ? puzzle.endWordAr : puzzle.endWordEn;

      if (_isMetaWord(start) || _isMetaWord(end)) return false;
      if (start.trim() == end.trim()) return false;
    }

    final steps = _isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    if (steps.isEmpty) return false;

    final stepWords = steps
        .map((s) => s.word.trim().toLowerCase())
        .where((w) => w.isNotEmpty)
        .toList();
    if (stepWords.length != steps.length) return false;
    if (stepWords.toSet().length != stepWords.length) return false;

    for (final step in steps) {
      if (_isMetaWord(step.word)) return false;
      if (step.options.length != 4) return false;
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

  /// Validate chain instantly for tap-based answers (no loading spinner/debounce)
  Future<bool> validateChainImmediate(List<String> userSteps) async {
    _errorMessage = null;

    try {
      final puzzle = currentPuzzle;
      if (puzzle == null) return false;

      final steps = _isArabic ? puzzle.stepsAr : puzzle.stepsEn;

      if (!_isChainCorrect(userSteps, steps)) {
        _errorMessage = _isArabic
            ? AppStrings.incorrectAnswerAr
            : AppStrings.incorrectAnswer;
        decrementLives();
        await advancePuzzle();
        return false;
      }

      incrementScore(AppConstants.stepScore);
      await advancePuzzle();
      return true;
    } catch (e) {
      _errorMessage = AppStrings.failedToValidateLink;
      notifyListeners();
      return false;
    }
  }

  /// Check if user's chain is correct
  bool _isChainCorrect(List<String> userSteps, List<dynamic> steps) {
    if (userSteps.length < steps.length) return false;

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
      var questionKeysToSave = _sessionSeenQuestionKeys.toList();

      if (keysToSave.length > AppConstants.maxSeenPuzzleKeys) {
        keysToSave.removeRange(
          0,
          keysToSave.length - AppConstants.maxSeenPuzzleKeys,
        );
      }

      if (questionKeysToSave.length > AppConstants.maxSeenPuzzleKeys) {
        questionKeysToSave.removeRange(
          0,
          questionKeysToSave.length - AppConstants.maxSeenPuzzleKeys,
        );
      }

      await prefs.setStringList(_seenPuzzleKeysStorageKey, keysToSave);
      await prefs.setStringList(
        _seenQuestionKeysStorageKey,
        questionKeysToSave,
      );
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
    return AppConstants.puzzlesPerLevel;
  }

  /// يقتصر على [targetCount] لغزاً من القائمة القادمة من D1 فقط (لا إكمال محلي).
  List<GamePuzzle> _padPuzzlesToTarget(
    List<GamePuzzle> puzzles,
    int targetCount,
  ) {
    if (targetCount <= 0) return const [];
    if (puzzles.length >= targetCount) {
      return puzzles.take(targetCount).toList();
    }
    return List<GamePuzzle>.from(puzzles);
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
