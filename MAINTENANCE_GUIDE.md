# 📚 دليل الصيانة والأفضل الممارسات - Wonder Link

## جدول المحتويات
1. [تعليمات الأنماط](#تعليمات-الأنماط)
2. [قواعس الثابتة والألوان](#قواعس-الثابتة-والألوان)
3. [State Management](#state-management)
4. [Memory Management](#memory-management)
5. [معالجة الأخطاء](#معالجة-الأخطاء)
6. [الاختبار](#الاختبار)

---

## تعليمات الأنماط

### 1. استخدام Constants دائماً

```dart
// ❌ خطأ - magic numbers و magic strings
if (lives < 3) { ... }
final duration = Duration(seconds: 60);
final color = Color(0xFF00D9FF);
final endpoint = '/auth/login';

// ✅ صحيح - استخدام constants
if (lives < AppConstants.initialLives) { ... }
final duration = AppConstants.animationDuration;
final color = AppColors.cyan;
final endpoint = AppStrings.authLoginEndpoint;
```

### 2. دوال قصيرة وواضحة

```dart
// ❌ خطأ - دالة طويلة جداً
Future<void> processLevel() async {
  // 100+ سطر
  // logic مخلوط
  // صعب الفهم
}

// ✅ صحيح - دوال صغيرة وواضحة المسؤولية
Future<void> loadLevel(GameLevel level) async {
  _resetLevelState();
  final puzzles = await _generatePuzzles(level.id, _isArabic);
  _currentLevel = GameLevel(id: level.id, puzzles: puzzles);
  _loadPuzzle();
  _resetGameState();
}

void _resetLevelState() { ... }
void _resetGameState() { ... }
Future<List<GamePuzzle>> _generatePuzzles(...) { ... }
```

### 3. تسمية واضحة

```dart
// ❌ خطأ - أسماء غير واضحة
bool _p = false;
int _c = 0;
void _f() { ... }

// ✅ صحيح - أسماء واضحة
bool _isLevelComplete = false;
int _currentScore = 0;
void _completeLevel() { ... }
```

### 4. استخدام Getters بدلاً من الدوال البسيطة

```dart
// ❌ خطأ
String getUserName() => _user?['name'] ?? 'Guest';

// ✅ صحيح
String get userName => _user?['name'] ?? 'Guest';
```

---

## قواعس الثابتة والألوان

### إضافة Constants جديد

عند الحاجة إلى constant جديد:

```dart
// في lib/constants/app_constants.dart
abstract class AppConstants {
  // أضف هنا
  static const int newGameConstant = 100;
  static const Duration newDuration = Duration(seconds: 30);
}

// في lib/constants/app_colors.dart
abstract class AppColors {
  // أضف هنا
  static const Color newColor = Color(0xFF123456);
  static const Color newColorOpacity50 = Color.fromARGB(127, 18, 52, 86);
}

// في lib/constants/app_strings.dart
abstract class AppStrings {
  // أضف هنا
  static const String newErrorMessage = 'New error occurred';
}
```

### استخدام الألوان مع Opacity

```dart
// ✅ الطريقة الصحيحة
Container(
  color: AppColors.cyan.withOpacity(0.5),
  // أو
  color: AppColors.cyanOpacity50,
)

// بدلاً من
// color: Color(0xFF00D9FF).withOpacity(0.5),
```

---

## State Management

### 1. استخدام sealed classes للـ states

```dart
sealed class GameState {
  const GameState();
}

class GameStateActive extends GameState {
  final int level;
  final int lives;
  const GameStateActive({required this.level, required this.lives});
}

class GameStateGameOver extends GameState {
  final int finalScore;
  const GameStateGameOver(this.finalScore);
}

// في الـ Provider
GameState _gameState = const GameStateInitial();

GameState get gameState => _gameState;

Future<void> loadLevel() async {
  _gameState = GameStateActive(level: 1, lives: 3);
  notifyListeners();
}
```

### 2. إضافة Provider جديد

```dart
// ✅ الطريقة الصحيحة
class NewProvider extends ChangeNotifier {
  // State variables
  String _data = '';
  bool _isLoading = false;
  String? _error;
  
  // Getters
  String get data => _data;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Constructor with dependency injection
  NewProvider({SomeDependency? dependency})
      : _dependency = dependency ?? SomeDependency();
  
  // Initialization
  Future<void> initialize() async { ... }
  
  // Methods
  Future<void> loadData() async { ... }
  
  // Cleanup
  @override
  void dispose() {
    _data = '';
    _error = null;
    super.dispose();
  }
}

// في main.dart
ChangeNotifierProvider(create: (_) => NewProvider()),
```

### 3. استخدام Provider ProxyProvider للتبعيات

```dart
// إذا كان Provider يعتمد على آخر
ChangeNotifierProxyProvider<AuthProvider, GameProvider>(
  create: (_) => GameProvider(),
  update: (_, auth, game) => game!..updateAuthProvider(auth),
)
```

---

## Memory Management

### 1. Dispose Pattern

```dart
class MyStatefulWidget extends StatefulWidget {
  @override
  State<MyStatefulWidget> createState() => _MyStatefulWidgetState();
}

class _MyStatefulWidgetState extends State<MyStatefulWidget> {
  late AnimationController _controller;
  late StreamSubscription _subscription;
  late Timer _timer;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: const Duration(seconds: 1), vsync: this);
    _subscription = someStream.listen((_) { ... });
    _timer = Timer.periodic(const Duration(seconds: 1), (_) { ... });
  }
  
  @override
  void dispose() {
    // Dispose بالعكس من الترتيب
    _timer.cancel();
    _subscription.cancel();
    _controller.dispose();
    super.dispose();
  }
}
```

### 2. Provider Cleanup

```dart
class MyProvider extends ChangeNotifier {
  late Timer _timer;
  MyDependency? _dependency;
  
  @override
  void dispose() {
    _timer?.cancel();
    _dependency = null;
    super.dispose();
  }
}
```

### 3. تجنب Circular References

```dart
// ❌ خطأ - قد يسبب circular reference
class A extends ChangeNotifier {
  final B _b = B();
  
  void doSomething() {
    _b.doSomethingWithA(this); // passing 'this'
  }
}

// ✅ صحيح - passing function أو weak reference
class A extends ChangeNotifier {
  final B _b = B();
  
  void doSomething() {
    _b.doSomething(() {
      // callback
    });
  }
}
```

---

## معالجة الأخطاء

### 1. استخدام Custom Exceptions

```dart
// تعريف exception
class GameException implements Exception {
  final String message;
  final Exception? cause;
  
  GameException(this.message, [this.cause]);
  
  @override
  String toString() => 'GameException: $message';
}

// استخدام
Future<void> loadLevel() async {
  try {
    final level = await _apiService.fetchLevel(id);
    if (level == null) {
      throw GameException('Failed to load level');
    }
  } on GameException catch (e) {
    _errorMessage = e.message;
  } on NetworkException catch (e) {
    _errorMessage = 'Network error: ${e.message}';
  } catch (e) {
    _errorMessage = 'Unknown error';
  }
}
```

### 2. Result Pattern

```dart
class Result<T> {
  final T? data;
  final Exception? error;
  final bool isLoading;
  
  const Result({
    this.data,
    this.error,
    this.isLoading = false,
  });
  
  factory Result.success(T data) => Result(data: data);
  factory Result.error(Exception error) => Result(error: error);
  factory Result.loading() => const Result(isLoading: true);
  
  bool get isSuccess => data != null && error == null;
  bool get isError => error != null;
}

// استخدام
Future<Result<GameLevel>> loadLevel(int id) async {
  try {
    final level = await _apiService.fetchLevel(id);
    return Result.success(level);
  } catch (e) {
    return Result.error(e as Exception);
  }
}
```

### 3. Error Handling في API

```dart
Future<http.Response> request(...) async {
  try {
    final response = await _client.send(request).timeout(
      AppConstants.networkTimeout,
      onTimeout: () => throw TimeoutException('Request timeout'),
    );
    return response;
  } on TimeoutException catch (e) {
    throw NetworkException('Request timeout: ${e.message}');
  } on http.ClientException catch (e) {
    throw NetworkException('Client error: ${e.message}');
  } catch (e) {
    throw NetworkException('Request failed: $e');
  }
}
```

---

## الاختبار

### Unit Tests

```dart
void main() {
  group('GameProvider', () {
    late GameProvider gameProvider;
    late MockApiService mockApiService;
    
    setUp(() {
      mockApiService = MockApiService();
      gameProvider = GameProvider(apiService: mockApiService);
    });
    
    tearDown(() {
      gameProvider.dispose();
    });
    
    test('should initialize with default values', () {
      expect(gameProvider.lives, equals(AppConstants.initialLives));
      expect(gameProvider.score, equals(0));
      expect(gameProvider.isGameOver, equals(false));
    });
    
    test('should decrement lives correctly', () {
      gameProvider.decrementLives();
      expect(gameProvider.lives, equals(AppConstants.initialLives - 1));
    });
    
    test('should calculate stars correctly', () {
      // الاختبار
    });
  });
}
```

### Widget Tests

```dart
void main() {
  group('HomeView', () {
    testWidgets('should display title', (WidgetTester tester) async {
      await tester.pumpWidget(
        MultiProvider(
          providers: [
            ChangeNotifierProvider(create: (_) => AuthProvider()),
            ChangeNotifierProvider(create: (_) => LocaleProvider()),
          ],
          child: const MaterialApp(home: HomeView()),
        ),
      );
      
      expect(find.text('Wonder Link'), findsOneWidget);
    });
  });
}
```

---

## قائمة التحقق قبل الـ Commit

- [ ] تم استخدام AppConstants لجميع القيم
- [ ] تم استخدام AppColors لجميع الألوان
- [ ] تم استخدام AppStrings لجميع النصوص
- [ ] جميع الدوال ≤ 50 سطر
- [ ] لا توجد magic numbers
- [ ] لا توجد commented code
- [ ] تم إضافة dispose() للـ StatefulWidgets
- [ ] تم إضافة dispose() للـ Providers
- [ ] تم استخدام `debugPrint` بدلاً من `print`
- [ ] تم التحقق من memory leaks
- [ ] تم كتابة tests
- [ ] تم توثيق الكود المعقد

---

**آخر تحديث:** 29 يناير 2026
