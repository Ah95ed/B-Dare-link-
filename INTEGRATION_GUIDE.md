# 📖 Complete Integration Guide

## How to Use the New Code Quality Improvements

---

## 1. Using Custom Exceptions

### Before (Generic Exceptions)
```dart
try {
  await login();
} catch (e) {
  showError('Something went wrong: $e');
}
```

### After (Typed Exceptions)
```dart
try {
  await login(email, password);
} on AuthException catch (e) {
  if (e is AuthException && e.message.contains('Invalid')) {
    showError('Email or password is incorrect');
  }
} on NetworkException catch (e) {
  showError('Network error: Please check your connection');
} on StorageException catch (e) {
  showError('Storage error: Could not save data');
} catch (e) {
  showError('Unexpected error: $e');
}
```

### In Services
```dart
// lib/services/auth_service.dart
Future<void> logout() async {
  try {
    await _storage.delete(key: AppConstants.jwtTokenKey);
  } catch (e) {
    // Use factory constructor for specific error type
    throw StorageException.deleteFailed('Failed to delete token: $e');
  }
}
```

### In Providers
```dart
// lib/providers/auth_provider.dart
Future<void> login(String email, String password) async {
  _setLoading(true);
  try {
    _user = await _authService.login(email, password);
    _lastError = null;
  } on AuthException catch (e) {
    _lastError = e.message;  // Use .message property
    rethrow;
  } finally {
    _setLoading(false);
  }
}
```

---

## 2. Using Extension Utilities

### String Extensions
```dart
import 'package:app/core/extensions/extensions.dart';

// Validation
if (email.isValidEmail) {
  // Valid email format
}

if (password.isStrongPassword) {
  // Strong password (8+ chars, contains special chars, numbers, letters)
}

// String manipulation
String name = "john doe";
print(name.capitalize());  // "John doe"

String text = "hello  world  ";
print(text.removeExtraSpaces());  // "hello world"

// Truncate long strings
String longText = "This is a very long text...";
print(longText.truncate(20));  // "This is a very long..."
```

### Number Extensions
```dart
// Format time from seconds
int seconds = 300;
print(seconds.toTimeFormat());  // "5:00"

// Format numbers with thousands separator
int number = 1000000;
print(number.toFormattedString());  // "1,000,000.00"

// Number checks
if (value.isPositive) { }
if (value.isNegative) { }
if (value.isBetween(0, 100)) { }
```

### List Extensions
```dart
// Get random item
List<String> items = ['a', 'b', 'c'];
print(items.random());  // Randomly "a", "b", or "c"

// Shuffle list
List<String> shuffled = items.shuffled();

// Safe access
int? value = items.getOrNull(10);  // Returns null if index out of range

// Get unique items
List<int> numbers = [1, 2, 2, 3, 3, 3];
print(numbers.unique());  // [1, 2, 3]
```

### Map Extensions
```dart
// Safe access
String? value = map.getOrNull('key');  // Returns null if key doesn't exist

// Merge maps
Map<String, int> result = map1.merge(map2);

// Filter by key or value
Map<String, int> evens = numbers.filterByKey((k) => k != 'odd');
Map<String, int> positive = numbers.filterByValue((v) => v > 0);
```

### DateTime Extensions
```dart
DateTime date = DateTime.now();

// Checks
if (date.isToday) { }
if (date.isYesterday) { }

// Formatting
print(date.toDateString());  // "2024-01-15"
print(date.toTimeString());  // "14:30"

// Calculations
int days = date.daysUntil(DateTime(2025, 1, 1));
```

### BuildContext Extensions
```dart
import 'package:app/core/extensions/extensions.dart';

// Get screen dimensions
context.screenWidth      // Width in pixels
context.screenHeight     // Height in pixels
context.isLandscape      // true if landscape
context.isTablet         // true if tablet device

// Responsive widgets
responsive(
  mobile: Text('Mobile view'),
  tablet: Text('Tablet view'),
)

// Show snackbars
context.showSnackBar('Success!');
context.showErrorSnackBar('Error occurred');
context.showSuccessSnackBar('Operation completed');

// Navigation
context.pop();                    // Pop current screen
context.pushNamed('/home');       // Navigate to route

// Get size info
Size size = context.screenSize;
```

### Widget Extensions
```dart
// Add padding
Text('Hello').withPadding(EdgeInsets.all(16))

// Center widget
Container(color: Colors.red).centered()

// Add tap handler
Image.asset('image.png').onTap(() {
  print('Image tapped');
})
```

---

## 3. Memory Management Best Practices

### StatefulWidget with Animations
```dart
class _MyScreenState extends State<MyScreen> with TickerProviderStateMixin {
  late AnimationController _controller;
  late StreamSubscription<T> _subscription;

  @override
  void initState() {
    super.initState();
    
    // Initialize controller
    _controller = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,  // Important for preventing jank
    )..repeat(reverse: true);  // Start animation
    
    // Subscribe to stream
    _subscription = _stream.listen((_) {
      setState(() {
        // Update state
      });
    });
  }

  @override
  void dispose() {
    // Always dispose controllers
    _controller.dispose();
    
    // Always cancel subscriptions
    _subscription.cancel();
    
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        // Build animated widget
        return Container();
      },
    );
  }
}
```

### Service Disposal
```dart
// In main.dart or app initialization
final authService = AuthService();

// ... use service ...

// Always dispose when done
authService.dispose();

// Or use Provider (automatic disposal)
ChangeNotifierProvider(
  create: (_) => AuthService(),
  dispose: (_, service) => service.dispose(),
  child: const MyApp(),
)
```

---

## 4. Code Organization Examples

### Folder Structure
```
lib/
├── core/
│   ├── exceptions/app_exceptions.dart    ✅ Use these!
│   ├── extensions/extensions.dart        ✅ Use these!
│   └── app_theme.dart
├── constants/
│   ├── app_colors.dart
│   ├── app_strings.dart                  ✅ Use for localization
│   └── app_constants.dart
├── models/
├── services/
│   ├── auth_service.dart                 ✅ Custom exceptions
│   ├── api_client.dart                   ✅ Custom exceptions
│   └── api_service.dart                  ✅ Custom exceptions
├── providers/
│   ├── auth_provider.dart                ✅ Custom exceptions
│   └── game_provider.dart
├── views/
│   ├── home_view.dart                    ✅ Proper dispose()
│   ├── auth/
│   ├── modes/
│   └── ...
└── main.dart
```

---

## 5. Best Practices Checklist

### When Writing New Code

#### 1. Use Custom Exceptions
```dart
// ✅ Good
throw AuthException.invalidCredentials('Wrong password');
throw NetworkException.timeout('Request took too long');

// ❌ Avoid
throw Exception('Login failed');
throw 'Error occurred';
```

#### 2. Use Extensions
```dart
// ✅ Good
if (email.isValidEmail) { }

// ❌ Avoid
if (_validateEmail(email)) { }
```

#### 3. Handle Exceptions Properly
```dart
// ✅ Good
try {
  await operation();
} on AuthException catch (e) {
  showError(e.message);
} on NetworkException catch (e) {
  showRetry();
} catch (e) {
  showGenericError();
}

// ❌ Avoid
try {
  await operation();
} catch (e) {
  print(e);
}
```

#### 4. Dispose Resources
```dart
// ✅ Good
@override
void dispose() {
  _controller.dispose();
  _subscription.cancel();
  super.dispose();
}

// ❌ Avoid
@override
void dispose() {
  super.dispose();
}
```

#### 5. Use Const Constructors
```dart
// ✅ Good
const SizedBox(height: 16)
const MyWidget({super.key})

// ❌ Avoid
SizedBox(height: 16)
MyWidget(key: null)
```

#### 6. Use Named Constants
```dart
// ✅ Good
static const Duration timeout = Duration(seconds: 30);
final delay = AppConstants.networkTimeout;

// ❌ Avoid
await Future.delayed(Duration(seconds: 30));
```

#### 7. Use Localization
```dart
// ✅ Good
final l10n = AppLocalizations.of(context)!;
Text(l10n.welcomeMessage)

// ❌ Avoid
Text("Welcome")
```

---

## 6. Real-World Examples

### Login Flow with Proper Error Handling
```dart
Future<void> handleLogin(String email, String password) async {
  try {
    // Validate input
    if (!email.isValidEmail) {
      throw ValidationException.invalidEmail(email);
    }
    if (password.isEmpty) {
      throw ValidationException.emptyField('password');
    }

    // Attempt login
    await authProvider.login(email, password);
    
    // Success
    context.showSuccessSnackBar('Login successful!');
    context.pushNamed('/home');
    
  } on ValidationException catch (e) {
    // Input validation error
    context.showErrorSnackBar(e.message);
  } on AuthException catch (e) {
    // Authentication error
    if (e.message.contains('not found')) {
      context.showErrorSnackBar('User not found');
    } else if (e.message.contains('Invalid')) {
      context.showErrorSnackBar('Invalid credentials');
    } else {
      context.showErrorSnackBar(e.message);
    }
  } on NetworkException catch (e) {
    // Network error
    context.showErrorSnackBar('Network error. Please try again.');
  } catch (e) {
    // Unexpected error
    context.showErrorSnackBar('Something went wrong. Please try again.');
  }
}
```

### Game Level Loading with Fallback
```dart
Future<GameLevel?> loadLevel(int levelId) async {
  try {
    // Try loading from API
    final level = await gameService.generateLevel(
      isArabic: localeProvider.isArabic,
      levelId: levelId,
    );
    
    if (level != null) {
      return level;
    }
    
    throw GameException.puzzleLoadFailed('Empty response from server');
    
  } on GameException catch (e) {
    debugPrint('Game error: ${e.message}');
    // Show error dialog and retry
    return null;
  } on NetworkException catch (e) {
    debugPrint('Network error: ${e.message}');
    // Show offline message
    return null;
  } catch (e) {
    debugPrint('Unexpected error: $e');
    return null;
  }
}
```

### Animated Widget with Proper Resource Management
```dart
class AnimatedBackground extends StatefulWidget {
  const AnimatedBackground({Key? key}) : super(key: key);

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with TickerProviderStateMixin {
  late AnimationController _gradientController;

  @override
  void initState() {
    super.initState();
    _gradientController = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _gradientController.dispose();  // Always dispose!
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _gradientController,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.blue.withOpacity(0.3 + (_gradientController.value * 0.3)),
                Colors.purple.withOpacity(0.3 + (_gradientController.value * 0.3)),
              ],
            ),
          ),
          child: child,
        );
      },
      child: const SizedBox.expand(),
    );
  }
}
```

---

## 7. Troubleshooting

### Issue: Memory Leak Warning
**Solution**: Ensure dispose() is called on all AnimationControllers and StreamSubscriptions
```dart
@override
void dispose() {
  _controller?.dispose();
  _subscription?.cancel();
  super.dispose();
}
```

### Issue: Exception Type Mismatch
**Solution**: Check import and use correct exception type
```dart
// Make sure to import
import '../core/exceptions/app_exceptions.dart';

// Use correct exception type
throw AuthException.invalidCredentials('message');  // ✅
// NOT: throw AuthException('message');  // ❌
```

### Issue: BuildContext in Async Call
**Solution**: Check if context is still mounted
```dart
if (!mounted) return;
context.showSnackBar('Message');
```

### Issue: Unnecessary Rebuilds
**Solution**: Use Selector instead of Consumer
```dart
// ❌ Rebuilds on any change
Consumer<Provider>(
  builder: (context, provider, _) => Text(provider.value),
)

// ✅ Only rebuilds on value change
Selector<Provider, String>(
  selector: (_, provider) => provider.value,
  builder: (_, value, __) => Text(value),
)
```

---

## 8. Performance Tips

### Do's ✅
- Use const constructors
- Use Selector for specific values
- Dispose resources properly
- Use extension utilities to reduce code duplication
- Cache computed values
- Use CircularProgressIndicator for loading states

### Don'ts ❌
- Don't use setState in build()
- Don't create objects in build()
- Don't forget to dispose controllers
- Don't use generic Exception
- Don't hardcode values
- Don't ignore warnings

---

## Next Steps

1. **Review existing code** using the CODE_QUALITY_IMPROVEMENTS.md guide
2. **Refactor problematic areas** using these patterns
3. **Write tests** for exception handling
4. **Add monitoring** for error tracking
5. **Optimize performance** based on DevTools profiling

---

**Happy Coding! 🚀**
