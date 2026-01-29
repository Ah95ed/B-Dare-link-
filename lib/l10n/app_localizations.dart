import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/intl.dart' as intl;

import 'app_localizations_ar.dart';
import 'app_localizations_en.dart';

// ignore_for_file: type=lint

/// Callers can lookup localized strings with an instance of AppLocalizations
/// returned by `AppLocalizations.of(context)`.
///
/// Applications need to include `AppLocalizations.delegate()` in their app's
/// `localizationDelegates` list, and the locales they support in the app's
/// `supportedLocales` list. For example:
///
/// ```dart
/// import 'l10n/app_localizations.dart';
///
/// return MaterialApp(
///   localizationsDelegates: AppLocalizations.localizationsDelegates,
///   supportedLocales: AppLocalizations.supportedLocales,
///   home: MyApplicationHome(),
/// );
/// ```
///
/// ## Update pubspec.yaml
///
/// Please make sure to update your pubspec.yaml to include the following
/// packages:
///
/// ```yaml
/// dependencies:
///   # Internationalization support.
///   flutter_localizations:
///     sdk: flutter
///   intl: any # Use the pinned version from flutter_localizations
///
///   # Rest of dependencies
/// ```
///
/// ## iOS Applications
///
/// iOS applications define key application metadata, including supported
/// locales, in an Info.plist file that is built into the application bundle.
/// To configure the locales supported by your app, you’ll need to edit this
/// file.
///
/// First, open your project’s ios/Runner.xcworkspace Xcode workspace file.
/// Then, in the Project Navigator, open the Info.plist file under the Runner
/// project’s Runner folder.
///
/// Next, select the Information Property List item, select Add Item from the
/// Editor menu, then select Localizations from the pop-up menu.
///
/// Select and expand the newly-created Localizations item then, for each
/// locale your application supports, add a new item and select the locale
/// you wish to add from the pop-up menu in the Value field. This list should
/// be consistent with the languages listed in the AppLocalizations.supportedLocales
/// property.
abstract class AppLocalizations {
  AppLocalizations(String locale)
    : localeName = intl.Intl.canonicalizedLocale(locale.toString());

  final String localeName;

  static AppLocalizations? of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations);
  }

  static const LocalizationsDelegate<AppLocalizations> delegate =
      _AppLocalizationsDelegate();

  /// A list of this localizations delegate along with the default localizations
  /// delegates.
  ///
  /// Returns a list of localizations delegates containing this delegate along with
  /// GlobalMaterialLocalizations.delegate, GlobalCupertinoLocalizations.delegate,
  /// and GlobalWidgetsLocalizations.delegate.
  ///
  /// Additional delegates can be added by appending to this list in
  /// MaterialApp. This list does not have to be used at all if a custom list
  /// of delegates is preferred or required.
  static const List<LocalizationsDelegate<dynamic>> localizationsDelegates =
      <LocalizationsDelegate<dynamic>>[
        delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
      ];

  /// A list of this localizations delegate's supported locales.
  static const List<Locale> supportedLocales = <Locale>[
    Locale('ar'),
    Locale('en'),
  ];

  /// No description provided for @appTitle.
  ///
  /// In en, this message translates to:
  /// **'Wonder Link'**
  String get appTitle;

  /// No description provided for @appSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Discover the hidden connection!'**
  String get appSubtitle;

  /// No description provided for @startGame.
  ///
  /// In en, this message translates to:
  /// **'Start Game'**
  String get startGame;

  /// No description provided for @linkStart.
  ///
  /// In en, this message translates to:
  /// **'Start Word'**
  String get linkStart;

  /// No description provided for @linkEnd.
  ///
  /// In en, this message translates to:
  /// **'End Word'**
  String get linkEnd;

  /// No description provided for @yourLink.
  ///
  /// In en, this message translates to:
  /// **'Your Connection'**
  String get yourLink;

  /// No description provided for @submit.
  ///
  /// In en, this message translates to:
  /// **'Link It!'**
  String get submit;

  /// No description provided for @loading.
  ///
  /// In en, this message translates to:
  /// **'Checking Link...'**
  String get loading;

  /// No description provided for @winMessage.
  ///
  /// In en, this message translates to:
  /// **'Amazing! You found the link!'**
  String get winMessage;

  /// No description provided for @loseMessage.
  ///
  /// In en, this message translates to:
  /// **'Not quite right. Try again!'**
  String get loseMessage;

  /// No description provided for @steps.
  ///
  /// In en, this message translates to:
  /// **'Steps'**
  String get steps;

  /// No description provided for @changeLanguage.
  ///
  /// In en, this message translates to:
  /// **'اللغة العربية'**
  String get changeLanguage;

  /// No description provided for @levelsTitle.
  ///
  /// In en, this message translates to:
  /// **'Levels'**
  String get levelsTitle;

  /// No description provided for @soloPlay.
  ///
  /// In en, this message translates to:
  /// **'Solo Play'**
  String get soloPlay;

  /// No description provided for @tournaments.
  ///
  /// In en, this message translates to:
  /// **'Tournaments'**
  String get tournaments;

  /// No description provided for @profile.
  ///
  /// In en, this message translates to:
  /// **'Profile'**
  String get profile;

  /// No description provided for @settings.
  ///
  /// In en, this message translates to:
  /// **'Settings'**
  String get settings;

  /// No description provided for @login.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get login;

  /// No description provided for @register.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get register;

  /// No description provided for @logout.
  ///
  /// In en, this message translates to:
  /// **'Logout'**
  String get logout;

  /// No description provided for @deleteAccount.
  ///
  /// In en, this message translates to:
  /// **'Delete Account'**
  String get deleteAccount;

  /// No description provided for @loginTitle.
  ///
  /// In en, this message translates to:
  /// **'Login'**
  String get loginTitle;

  /// No description provided for @registerTitle.
  ///
  /// In en, this message translates to:
  /// **'Register'**
  String get registerTitle;

  /// No description provided for @welcomeBack.
  ///
  /// In en, this message translates to:
  /// **'Welcome Back!'**
  String get welcomeBack;

  /// No description provided for @createAccount.
  ///
  /// In en, this message translates to:
  /// **'Create Account'**
  String get createAccount;

  /// No description provided for @username.
  ///
  /// In en, this message translates to:
  /// **'Username'**
  String get username;

  /// No description provided for @email.
  ///
  /// In en, this message translates to:
  /// **'Email'**
  String get email;

  /// No description provided for @password.
  ///
  /// In en, this message translates to:
  /// **'Password'**
  String get password;

  /// No description provided for @newPassword.
  ///
  /// In en, this message translates to:
  /// **'New Password'**
  String get newPassword;

  /// No description provided for @forgotPassword.
  ///
  /// In en, this message translates to:
  /// **'Forgot Password?'**
  String get forgotPassword;

  /// No description provided for @resetPassword.
  ///
  /// In en, this message translates to:
  /// **'Reset Password'**
  String get resetPassword;

  /// No description provided for @dontHaveAccount.
  ///
  /// In en, this message translates to:
  /// **'Don\'t have an account? Register'**
  String get dontHaveAccount;

  /// No description provided for @enterValidEmail.
  ///
  /// In en, this message translates to:
  /// **'Enter a valid email'**
  String get enterValidEmail;

  /// No description provided for @enterUsername.
  ///
  /// In en, this message translates to:
  /// **'Enter a username'**
  String get enterUsername;

  /// No description provided for @passwordTooShort.
  ///
  /// In en, this message translates to:
  /// **'Password too short'**
  String get passwordTooShort;

  /// No description provided for @loginFailed.
  ///
  /// In en, this message translates to:
  /// **'Login Failed'**
  String get loginFailed;

  /// No description provided for @registrationFailed.
  ///
  /// In en, this message translates to:
  /// **'Registration Failed'**
  String get registrationFailed;

  /// No description provided for @resetPasswordInstructions.
  ///
  /// In en, this message translates to:
  /// **'Enter your registered email to receive a reset code.'**
  String get resetPasswordInstructions;

  /// No description provided for @sendOTP.
  ///
  /// In en, this message translates to:
  /// **'Send OTP'**
  String get sendOTP;

  /// No description provided for @verifyAndReset.
  ///
  /// In en, this message translates to:
  /// **'Verify & Reset'**
  String get verifyAndReset;

  /// No description provided for @otpSent.
  ///
  /// In en, this message translates to:
  /// **'OTP sent to {email}'**
  String otpSent(String email);

  /// No description provided for @failedToSendOTP.
  ///
  /// In en, this message translates to:
  /// **'Failed to send OTP'**
  String get failedToSendOTP;

  /// No description provided for @errorSendingOTP.
  ///
  /// In en, this message translates to:
  /// **'Error sending OTP: {error}'**
  String errorSendingOTP(String error);

  /// No description provided for @passwordResetSuccessful.
  ///
  /// In en, this message translates to:
  /// **'Password reset successful'**
  String get passwordResetSuccessful;

  /// No description provided for @invalidOTP.
  ///
  /// In en, this message translates to:
  /// **'Invalid OTP'**
  String get invalidOTP;

  /// No description provided for @errorVerifyingOTP.
  ///
  /// In en, this message translates to:
  /// **'Error verifying OTP: {error}'**
  String errorVerifyingOTP(String error);

  /// No description provided for @levelComplete.
  ///
  /// In en, this message translates to:
  /// **'Level Complete!'**
  String get levelComplete;

  /// No description provided for @levelCompleted.
  ///
  /// In en, this message translates to:
  /// **'Level Completed!'**
  String get levelCompleted;

  /// No description provided for @continueButton.
  ///
  /// In en, this message translates to:
  /// **'Continue'**
  String get continueButton;

  /// No description provided for @next.
  ///
  /// In en, this message translates to:
  /// **'Next'**
  String get next;

  /// No description provided for @tryAgain.
  ///
  /// In en, this message translates to:
  /// **'Try again!'**
  String get tryAgain;

  /// No description provided for @checkAnswer.
  ///
  /// In en, this message translates to:
  /// **'Check'**
  String get checkAnswer;

  /// No description provided for @amazing.
  ///
  /// In en, this message translates to:
  /// **'Amazing! Path Found.'**
  String get amazing;

  /// No description provided for @excellent.
  ///
  /// In en, this message translates to:
  /// **'Excellent! Order Correct.'**
  String get excellent;

  /// No description provided for @wrongChoice.
  ///
  /// In en, this message translates to:
  /// **'Wrong choice! Follow the chain.'**
  String get wrongChoice;

  /// No description provided for @incorrectOrder.
  ///
  /// In en, this message translates to:
  /// **'Incorrect Order!'**
  String get incorrectOrder;

  /// No description provided for @greatJob.
  ///
  /// In en, this message translates to:
  /// **'Great! You found the correct path.'**
  String get greatJob;

  /// No description provided for @chooseCorrectOption.
  ///
  /// In en, this message translates to:
  /// **'Choose the correct option'**
  String get chooseCorrectOption;

  /// No description provided for @whatLinks.
  ///
  /// In en, this message translates to:
  /// **'What links \"{start}\" and \"{end}\"?'**
  String whatLinks(String start, String end);

  /// No description provided for @tapWordsInOrder.
  ///
  /// In en, this message translates to:
  /// **'Tap words in order: {start} -> ... -> {end}'**
  String tapWordsInOrder(String start, String end);

  /// No description provided for @authRequired.
  ///
  /// In en, this message translates to:
  /// **'To continue after level 3, please register or log in.'**
  String get authRequired;

  /// No description provided for @cantAdvanceWithoutLogin.
  ///
  /// In en, this message translates to:
  /// **'You can\'t advance without logging in.'**
  String get cantAdvanceWithoutLogin;

  /// No description provided for @backToLevels.
  ///
  /// In en, this message translates to:
  /// **'Back to levels'**
  String get backToLevels;

  /// No description provided for @coins.
  ///
  /// In en, this message translates to:
  /// **'Coins'**
  String get coins;

  /// No description provided for @streak.
  ///
  /// In en, this message translates to:
  /// **'Streak'**
  String get streak;

  /// No description provided for @badges.
  ///
  /// In en, this message translates to:
  /// **'Badges'**
  String get badges;

  /// No description provided for @dailyBonus.
  ///
  /// In en, this message translates to:
  /// **'Daily Bonus!'**
  String get dailyBonus;

  /// No description provided for @newStreakStarted.
  ///
  /// In en, this message translates to:
  /// **'New streak started'**
  String get newStreakStarted;

  /// No description provided for @streakDays.
  ///
  /// In en, this message translates to:
  /// **'Streak: {days} days'**
  String streakDays(int days);

  /// No description provided for @awesome.
  ///
  /// In en, this message translates to:
  /// **'Awesome!'**
  String get awesome;

  /// No description provided for @achievementUnlocked.
  ///
  /// In en, this message translates to:
  /// **'Achievement Unlocked!'**
  String get achievementUnlocked;

  /// No description provided for @gotIt.
  ///
  /// In en, this message translates to:
  /// **'Got it!'**
  String get gotIt;

  /// No description provided for @daily.
  ///
  /// In en, this message translates to:
  /// **'Daily'**
  String get daily;

  /// No description provided for @weekly.
  ///
  /// In en, this message translates to:
  /// **'Weekly'**
  String get weekly;

  /// No description provided for @dailyChallenge.
  ///
  /// In en, this message translates to:
  /// **'Daily Challenge'**
  String get dailyChallenge;

  /// No description provided for @weeklyChampionship.
  ///
  /// In en, this message translates to:
  /// **'Weekly Championship'**
  String get weeklyChampionship;

  /// No description provided for @yourScore.
  ///
  /// In en, this message translates to:
  /// **'Your Score'**
  String get yourScore;

  /// No description provided for @yourRank.
  ///
  /// In en, this message translates to:
  /// **'Your Rank'**
  String get yourRank;

  /// No description provided for @playNow.
  ///
  /// In en, this message translates to:
  /// **'Play Now'**
  String get playNow;

  /// No description provided for @todaysLeaders.
  ///
  /// In en, this message translates to:
  /// **'Today\'s Leaders'**
  String get todaysLeaders;

  /// No description provided for @weeklyStandings.
  ///
  /// In en, this message translates to:
  /// **'Weekly Standings'**
  String get weeklyStandings;

  /// No description provided for @accumulatePointsWeekly.
  ///
  /// In en, this message translates to:
  /// **'Accumulate points throughout the week!'**
  String get accumulatePointsWeekly;

  /// No description provided for @nextChallengeIn.
  ///
  /// In en, this message translates to:
  /// **'Next challenge in: {hours}h {minutes}m'**
  String nextChallengeIn(int hours, int minutes);

  /// No description provided for @noDataYet.
  ///
  /// In en, this message translates to:
  /// **'No data yet'**
  String get noDataYet;

  /// No description provided for @unknown.
  ///
  /// In en, this message translates to:
  /// **'Unknown'**
  String get unknown;

  /// No description provided for @dailyChallengeWillOpen.
  ///
  /// In en, this message translates to:
  /// **'Daily challenge will open here!'**
  String get dailyChallengeWillOpen;

  /// No description provided for @totalScore.
  ///
  /// In en, this message translates to:
  /// **'Total Score'**
  String get totalScore;

  /// No description provided for @deleteAccountConfirm.
  ///
  /// In en, this message translates to:
  /// **'Delete Account?'**
  String get deleteAccountConfirm;

  /// No description provided for @deleteAccountWarning.
  ///
  /// In en, this message translates to:
  /// **'This action cannot be undone. All progress will be lost.'**
  String get deleteAccountWarning;

  /// No description provided for @cancel.
  ///
  /// In en, this message translates to:
  /// **'Cancel'**
  String get cancel;

  /// No description provided for @delete.
  ///
  /// In en, this message translates to:
  /// **'DELETE'**
  String get delete;

  /// No description provided for @arMode.
  ///
  /// In en, this message translates to:
  /// **'AR Mode'**
  String get arMode;

  /// No description provided for @contextualRealityStart.
  ///
  /// In en, this message translates to:
  /// **'Contextual Reality Start'**
  String get contextualRealityStart;

  /// No description provided for @arInstructions.
  ///
  /// In en, this message translates to:
  /// **'Capture a photo and we will transform it into a unique puzzle starting from your world!'**
  String get arInstructions;

  /// No description provided for @analyzingImage.
  ///
  /// In en, this message translates to:
  /// **'Analyzing Image...'**
  String get analyzingImage;

  /// No description provided for @camera.
  ///
  /// In en, this message translates to:
  /// **'Camera'**
  String get camera;

  /// No description provided for @gallery.
  ///
  /// In en, this message translates to:
  /// **'Gallery'**
  String get gallery;

  /// No description provided for @visionNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Vision scanning is not supported on Web yet.'**
  String get visionNotSupported;

  /// No description provided for @scannerNotSupported.
  ///
  /// In en, this message translates to:
  /// **'Scanner not supported on Desktop yet.\nUse Android/iOS.'**
  String get scannerNotSupported;

  /// No description provided for @errorPickingImage.
  ///
  /// In en, this message translates to:
  /// **'Error picking image: {error}'**
  String errorPickingImage(String error);

  /// No description provided for @failedToAnalyzeImage.
  ///
  /// In en, this message translates to:
  /// **'Failed to analyze image. Try again.'**
  String get failedToAnalyzeImage;

  /// No description provided for @chooseGameMode.
  ///
  /// In en, this message translates to:
  /// **'Choose Game Mode'**
  String get chooseGameMode;

  /// No description provided for @choices.
  ///
  /// In en, this message translates to:
  /// **'Choices'**
  String get choices;
}

class _AppLocalizationsDelegate
    extends LocalizationsDelegate<AppLocalizations> {
  const _AppLocalizationsDelegate();

  @override
  Future<AppLocalizations> load(Locale locale) {
    return SynchronousFuture<AppLocalizations>(lookupAppLocalizations(locale));
  }

  @override
  bool isSupported(Locale locale) =>
      <String>['ar', 'en'].contains(locale.languageCode);

  @override
  bool shouldReload(_AppLocalizationsDelegate old) => false;
}

AppLocalizations lookupAppLocalizations(Locale locale) {
  // Lookup logic when only language code is specified.
  switch (locale.languageCode) {
    case 'ar':
      return AppLocalizationsAr();
    case 'en':
      return AppLocalizationsEn();
  }

  throw FlutterError(
    'AppLocalizations.delegate failed to load unsupported locale "$locale". This is likely '
    'an issue with the localizations generation tool. Please file an issue '
    'on GitHub with a reproducible sample app and the gen-l10n configuration '
    'that was used.',
  );
}
