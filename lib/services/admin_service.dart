import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

import '../../services/auth_service.dart';

const String _devAdminToken = String.fromEnvironment(
  'DEV_ADMIN_TOKEN',
  defaultValue: '',
);
const String _apiBase = 'https://wonder-link-backend.amhmeed31.workers.dev';

/// Admin API service for puzzle management
class AdminService {
  final AuthService _auth = AuthService();

  /// Fetch puzzles with optional filters
  Future<List<dynamic>> fetchPuzzles({int? level, String? language}) async {
    try {
      final query = <String, String>{};
      if (level != null && level > 0) query['level'] = '$level';
      if (language != null && language != 'all') query['lang'] = language;

      final uri = Uri.parse(
        '$_apiBase/admin/puzzles',
      ).replace(queryParameters: query);
      final token = await _getEffectiveToken();
      final resp = await http.get(
        uri,
        headers: token != null ? {'Authorization': 'Bearer $token'} : {},
      );

      if (resp.statusCode == 200) {
        return jsonDecode(resp.body) as List<dynamic>;
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Regenerate a puzzle for a specific level
  Future<bool> regeneratePuzzle(int level, String language) async {
    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles/regenerate');
      final token = await _getEffectiveToken();
      final resp = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'level': level, 'language': language}),
      );
      return resp.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Generate bulk puzzles (100 total)
  Future<Map<String, dynamic>?> generateBulkPuzzles() async {
    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles/generate-bulk');
      final token = await _getEffectiveToken();
      final resp = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (resp.statusCode == 200) {
        return jsonDecode(resp.body) as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Delete a puzzle
  Future<bool> deletePuzzle(dynamic id) async {
    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles');
      final token = await _getEffectiveToken();
      final resp = await http.delete(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'id': id}),
      );
      return resp.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Get effective token from auth or dev override
  Future<String?> _getEffectiveToken() async {
    final token = await _auth.getToken();
    if (token != null) return token;
    if (kDebugMode && _devAdminToken.isNotEmpty) return _devAdminToken;
    return null;
  }
}
