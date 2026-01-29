import 'package:flutter/foundation.dart';

/// Manages room and participant state
class RoomStateManager with ChangeNotifier {
  Map<String, dynamic>? _currentRoom;
  List<Map<String, dynamic>> _roomParticipants = [];
  List<Map<String, dynamic>> _messages = [];
  String? _hostId;
  bool _isReady = false;
  String? _solvedByUsername;

  // Getters
  Map<String, dynamic>? get currentRoom => _currentRoom;
  List<Map<String, dynamic>> get roomParticipants => _roomParticipants;
  List<Map<String, dynamic>> get messages => _messages;
  String? get hostId => _hostId;
  bool get isReady => _isReady;
  String? get solvedByUsername => _solvedByUsername;

  bool get isHost => hostId != null; // Simplified check

  /// Initialize room
  void initializeRoom(Map<String, dynamic> room, String? hostId) {
    _currentRoom = room;
    _hostId = hostId;
    _roomParticipants = [];
    _messages = [];
    _isReady = false;
    notifyListeners();
  }

  /// Update participants list
  void updateParticipants(List<Map<String, dynamic>> participants) {
    _roomParticipants = participants;
    notifyListeners();
  }

  /// Add participant
  void addParticipant(Map<String, dynamic> participant) {
    _roomParticipants.add(participant);
    notifyListeners();
  }

  /// Remove participant
  void removeParticipant(String participantId) {
    _roomParticipants.removeWhere((p) => p['id'] == participantId);
    notifyListeners();
  }

  /// Update ready status
  void setReady(bool ready) {
    _isReady = ready;
    notifyListeners();
  }

  /// Add message
  void addMessage(Map<String, dynamic> message) {
    _messages.add(message);
    notifyListeners();
  }

  /// Add multiple messages
  void addMessages(List<Map<String, dynamic>> messages) {
    _messages.addAll(messages);
    notifyListeners();
  }

  /// Clear messages
  void clearMessages() {
    _messages.clear();
    notifyListeners();
  }

  /// Set who solved the puzzle
  void setSolvedBy(String? username) {
    _solvedByUsername = username;
    notifyListeners();
  }

  /// Leave room
  void leaveRoom() {
    _currentRoom = null;
    _roomParticipants = [];
    _messages = [];
    _hostId = null;
    _isReady = false;
    _solvedByUsername = null;
    notifyListeners();
  }

  /// Get participant count
  int get participantCount => _roomParticipants.length;

  /// Check if specific user is ready
  bool isParticipantReady(String userId) {
    try {
      final participant = _roomParticipants.firstWhere(
        (p) => p['id'] == userId,
        orElse: () => {},
      );
      return participant['isReady'] ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Get participant by ID
  Map<String, dynamic>? getParticipant(String userId) {
    try {
      return _roomParticipants.firstWhere((p) => p['id'] == userId);
    } catch (_) {
      return null;
    }
  }
}
