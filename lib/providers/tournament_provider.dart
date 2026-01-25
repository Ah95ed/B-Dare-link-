import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

/// Manages tournament data and participation
class TournamentProvider extends ChangeNotifier {
  static const String _baseUrl =
      'https://wonder-link-backend.amhmeed31.workers.dev';

  // Daily challenge state
  Map<String, dynamic>? _dailyChallenge;
  Map<String, dynamic>? get dailyChallenge => _dailyChallenge;

  bool _hasPlayedToday = false;
  bool get hasPlayedToday => _hasPlayedToday;

  int? _todayScore;
  int? get todayScore => _todayScore;

  int? _todayRank;
  int? get todayRank => _todayRank;

  // Leaderboards
  List<Map<String, dynamic>> _dailyLeaderboard = [];
  List<Map<String, dynamic>> get dailyLeaderboard => _dailyLeaderboard;

  List<Map<String, dynamic>> _weeklyStandings = [];
  List<Map<String, dynamic>> get weeklyStandings => _weeklyStandings;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  // Auth token
  String? _authToken;

  void setAuthToken(String? token) {
    _authToken = token;
    notifyListeners();
  }

  TournamentProvider() {
    _loadLocalState();
  }

  Future<void> _loadLocalState() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().split('T')[0];
    final lastPlayedDate = prefs.getString('tournament_last_played');

    _hasPlayedToday = lastPlayedDate == today;
    if (_hasPlayedToday) {
      _todayScore = prefs.getInt('tournament_today_score');
      _todayRank = prefs.getInt('tournament_today_rank');
    }

    notifyListeners();
  }

  Future<void> _saveLocalState() async {
    final prefs = await SharedPreferences.getInstance();
    final today = DateTime.now().toIso8601String().split('T')[0];

    await prefs.setString('tournament_last_played', today);
    if (_todayScore != null) {
      await prefs.setInt('tournament_today_score', _todayScore!);
    }
    if (_todayRank != null) {
      await prefs.setInt('tournament_today_rank', _todayRank!);
    }
  }

  /// Fetch today's daily challenge
  Future<void> fetchDailyChallenge() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/tournament/daily'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        _dailyChallenge = json.decode(response.body);
      } else {
        _error = 'Failed to fetch daily challenge';
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Submit score for daily challenge
  Future<Map<String, dynamic>?> submitDailyScore({
    required int timeTaken,
    required int mistakes,
    required bool completed,
  }) async {
    if (_authToken == null) {
      _error = 'Not authenticated';
      return null;
    }

    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/tournament/daily/submit'),
        headers: _getHeaders(),
        body: json.encode({
          'timeTaken': timeTaken,
          'mistakes': mistakes,
          'completed': completed,
        }),
      );

      if (response.statusCode == 200) {
        final result = json.decode(response.body);
        _todayScore = result['score'];
        _todayRank = result['rank'];
        _hasPlayedToday = true;
        await _saveLocalState();

        _isLoading = false;
        notifyListeners();
        return result;
      } else {
        _error = 'Failed to submit score';
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
    return null;
  }

  /// Fetch daily leaderboard
  Future<void> fetchDailyLeaderboard({String? date}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final uri = Uri.parse(
        '$_baseUrl/tournament/daily/leaderboard',
      ).replace(queryParameters: date != null ? {'date': date} : null);

      final response = await http.get(uri, headers: _getHeaders());

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _dailyLeaderboard = List<Map<String, dynamic>>.from(
          data['leaderboard'] ?? [],
        );
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Fetch weekly standings
  Future<void> fetchWeeklyStandings() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/tournament/weekly'),
        headers: _getHeaders(),
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        _weeklyStandings = List<Map<String, dynamic>>.from(
          data['standings'] ?? [],
        );
      }
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Map<String, String> _getHeaders() {
    final headers = {'Content-Type': 'application/json'};
    if (_authToken != null) {
      headers['Authorization'] = 'Bearer $_authToken';
    }
    return headers;
  }

  /// Get time remaining until next daily challenge
  Duration getTimeUntilNextChallenge() {
    final now = DateTime.now();
    final midnight = DateTime(now.year, now.month, now.day + 1);
    return midnight.difference(now);
  }
}
