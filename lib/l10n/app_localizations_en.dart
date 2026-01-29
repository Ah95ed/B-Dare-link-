// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get appTitle => 'Wonder Link';

  @override
  String get appSubtitle => 'Discover the hidden connection!';

  @override
  String get startGame => 'Start Game';

  @override
  String get linkStart => 'Start Word';

  @override
  String get linkEnd => 'End Word';

  @override
  String get yourLink => 'Your Connection';

  @override
  String get submit => 'Link It!';

  @override
  String get loading => 'Checking Link...';

  @override
  String get winMessage => 'Amazing! You found the link!';

  @override
  String get loseMessage => 'Not quite right. Try again!';

  @override
  String get steps => 'Steps';

  @override
  String get changeLanguage => 'اللغة العربية';

  @override
  String get levelsTitle => 'Levels';

  @override
  String get soloPlay => 'Solo Play';

  @override
  String get tournaments => 'Tournaments';

  @override
  String get profile => 'Profile';

  @override
  String get settings => 'Settings';

  @override
  String get login => 'Login';

  @override
  String get register => 'Register';

  @override
  String get logout => 'Logout';

  @override
  String get deleteAccount => 'Delete Account';

  @override
  String get loginTitle => 'Login';

  @override
  String get registerTitle => 'Register';

  @override
  String get welcomeBack => 'Welcome Back!';

  @override
  String get createAccount => 'Create Account';

  @override
  String get username => 'Username';

  @override
  String get email => 'Email';

  @override
  String get password => 'Password';

  @override
  String get newPassword => 'New Password';

  @override
  String get forgotPassword => 'Forgot Password?';

  @override
  String get resetPassword => 'Reset Password';

  @override
  String get dontHaveAccount => 'Don\'t have an account? Register';

  @override
  String get enterValidEmail => 'Enter a valid email';

  @override
  String get enterUsername => 'Enter a username';

  @override
  String get passwordTooShort => 'Password too short';

  @override
  String get loginFailed => 'Login Failed';

  @override
  String get registrationFailed => 'Registration Failed';

  @override
  String get resetPasswordInstructions =>
      'Enter your registered email to receive a reset code.';

  @override
  String get sendOTP => 'Send OTP';

  @override
  String get verifyAndReset => 'Verify & Reset';

  @override
  String otpSent(String email) {
    return 'OTP sent to $email';
  }

  @override
  String get failedToSendOTP => 'Failed to send OTP';

  @override
  String errorSendingOTP(String error) {
    return 'Error sending OTP: $error';
  }

  @override
  String get passwordResetSuccessful => 'Password reset successful';

  @override
  String get invalidOTP => 'Invalid OTP';

  @override
  String errorVerifyingOTP(String error) {
    return 'Error verifying OTP: $error';
  }

  @override
  String get levelComplete => 'Level Complete!';

  @override
  String get levelCompleted => 'Level Completed!';

  @override
  String get continueButton => 'Continue';

  @override
  String get next => 'Next';

  @override
  String get tryAgain => 'Try again!';

  @override
  String get checkAnswer => 'Check';

  @override
  String get amazing => 'Amazing! Path Found.';

  @override
  String get excellent => 'Excellent! Order Correct.';

  @override
  String get wrongChoice => 'Wrong choice! Follow the chain.';

  @override
  String get incorrectOrder => 'Incorrect Order!';

  @override
  String get greatJob => 'Great! You found the correct path.';

  @override
  String get chooseCorrectOption => 'Choose the correct option';

  @override
  String whatLinks(String start, String end) {
    return 'What links \"$start\" and \"$end\"?';
  }

  @override
  String tapWordsInOrder(String start, String end) {
    return 'Tap words in order: $start -> ... -> $end';
  }

  @override
  String get authRequired =>
      'To continue after level 3, please register or log in.';

  @override
  String get cantAdvanceWithoutLogin =>
      'You can\'t advance without logging in.';

  @override
  String get backToLevels => 'Back to levels';

  @override
  String get coins => 'Coins';

  @override
  String get streak => 'Streak';

  @override
  String get badges => 'Badges';

  @override
  String get dailyBonus => 'Daily Bonus!';

  @override
  String get newStreakStarted => 'New streak started';

  @override
  String streakDays(int days) {
    return 'Streak: $days days';
  }

  @override
  String get awesome => 'Awesome!';

  @override
  String get achievementUnlocked => 'Achievement Unlocked!';

  @override
  String get gotIt => 'Got it!';

  @override
  String get daily => 'Daily';

  @override
  String get weekly => 'Weekly';

  @override
  String get dailyChallenge => 'Daily Challenge';

  @override
  String get weeklyChampionship => 'Weekly Championship';

  @override
  String get yourScore => 'Your Score';

  @override
  String get yourRank => 'Your Rank';

  @override
  String get playNow => 'Play Now';

  @override
  String get todaysLeaders => 'Today\'s Leaders';

  @override
  String get weeklyStandings => 'Weekly Standings';

  @override
  String get accumulatePointsWeekly => 'Accumulate points throughout the week!';

  @override
  String nextChallengeIn(int hours, int minutes) {
    return 'Next challenge in: ${hours}h ${minutes}m';
  }

  @override
  String get noDataYet => 'No data yet';

  @override
  String get unknown => 'Unknown';

  @override
  String get dailyChallengeWillOpen => 'Daily challenge will open here!';

  @override
  String get totalScore => 'Total Score';

  @override
  String get deleteAccountConfirm => 'Delete Account?';

  @override
  String get deleteAccountWarning =>
      'This action cannot be undone. All progress will be lost.';

  @override
  String get cancel => 'Cancel';

  @override
  String get delete => 'DELETE';

  @override
  String get arMode => 'AR Mode';

  @override
  String get contextualRealityStart => 'Contextual Reality Start';

  @override
  String get arInstructions =>
      'Capture a photo and we will transform it into a unique puzzle starting from your world!';

  @override
  String get analyzingImage => 'Analyzing Image...';

  @override
  String get camera => 'Camera';

  @override
  String get gallery => 'Gallery';

  @override
  String get visionNotSupported =>
      'Vision scanning is not supported on Web yet.';

  @override
  String get scannerNotSupported =>
      'Scanner not supported on Desktop yet.\nUse Android/iOS.';

  @override
  String errorPickingImage(String error) {
    return 'Error picking image: $error';
  }

  @override
  String get failedToAnalyzeImage => 'Failed to analyze image. Try again.';

  @override
  String get chooseGameMode => 'Choose Game Mode';

  @override
  String get choices => 'Choices';
}
