import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/competition_service.dart';
import '../providers/auth_provider.dart';

class CompetitionProvider with ChangeNotifier {
  final CompetitionService _service = CompetitionService();
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
  Timer? _pollTimer;
  int _score = 0;
  int _puzzlesSolved = 0;
  DateTime? _puzzleStartTime;

  Map<String, dynamic>? get currentRoom => _currentRoom;
  List<Map<String, dynamic>> get roomParticipants => _roomParticipants;
  Map<String, dynamic>? get currentPuzzle => _currentPuzzle;
  int get currentPuzzleIndex => _currentPuzzleIndex;
  bool get isReady => _isReady;
  bool get gameStarted => _gameStarted;
  bool get gameFinished => _gameFinished;
  int get score => _score;
  int get puzzlesSolved => _puzzlesSolved;

  // Competition state
  List<Map<String, dynamic>> _activeCompetitions = [];
  List<Map<String, dynamic>> get activeCompetitions => _activeCompetitions;

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
      _startPolling();
      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> joinRoom(String code) async {
    try {
      final result = await _service.joinRoom(code);
      _currentRoom = result['room'];
      _startPolling();
      notifyListeners();
    } catch (e) {
      rethrow;
    }
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

    // Get puzzle ID from room's current_puzzle_id
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
        _score = result['points'] ?? 0;
        _puzzlesSolved++;
      }

      if (result['nextPuzzle'] != null) {
        _currentPuzzle = result['nextPuzzle'];
        _currentPuzzleIndex++;
        _puzzleStartTime = DateTime.now();
      }

      if (result['gameFinished'] == true) {
        _gameFinished = true;
        _stopPolling();
      }

      notifyListeners();
    } catch (e) {
      rethrow;
    }
  }

  void _startPolling() {
    _stopPolling();
    _pollTimer = Timer.periodic(const Duration(seconds: 2), (_) {
      _updateRoomStatus();
    });
  }

  void _stopPolling() {
    _pollTimer?.cancel();
    _pollTimer = null;
  }

  Future<void> _updateRoomStatus() async {
    if (_currentRoom == null) return;

    try {
      final status = await _service.getRoomStatus(_currentRoom!['id']);
      _roomParticipants = List<Map<String, dynamic>>.from(status['participants'] ?? []);

      if (status['currentPuzzle'] != null && !_gameStarted) {
        _gameStarted = true;
        _currentPuzzle = status['currentPuzzle'];
        _currentPuzzleIndex = 0;
        _puzzleStartTime = DateTime.now();
      } else if (status['currentPuzzle'] != null && _currentPuzzleIndex < status['room']['current_puzzle_index']) {
        _currentPuzzle = status['currentPuzzle'];
        _currentPuzzleIndex = status['room']['current_puzzle_index'];
        _puzzleStartTime = DateTime.now();
      }

      if (status['room']['status'] == 'finished' && !_gameFinished) {
        _gameFinished = true;
        _stopPolling();
      }

      notifyListeners();
    } catch (e) {
      debugPrint('Error polling room status: $e');
    }
  }

  Future<void> loadActiveCompetitions() async {
    try {
      final result = await _service.getActiveCompetitions();
      _activeCompetitions = List<Map<String, dynamic>>.from(result['competitions'] ?? []);
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
    _stopPolling();
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
    notifyListeners();
  }

  @override
  void dispose() {
    _stopPolling();
    super.dispose();
  }
}

