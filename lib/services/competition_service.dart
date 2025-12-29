import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class CompetitionService {
  static const String _baseUrl =
      'https://wonder-link-backend.amhmeed31.workers.dev';
  final AuthService _auth = AuthService();

  Future<String?> _getToken() async {
    return await _auth.getToken();
  }

  // Rooms
  Future<Map<String, dynamic>> createRoom({
    String? name,
    int maxParticipants = 10,
    int puzzleCount = 5,
    int timePerPuzzle = 60,
    String puzzleSource = 'ai', // 'ai', 'database', 'manual'
    int difficulty = 1,
    String language = 'ar',
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'name': name,
        'maxParticipants': maxParticipants,
        'puzzleCount': puzzleCount,
        'timePerPuzzle': timePerPuzzle,
        'puzzleSource': puzzleSource,
        'difficulty': difficulty,
        'language': language,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create room: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> joinRoom(String code) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/join'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'code': code}),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to join room: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> getRoomStatus(int roomId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/rooms/status?roomId=$roomId'),
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get room status: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> setReady(int roomId, bool isReady) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/ready'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'roomId': roomId, 'isReady': isReady}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to set ready: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> submitAnswer({
    required int roomId,
    required int puzzleIndex,
    required List<String> steps,
    required int timeTaken,
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/answer'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'roomId': roomId,
        'puzzleIndex': puzzleIndex,
        'steps': steps,
        'timeTaken': timeTaken,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to submit answer: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> submitQuizAnswer({
    required int roomId,
    required int puzzleIndex,
    required int answerIndex,
    required int timeTaken,
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/answer'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'roomId': roomId,
        'puzzleIndex': puzzleIndex,
        'answerIndex': answerIndex,
        'timeTaken': timeTaken,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to submit quiz answer: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> startGame(int roomId) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/start'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'roomId': roomId}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to start game: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> reopenRoom(int roomId) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/reopen'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'roomId': roomId}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to reopen room: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> nextPuzzle(int roomId) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/rooms/next'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'roomId': roomId}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to advance puzzle: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> getLeaderboard(int roomId) async {
    return await _get(
      '/api/rooms/status?roomId=$roomId',
    ); // Reusing status for members list mainly
  }

  Future<Map<String, dynamic>> leaveRoom(int roomId) async {
    return await _post('/api/rooms/leave', {'roomId': roomId});
  }

  Future<Map<String, dynamic>> kickUser(int roomId, String targetUserId) async {
    return await _post('/api/rooms/kick', {
      'roomId': roomId,
      'targetUserId': targetUserId,
    });
  }

  Future<void> deleteRoom(int roomId) async {
    final token = await _getToken();
    final response = await http.delete(
      Uri.parse('$_baseUrl/api/rooms/delete?roomId=$roomId'),
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete room: ${response.body}');
    }
  }

  // Competitions
  Future<Map<String, dynamic>> getActiveCompetitions() async {
    return await _get('/api/competitions/active');
  }

  Future<Map<String, dynamic>> getMyRooms() async {
    return await _get('/api/rooms/my');
  }

  Future<Map<String, dynamic>> createCompetition({
    String? name,
    int maxParticipants = 100,
    int puzzleCount = 10,
    int timePerPuzzle = 60,
  }) async {
    return await _post('/api/competitions', {
      'name': name,
      'maxParticipants': maxParticipants,
      'puzzleCount': puzzleCount,
      'timePerPuzzle': timePerPuzzle,
    });
  }

  Future<Map<String, dynamic>> joinCompetition(int competitionId) async {
    return await _post('/api/competitions/join', {
      'competitionId': competitionId,
    });
  }

  // Helpers
  Future<Map<String, dynamic>> _get(String path) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl$path'),
      headers: {if (token != null) 'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('GET $path failed: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> _post(
    String path,
    Map<String, dynamic> body,
  ) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl$path'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('POST $path failed: ${response.body}');
    }
  }
}
