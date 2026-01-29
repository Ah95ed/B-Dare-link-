/// Sealed class for authentication states following OOP best practices
sealed class AuthState {
  const AuthState();
}

/// Initial state when app first loads
class AuthStateInitial extends AuthState {
  const AuthStateInitial();
}

/// Loading state during async operations
class AuthStateLoading extends AuthState {
  const AuthStateLoading();
}

/// Authenticated state with user data
class AuthStateAuthenticated extends AuthState {
  final Map<String, dynamic> user;

  const AuthStateAuthenticated(this.user);
}

/// Unauthenticated state (logged out)
class AuthStateUnauthenticated extends AuthState {
  const AuthStateUnauthenticated();
}

/// Error state with error message
class AuthStateError extends AuthState {
  final String message;
  final Exception? exception;

  const AuthStateError(this.message, [this.exception]);
}
