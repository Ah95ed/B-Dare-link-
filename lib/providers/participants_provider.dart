import 'package:flutter/foundation.dart';

/// ParticipantsProvider - Handles participant list and scoring
/// This prevents participant updates from triggering game/puzzle rebuilds
class ParticipantsProvider with ChangeNotifier {
  List<Map<String, dynamic>> _participants = [];
  String? _hostId;

  List<Map<String, dynamic>> get participants => _participants;
  String? get hostId => _hostId;

  int get participantCount => _participants.length;

  /// Check if current user is host
  bool isUserHost(String? userId) {
    if (userId == null || _hostId == null) return false;
    return userId == _hostId;
  }

  /// Get participant by user ID
  Map<String, dynamic>? getParticipant(String userId) {
    try {
      return _participants.firstWhere((p) => _participantId(p) == userId);
    } catch (e) {
      return null;
    }
  }

  /// Update participants list and sort by score
  void updateParticipants(List<Map<String, dynamic>> incoming, String? hostId) {
    _hostId = hostId;

    if (incoming.isEmpty) {
      _participants = [];
      notifyListeners();
      return;
    }

    // Merge incoming realtime data with existing participant data
    final byIdExisting = <String, Map<String, dynamic>>{};
    for (final p in _participants) {
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

      // Update realtime fields only (don't clobber score)
      out['userId'] = id;
      out['username'] = inc['username'] ?? out['username'];
      if (inc.containsKey('isReady')) {
        out['isReady'] = inc['isReady'] == true;
      }
      merged.add(out);
    }

    // Keep existing participants that weren't in realtime list (defensive)
    for (final p in _participants) {
      final id = _participantId(p);
      if (id == null) continue;
      if (merged.any((m) => _participantId(m) == id)) continue;
      merged.add(p);
    }

    _participants = merged;
    _sortByScore();
    notifyListeners();
  }

  /// Sort participants by score then puzzles solved
  void _sortByScore() {
    _participants.sort((a, b) {
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

  /// Clear all participants
  void clear() {
    _participants = [];
    _hostId = null;
    notifyListeners();
  }

  /// Extract participant ID from map
  String? _participantId(Map<String, dynamic> p) {
    return p['userId']?.toString() ?? p['id']?.toString();
  }
}
