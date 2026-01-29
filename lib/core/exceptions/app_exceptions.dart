/// Custom exception classes for better error handling
/// Follows OOP best practices with specific exception types
library;

import 'package:flutter/foundation.dart';

/// Base exception class for all app exceptions
abstract class AppException implements Exception {
  final String message;
  final dynamic originalException;

  AppException({required this.message, this.originalException});

  @override
  String toString() => message;
}

/// Network related exceptions
class NetworkException extends AppException {
  final int? statusCode;

  NetworkException({
    required super.message,
    this.statusCode,
    super.originalException,
  });

  factory NetworkException.timeout(String message) =>
      NetworkException(message: 'Request timeout: $message');

  factory NetworkException.noConnection(String message) =>
      NetworkException(message: 'No connection: $message');

  factory NetworkException.badRequest(String message) =>
      NetworkException(message: 'Bad request: $message', statusCode: 400);

  factory NetworkException.unauthorized(String message) =>
      NetworkException(message: 'Unauthorized: $message', statusCode: 401);

  factory NetworkException.forbidden(String message) =>
      NetworkException(message: 'Forbidden: $message', statusCode: 403);

  factory NetworkException.notFound(String message) =>
      NetworkException(message: 'Not found: $message', statusCode: 404);

  factory NetworkException.serverError(String message) =>
      NetworkException(message: 'Server error: $message', statusCode: 500);
}

/// Authentication related exceptions
class AuthException extends AppException {
  AuthException({required super.message, super.originalException});

  factory AuthException.invalidCredentials(String details) =>
      AuthException(message: 'Invalid credentials: $details');

  factory AuthException.registrationFailed(String details) =>
      AuthException(message: 'Registration failed: $details');

  factory AuthException.userNotFound(String details) =>
      AuthException(message: 'User not found: $details');

  factory AuthException.emailAlreadyExists(String email) =>
      AuthException(message: 'This email ($email) is already registered.');

  factory AuthException.weakPassword(String reason) =>
      AuthException(message: 'Password is too weak: $reason');

  factory AuthException.tokenExpired(String reason) =>
      AuthException(message: 'Session expired: $reason');
}

/// Validation related exceptions
class ValidationException extends AppException {
  final String? fieldName;

  ValidationException({
    required super.message,
    this.fieldName,
    super.originalException,
  });

  factory ValidationException.emptyField(String fieldName) =>
      ValidationException(
        message: '$fieldName cannot be empty.',
        fieldName: fieldName,
      );

  factory ValidationException.invalidEmail(String email) => ValidationException(
    message: 'Please enter a valid email: $email',
    fieldName: 'email',
  );

  factory ValidationException.invalidPassword(String reason) =>
      ValidationException(
        message: 'Password is invalid: $reason',
        fieldName: 'password',
      );

  factory ValidationException.invalidUsername(String reason) =>
      ValidationException(
        message: 'Username is invalid: $reason',
        fieldName: 'username',
      );

  factory ValidationException.invalidData(String details) =>
      ValidationException(message: 'Invalid data: $details');
}

/// Storage related exceptions
class StorageException extends AppException {
  StorageException({required super.message, super.originalException});

  factory StorageException.readFailed(String message) =>
      StorageException(message: 'Failed to read from storage: $message');

  factory StorageException.writeFailed(String message) =>
      StorageException(message: 'Failed to write to storage: $message');

  factory StorageException.deleteFailed(String message) =>
      StorageException(message: 'Failed to delete from storage: $message');
}

/// Game related exceptions
class GameException extends AppException {
  GameException({required super.message, super.originalException});

  factory GameException.levelNotFound(String levelId) =>
      GameException(message: 'Level $levelId not found.');

  factory GameException.puzzleLoadFailed(String details) =>
      GameException(message: 'Failed to load puzzles: $details');

  factory GameException.progressSyncFailed(String details) =>
      GameException(message: 'Failed to sync progress: $details');
}

/// Exception handler utility class
class ExceptionHandler {
  /// Get user-friendly error message
  static String getErrorMessage(Exception exception) {
    if (exception is AppException) {
      return exception.message;
    }
    return 'An unexpected error occurred.';
  }

  /// Check if exception is network related
  static bool isNetworkException(Exception exception) {
    return exception is NetworkException;
  }

  /// Check if exception is auth related
  static bool isAuthException(Exception exception) {
    return exception is AuthException;
  }

  /// Check if exception is validation related
  static bool isValidationException(Exception exception) {
    return exception is ValidationException;
  }

  /// Log exception for debugging
  static void logException(Exception exception, [StackTrace? stackTrace]) {
    debugPrint('Exception: ${exception.runtimeType}');
    debugPrint('Message: ${getErrorMessage(exception)}');
    if (stackTrace != null) {
      debugPrint('StackTrace: $stackTrace');
    }
  }
}
