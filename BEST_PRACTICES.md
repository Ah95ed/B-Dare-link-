/// Best Practices Documentation
/// دليل أفضل الممارسات المطبقة في التطبيق

# ✅ أفضل الممارسات المطبقة

## 1. SOLID Principles

### Single Responsibility Principle (SRP)
```dart
// ✅ صحيح - كل class له مسؤولية واحدة
class AuthService {
  // فقط authentication operations
  Future<Map<String, dynamic>> login(String email, String password) { }
}

class AuthProvider extends ChangeNotifier {
  // فقط state management
  Future<void> login(String email, String password) async { }
}

// ❌ خطأ - مسؤوليات متعددة
class UserManager {
  Future<void> login() { } // auth
  void saveData() { } // storage
  void showDialog() { } // UI
}
```

### Open/Closed Principle (OCP)
```dart
// ✅ صحيح - مفتوح للتوسع
abstract class ApiException implements Exception { }
class NetworkException extends ApiException { }
class ValidationException extends ApiException { }

// يمكن إضافة exceptions جديدة دون تعديل الكود القديم
```

### Liskov Substitution Principle (LSP)
```dart
// ✅ صحيح - يمكن استبدال الـ subclass
class Repository {
  List<T> getAll() { }
}

class UserRepository extends Repository<User> {
  @override
  List<User> getAll() { } // compatible return type
}
```

### Interface Segregation Principle (ISP)
```dart
// ✅ صحيح - interfaces صغيرة ومحددة
abstract class Authenticate {
  Future<void> login(String email, String password);
}

abstract class Logout {
  Future<void> logout();
}

// بدلاً من interface واحد كبيرة
abstract class AuthService implements Authenticate, Logout { }
```

### Dependency Inversion Principle (DIP)
```dart
// ✅ صحيح - الـ dependencies تعتمد على abstractions
class GameProvider {
  final ApiService _apiService; // Dependency Injection
  
  GameProvider({required ApiService apiService})
    : _apiService = apiService;
}

// استخدام
final gameProvider = GameProvider(
  apiService: CloudflareApiService(),
);
```

---

## 2. Design Patterns

### Singleton Pattern
```dart
// ✅ صحيح
class AppConfig {
  static final AppConfig _instance = AppConfig._internal();
  
  factory AppConfig() => _instance;
  
  AppConfig._internal();
}
```

### Builder Pattern
```dart
// ✅ صحيح في main.dart
MultiProvider(
  providers: [
    ChangeNotifierProvider<AuthProvider>(
      create: (_) => AuthProvider(),
    ),
    ChangeNotifierProvider<GameProvider>(
      create: (_) => GameProvider(),
    ),
  ],
  child: const WonderLinkApp(),
)
```

### Repository Pattern
```dart
// ✅ صحيح - فصل data access
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<void> saveUser(User user);
}

class ApiUserRepository implements UserRepository {
  @override
  Future<User> getUser(String id) { }
}

class LocalUserRepository implements UserRepository {
  @override
  Future<User> getUser(String id) { }
}
```

### Observer Pattern
```dart
// ✅ صحيح - Provider pattern
class AuthProvider extends ChangeNotifier {
  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners(); // Observers are notified
  }
}
```

---

## 3. Memory Management

### Proper Disposal
```dart
// ✅ صحيح
class _HomeViewState extends State<HomeView> with TickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose(); // Always dispose
    super.dispose();
  }
}
```

### Listener Cleanup
```dart
// ✅ صحيح
class _DeepLinkHandlerState extends State<DeepLinkHandler> {
  StreamSubscription<Uri>? _linkSubscription;

  @override
  void initState() {
    super.initState();
    _linkSubscription = _appLinks.uriLinkStream.listen(_handleDeepLink);
  }

  @override
  void dispose() {
    _linkSubscription?.cancel(); // Cancel subscription
    super.dispose();
  }
}
```

---

## 4. Error Handling

### Custom Exceptions
```dart
// ✅ صحيح - Custom exceptions
try {
  await login(email, password);
} on AuthException catch (e) {
  showErrorDialog(e.message);
} on NetworkException catch (e) {
  showRetryDialog();
} catch (e) {
  showGenericErrorDialog();
}
```

---

## 5. State Management

### Proper Provider Usage
```dart
// ✅ صحيح - استخدام Consumer
Consumer<GameProvider>(
  builder: (context, gameProvider, _) {
    return Text('Level: ${gameProvider.currentLevel?.id}');
  },
)

// ✅ صحيح - استخدام Selector للـ performance
Selector<GameProvider, int>(
  selector: (_, provider) => provider.score,
  builder: (_, score, __) => Text('Score: $score'),
)
```

---

## 6. Code Organization

### Folder Structure
```
lib/
├── core/                    # Core logic
│   ├── exceptions/         # Custom exceptions
│   ├── extensions/         # Extensions
│   └── app_theme.dart      # Theme configuration
├── constants/              # Constants
│   ├── app_colors.dart
│   ├── app_constants.dart
│   └── app_strings.dart
├── models/                 # Data models
├── services/               # Business logic
│   ├── auth_service.dart
│   ├── api_client.dart
│   └── api_service.dart
├── providers/              # State management
├── controllers/            # Game logic
├── views/                  # UI screens
│   ├── home_view.dart
│   ├── auth/
│   ├── modes/
│   └── ...
├── widgets/                # Custom widgets
├── l10n/                   # Localization
└── main.dart               # Entry point
```

---

## 7. Performance Best Practices

### Use const Constructors
```dart
// ✅ صحيح
const SizedBox(height: 20)
const Padding(padding: EdgeInsets.all(16))

// ✅ صحيح - const widgets
const class MyWidget extends StatelessWidget {
  const MyWidget({super.key});
}
```

### Use Selector for Efficiency
```dart
// ✅ صحيح - يعاد بناء فقط عند تغيير score
Selector<GameProvider, int>(
  selector: (_, provider) => provider.score,
  builder: (_, score, __) => Text('$score'),
)

// ❌ خطأ - يعاد بناء كل التغييرات
Consumer<GameProvider>(
  builder: (context, provider, _) => Text('${provider.score}'),
)
```

---

## 8. Clean Code Rules

### Functions Should Be Short
```dart
// ✅ صحيح - < 30 lines
void _initializeAuth() {
  _loadToken();
  _validateToken();
  notifyListeners();
}

// ❌ خطأ - طويلة جداً
void doEverything() {
  // 100+ lines
}
```

### Meaningful Names
```dart
// ✅ صحيح
Future<User> getAuthenticatedUser() { }
bool isValidEmail(String email) { }

// ❌ خطأ
Future<dynamic> getData() { }
bool check(String data) { }
```

### No Magic Numbers
```dart
// ✅ صحيح
static const int maxRetries = 3;
static const Duration timeout = Duration(seconds: 30);

// ❌ خطأ
for (int i = 0; i < 3; i++) { } // What is 3?
```

---

## 9. Localization Best Practices

```dart
// ✅ صحيح - استخدام AppLocalizations
final l10n = AppLocalizations.of(context)!;
Text(l10n.appTitle)

// ❌ خطأ - hardcoded strings
Text("Welcome")
```

---

## 10. Security Best Practices

### Secure Storage
```dart
// ✅ صحيح - Secure storage للـ tokens
Future<String?> getToken() async {
  return await _storage.read(key: 'jwt_token');
}

// ❌ خطأ - Storing in SharedPreferences
preferences.setString('token', token);
```

---

## ✅ Checklist للـ Code Review:

- [ ] جميع StatefulWidgets لها dispose()
- [ ] لا توجد StreamSubscriptions معلقة
- [ ] جميع exceptions مخصصة
- [ ] Single Responsibility في كل class
- [ ] No magic numbers
- [ ] Meaningful variable names
- [ ] Functions < 30 lines
- [ ] No commented code
- [ ] Proper error handling
- [ ] const constructors حيث مناسب
- [ ] استخدام extensions للكود النظيف
- [ ] Dependency injection
- [ ] No circular dependencies
- [ ] Proper logging
- [ ] Security best practices

---

## 📚 مراجع إضافية:

1. [Dart Style Guide](https://dart.dev/guides/language/effective-dart/style)
2. [Flutter Best Practices](https://flutter.dev/docs/testing/best-practices)
3. [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
4. [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**الكود الآن يتبع أفضل الممارسات البرمجية!** ✨
