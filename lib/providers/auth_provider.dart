import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider with ChangeNotifier {
  final AuthService _authService = AuthService();

  Map<String, dynamic>? _user;
  bool _isLoading = true;

  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _user != null;

  AuthProvider() {
    _init();
  }

  Future<void> _init() async {
    try {
      _user = await _authService.getCurrentUser();
    } catch (e) {
      print("Auth check failed: $e");
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> login(String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      _user = await _authService.login(email, password);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> register(String username, String email, String password) async {
    _isLoading = true;
    notifyListeners();
    try {
      _user = await _authService.register(username, email, password);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _user = null;
    notifyListeners();
  }

  Future<void> deleteAccount() async {
    await _authService.deleteAccount();
    _user = null;
    notifyListeners();
  }

  Future<void> resetPassword(String email, String newPassword) async {
    _isLoading = true;
    notifyListeners();
    try {
      await _authService.resetPassword(email, newPassword);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Progress helpers
  Future<void> syncProgress(int level, int score, int stars) async {
    if (!isAuthenticated) return;
    try {
      await _authService.saveProgress(level, score, stars);
    } catch (e) {
      print("Failed to sync progress: $e");
    }
  }
}
