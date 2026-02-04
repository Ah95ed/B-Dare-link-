import 'dart:async';
import 'package:flutter/foundation.dart';

/// ChatProvider - Handles all chat/messaging state separately
/// This prevents chat updates from triggering game state rebuilds
class ChatProvider with ChangeNotifier {
  List<Map<String, dynamic>> _messages = [];

  // Batching configuration
  Timer? _messageBatchTimer;
  final List<Map<String, dynamic>> _messageBatch = [];
  final Duration _batchDuration = const Duration(milliseconds: 500);

  List<Map<String, dynamic>> get messages => _messages;
  int get messageCount => _messages.length;

  /// Add a single message and batch it with others
  void addMessage(Map<String, dynamic> message) {
    _messageBatch.add(message);
    _resetBatchTimer();
  }

  /// Add multiple messages at once
  void addMessages(List<Map<String, dynamic>> newMessages) {
    _messageBatch.addAll(newMessages);
    _resetBatchTimer();
  }

  /// Reset the batch timer
  void _resetBatchTimer() {
    _messageBatchTimer?.cancel();

    // If batch is large enough, flush immediately
    if (_messageBatch.length >= 10) {
      _flushBatch();
      return;
    }

    // Otherwise wait for batch duration
    _messageBatchTimer = Timer(_batchDuration, _flushBatch);
  }

  /// Flush all batched messages to the main list
  void _flushBatch() {
    if (_messageBatch.isEmpty) return;

    _messageBatchTimer?.cancel();
    _messageBatchTimer = null;

    // Add all batched messages
    _messages.addAll(_messageBatch);

    // Keep only last 100 messages to avoid memory issues
    if (_messages.length > 100) {
      _messages = _messages.sublist(_messages.length - 100);
    }

    _messageBatch.clear();

    // Single notify after batching
    notifyListeners();
  }

  /// Clear all messages
  void clearMessages() {
    _messages.clear();
    _messageBatch.clear();
    _messageBatchTimer?.cancel();
    notifyListeners();
  }

  @override
  void dispose() {
    _messageBatchTimer?.cancel();
    super.dispose();
  }
}
