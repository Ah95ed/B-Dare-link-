import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../constants/app_constants.dart';

import '../../services/auth_service.dart';

const String _devAdminToken = String.fromEnvironment(
  'DEV_ADMIN_TOKEN',
  defaultValue: '',
);

/// Same base resolution as [CloudflareApiService] (dart-define API_BASE_URL / WORKER_URL).
const String _defaultWorkerUrl = AppConstants.defaultBaseUrl;
const String _apiBase = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: String.fromEnvironment(
    'WORKER_URL',
    defaultValue: _defaultWorkerUrl,
  ),
);

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

  /// Solo D1 bank: server-side AI generation + insert (admin only). Players use `/api/solo/level-pack` only.
  Future<Map<String, dynamic>?> refillSoloBank({
    required int level,
    required String language,
    required int count,
  }) async {
    try {
      final uri = Uri.parse('$_apiBase/admin/solo-bank/refill');
      final token = await _getEffectiveToken();
      final resp = await http
          .post(
            uri,
            headers: {
              'Content-Type': 'application/json',
              if (token != null) 'Authorization': 'Bearer $token',
            },
            body: jsonEncode({
              'level': level.clamp(1, 100),
              'language': language == 'en' ? 'en' : 'ar',
              'count': count.clamp(1, 200),
            }),
          )
          .timeout(AppConstants.adminSoloBankRefillTimeout);

      dynamic decoded;
      try {
        decoded = jsonDecode(resp.body);
      } catch (_) {
        return {'_statusCode': resp.statusCode, '_raw': resp.body};
      }
      if ((resp.statusCode == 200 || resp.statusCode == 202) &&
          decoded is Map) {
        return Map<String, dynamic>.from(decoded);
      }
      if (decoded is Map) {
        return {
          ...Map<String, dynamic>.from(decoded),
          '_statusCode': resp.statusCode,
        };
      }
      return {'_statusCode': resp.statusCode, '_raw': resp.body};
    } catch (e) {
      debugPrint('refillSoloBank: $e');
      return null;
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

  /// Insert one or many chain puzzles into D1 (`POST /admin/puzzles`).
  ///
  /// [body] must include `puzzle` or `puzzles` or `items` per Worker contract,
  /// plus `level` / `language` as needed.
  Future<Map<String, dynamic>?> importPuzzlesPost(
    Map<String, dynamic> body,
  ) async {
    try {
      final uri = Uri.parse('$_apiBase/admin/puzzles');
      final token = await _getEffectiveToken();
      final resp = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );
      dynamic decoded;
      try {
        decoded = jsonDecode(resp.body);
      } catch (_) {
        return {'_statusCode': resp.statusCode, '_raw': resp.body};
      }
      if (decoded is Map) {
        return {
          ...Map<String, dynamic>.from(decoded),
          '_statusCode': resp.statusCode,
        };
      }
      return {'_statusCode': resp.statusCode, '_raw': resp.body};
    } catch (e) {
      debugPrint('importPuzzlesPost: $e');
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
