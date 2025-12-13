import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class AuthService {
  // TODO: Update this with your actual deployed Cloudflare Worker URL or localhost
  static const String _baseUrl =
      'https://wonder-link-backend.amhmeed31.workers.dev';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> getToken() async {
    return await _storage.read(key: 'jwt_token');
  }

  Future<void> _saveToken(String token) async {
    await _storage.write(key: 'jwt_token', value: token);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt_token');
  }

  Future<Map<String, dynamic>> register(
    String username,
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 201) {
      final data = jsonDecode(response.body);
      await _saveToken(data['token']);
      return data['user'];
    } else {
      throw Exception(response.body);
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      await _saveToken(data['token']);
      return data['user'];
    } else {
      throw Exception('Login failed: ${response.body}');
    }
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    final token = await getToken();
    if (token == null) return null;

    final response = await http.get(
      Uri.parse('$_baseUrl/auth/me'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      // Token might be invalid or expired
      await logout();
      return null;
    }
  }

  Future<void> deleteAccount() async {
    final token = await getToken();
    if (token == null) return;

    await http.delete(
      Uri.parse('$_baseUrl/auth/me'),
      headers: {'Authorization': 'Bearer $token'},
    );
    await logout();
  }

  Future<void> resetPassword(String email, String newPassword) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/reset'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'newPassword': newPassword}),
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw Exception('Reset failed: ${response.body}');
    }
  }

  // --- Progress Sync ---

  Future<void> saveProgress(int level, int score, int stars) async {
    final token = await getToken();
    if (token == null) return;

    await http.post(
      Uri.parse('$_baseUrl/progress'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'level': level, 'score': score, 'stars': stars}),
    );
  }

  Future<List<dynamic>> getProgress() async {
    final token = await getToken();
    if (token == null) return [];

    final response = await http.get(
      Uri.parse('$_baseUrl/progress'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body) as List<dynamic>;
    }
    return [];
  }
}
