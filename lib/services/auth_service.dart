import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'api_client.dart';
import '../constants/app_constants.dart';
import '../constants/app_strings.dart';
import '../core/exceptions/app_exceptions.dart';

/// Service for handling authentication operations
/// Follows Single Responsibility Principle by managing auth-related tasks
class AuthService {
  static const String _baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: AppConstants.defaultBaseUrl,
  );

  final FlutterSecureStorage _storage;
  late final ApiClient _client;

  /// Constructor with dependency injection
  AuthService({FlutterSecureStorage? storage})
    : _storage = storage ?? const FlutterSecureStorage() {
    _initializeClient();
  }

  /// Initialize API client with response middleware
  void _initializeClient() {
    _client = ApiClient(baseUrl: _baseUrl, getToken: getToken);

    _client.addResponseMiddleware(_handleUnauthorized);
  }

  /// Handle 401 responses by clearing token
  Future<http.Response> _handleUnauthorized(http.Response response) async {
    if (response.statusCode == 401) {
      await logout();
    }
    return response;
  }

  /// Get JWT token from secure storage
  Future<String?> getToken() async {
    try {
      return await _storage.read(key: AppConstants.jwtTokenKey);
    } catch (e) {
      throw StorageException.readFailed('Failed to read token: $e');
    }
  }

  /// Save JWT token to secure storage
  Future<void> _saveToken(String token) async {
    try {
      await _storage.write(key: AppConstants.jwtTokenKey, value: token);
    } catch (e) {
      throw StorageException.writeFailed('Failed to save token: $e');
    }
  }

  /// Clear JWT token from secure storage
  Future<void> logout() async {
    try {
      await _storage.delete(key: AppConstants.jwtTokenKey);
    } catch (e) {
      throw StorageException.deleteFailed('Failed to delete token: $e');
    }
  }

  /// Register new user
  Future<Map<String, dynamic>> register(
    String username,
    String email,
    String password,
  ) async {
    try {
      final response = await _client.request(
        'POST',
        AppStrings.authRegisterEndpoint,
        body: {'username': username, 'email': email, 'password': password},
      );

      if (response.statusCode == 201) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        await _saveToken(data['token'] as String);
        return data['user'] as Map<String, dynamic>;
      } else {
        throw AuthException.registrationFailed(response.body);
      }
    } catch (e) {
      throw AuthException.registrationFailed('$e');
    }
  }

  /// Login with email and password
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _client.request(
        'POST',
        AppStrings.authLoginEndpoint,
        body: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        await _saveToken(data['token'] as String);
        return data['user'] as Map<String, dynamic>;
      } else {
        throw AuthException.invalidCredentials(response.body);
      }
    } catch (e) {
      throw AuthException.invalidCredentials('$e');
    }
  }

  /// Get current user info
  Future<Map<String, dynamic>?> getCurrentUser() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) return null;

      final response = await _client.request(
        'GET',
        AppStrings.authMeEndpoint,
        auth: true,
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body) as Map<String, dynamic>;
      } else {
        // Token might be invalid or expired
        await logout();
        return null;
      }
    } catch (e) {
      // Token might be invalid or expired
      await logout();
      return null;
    }
  }

  /// Delete current user account
  Future<void> deleteAccount() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) {
        throw AuthException.tokenExpired('No authentication token available');
      }

      await _client.request('DELETE', AppStrings.authMeEndpoint, auth: true);
      await logout();
    } catch (e) {
      throw AuthException.userNotFound('Delete account error: $e');
    }
  }

  /// Reset password for user
  Future<void> resetPassword(String email, String newPassword) async {
    try {
      final response = await _client.request(
        'POST',
        AppStrings.authResetEndpoint,
        body: {'email': email, 'newPassword': newPassword},
      );

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw AuthException.tokenExpired(response.body);
      }
    } catch (e) {
      throw AuthException.tokenExpired('Reset password error: $e');
    }
  }

  /// Save user progress
  Future<void> saveProgress(int level, int score, int stars) async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) {
        throw AuthException.tokenExpired('No authentication token available');
      }

      await _client.request(
        'POST',
        AppStrings.progressEndpoint,
        auth: true,
        body: {'level': level, 'score': score, 'stars': stars},
      );
    } catch (e) {
      throw GameException.progressSyncFailed('$e');
    }
  }

  /// Get user progress
  Future<List<dynamic>> getProgress() async {
    try {
      final token = await getToken();
      if (token == null || token.isEmpty) return [];

      final response = await _client.request(
        'GET',
        AppStrings.progressEndpoint,
        auth: true,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data is List ? data : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  }

  /// Dispose of resources
  void dispose() {
    _client.dispose();
  }
}
