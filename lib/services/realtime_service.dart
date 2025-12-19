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
    disconnect();
    _isConnecting = true;
    _isConnected = false;

    // URL format: wss://.../rooms/ws?roomId=...
    final uri = Uri.parse(url);
    try {
      _channel = WebSocketChannel.connect(uri, protocols: ['bearer', token]);

      _channel!.stream.listen(
        (data) {
          _isConnecting = false;
          _isConnected = true;
          try {
            final event = jsonDecode(data);
            _eventController.add(event);
          } catch (e) {
            debugPrint('Error decoding websocket message: $data');
          }
        },
        onError: (error) {
          debugPrint('WebSocket error: $error');
          _isConnecting = false;
          _isConnected = false;
          _eventController.add({'type': 'error', 'message': error.toString()});
        },
        onDone: () {
          debugPrint('WebSocket closed');
          _isConnecting = false;
          _isConnected = false;
          _channel = null;
        },
      );
    } catch (e) {
      _isConnecting = false;
      _isConnected = false;
      debugPrint('Connection error: $e');
    }
  }

  void send(Map<String, dynamic> data) {
    if (_channel != null && _isConnected) {
      _channel!.sink.add(jsonEncode(data));
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
