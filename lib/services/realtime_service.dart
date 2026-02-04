import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class RealtimeService {
  WebSocketChannel? _channel;
  final StreamController<Map<String, dynamic>> _eventController =
      StreamController.broadcast();

  Stream<Map<String, dynamic>> get events => _eventController.stream;

  bool _isConnected = false;
  bool _isConnecting = false;
  bool get isConnected => _isConnected;
  bool get isConnecting => _isConnecting;

  void connect(String url, String token) {
    // WebSocket connection is disabled due to Cloudflare Workers limitations
    // Using HTTP polling instead in CompetitionProvider
    debugPrint('WebSocket connection deprecated. Using HTTP polling instead.');
    disconnect();
    _isConnecting = false;
    _isConnected = false;
  }

  bool send(Map<String, dynamic> data) {
    if (_channel != null && _isConnected) {
      try {
        _channel!.sink.add(jsonEncode(data));
      } catch (e) {
        debugPrint('WebSocket send exception: $e');
        return false;
      }
      debugPrint('WebSocket message sent: ${data['type']}');
      return true;
    } else {
      debugPrint(
        'WebSocket send failed - not connected. isConnected: $_isConnected, channel: ${_channel != null}',
      );
      return false;
    }
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
    _isConnecting = false;
    _isConnected = false;
  }

  void dispose() {
    disconnect();
    _eventController.close();
  }
}
