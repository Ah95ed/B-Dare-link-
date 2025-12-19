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
  DateTime? _puzzleStartTime;

  // Real-time states
  List<Map<String, dynamic>> _messages = [];
  String? _solvedByUsername;
  String? _hostId;

  Map<String, dynamic>? get currentRoom => _currentRoom;
  List<Map<String, dynamic>> get roomParticipants => _roomParticipants;
  Map<String, dynamic>? get currentPuzzle => _currentPuzzle;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  bool get isReady => _isReady;
  bool get gameStarted => _gameStarted;
  bool get gameFinished => _gameFinished;
  int get score => _score;
  int get puzzlesSolved => _puzzlesSolved;
  List<Map<String, dynamic>> get messages => _messages;
  String? get solvedByUsername => _solvedByUsername;
  String? get hostId => _hostId;
  bool get isHost =>
      _hostId != null &&
      _authProvider != null &&
      _hostId == _authProvider!.userId.toString();

  // Competition state
  List<Map<String, dynamic>> _activeCompetitions = [];
  List<Map<String, dynamic>> get activeCompetitions => _activeCompetitions;

  StreamSubscription? _realtimeSub;

  Future<void> createRoom({
    String? name,
    int maxParticipants = 10,
    int puzzleCount = 5,
    int timePerPuzzle = 60,
  }) async {
    try {
      final result = await _service.createRoom(
        name: name,
        maxParticipants: maxParticipants,
        puzzleCount: puzzleCount,
        timePerPuzzle: timePerPuzzle,
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
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  void _connectRealtime() async {
    if (_currentRoom == null || _authProvider == null) return;

    final token = await _authProvider!.getToken();
    if (token == null) return;

    final roomId = _currentRoom!['id'];
    // Assuming base URL from service, convert to wss
    final baseUrl = "wonder-link-backend.amhmeed31.workers.dev";
    final wsUrl = "wss://$baseUrl/rooms/ws?roomId=$roomId";

    _realtimeSub?.cancel();
    _realtimeSub = _realtime.events.listen((event) {
      _handleRealtimeEvent(event);
    });

    _realtime.connect(wsUrl, token);
  }

  void _handleRealtimeEvent(Map<String, dynamic> event) {
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
        _messages = [..._messages, event];
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
        if (event['userId']?.toString() == _authProvider?.userId.toString()) {
          _isReady = event['isReady'] ?? false;
        }
        break;
      case 'error':
        debugPrint('Realtime Error: ${event['message']}');
        break;
      case 'kicked':
        leaveRoom();
        break;
      case 'game_started':
        _gameStarted = true;
        _currentPuzzleIndex = 0;
        _solvedByUsername = null;
        _gameFinished = false;
        break;
      case 'puzzle_solved_first':
        _solvedByUsername = event['username'];
        break;
      case 'new_puzzle':
        _currentPuzzleIndex = event['gameState']['currentPuzzleIndex'];
        _solvedByUsername = null;
        _puzzleStartTime = DateTime.now();
        break;
      case 'game_finished':
        _gameFinished = true;
        break;
    }
    notifyListeners();
  }

  void _updateGameState(Map<String, dynamic>? gameState) {
    if (gameState == null) return;
    _gameStarted = gameState['status'] == 'active';
    _gameFinished = gameState['status'] == 'finished';
    _currentPuzzleIndex = gameState['currentPuzzleIndex'] ?? 0;
  }

  bool get isConnected => _realtime.isConnected;
  bool get isConnecting => _realtime.isConnecting;

  Future<void> refreshRoomStatus() async {
    if (_currentRoom == null) return;
    try {
      final result = await _service.getRoomStatus(_currentRoom!['id']);
      _currentRoom = result['room'];
      _roomParticipants = List<Map<String, dynamic>>.from(
        result['participants'] ?? [],
      );
      _updateGameState(_currentRoom!); // room object contains status
      notifyListeners();
    } catch (e) {
      debugPrint('Error refreshing room status: $e');
    }
  }

  Future<void> sendMessage(String text) async {
    _realtime.send({'type': 'chat', 'text': text});
  }

  Future<void> startGame() async {
    _realtime.send({'type': 'start_game'});
  }

  Future<void> toggleReady(bool ready) async {
    _realtime.send({'type': 'toggle_ready', 'isReady': ready});
  }

  Future<void> kickUser(String userId) async {
    _realtime.send({'type': 'kick_user', 'targetUserId': userId});
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

    final puzzleId = _currentRoom!['current_puzzle_id'] ?? 0;

    try {
      final result = await _service.submitAnswer(
        roomId: _currentRoom!['id'],
        puzzleId: puzzleId,
        puzzleIndex: _currentPuzzleIndex,
        steps: steps,
        timeTaken: timeTaken,
      );

      if (result['isCorrect'] == true) {
        _score += result['points'] as int? ?? 0;
        _puzzlesSolved++;

        // Notify others via WebSocket that I solved it
        await solvePuzzle(_currentPuzzleIndex);
      }

      if (result['nextPuzzle'] != null) {
        _currentPuzzle = result['nextPuzzle'];
        // _currentPuzzleIndex++ is handled by WebSocket event 'new_puzzle'
        // to keep everyone synchronized.
      }

      notifyListeners();
    } catch (e) {
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

  void leaveRoom() {
    _realtime.disconnect();
    _realtimeSub?.cancel();
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
