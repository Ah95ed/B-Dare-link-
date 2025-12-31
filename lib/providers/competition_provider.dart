import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/competition_service.dart';
import '../services/realtime_service.dart';
import '../providers/auth_provider.dart';

class CompetitionProvider with ChangeNotifier {
  final CompetitionService _service = CompetitionService();
  final RealtimeService _realtime = RealtimeService();
  AuthProvider? _authProvider;

  void setAuthProvider(AuthProvider auth) {
    _authProvider = auth;
  }

  // Room state
  Map<String, dynamic>? _currentRoom;
  List<Map<String, dynamic>> _roomParticipants = [];
  Map<String, dynamic>? _currentPuzzle;
  int _currentPuzzleIndex = 0;
  bool _isReady = false;
  bool _gameStarted = false;
  bool _gameFinished = false;
  int _score = 0;
  int _puzzlesSolved = 0;
  int _totalPuzzles = 5;
  DateTime? _puzzleStartTime;
  DateTime? _puzzleEndsAt;
  int _timePerPuzzleSeconds = 30;

  // Real-time states
  List<Map<String, dynamic>> _messages = [];
  String? _solvedByUsername;
  String? _hostId;
  int? _selectedAnswerIndex;
  bool? _lastAnswerCorrect;
  int? _correctAnswerIndex;

  Map<String, dynamic>? get currentRoom => _currentRoom;
  int? get selectedAnswerIndex => _selectedAnswerIndex;
  bool? get lastAnswerCorrect => _lastAnswerCorrect;
  int? get correctAnswerIndex => _correctAnswerIndex;
  List<Map<String, dynamic>> get roomParticipants => _roomParticipants;
  Map<String, dynamic>? get currentPuzzle => _currentPuzzle;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  DateTime? get puzzleEndsAt => _puzzleEndsAt;
  int get timePerPuzzleSeconds => _timePerPuzzleSeconds;
  bool get isReady => _isReady;
  bool get gameStarted => _gameStarted;
  bool get gameFinished => _gameFinished;

  /// Reset game state to go back to lobby without leaving room
  void goBackToLobby() {
    _gameStarted = false;
    _currentPuzzle = null;
    notifyListeners();
  }

  int get score => _score;
  int get puzzlesSolved => _puzzlesSolved;
  int get totalPuzzles => _totalPuzzles;
  List<Map<String, dynamic>> get messages => _messages;
  String? get solvedByUsername => _solvedByUsername;
  String? get hostId => _hostId;
  bool get isHost =>
      _hostId != null &&
      _hostId!.isNotEmpty &&
      _authProvider != null &&
      _authProvider!.userId.toString() == _hostId;

  // Normalize puzzle to always have question/options/type for UI
  Map<String, dynamic> _normalizePuzzle(Map<String, dynamic> puzzle) {
    final normalized = Map<String, dynamic>.from(puzzle);

    // If this looks like a Wonder Link puzzle (steps array), lift first step into options/question
    final steps = (normalized['steps'] as List?) ?? const [];
    if ((normalized['options'] as List?)?.isEmpty == true && steps.isNotEmpty) {
      final firstStep = Map<String, dynamic>.from(steps.first as Map? ?? {});
      final start = normalized['startWord'] ?? '';
      final end = normalized['endWord'] ?? '';
      final stepWord = firstStep['word'] ?? start;
      normalized['type'] = normalized['type'] ?? 'steps';
      normalized['question'] =
          normalized['question'] ??
          'ربط بين "$start" و"$end" - اختر الكلمة التالية بعد "$stepWord"';
      normalized['options'] = List<dynamic>.from(
        firstStep['options'] ?? const [],
      );
      normalized['correctIndex'] =
          normalized['correctIndex'] ?? (firstStep['correctIndex'] ?? 0);
    }

    normalized['question'] = normalized['question'] ?? 'سؤال غير متوفر';
    normalized['options'] = (normalized['options'] as List?) ?? <dynamic>[];
    normalized['type'] = normalized['type'] ?? 'quiz';
    return normalized;
  }

  // Competition state
  List<Map<String, dynamic>> _activeCompetitions = [];
  List<Map<String, dynamic>> _myRooms = [];
  List<Map<String, dynamic>> get activeCompetitions => _activeCompetitions;
  List<Map<String, dynamic>> get myRooms => _myRooms;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  StreamSubscription? _realtimeSub;

  Future<void> createRoom({
    String? name,
    int maxParticipants = 10,
    int puzzleCount = 5,
    int timePerPuzzle = 60,
    String puzzleSource = 'ai',
    int difficulty = 1,
    String language = 'ar',
  }) async {
    try {
      final result = await _service.createRoom(
        name: name,
        maxParticipants: maxParticipants,
        puzzleCount: puzzleCount,
        timePerPuzzle: timePerPuzzle,
        puzzleSource: puzzleSource,
        difficulty: difficulty,
        language: language,
      );
      _currentRoom = result['room'];
      _connectRealtime();
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> joinRoom(String code) async {
    try {
      final result = await _service.joinRoom(code);
      _currentRoom = result['room'];
      _connectRealtime();
      // Fetch current puzzle if game is already active
      await refreshRoomStatus();
      // Refresh the list of my rooms after joining
      await loadMyRooms();
      notifyListeners();
    } catch (e) {
      // Capture error message for UI feedback
      _errorMessage = e.toString();
      notifyListeners();
      rethrow;
    }
  }

  void _connectRealtime() async {
    if (_currentRoom == null || _authProvider == null) return;

    final token = await _authProvider!.getToken();
    if (token == null || token.isEmpty) {
      _errorMessage = 'مقيد: توكن المصادقة. الرجاء تسجيل الدخول من جديد.';
      notifyListeners();
      return;
    }

    final roomId = _currentRoom!['id'];
    // Assuming base URL from service, convert to wss
    final baseUrl = "wonder-link-backend.amhmeed31.workers.dev";
    final wsUrl = "wss://$baseUrl/rooms/ws?roomId=$roomId&token=$token";

    _realtimeSub?.cancel();
    _realtimeSub = _realtime.events.listen((event) {
      _handleRealtimeEvent(event);
    });

    _realtime.connect(wsUrl, token);
  }

  void _handleRealtimeEvent(Map<String, dynamic> event) {
    // Surface transport-level errors to the UI
    if (event['type'] == 'error' || event['type'] == 'closed') {
      _errorMessage =
          event['message'] ??
          (event['type'] == 'closed' ? 'WebSocket closed' : null);
      notifyListeners();
      // Attempt reconnect after short delay
      Future.delayed(const Duration(seconds: 3), () async {
        try {
          if (_currentRoom != null && _authProvider != null) {
            final token = await _authProvider!.getToken();
            if (token != null && token.isNotEmpty) {
              final roomId = _currentRoom!['id'];
              final baseUrl = "wonder-link-backend.amhmeed31.workers.dev";
              final wsUrl =
                  "wss://$baseUrl/rooms/ws?roomId=$roomId&token=$token";
              _realtime.connect(wsUrl, token);
            }
          }
        } catch (e) {}
      });
      return;
    }
    switch (event['type']) {
      case 'init':
        _messages = List<Map<String, dynamic>>.from(event['messages'] ?? []);
        _roomParticipants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        _hostId = event['hostId']?.toString();

        // Find my own ready status in the participants list
        final myId = _authProvider?.userId?.toString();
        if (myId != null) {
          final me = _roomParticipants.firstWhere(
            (p) => p['userId']?.toString() == myId,
            orElse: () => {},
          );
          _isReady = me['isReady'] == true;
        }

        _updateGameState(event['gameState']);
        break;
      case 'chat':
        if (event['message'] != null) {
          _messages = [
            ..._messages,
            Map<String, dynamic>.from(event['message']),
          ];
        }
        break;
      case 'user_joined':
      case 'user_left':
        _roomParticipants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        _hostId = event['hostId']?.toString();
        break;
      case 'ready_status':
        _roomParticipants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        final myId = _authProvider?.userId?.toString();
        if (event['userId']?.toString() == myId && myId != null) {
          _isReady = event['isReady'] ?? false;
        }
        break;

      case 'user_kicked':
        _roomParticipants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        break;

      case 'kicked':
      case 'room_deleted':
        _errorMessage = event['type'] == 'kicked'
            ? 'تم طردك من المجموعة'
            : 'تم حذف المجموعة من قبل القائد';
        leaveRoom();
        break;
      case 'game_started':
        debugPrint('🎮 Game started event received');
        _gameStarted = true;
        _currentPuzzleIndex = event['puzzleIndex'] ?? 0;
        _totalPuzzles = event['totalPuzzles'] ?? 5;
        _solvedByUsername = null;
        _gameFinished = false;
        _selectedAnswerIndex = null;
        _lastAnswerCorrect = null;
        _correctAnswerIndex = null;
        if (event['puzzle'] != null) {
          _currentPuzzle = _normalizePuzzle(
            Map<String, dynamic>.from(event['puzzle']),
          );
          debugPrint('âœ… Puzzle loaded: ${_currentPuzzle!['question']}');
          debugPrint(
            'âœ… Options count: ${(_currentPuzzle!['options'] as List?)?.length ?? 0}',
          );
          final ci = int.tryParse((_currentPuzzle!['correctIndex']).toString());
          final opts = (_currentPuzzle!['options'] as List?) ?? const [];
          if (ci != null && ci >= 0 && ci < opts.length) {
            debugPrint('âœ… Correct answer: ${opts[ci]} (index $ci)');
          }
        } else {
          debugPrint(
            'âš ï¸ Puzzle missing in game_started, fetching from API',
          );
        }
        // Always refresh to ensure we have the puzzle
        refreshRoomStatus();
        _puzzleStartTime = DateTime.now();
        // Read timer info from gameState if present
        final gs = event['gameState'];
        if (gs != null && gs['puzzleEndsAt'] != null) {
          _puzzleEndsAt = DateTime.fromMillisecondsSinceEpoch(
            gs['puzzleEndsAt'],
          );
          if (gs['timePerPuzzle'] != null) {
            _timePerPuzzleSeconds =
                int.tryParse(gs['timePerPuzzle'].toString()) ??
                _timePerPuzzleSeconds;
          }
        }
        break;
      case 'puzzle_solved_first':
        _solvedByUsername = event['username'];
        break;
      case 'new_puzzle':
        _currentPuzzleIndex =
            event['gameState']['currentPuzzleIndex'] ??
            event['puzzleIndex'] ??
            0;
        _solvedByUsername = null;
        _selectedAnswerIndex = null;
        _lastAnswerCorrect = null;
        _correctAnswerIndex = null;
        if (event['puzzle'] != null) {
          _currentPuzzle = _normalizePuzzle(
            Map<String, dynamic>.from(event['puzzle']),
          );
          final ci = int.tryParse((_currentPuzzle!['correctIndex']).toString());
          final opts = (_currentPuzzle!['options'] as List?) ?? const [];
          debugPrint('✨ New puzzle: ${_currentPuzzle!['question']}');
          if (ci != null && ci >= 0 && ci < opts.length) {
            debugPrint('âœ… Correct answer: ${opts[ci]} (index $ci)');
          }
        }
        _puzzleStartTime = DateTime.now();
        final gs2 = event['gameState'];
        if (gs2 != null && gs2['puzzleEndsAt'] != null) {
          _puzzleEndsAt = DateTime.fromMillisecondsSinceEpoch(
            gs2['puzzleEndsAt'],
          );
          if (gs2['timePerPuzzle'] != null) {
            _timePerPuzzleSeconds =
                int.tryParse(gs2['timePerPuzzle'].toString()) ??
                _timePerPuzzleSeconds;
          }
        }
        break;
      case 'timer_started':
        if (event['endsAt'] != null) {
          _puzzleEndsAt = DateTime.fromMillisecondsSinceEpoch(event['endsAt']);
        }
        if (event['durationSec'] != null) {
          _timePerPuzzleSeconds =
              int.tryParse(event['durationSec'].toString()) ??
              _timePerPuzzleSeconds;
        }
        break;
      case 'game_finished':
        _gameFinished = true;
        break;
    }
    notifyListeners();
  }

  void _updateGameState(
    Map<String, dynamic>? gameState, {
    Map<String, dynamic>? puzzle,
  }) {
    if (gameState == null) return;
    _gameStarted = gameState['status'] == 'active';
    _gameFinished = gameState['status'] == 'finished';
    _currentPuzzleIndex = gameState['currentPuzzleIndex'] ?? 0;
    // Safety defaults to avoid null UI
    if (_currentPuzzle != null) {
      _currentPuzzle = _normalizePuzzle(_currentPuzzle!);
    }
    if (gameState['puzzleEndsAt'] != null) {
      _puzzleEndsAt = DateTime.fromMillisecondsSinceEpoch(
        gameState['puzzleEndsAt'],
      );
    }
    if (gameState['timePerPuzzle'] != null) {
      _timePerPuzzleSeconds =
          int.tryParse(gameState['timePerPuzzle'].toString()) ??
          _timePerPuzzleSeconds;
    }
    if (gameState['timePerPuzzle'] != null) {
      _timePerPuzzleSeconds =
          int.tryParse(gameState['timePerPuzzle'].toString()) ??
          _timePerPuzzleSeconds;
    }

    // Load puzzle if provided
    if (puzzle != null) {
      _currentPuzzle = _normalizePuzzle(Map<String, dynamic>.from(puzzle));
      _puzzleStartTime = DateTime.now();
    }
    // Also check if gameState has currentPuzzle (from init/websocket)
    if (gameState['currentPuzzle'] != null) {
      _currentPuzzle = _normalizePuzzle(
        Map<String, dynamic>.from(gameState['currentPuzzle']),
      );
      _puzzleStartTime = DateTime.now();
    }
    if (_currentPuzzle != null) {
      _currentPuzzle = _normalizePuzzle(_currentPuzzle!);
    }
  }

  bool get isConnected => _realtime.isConnected;
  bool get isConnecting => _realtime.isConnecting;

  Future<void> refreshRoomStatus() async {
    if (_currentRoom == null) return;
    try {
      debugPrint('🔄 Refreshing room status for room ${_currentRoom!['id']}');
      final result = await _service.getRoomStatus(_currentRoom!['id']);
      _currentRoom = result['room'];
      _roomParticipants = List<Map<String, dynamic>>.from(
        result['participants'] ?? [],
      );

      // Get current puzzle from API result if game is active
      final puzzle = result['currentPuzzle'];
      debugPrint(
        '📊 Room status: ${_currentRoom!['status']}, puzzle: ${puzzle != null ? 'present' : 'null'}',
      );
      if (puzzle != null) {
        final normalized = _normalizePuzzle(Map<String, dynamic>.from(puzzle));
        debugPrint('📄 Puzzle question: ${puzzle['question']}');
        debugPrint('📄 Puzzle options: ${puzzle['options']}');
        final ci = int.tryParse((puzzle['correctIndex']).toString());
        final opts = (normalized['options'] as List?) ?? const [];
        if (ci != null && ci >= 0 && ci < opts.length) {
          debugPrint('✅ Correct answer: ${opts[ci]} (index $ci)');
        }

        // Only update puzzle if game is active (status = 'active')
        final roomStatus = _currentRoom!['status']?.toString() ?? 'unknown';
        if (roomStatus == 'active') {
          _updateGameState(_currentRoom!, puzzle: normalized);
        } else {
          // Clear puzzle if game hasn't started
          _currentPuzzle = null;
          _updateGameState(_currentRoom!, puzzle: null);
        }
        notifyListeners();
        return;
      }
      _updateGameState(
        _currentRoom!,
        puzzle: puzzle != null ? Map<String, dynamic>.from(puzzle) : null,
      );
      notifyListeners();
    } catch (e) {
      debugPrint('âŒ Error refreshing room status: $e');
    }
  }

  Future<bool> sendMessage(String text) async {
    try {
      final sent = _realtime.send({'type': 'chat', 'text': text});
      if (!sent) {
        debugPrint('Message not sent - WebSocket not connected');
      }
      return sent;
    } catch (e) {
      debugPrint('Error sending message: $e');
      return false;
    }
  }

  Future<void> startGame() async {
    if (_currentRoom == null) return;
    try {
      // Refresh first to get latest status and any existing puzzle
      await refreshRoomStatus();
      final status = _currentRoom?['status']?.toString() ?? 'unknown';
      debugPrint('Starting game requested. Current room status: $status');

      if (status != 'waiting') {
        // If already active, just ensure we fetch the current puzzle and surface an error
        await refreshRoomStatus();
        final msg =
            'فشل بدء اللعبة: الغرفة ليست في وضع الانتظار (الحالة: $status)';
        debugPrint(msg);
        _errorMessage = msg;
        notifyListeners();
        return;
      }

      debugPrint('Starting game via HTTP API for room ${_currentRoom!['id']}');
      await _service.startGame(_currentRoom!['id']);
      // The game_started event will come via WebSocket after puzzles are generated
      // Also pull status to hydrate puzzle if event is delayed
      await refreshRoomStatus();
    } catch (e) {
      debugPrint('Error starting game: $e');
      _errorMessage = 'فشل بدء اللعبة: $e';
      // Try to fetch current state/puzzle to keep UI consistent
      await refreshRoomStatus();
      notifyListeners();
    }
  }

  Future<void> nextPuzzle() async {
    if (_currentRoom == null) return;
    try {
      await refreshRoomStatus();
      final status = _currentRoom?['status']?.toString() ?? 'unknown';
      debugPrint(
        'Host requested next puzzle for room ${_currentRoom!['id']} (status: $status)',
      );

      if (status == 'waiting') {
        // إذا كانت الغرفة في وضع الانتظار، ابدأ اللعبة
        debugPrint('Room is waiting; starting game via startGame');
        await startGame();
        return;
      }

      if (status != 'active') {
        _errorMessage =
            'لا يمكن الانتقال للسؤال التالي. الغرفة ليست نشطة (الحالة: $status)';
        notifyListeners();
        return;
      }

      // إذا كانت نشطة، انتقل للسؤال التالي
      await _service.nextPuzzle(_currentRoom!['id']);
      await refreshRoomStatus();
    } catch (e) {
      debugPrint('Error advancing to next puzzle: $e');
      _errorMessage = 'فشل تبديل السؤال: $e';
      await refreshRoomStatus();
      notifyListeners();
    }
  }

  Future<void> toggleReady(bool ready) async {
    if (_currentRoom == null) return;
    try {
      // Call API to set ready - this triggers game start if all are ready
      await _service.setReady(_currentRoom!['id'], ready);
      // Also notify via WebSocket for immediate UI update
      _realtime.send({'type': 'toggle_ready', 'isReady': ready});
    } catch (e) {
      debugPrint('Error toggling ready: $e');
    }
  }

  Future<void> solvePuzzle(int puzzleIndex) async {
    _realtime.send({'type': 'solve_puzzle', 'puzzleIndex': puzzleIndex});

    // Also submit to DB for persistence
    // (This part will be handled in the Game UI logic)
  }

  Future<void> setReady(bool ready) async {
    if (_currentRoom == null) return;
    try {
      await _service.setReady(_currentRoom!['id'], ready);
      _isReady = ready;
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> submitAnswer(List<String> steps) async {
    if (_currentRoom == null || _currentPuzzle == null) return;

    final timeTaken = _puzzleStartTime != null
        ? DateTime.now().difference(_puzzleStartTime!).inMilliseconds
        : 0;

    try {
      final result = await _service.submitAnswer(
        roomId: _currentRoom!['id'],
        puzzleIndex: _currentPuzzleIndex,
        steps: steps,
        timeTaken: timeTaken,
      );

      if (result['isCorrect'] == true) {
        _score += result['points'] as int? ?? 0;
        _puzzlesSolved++;

        // Show success message
        if (result['isFirstCorrect'] == true) {
          // Will be updated by WebSocket event 'puzzle_solved_first'
        } else if (result['rank'] != null) {
          // Show rank if not first
          debugPrint('Solved correctly! Rank: ${result['rank']}');
        }
      } else {
        // Show error for incorrect answer
        debugPrint('Incorrect answer');
      }

      // nextPuzzle and gameFinished are handled by WebSocket events
      // to keep all players synchronized

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  // Quiz format answer submission (answerIndex instead of steps)
  Future<void> submitQuizAnswer(int answerIndex) async {
    if (_currentRoom == null || _currentPuzzle == null) return;

    final timeTaken = _puzzleStartTime != null
        ? DateTime.now().difference(_puzzleStartTime!).inMilliseconds
        : 0;

    try {
      // تحديث الإجابة المختارة فوراً لعرض النتيجة للمستخدم
      _selectedAnswerIndex = answerIndex;
      notifyListeners();

      // Save puzzle index BEFORE any operations that might change it
      final submissionPuzzleIndex = _currentPuzzleIndex;

      final status = _currentRoom?['status']?.toString() ?? 'unknown';

      // يجب أن تكون اللعبة نشطة لإرسال الإجابة
      if (status != 'active') {
        _errorMessage =
            'لا يمكن إرسال الإجابة لأن اللعبة لم تبدأ بعد (الحالة: $status)';
        notifyListeners();
        return;
      }

      // IMPORTANT: Send answer with the puzzle index that was current when user selected it
      final result = await _service.submitQuizAnswer(
        roomId: _currentRoom!['id'],
        puzzleIndex: submissionPuzzleIndex,
        answerIndex: answerIndex,
        timeTaken: timeTaken,
      );

      _lastAnswerCorrect = result['isCorrect'] == true;

      if (result['isCorrect'] == true) {
        _score += result['points'] as int? ?? 0;
        _puzzlesSolved++;
        debugPrint(
          'Correct! Points: ${result['points']}, First: ${result['isFirstCorrect']}',
        );
      } else {
        debugPrint('Incorrect answer');
        // حفظ الإجابة الصحيحة لعرضها
        if (_currentPuzzle != null) {
          final ci = int.tryParse((_currentPuzzle!['correctIndex']).toString());
          if (ci != null) {
            _correctAnswerIndex = ci;
          }
        }
      }

      // If server already returned next puzzle, hydrate immediately for snappy UX
      if (result['nextPuzzle'] != null) {
        _currentPuzzleIndex = (_currentPuzzleIndex + 1);
        _currentPuzzle = _normalizePuzzle(
          Map<String, dynamic>.from(result['nextPuzzle']),
        );
        _puzzleStartTime = DateTime.now();
        _puzzleEndsAt =
            null; // will be updated by timer_started/new_puzzle events
      }

      // If game finished, mark and refresh leaderboard
      if (result['gameFinished'] == true) {
        _gameFinished = true;
        await refreshRoomStatus();
      } else {
        // Fallback: pull fresh state so next_puzzle moves if server advanced
        await refreshRoomStatus();
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error submitting quiz answer: $e');
      rethrow;
    }
  }

  Future<void> loadActiveCompetitions() async {
    try {
      final result = await _service.getActiveCompetitions();
      _activeCompetitions = List<Map<String, dynamic>>.from(
        result['competitions'] ?? [],
      );
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading competitions: $e');
    }
  }

  Future<void> joinCompetition(int competitionId) async {
    try {
      await _service.joinCompetition(competitionId);
      await loadActiveCompetitions();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> loadMyRooms() async {
    try {
      final result = await _service.getMyRooms();
      _myRooms = List<Map<String, dynamic>>.from(result['rooms'] ?? []);
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading my rooms: $e');
    }
  }

  Future<void> leaveRoom() async {
    if (_currentRoom != null) {
      try {
        await _service.leaveRoom(_currentRoom!['id']);
      } catch (e) {
        debugPrint('Error during leave API: $e');
      }
    }
    _resetRoomState();
    await loadMyRooms();
    notifyListeners();
  }

  Future<void> deleteRoom() async {
    if (_currentRoom != null) {
      try {
        await _service.deleteRoom(_currentRoom!['id']);
        _resetRoomState();
        loadMyRooms();
      } catch (e) {
        _errorMessage = 'فشل في حذف المجموعة: $e';
        notifyListeners();
      }
    }
  }

  Future<void> reopenRoom() async {
    if (_currentRoom == null) return;
    try {
      await _service.reopenRoom(_currentRoom!['id']);
      // reset local state like going back to lobby
      _gameStarted = false;
      _gameFinished = false;
      _currentPuzzle = null;
      _currentPuzzleIndex = 0;
      _puzzlesSolved = 0;
      _score = 0;
      _isReady = false;
      await refreshRoomStatus();
      notifyListeners();
    } catch (e) {
      _errorMessage = 'فشل إعادة فتح الغرفة: $e';
      notifyListeners();
    }
  }

  Future<void> kickUser(String userId) async {
    if (_currentRoom != null) {
      try {
        await _service.kickUser(_currentRoom!['id'], userId);
      } catch (e) {
        debugPrint('Error kicking user: $e');
      }
    }
  }

  void _resetRoomState() {
    _realtime.disconnect();
    _realtimeSub?.cancel();
    _realtimeSub = null;
    _currentRoom = null;
    _roomParticipants = [];
    _currentPuzzle = null;
    _currentPuzzleIndex = 0;
    _isReady = false;
    _gameStarted = false;
    _gameFinished = false;
    _score = 0;
    _puzzlesSolved = 0;
    _puzzleStartTime = null;
    _puzzleEndsAt = null;
    _timePerPuzzleSeconds = 30;
    _messages = [];
    _solvedByUsername = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _realtime.dispose();
    _realtimeSub?.cancel();
    super.dispose();
  }
}
