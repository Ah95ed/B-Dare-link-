/// Application-wide string constants and error messages
abstract class AppStrings {
  // Error Messages
  static const String authCheckFailed = 'Auth check failed';
  static const String loginFailed = 'Login failed';
  static const String resetFailed = 'Reset failed';
  static const String incompleteProgressFetch = 'Failed to fetch progress';
  static const String failedToRestoreProgress = 'Restore progress failed';
  static const String failedToSyncProgress = 'Failed to sync progress';
  static const String failedToGenerateLevel =
      'Failed to generate level. Check backend connection.';
  static const String failedToLoadLevelData = 'Failed to load level data.';
  static const String failedToValidateLink = 'Error validating link';
  static const String failedToGeneratePuzzleFromImage =
      'Failed to generate puzzle from image';
  static const String incorrectAnswer = 'Incorrect Answer';
  static const String incorrectAnswerAr = 'الإجابة غير صحيحة';
  static const String timeoutMessage = "Time's Up!";
  static const String timeoutMessageAr = 'انتهى الوقت!';
  static const String failedToJoinRoom = 'Failed to join room';

  // Debug Messages
  static const String debugGenerationStart =
      '--- STARTING 20 PUZZLE GENERATION TEST ---';
  static const String debugGenerationComplete = '--- TEST COMPLETE ---';
  static const String debugFetchingPuzzles = 'Fetching puzzles for Level';

  // API Endpoints
  static const String authRegisterEndpoint = '/auth/register';
  static const String authLoginEndpoint = '/auth/login';
  static const String authMeEndpoint = '/auth/me';
  static const String authResetEndpoint = '/auth/reset';
  static const String progressEndpoint = '/progress';
}
