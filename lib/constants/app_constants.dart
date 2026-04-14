/// Application-wide constants
abstract class AppConstants {
  // API Configuration
  static const String productionBaseUrl =
      'https://wonder-link-backend.amhmeed31.workers.dev';
  static const String localAndroidBaseUrl = 'http://10.0.2.2:8787';
  static const String localHostBaseUrl = 'http://127.0.0.1:8787';
  static const String defaultBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: productionBaseUrl,
  );
  static const String jwtTokenKey = 'jwt_token';

  // Duration Constants
  static const Duration animationDuration = Duration(milliseconds: 300);
  static const Duration debounceDelay = Duration(milliseconds: 500);

  // Timer Configuration
  static const int beginnerTimeLimit = 60; // seconds
  static const int earlyTimeLimit = 55;
  static const int intermediateTimeLimit = 50;
  static const int advancedTimeLimit = 45;
  static const int expertTimeLimit = 40;
  static const int masterTimeLimit = 35;
  static const int legendTimeLimit = 30;

  // Puzzle Configuration
  static const int puzzlesPerLevel = 5;
  static const int beginnerPuzzleCount = 3;
  static const int intermediatePuzzleCount = 4;
  static const int advancedPuzzleCount = 5;
  static const int expertPuzzleCount = 6;

  // Level Ranges
  static const int beginnerMaxLevel = 10;
  static const int earlyMaxLevel = 20;
  static const int intermediateMaxLevel = 30;
  static const int advancedMaxLevel = 40;
  static const int expertMaxLevel = 50;
  static const int masterMaxLevel = 75;

  // Game Configuration
  static const int initialLives = 3;
  static const int levelBaseScore = 500;
  static const int stepScore = 1;
  /// Persisted + in-memory cap for dedupe (solo can exceed 500 puzzles over many levels).
  static const int maxSeenPuzzleKeys = 2500;
  /// Legacy admin / internal paths that still call `/generate-level`.
  static const int maxExcludedQuestionKeysForApi = 2400;
  static const int maxGenerationAttempts = 24;
  static const int maxBatchSize = 3;

  // Star Requirements
  static const int perfectStars = 3; // 0 mistakes
  static const int goodStars = 2; // 1-2 mistakes
  static const int passStars = 1; // 3+ mistakes

  // Authentication
  static const int adminUserId = 1;
  static const int authRequiredLevel = 3;

  // Timeouts
  static const Duration timeoutMessageDuration = Duration(milliseconds: 900);
  static const Duration networkTimeout = Duration(seconds: 30);
  /// Solo fetch from D1 (`/api/solo/level-pack`) and admin bank refill can be slow.
  static const Duration soloBatchTimeout = Duration(seconds: 180);
  /// Admin solo-bank refill runs many Worker AI calls; allow a long HTTP timeout.
  static const Duration adminSoloBankRefillTimeout = Duration(minutes: 25);
  static const Duration debounceTimeout = Duration(milliseconds: 500);
}
