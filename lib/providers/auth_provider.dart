import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import '../constants/app_strings.dart';
import '../core/exceptions/app_exceptions.dart';

/// Provider for managing authentication state and operations
/// Implements Single Responsibility Principle
class AuthProvider extends ChangeNotifier {
  final AuthService _authService;

  Map<String, dynamic>? _user;
  bool _isLoading = true;
  String? _lastError;

  // Getters
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;
  int? get userId => _user?['id'];
  String? get lastError => _lastError;

  /// Constructor with dependency injection for AuthService
  AuthProvider({AuthService? authService})
    : _authService = authService ?? AuthService() {
    _initializeAuth();
  }

  /// Initialize authentication state on app startup
  Future<void> _initializeAuth() async {
    _setLoading(true);
    try {
      _user = await _authService.getCurrentUser();
      _lastError = null;
    } on AuthException catch (e) {
      debugPrint('${AppStrings.authCheckFailed}: ${e.message}');
      _lastError = e.message;
      _user = null;
    } catch (e) {
      debugPrint('${AppStrings.authCheckFailed}: $e');
      _lastError = AppStrings.authCheckFailed;
      _user = null;
    } finally {
      _setLoading(false);
    }
  }

  /// Perform user login
  Future<void> login(String email, String password) async {
    _setLoading(true);
    try {
      _user = await _authService.login(email, password);
      _lastError = null;
    } on AuthException catch (e) {
      _lastError = e.message;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Register new user
  Future<void> register(String username, String email, String password) async {
    _setLoading(true);
    try {
      _user = await _authService.register(username, email, password);
      _lastError = null;
    } on AuthException catch (e) {
      _lastError = e.message;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Perform user logout
  Future<void> logout() async {
    try {
      await _authService.logout();
      _user = null;
      _lastError = null;
      notifyListeners();
    } on StorageException catch (e) {
      debugPrint('Logout error: ${e.message}');
      _lastError = e.message;
    } catch (e) {
      debugPrint('Logout error: $e');
      _lastError = e.toString();
    }
  }

  /// Delete user account permanently
  Future<void> deleteAccount() async {
    _setLoading(true);
    try {
      await _authService.deleteAccount();
      _user = null;
      _lastError = null;
    } on AuthException catch (e) {
      _lastError = e.message;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Reset password for email
  Future<void> resetPassword(String email, String newPassword) async {
    _setLoading(true);
    try {
      await _authService.resetPassword(email, newPassword);
      _lastError = null;
    } on AuthException catch (e) {
      _lastError = e.message;
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Fetch user's progress from server
  Future<List<dynamic>> fetchProgress() async {
    if (!isAuthenticated) return [];
    try {
      return await _authService.getProgress();
    } on GameException catch (e) {
      debugPrint('${AppStrings.incompleteProgressFetch}: ${e.message}');
      return [];
    } catch (e) {
      debugPrint('${AppStrings.incompleteProgressFetch}: $e');
      return [];
    }
  }

  /// Sync progress to server
  Future<void> syncProgress(int level, int score, int stars) async {
    if (!isAuthenticated) return;
    try {
      await _authService.saveProgress(level, score, stars);
    } on GameException catch (e) {
      debugPrint('${AppStrings.failedToSyncProgress}: ${e.message}');
    } catch (e) {
      debugPrint('${AppStrings.failedToSyncProgress}: $e');
    }
  }

  /// Get JWT token from secure storage
  Future<String?> getToken() => _authService.getToken();

  /// Helper method to update loading state
  void _setLoading(bool isLoading) {
    _isLoading = isLoading;
    notifyListeners();
  }

  @override
  void dispose() {
    _user = null;
    _lastError = null;
    super.dispose();
  }
}
