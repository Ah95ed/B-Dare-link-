import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class RealtimeService {
  WebSocketChannel? _channel;
  final StreamController<Map<String, dynamic>> _eventController =
      StreamController.broadcast();

  Stream<Map<String, dynamic>> get events => _eventController.stream;

  bool get isConnected => _channel != null;

  void connect(String url, String token) {
    disconnect();

    // URL format: wss://.../rooms/ws?roomId=...
    final uri = Uri.parse(url);
    _channel = WebSocketChannel.connect(uri, protocols: ['bearer', token]);

    _channel!.stream.listen(
      (data) {
        try {
          final event = jsonDecode(data);
          _eventController.add(event);
        } catch (e) {
          debugPrint('Error decoding websocket message: $e');
        }
      },
      onError: (error) {
        debugPrint('WebSocket error: $error');
        _eventController.add({'type': 'error', 'message': error.toString()});
      },
      onDone: () {
        debugPrint('WebSocket closed');
        _channel = null;
      },
    );
  }

  void send(Map<String, dynamic> data) {
    if (_channel != null) {
      _channel!.sink.add(jsonEncode(data));
    }
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
  }

  void dispose() {
    disconnect();
    _eventController.close();
  }
}
