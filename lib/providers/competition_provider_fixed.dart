// 👑 **نسخة محسّنة من CompetitionProvider مع تصحيحات الإدارة**
// التغييرات الرئيسية:
// 1. استخراج _hostId من room.created_by في جميع الأماكن
// 2. ضمان أن منشئ الغرفة يصبح المدير فوراً

import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/competition_service.dart';
import '../services/realtime_service.dart';
import '../providers/auth_provider.dart';

// =============== تحسينات الإدارة ===============
// النقاط المهمة:
// 1. **created_by في قاعدة البيانات** = المدير الحقيقي (Host)
// 2. **role في room_participants** = دور اللاعب (manager/player/co_manager)
// 3. **created_by يصبح hostId** = يتم تحديثه من البيانات المستقبلة من API
//
// الفرق:
// - hostId: معرّف المدير (منشئ الغرفة) = room.created_by
// - isHost: تحقق من أن المستخدم الحالي هو hostId
// - isAdminOrManager: تحقق من أن المستخدم له دور 'manager' أو 'co_manager'

class CompetitionProvider with ChangeNotifier {
  final CompetitionService _service = CompetitionService();
  final RealtimeService _realtime = RealtimeService();
  AuthProvider? _authProvider;

  Timer? _advanceAfterAnswerTimer;
  Map<String, dynamic>? _pendingNextPuzzle;
  int? _pendingNextPuzzleIndex;
  bool _isAdvancingToNextPuzzle = false;

  Future<void>? _refreshInFlight;
  DateTime? _lastRefreshAt;

  // HTTP polling fallback for WebSocket
  Timer? _pollingTimer;
  final int _pollingIntervalSeconds = 2;
  bool _usePolling = false;
  String? _lastPolledEventHash;

  void setAuthProvider(AuthProvider auth) {
    _authProvider = auth;
  }

  // Room state
  Map<String, dynamic>? _currentRoom;
  List<Map<String, dynamic>> _roomParticipants = [];
  Map<String, dynamic>? _currentPuzzle;
  int _currentPuzzleIndex = 0;
  int _currentStepIndex = 0;
  List<String> _completedSteps = [];
  bool _isReady = false;
  bool _gameStarted = false;
  bool _gameFinished = false;
  bool _isStartingGame = false;
  int _score = 0;
  int _puzzlesSolved = 0;
  int _totalPuzzles = 5;
  DateTime? _puzzleStartTime;
  DateTime? _puzzleEndsAt;
  int _timePerPuzzleSeconds = 30;

  // Real-time states
  List<Map<String, dynamic>> _messages = [];
  String? _solvedByUsername;
  String? _hostId; // ✅ معرّف المدير = room.created_by

  int? _selectedAnswerIndex;
  bool? _lastAnswerCorrect;
  int? _correctAnswerIndex;

  // Getters
  Map<String, dynamic>? get currentRoom => _currentRoom;
  int get currentStepIndex => _currentStepIndex;
  List<String> get completedSteps => _completedSteps;
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
  bool get isStartingGame => _isStartingGame;
  bool get isAdvancingToNextPuzzle => _isAdvancingToNextPuzzle;

  void _setNextPuzzleFromPayload({
    required Map<String, dynamic> puzzle,
    int? puzzleIndex,
  }) {
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

    _selectedAnswerIndex = null;
    _lastAnswerCorrect = null;
    _correctAnswerIndex = null;
  }

  void _scheduleAdvanceToNextPuzzle() {
    _advanceAfterAnswerTimer?.cancel();
    _isAdvancingToNextPuzzle = true;
    notifyListeners();

    _advanceAfterAnswerTimer = Timer(const Duration(milliseconds: 900), () {
      () async {
        try {
          if (_pendingNextPuzzle != null) {
            _setNextPuzzleFromPayload(
              puzzle: _pendingNextPuzzle!,
              puzzleIndex: _pendingNextPuzzleIndex,
            );
            _pendingNextPuzzle = null;
            _pendingNextPuzzleIndex = null;
            _isAdvancingToNextPuzzle = false;
            notifyListeners();
            return;
          }

          await refreshRoomStatus(bypassThrottle: true);
        } finally {
          _isAdvancingToNextPuzzle = false;
          notifyListeners();
        }
      }();
    });
  }

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

  // ✅ **تحقق من أن المستخدم الحالي هو منشئ الغرفة (Host)**
  bool get isHost =>
      _hostId != null &&
      _hostId!.isNotEmpty &&
      _authProvider != null &&
      _authProvider!.userId.toString() == _hostId;

  // ✅ **تحقق من أن المستخدم له دور إداري (manager/co_manager)**
  bool get isAdminOrManager {
    if (_authProvider == null || _authProvider!.userId == null) return false;
    final myId = _authProvider!.userId?.toString();
    if (myId == null) return false;

    final me = _roomParticipants.firstWhere(
      (p) => _participantId(p) == myId,
      orElse: () => {},
    );

    final role = me['role']?.toString() ?? '';
    return role == 'manager' || role == 'admin' || role == 'co_manager';
  }

  bool _canKickUser(Map<String, dynamic> targetUser) {
    if (!isAdminOrManager) return false;

    final targetRole = targetUser['role']?.toString() ?? 'player';
    if ((targetRole == 'manager' || targetRole == 'admin') && !isHost) {
      return false;
    }

    final targetId = _participantId(targetUser);
    final myId = _authProvider?.userId?.toString();
    return targetId != myId;
  }

  String? _participantId(Map<String, dynamic> p) {
    final v = p['userId'] ?? p['user_id'] ?? p['user'];
    return v?.toString();
  }

  Map<String, dynamic> _normalizeParticipantFromApi(Map<String, dynamic> p) {
    final out = Map<String, dynamic>.from(p);
    out['userId'] = (p['userId'] ?? p['user_id'])?.toString();
    final ir = p['isReady'] ?? p['is_ready'];
    out['isReady'] = ir == true || ir == 1 || ir == '1';
    return out;
  }

  void _mergeRoomParticipantsFromRealtime(List<dynamic> incomingDyn) {
    final incoming = incomingDyn
        .whereType<Map>()
        .map((e) => Map<String, dynamic>.from(e))
        .toList();

    final byIdExisting = <String, Map<String, dynamic>>{};
    for (final p in _roomParticipants) {
      final id = _participantId(p);
      if (id != null) byIdExisting[id] = p;
    }

    final merged = <Map<String, dynamic>>[];
    for (final inc in incoming) {
      final id = _participantId(inc);
      if (id == null) continue;
      final existing = byIdExisting[id];
      final out = existing != null
          ? Map<String, dynamic>.from(existing)
          : <String, dynamic>{};
      out['userId'] = id;
      out['username'] = inc['username'] ?? out['username'];
      if (inc.containsKey('isReady')) out['isReady'] = inc['isReady'] == true;
      merged.add(out);
    }

    for (final p in _roomParticipants) {
      final id = _participantId(p);
      if (id == null) continue;
      if (merged.any((m) => _participantId(m) == id)) continue;
      merged.add(p);
    }

    _roomParticipants = merged;
    _roomParticipants.sort((a, b) {
      final scoreA = (a['score'] as num?)?.toInt() ?? 0;
      final scoreB = (b['score'] as num?)?.toInt() ?? 0;
      if (scoreA != scoreB) return scoreB.compareTo(scoreA);
      final solvedA = (a['puzzles_solved'] as num?)?.toInt() ?? 0;
      final solvedB = (b['puzzles_solved'] as num?)?.toInt() ?? 0;
      if (solvedA != solvedB) return solvedB.compareTo(solvedA);
      return (a['username']?.toString() ?? '').compareTo(
        b['username']?.toString() ?? '',
      );
    });
  }

  Map<String, dynamic> _normalizePuzzle(Map<String, dynamic> puzzle) {
    final normalized = Map<String, dynamic>.from(puzzle);
    normalized['question'] = normalized['question'] ?? 'سؤال غير متوفر';
    normalized['options'] = (normalized['options'] as List?) ?? <dynamic>[];
    normalized['type'] = normalized['type'] ?? 'quiz';
    return normalized;
  }

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
    String puzzleSource = 'database',
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

      // ✅ استخرج hostId من room.created_by عند الإنشاء
      if (_currentRoom != null && _currentRoom!['created_by'] != null) {
        _hostId = _currentRoom!['created_by'].toString();
        debugPrint('👑 Host ID set from createRoom: $_hostId');
      }

      _connectRealtime();
      _errorMessage = null;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'فشل إنشاء الغرفة: $e';
      debugPrint(_errorMessage);
      notifyListeners();
    }
  }

  Future<void> joinRoom(String code) async {
    try {
      final result = await _service.joinRoom(code);
      _currentRoom = result['room'];

      // ✅ استخرج hostId من room.created_by عند الانضمام
      if (_currentRoom != null && _currentRoom!['created_by'] != null) {
        _hostId = _currentRoom!['created_by'].toString();
        debugPrint('👑 Host ID set from joinRoom: $_hostId');
      }

      _connectRealtime();
      await refreshRoomStatus();
      await loadMyRooms();
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      debugPrint(_errorMessage);
      return;
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

    _realtimeSub?.cancel();
    _usePolling = true;
    _startHttpPolling();
  }

  void _startHttpPolling() {
    _pollingTimer?.cancel();
    _pollOnce();

    _pollingTimer = Timer.periodic(Duration(seconds: _pollingIntervalSeconds), (
      _,
    ) async {
      if (!_usePolling || _currentRoom == null) return;
      await _pollOnce();
    });
  }

  Future<void> _pollOnce() async {
    if (!_usePolling || _currentRoom == null) return;

    try {
      final roomId = _currentRoom!['id'];
      final response = await _service.getRoomEvents(roomId);

      if (response != null) {
        final eventHash = response.toString().hashCode.toString();
        if (eventHash != _lastPolledEventHash) {
          _lastPolledEventHash = eventHash;
          _handleRealtimeEvent(response);
        }
      }
    } catch (e) {
      debugPrint('HTTP polling error: $e');
    }
  }

  void _handleRealtimeEvent(Map<String, dynamic> event) {
    if (event['type'] == 'error' || event['type'] == 'closed') {
      if (_usePolling) {
        debugPrint('HTTP polling event error/closed: ${event['message']}');
      } else {
        _errorMessage =
            event['message'] ??
            (event['type'] == 'closed' ? 'WebSocket closed' : null);
        notifyListeners();
      }
      return;
    }
    switch (event['type']) {
      case 'init':
        _messages = List<Map<String, dynamic>>.from(event['messages'] ?? []);
        _mergeRoomParticipantsFromRealtime(event['participants'] ?? []);
        _hostId = event['hostId']?.toString();

        final myId = _authProvider?.userId?.toString();
        if (myId != null) {
          final me = _roomParticipants.firstWhere(
            (p) => _participantId(p) == myId,
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
        _mergeRoomParticipantsFromRealtime(event['participants'] ?? []);
        _hostId = event['hostId']?.toString();
        break;
      case 'ready_status':
        _mergeRoomParticipantsFromRealtime(event['participants'] ?? []);
        final myId = _authProvider?.userId?.toString();
        if (event['userId']?.toString() == myId && myId != null) {
          _isReady = event['isReady'] ?? false;
        }
        break;

      case 'user_kicked':
        _mergeRoomParticipantsFromRealtime(event['participants'] ?? []);
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
        _currentPuzzleIndex = event['puzzleIndex'] ?? _currentPuzzleIndex;
        _totalPuzzles = event['totalPuzzles'] ?? 5;
        _solvedByUsername = null;
        _gameFinished = false;
        _selectedAnswerIndex = null;
        _lastAnswerCorrect = null;
        _correctAnswerIndex = null;

        refreshRoomStatus();
        _puzzleStartTime = DateTime.now();
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
        debugPrint('🆕 NEW_PUZZLE event received - clearing answer state');
        _currentPuzzleIndex =
            event['gameState']['currentPuzzleIndex'] ??
            event['puzzleIndex'] ??
            _currentPuzzleIndex;
        _solvedByUsername = null;
        _selectedAnswerIndex = null;
        _lastAnswerCorrect = null;
        _correctAnswerIndex = null;
        debugPrint(
          '✅ Answer state cleared: selectedIdx=$_selectedAnswerIndex, lastCorrect=$_lastAnswerCorrect, correctIdx=$_correctAnswerIndex',
        );

        refreshRoomStatus();
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
    bool trustPuzzleIndex = true,
  }) {
    if (gameState == null) return;
    _gameStarted = gameState['status'] == 'active';
    _gameFinished = gameState['status'] == 'finished';
    if (trustPuzzleIndex) {
      final idxRaw =
          gameState['currentPuzzleIndex'] ?? gameState['current_puzzle_index'];
      if (idxRaw != null) {
        _currentPuzzleIndex =
            int.tryParse(idxRaw.toString()) ?? _currentPuzzleIndex;
      }
    }
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

    if (puzzle != null) {
      _currentPuzzle = _normalizePuzzle(Map<String, dynamic>.from(puzzle));
      _puzzleStartTime = DateTime.now();
    }
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

  Future<void> refreshRoomStatus({bool bypassThrottle = false}) {
    if (_currentRoom == null) return Future.value();

    if (_refreshInFlight != null) return _refreshInFlight!;

    final now = DateTime.now();
    final last = _lastRefreshAt;
    if (!bypassThrottle &&
        last != null &&
        now.difference(last) < const Duration(milliseconds: 350)) {
      return Future.value();
    }
    _lastRefreshAt = now;

    final f = _doRefreshRoomStatus();
    _refreshInFlight = f;
    return f.whenComplete(() {
      _refreshInFlight = null;
    });
  }

  Future<void> _doRefreshRoomStatus() async {
    try {
      debugPrint('🔄 Refreshing room status for room ${_currentRoom!['id']}');
      final prevPuzzleIndex = _currentPuzzleIndex;
      final result = await _service.getRoomStatus(_currentRoom!['id']);
      _currentRoom = result['room'];

      // ✅ **الخطوة الحاسمة: استخراج hostId من room.created_by**
      if (_currentRoom != null && _currentRoom!['created_by'] != null) {
        _hostId = _currentRoom!['created_by'].toString();
        debugPrint('👑 Host ID set from getRoomStatus: $_hostId');
      }

      final roomStatus = _currentRoom!['status']?.toString() ?? 'unknown';

      final idxRaw =
          result['currentPuzzleIndex'] ?? result['current_puzzle_index'];
      if (idxRaw != null) {
        final parsed = int.tryParse(idxRaw.toString());
        if (parsed != null) {
          if (roomStatus == 'active' && parsed < _currentPuzzleIndex) {
            debugPrint(
              '⚠️ Ignoring server puzzle index rollback: server=$parsed local=$_currentPuzzleIndex',
            );
          } else {
            _currentPuzzleIndex = parsed;
          }
        }
      }

      if (_currentPuzzleIndex != prevPuzzleIndex) {
        _selectedAnswerIndex = null;
        _lastAnswerCorrect = null;
        _correctAnswerIndex = null;
      }

      _roomParticipants = List<Map<String, dynamic>>.from(
        (result['participants'] ?? []).map(
          (p) => _normalizeParticipantFromApi(Map<String, dynamic>.from(p)),
        ),
      );
      _roomParticipants.sort((a, b) {
        final scoreA = (a['score'] as num?)?.toInt() ?? 0;
        final scoreB = (b['score'] as num?)?.toInt() ?? 0;
        if (scoreA != scoreB) return scoreB.compareTo(scoreA);
        final solvedA = (a['puzzles_solved'] as num?)?.toInt() ?? 0;
        final solvedB = (b['puzzles_solved'] as num?)?.toInt() ?? 0;
        if (solvedA != solvedB) return solvedB.compareTo(solvedA);
        return (a['username']?.toString() ?? '').compareTo(
          b['username']?.toString() ?? '',
        );
      });

      final puzzle = result['currentPuzzle'];
      final globalPuzzle = result['globalCurrentPuzzle'];
      debugPrint(
        '📊 Room status: $roomStatus, puzzle: ${puzzle != null ? 'present' : 'null'}',
      );

      if (puzzle != null) {
        if (_selectedAnswerIndex != null && !_isAdvancingToNextPuzzle) {
          debugPrint('⏸️ Skipping puzzle overwrite during answered window');
          notifyListeners();
          return;
        }

        final normalized = _normalizePuzzle(Map<String, dynamic>.from(puzzle));
        final opts = (normalized['options'] as List?) ?? const [];
        final q = normalized['question']?.toString().trim() ?? '';

        debugPrint('🔄 PUZZLE REFRESH: Index=$_currentPuzzleIndex');
        debugPrint('📄 Question: $q');
        debugPrint('📄 Options: ${opts.length}');
        debugPrint('📄 Puzzle ID: ${normalized['puzzleId'] ?? 'N/A'}');

        if (opts.isEmpty) {
          debugPrint('⚠️ Received puzzle without options');
          if (_currentPuzzle != null &&
              (_currentPuzzle!['options'] as List?)?.isNotEmpty == true) {
            debugPrint('⚠️ Keeping existing valid puzzle');
            notifyListeners();
            return;
          }
          debugPrint('⚠️ No valid puzzle available');
          notifyListeners();
          return;
        }

        _gameStarted = roomStatus == 'active';
        _updateGameState(
          _currentRoom!,
          puzzle: normalized,
          trustPuzzleIndex: false,
        );
        debugPrint('✅ Puzzle loaded successfully: ${opts.length} options');
        notifyListeners();
        return;
      }

      if (roomStatus == 'active' && globalPuzzle != null) {
        final normalized = _normalizePuzzle(
          Map<String, dynamic>.from(globalPuzzle),
        );
        final opts = (normalized['options'] as List?) ?? const [];
        if (opts.isNotEmpty) {
          debugPrint(
            '⚠️ Using globalCurrentPuzzle fallback to avoid loading spinner',
          );
          _gameStarted = true;
          _currentPuzzle = normalized;
          _puzzleStartTime = DateTime.now();
          notifyListeners();
          return;
        }
      }

      _updateGameState(_currentRoom!, puzzle: null, trustPuzzleIndex: false);
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error refreshing room status: $e');
      _errorMessage = 'فشل تحديث حالة الغرفة: $e';
      notifyListeners();
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
    _isStartingGame = true;
    notifyListeners();
    try {
      await refreshRoomStatus();
      final status = _currentRoom?['status']?.toString() ?? 'unknown';
      debugPrint('Starting game requested. Current room status: $status');

      if (status != 'waiting') {
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
      await refreshRoomStatus();
      _gameStarted = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error starting game: $e');
      _errorMessage = 'فشل بدء اللعبة: $e';
      await refreshRoomStatus();
      notifyListeners();
    } finally {
      _isStartingGame = false;
      notifyListeners();
    }
  }

  Future<void> nextPuzzle() async {
    if (_currentRoom == null) return;
    try {
      await refreshRoomStatus(bypassThrottle: true);
      final status = _currentRoom?['status']?.toString() ?? 'unknown';
      debugPrint(
        'Host requested next puzzle for room ${_currentRoom!['id']} (status: $status)',
      );

      if (status == 'waiting') {
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

      await _service.nextPuzzle(_currentRoom!['id']);
      await refreshRoomStatus(bypassThrottle: true);
    } catch (e) {
      debugPrint('Error advancing to next puzzle: $e');
      _errorMessage = 'فشل تبديل السؤال: $e';
      await refreshRoomStatus(bypassThrottle: true);
      notifyListeners();
    }
  }

  Future<void> toggleReady(bool ready) async {
    if (_currentRoom == null) return;
    try {
      _isReady = ready;
      notifyListeners();
      await _service.setReady(_currentRoom!['id'], ready);
      _realtime.send({'type': 'toggle_ready', 'isReady': ready});
    } catch (e) {
      debugPrint('Error toggling ready: $e');
    }
  }

  Future<void> solvePuzzle(int puzzleIndex) async {
    _realtime.send({'type': 'solve_puzzle', 'puzzleIndex': puzzleIndex});
  }

  Future<void> setReady(bool ready) async {
    if (_currentRoom == null) return;
    try {
      await _service.setReady(_currentRoom!['id'], ready);
      _isReady = ready;
      notifyListeners();
    } catch (e) {
      _errorMessage = 'تعذر تحديث الجاهزية: $e';
      debugPrint(_errorMessage);
      notifyListeners();
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

        if (result['isFirstCorrect'] == true) {
          // Will be updated by WebSocket event 'puzzle_solved_first'
        } else if (result['rank'] != null) {
          debugPrint('Solved correctly! Rank: ${result['rank']}');
        }
      } else {
        debugPrint('Incorrect answer');
      }

      notifyListeners();
    } catch (e) {
      _errorMessage = 'تعذر إرسال الإجابة: $e';
      debugPrint(_errorMessage);
      notifyListeners();
    }
  }

  Future<void> submitQuizAnswer(int answerIndex) async {
    if (_currentRoom == null || _currentPuzzle == null) return;

    final timeTaken = _puzzleStartTime != null
        ? DateTime.now().difference(_puzzleStartTime!).inMilliseconds
        : 0;

    try {
      final opts = (_currentPuzzle!['options'] as List?) ?? const [];
      if (opts.isEmpty) {
        _errorMessage =
            'لا توجد خيارات متاحة لهذا السؤال، يرجى تحديث السؤال أو انتظار الإدارة لإرسال لغز صالح.';
        notifyListeners();
        await refreshRoomStatus();
        return;
      }
      if (answerIndex < 0 || answerIndex >= opts.length) {
        _errorMessage = 'اختيار غير صالح، يرجى إعادة المحاولة.';
        notifyListeners();
        return;
      }

      _selectedAnswerIndex = answerIndex;
      notifyListeners();

      final submissionPuzzleIndex = _currentPuzzleIndex;

      final status = _currentRoom?['status']?.toString() ?? 'unknown';

      if (status != 'active' && !_gameStarted) {
        _errorMessage =
            'لا يمكن إرسال الإجابة لأن اللعبة لم تبدأ بعد (الحالة: $status)';
        notifyListeners();
        return;
      }

      if (_totalPuzzles > 0 && submissionPuzzleIndex >= _totalPuzzles) {
        _errorMessage = 'رقم اللغز غير صالح، يرجى تحديث حالة الغرفة.';
        notifyListeners();
        await refreshRoomStatus();
        return;
      }

      final result = await _service.submitQuizAnswer(
        roomId: _currentRoom!['id'],
        puzzleIndex: submissionPuzzleIndex,
        answerIndex: answerIndex,
        timeTaken: timeTaken,
      );

      _lastAnswerCorrect = result['isCorrect'] == true;
      if (result['correctIndex'] != null) {
        _correctAnswerIndex = int.tryParse(result['correctIndex'].toString());
      }

      if (result['isCorrect'] == true) {
        _score += result['points'] as int? ?? 0;
        _puzzlesSolved++;
        debugPrint(
          'Correct! Points: ${result['points']}, First: ${result['isFirstCorrect']}',
        );
      } else {
        debugPrint('Incorrect answer');
      }

      _pendingNextPuzzle = null;
      _pendingNextPuzzleIndex = null;
      if (result['nextPuzzle'] != null) {
        _pendingNextPuzzle = Map<String, dynamic>.from(result['nextPuzzle']);
        if (result['nextPuzzleIndex'] != null) {
          _pendingNextPuzzleIndex = int.tryParse(
            result['nextPuzzleIndex'].toString(),
          );
        }
      }

      if (result['gameFinished'] == true) {
        _gameFinished = true;
        _advanceAfterAnswerTimer?.cancel();
        _advanceAfterAnswerTimer = null;
        _pendingNextPuzzle = null;
        _pendingNextPuzzleIndex = null;
        _isAdvancingToNextPuzzle = false;
        notifyListeners();
        await refreshRoomStatus(bypassThrottle: true);
      } else {
        _scheduleAdvanceToNextPuzzle();
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error submitting quiz answer: $e');
      _errorMessage = 'تعذر إرسال إجابة الاختبار: $e';
      notifyListeners();
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
      _errorMessage = 'فشل الانضمام للمسابقة: $e';
      debugPrint(_errorMessage);
      notifyListeners();
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

  Future<void> leaveRoom({bool permanent = false}) async {
    if (_currentRoom != null) {
      try {
        await _service.leaveRoom(_currentRoom!['id'], permanent: permanent);
      } catch (e) {
        debugPrint('Error during leave API: $e');
      }
    }
    _resetRoomState();
    await loadMyRooms();
    notifyListeners();
  }

  Future<void> deleteRoom() async {
    if (_currentRoom == null) return;

    try {
      if (!isHost) {
        _errorMessage = 'فقط صاحب الغرفة يمكنه حذفها.';
        notifyListeners();
        return;
      }

      final roomId = _currentRoom!['id'];
      debugPrint('🗑️ Deleting room $roomId...');

      await _service.deleteRoom(roomId);

      debugPrint('✅ Room deleted successfully');
      _resetRoomState();
      await loadMyRooms();
      notifyListeners();
    } catch (e) {
      debugPrint('❌ Error deleting room: $e');
      _errorMessage = 'فشل في حذف المجموعة: $e';
      notifyListeners();
    }
  }

  Future<void> reopenRoom() async {
    if (_currentRoom == null) return;
    try {
      await _service.reopenRoom(_currentRoom!['id']);
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

  Future<Map<String, dynamic>> getRoomSettings(int roomId) async {
    return _service.getRoomSettings(roomId);
  }

  Future<void> updateRoomSettings(
    int roomId,
    Map<String, dynamic> settings,
  ) async {
    await _service.updateRoomSettings(roomId, settings);
  }

  Future<Map<String, dynamic>> getHint(int roomId, int puzzleIndex) async {
    return _service.getHint(roomId, puzzleIndex);
  }

  Future<void> reportBadPuzzle(
    int roomId,
    int puzzleIndex,
    String reportType,
    String details,
  ) async {
    await _service.reportBadPuzzle(roomId, puzzleIndex, reportType, details);
  }

  int? get currentRoomId => _currentRoom?['id'] as int?;
  int? get currentDifficulty => _currentRoom?['difficulty'] as int?;

  Future<void> skipPuzzle(int roomId) async {
    await _service.skipPuzzle(roomId);
    notifyListeners();
  }

  Future<void> resetScores(int roomId) async {
    await _service.resetScores(roomId);
    _score = 0;
    _puzzlesSolved = 0;
    for (var participant in _roomParticipants) {
      participant['score'] = 0;
    }
    notifyListeners();
  }

  Future<void> changeDifficulty(int roomId, int difficulty) async {
    await _service.changeDifficulty(roomId, difficulty);
    if (_currentRoom != null) {
      _currentRoom!['difficulty'] = difficulty;
    }
    notifyListeners();
  }

  Future<void> freezePlayer(int roomId, String userId, bool freeze) async {
    if (!isAdminOrManager) {
      _errorMessage = 'ليس لديك صلاحيات لتجميد اللاعبين';
      notifyListeners();
      return;
    }

    try {
      await _service.freezePlayer(roomId, userId, freeze);
      final participantIndex = _roomParticipants.indexWhere(
        (p) => _participantId(p) == userId,
      );
      if (participantIndex >= 0) {
        _roomParticipants[participantIndex]['is_frozen'] = freeze;
      }
      notifyListeners();
    } catch (e) {
      _errorMessage = 'فشل في ${freeze ? "تجميد" : "إلغاء تجميد"} اللاعب: $e';
      debugPrint(_errorMessage);
      notifyListeners();
    }
  }

  Future<void> kickPlayer(int roomId, String userId) async {
    if (!isAdminOrManager) {
      _errorMessage = 'ليس لديك صلاحيات لطرد اللاعبين';
      notifyListeners();
      return;
    }

    final targetUser = _roomParticipants.firstWhere(
      (p) => _participantId(p) == userId,
      orElse: () => {},
    );

    if (targetUser.isEmpty) {
      _errorMessage = 'لم يتم العثور على اللاعب';
      notifyListeners();
      return;
    }

    if (!_canKickUser(targetUser)) {
      _errorMessage = 'لا يمكنك طرد هذا اللاعب';
      notifyListeners();
      return;
    }

    try {
      await _service.kickPlayer(roomId, userId);
      _roomParticipants.removeWhere((p) => _participantId(p) == userId);
      notifyListeners();
    } catch (e) {
      _errorMessage = 'فشل في طرد اللاعب: $e';
      debugPrint(_errorMessage);
      notifyListeners();
    }
  }

  Future<void> promoteToCoManager(int roomId, String userId) async {
    if (!isHost) {
      _errorMessage = 'فقط مدير الغرفة يمكنه ترقية اللاعبين';
      notifyListeners();
      return;
    }

    final targetUser = _roomParticipants.firstWhere(
      (p) => _participantId(p) == userId,
      orElse: () => {},
    );

    if (targetUser.isEmpty) {
      _errorMessage = 'لم يتم العثور على اللاعب';
      notifyListeners();
      return;
    }

    final targetRole = targetUser['role']?.toString() ?? 'player';
    if (targetRole == 'manager' ||
        targetRole == 'admin' ||
        targetRole == 'co_manager') {
      _errorMessage = 'هذا اللاعب مدير بالفعل';
      notifyListeners();
      return;
    }

    try {
      await _service.promoteToCoManager(roomId, userId);
      final participantIndex = _roomParticipants.indexWhere(
        (p) => _participantId(p) == userId,
      );
      if (participantIndex >= 0) {
        _roomParticipants[participantIndex]['role'] = 'co_manager';
      }
      notifyListeners();
    } catch (e) {
      _errorMessage = 'فشل في ترقية اللاعب: $e';
      debugPrint(_errorMessage);
      notifyListeners();
    }
  }

  void _resetRoomState() {
    _advanceAfterAnswerTimer?.cancel();
    _advanceAfterAnswerTimer = null;
    _pendingNextPuzzle = null;
    _pendingNextPuzzleIndex = null;
    _isAdvancingToNextPuzzle = false;
    _realtime.disconnect();
    _realtimeSub?.cancel();
    _realtimeSub = null;
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _usePolling = false;
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
    _hostId = null; // ✅ أعد تعيين hostId عند إعادة تعيين الحالة
    notifyListeners();
  }

  @override
  void dispose() {
    _advanceAfterAnswerTimer?.cancel();
    _advanceAfterAnswerTimer = null;
    _realtime.dispose();
    _realtimeSub?.cancel();
    super.dispose();
  }
}
