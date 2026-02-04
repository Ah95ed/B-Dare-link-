import 'dart:async';
import 'package:flutter/foundation.dart';
import '../services/competition_service.dart';

/// Handles real-time updates via HTTP polling and WebSocket
/// Separated from CompetitionProvider to focus solely on data synchronization
class RealtimeProvider with ChangeNotifier {
  final CompetitionService _service = CompetitionService();

  // Polling configuration
  Timer? _pollingTimer;
  final int _pollingIntervalSeconds = 2;
  bool _usePolling = false;
  String? _lastPolledEventHash;

  // Realtime state
  List<Map<String, dynamic>> _messages = [];
  List<Map<String, dynamic>> _participants = [];
  String? _hostId;
  int? _currentRoomId;

  // Event tracking
  String? _lastEventType;

  // Getters
  List<Map<String, dynamic>> get messages => _messages;
  List<Map<String, dynamic>> get participants => _participants;
  String? get hostId => _hostId;
  bool get isPolling => _usePolling;
  String? get lastEventType => _lastEventType;

  /// Initialize realtime connection for a room
  void initializeRoom({required int roomId, required String? createdBy}) {
    _currentRoomId = roomId;
    _hostId = createdBy?.toString();
    _messages = [];
    _participants = [];
    _startPolling();
  }

  /// Start HTTP polling for room events
  void _startPolling() {
    if (_currentRoomId == null) return;

    _pollingTimer?.cancel();
    _usePolling = true;

    // Immediate poll
    _pollOnce();

    // Periodic polling
    _pollingTimer = Timer.periodic(Duration(seconds: _pollingIntervalSeconds), (
      _,
    ) async {
      if (!_usePolling || _currentRoomId == null) return;
      await _pollOnce();
    });
  }

  /// Fetch latest room events
  Future<void> _pollOnce() async {
    if (!_usePolling || _currentRoomId == null) return;

    try {
      final response = await _service.getRoomEvents(_currentRoomId!);
      if (response == null) return;

      final eventHash = response.toString().hashCode.toString();
      if (eventHash != _lastPolledEventHash) {
        _lastPolledEventHash = eventHash;
        _handleEvent(response);
      }
    } catch (e) {
      debugPrint('❌ Polling error: $e');
    }
  }

  void _handleEvent(Map<String, dynamic> event) {
    final eventType = event['type']?.toString();
    if (eventType == null) return;

    _lastEventType = eventType;

    switch (eventType) {
      case 'init':
        _messages = List<Map<String, dynamic>>.from(event['messages'] ?? []);
        _participants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        _hostId = event['hostId']?.toString() ?? _hostId;
        break;

      case 'chat':
        final msg = event['message'];
        if (msg != null && msg is Map<String, dynamic>) {
          _messages.add(msg);
          if (_messages.length > 100) _messages.removeAt(0);
        }
        break;

      case 'user_joined':
      case 'user_left':
      case 'ready_status':
        _participants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        break;

      case 'user_kicked':
        _participants = List<Map<String, dynamic>>.from(
          event['participants'] ?? [],
        );
        break;

      case 'kicked':
      case 'room_deleted':
        _resetState();
        break;
    }

    notifyListeners();
  }

  /// Add message locally (for optimistic updates)
  void addMessageLocally(Map<String, dynamic> message) {
    _messages.add(message);
    if (_messages.length > 100) _messages.removeAt(0);
    notifyListeners();
  }

  /// Update participants list
  void updateParticipants(List<Map<String, dynamic>> participants) {
    _participants = participants;
    notifyListeners();
  }

  void _resetState() {
    _pollingTimer?.cancel();
    _pollingTimer = null;
    _usePolling = false;
    _messages = [];
    _participants = [];
    _hostId = null;
    _currentRoomId = null;
    _lastPolledEventHash = null;
  }

  /// Stop realtime connection
  @override
  void dispose() {
    _pollingTimer?.cancel();
    _resetState();
    super.dispose();
  }
}
