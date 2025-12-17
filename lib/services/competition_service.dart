import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_service.dart';

class CompetitionService {
  static const String _baseUrl = 'https://wonder-link-backend.amhmeed31.workers.dev';
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
      headers: {
        if (token != null) 'Authorization': 'Bearer $token',
      },
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
      body: jsonEncode({
        'roomId': roomId,
        'isReady': isReady,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to set ready: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> submitAnswer({
    required int roomId,
    required int puzzleId,
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
        'puzzleId': puzzleId,
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

  Future<Map<String, dynamic>> getLeaderboard(int roomId) async {
    final token = await _getToken();
    final response = await http.get(
      Uri.parse('$_baseUrl/rooms/leaderboard?roomId=$roomId'),
      headers: {
        if (token != null) 'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get leaderboard: ${response.body}');
    }
  }

  // Competitions
  Future<Map<String, dynamic>> getActiveCompetitions() async {
    final response = await http.get(
      Uri.parse('$_baseUrl/competitions'),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get competitions: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> createCompetition({
    String? name,
    int maxParticipants = 100,
    int puzzleCount = 10,
    int timePerPuzzle = 60,
  }) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/competitions'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({
        'name': name,
        'maxParticipants': maxParticipants,
        'puzzleCount': puzzleCount,
        'timePerPuzzle': timePerPuzzle,
      }),
    );

    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create competition: ${response.body}');
    }
  }

  Future<Map<String, dynamic>> joinCompetition(int competitionId) async {
    final token = await _getToken();
    final response = await http.post(
      Uri.parse('$_baseUrl/competitions/join'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'competitionId': competitionId}),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to join competition: ${response.body}');
    }
  }
}

