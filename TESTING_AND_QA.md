# 🧪 Testing & QA Guide - Wonder Link Game

## Quick Checklist للـ Code Quality

### Memory Management ✅
- [x] All AnimationControllers disposed in StatefulWidget.dispose()
- [x] All StreamSubscriptions canceled
- [x] All http.Client resources closed
- [x] No leaked listeners

### Exception Handling ✅
- [x] Custom exception hierarchy created
- [x] All service errors throw appropriate exceptions
- [x] Factory constructors for common error scenarios
- [x] ExceptionHandler utility for centralized management

### Code Organization ✅
- [x] Proper folder structure (constants, services, providers, views, widgets, l10n)
- [x] Single Responsibility Principle applied
- [x] Dependency Injection used throughout
- [x] No circular dependencies

### Clean Code ✅
- [x] Meaningful variable and function names
- [x] Functions < 30 lines
- [x] No magic numbers (use constants)
- [x] Const constructors where possible
- [x] Documentation for public APIs

### OOP Principles ✅
- [x] Encapsulation: Private fields with getters where needed
- [x] Inheritance: Custom exceptions extend AppException
- [x] Polymorphism: Different exception types handled appropriately
- [x] Abstraction: Abstract classes for base functionality

### Extensions & Utilities ✅
- [x] String extensions: isValidEmail, isStrongPassword, capitalize, etc.
- [x] Number extensions: toTimeFormat, toFormattedString, isBetween, etc.
- [x] List extensions: random, shuffled, getOrNull, unique
- [x] Map extensions: getOrNull, merge, filterByKey, filterByValue
- [x] DateTime extensions: isToday, isYesterday, date/time formatting
- [x] BuildContext extensions: screen metrics, responsive, snackbars, navigation
- [x] Widget extensions: withPadding, centered, onTap

---

## Testing Commands

### Build & Compile
```bash
# Clean build
flutter clean
flutter pub get

# Run with null safety checks
dart analyze

# Format code
dart format lib/
```

### Testing
```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/services/auth_service_test.dart

# Run with coverage
flutter test --coverage

# Run integration tests
flutter test integration_test/
```

### Performance
```bash
# Run with DevTools
flutter run -d <device-id> --profile

# Check memory usage
flutter run -d <device-id> --profile --verbose
```

---

## Code Review Checklist

### When Submitting Code Changes:

#### Memory Management
- [ ] All StatefulWidgets have dispose() method
- [ ] All AnimationControllers disposed
- [ ] All StreamSubscriptions canceled
- [ ] All http.Client connections closed

#### Exception Handling
- [ ] Using custom exceptions from app_exceptions.dart
- [ ] No generic Exception thrown
- [ ] Proper error messages provided
- [ ] Errors logged for debugging

#### Code Quality
- [ ] Functions are < 30 lines
- [ ] No duplicate code
- [ ] Meaningful variable names
- [ ] No commented code
- [ ] Proper error handling

#### Flutter Best Practices
- [ ] const constructors used
- [ ] Proper state management (Provider/Selector)
- [ ] No setState in build()
- [ ] Proper widget tree structure

#### Security
- [ ] Tokens stored securely
- [ ] No hardcoded credentials
- [ ] Input validation
- [ ] Proper authentication checks

#### Localization
- [ ] All text uses AppLocalizations
- [ ] No hardcoded strings
- [ ] Proper language support

---

## Common Issues & Solutions

### Issue: Memory Leaks
**Solution**: Always dispose resources
```dart
@override
void dispose() {
  _controller?.dispose();
  _subscription?.cancel();
  super.dispose();
}
```

### Issue: Unhandled Exceptions
**Solution**: Use proper exception handling
```dart
try {
  await operation();
} on NetworkException catch (e) {
  showError(e.message);
} on AuthException catch (e) {
  logout();
} catch (e) {
  showGenericError();
}
```

### Issue: Unnecessary Rebuilds
**Solution**: Use Selector for specific values
```dart
// ❌ Rebuilds on any GameProvider change
Consumer<GameProvider>(
  builder: (context, provider, _) => Text(provider.score),
)

// ✅ Only rebuilds when score changes
Selector<GameProvider, int>(
  selector: (_, provider) => provider.score,
  builder: (_, score, __) => Text(score),
)
```

### Issue: Hardcoded Values
**Solution**: Use constants
```dart
// ❌ Bad
duration: Duration(seconds: 30)

// ✅ Good
static const Duration timeout = Duration(seconds: 30);
duration: AppConstants.networkTimeout
```

---

## Performance Metrics to Monitor

### Target Metrics
- Frame rate: 60 FPS (90+ on flagship devices)
- Memory usage: < 150MB on startup
- Build time: < 2s incremental
- Launch time: < 3s cold start

### Tools
- Flutter DevTools (memory profiler)
- Android Studio Profiler
- Xcode Instruments
- Performance overlay (Ctrl+P in debug mode)

---

## Before Shipping

### Pre-Release Checklist
- [ ] All tests passing
- [ ] No compiler warnings
- [ ] No memory leaks (DevTools profiler)
- [ ] All screens tested in all supported languages
- [ ] All exception paths tested
- [ ] Performance acceptable on low-end devices
- [ ] No hardcoded strings or values
- [ ] All resources properly disposed
- [ ] Security review completed
- [ ] Offline mode tested (if applicable)

---

## Git Commit Guidelines

### Good Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Adding tests
- `chore`: Maintenance

### Examples
```
feat(auth): implement email OTP verification

fix(game): prevent level progression without login

refactor(services): use custom exceptions

docs(readme): update installation instructions

perf(home): optimize animation performance
```

---

## Continuous Improvement

### Code Review Process
1. Check memory management (dispose(), cancel())
2. Verify exception handling (proper exception types)
3. Review code organization (SRP, DI)
4. Check code quality (naming, length, duplication)
5. Verify security (no hardcoded values, secure storage)
6. Test functionality (manual + automated)

### Metrics to Track
- Test coverage (target: > 80%)
- Code duplication (target: < 5%)
- Function complexity (target: < 10)
- Security issues (target: 0)

---

## Documentation Standards

### Class Documentation
```dart
/// Handles authentication operations
/// 
/// This service manages user login, registration, and token management
/// using secure storage for JWT tokens.
/// 
/// Example:
/// ```dart
/// final auth = AuthService();
/// await auth.login('email@example.com', 'password');
/// ```
class AuthService { }
```

### Method Documentation
```dart
/// Get JWT token from secure storage
/// 
/// Returns the token if available, null if not authenticated
/// 
/// Throws [StorageException] if read operation fails
Future<String?> getToken() async { }
```

### Enum Documentation
```dart
/// Game difficulty levels
enum GameDifficulty {
  /// Easy (1-3 words)
  easy,
  /// Medium (4-6 words)
  medium,
  /// Hard (7+ words)
  hard,
}
```

---

## Quick Reference

### Exception Usage
```dart
// Network errors
throw NetworkException.timeout('Request took too long');
throw NetworkException.noConnection('No internet connection');
throw NetworkException.badRequest('Invalid request format');

// Auth errors
throw AuthException.invalidCredentials('Wrong password');
throw AuthException.tokenExpired('Please login again');

// Validation errors
throw ValidationException.emptyField('email');
throw ValidationException.invalidEmail('invalid@');

// Game errors
throw GameException.levelNotFound('Level 5');
throw GameException.puzzleLoadFailed('Failed to load puzzle');

// Storage errors
throw StorageException.readFailed('Could not read token');
throw StorageException.writeFailed('Could not save data');
```

### Extension Usage
```dart
// String
if (email.isValidEmail) { }
if (password.isStrongPassword) { }

// Number
print(300.toTimeFormat()); // "5:00"

// List
final random = items.random();
final unique = items.unique();

// BuildContext
context.showSnackBar('Success!');
context.showErrorSnackBar('Error!');

// DateTime
if (date.isToday) { }
```

---

## Resources

- [Dart Documentation](https://dart.dev/guides)
- [Flutter Best Practices](https://flutter.dev/docs/testing/best-practices)
- [Effective Dart](https://dart.dev/guides/language/effective-dart)
- [Flutter Architecture](https://flutter.dev/docs/development/architecture)

---

**Happy Coding! 🚀**
