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
  /// **'Start game'**
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

  /// No description provided for @otpLabel.
  ///
  /// In en, this message translates to:
  /// **'OTP'**
  String get otpLabel;

  /// No description provided for @otpSentLog.
  ///
  /// In en, this message translates to:
  /// **'OTP sent: {status}'**
  String otpSentLog(String status);

  /// No description provided for @otpVerifyLog.
  ///
  /// In en, this message translates to:
  /// **'OTP verify result: {status}'**
  String otpVerifyLog(String status);

  /// No description provided for @otpSendErrorLog.
  ///
  /// In en, this message translates to:
  /// **'OTP send error: {error}'**
  String otpSendErrorLog(String error);

  /// No description provided for @otpVerifyErrorLog.
  ///
  /// In en, this message translates to:
  /// **'OTP verify error: {error}'**
  String otpVerifyErrorLog(String error);

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

  /// No description provided for @competitionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Competitions & Rooms'**
  String get competitionsTitle;

  /// No description provided for @refresh.
  ///
  /// In en, this message translates to:
  /// **'Refresh'**
  String get refresh;

  /// No description provided for @searchRoom.
  ///
  /// In en, this message translates to:
  /// **'Search rooms'**
  String get searchRoom;

  /// No description provided for @roomLabel.
  ///
  /// In en, this message translates to:
  /// **'Room'**
  String get roomLabel;

  /// No description provided for @competitionLabel.
  ///
  /// In en, this message translates to:
  /// **'Competition'**
  String get competitionLabel;

  /// No description provided for @searchByCodeHint.
  ///
  /// In en, this message translates to:
  /// **'Search by code (e.g., ABCD12)'**
  String get searchByCodeHint;

  /// No description provided for @joinError.
  ///
  /// In en, this message translates to:
  /// **'Join error: {error}'**
  String joinError(String error);

  /// No description provided for @createRoomCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Create new room'**
  String get createRoomCardTitle;

  /// No description provided for @createRoomCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Create a room and invite friends'**
  String get createRoomCardSubtitle;

  /// No description provided for @joinRoomCardTitle.
  ///
  /// In en, this message translates to:
  /// **'Join a room'**
  String get joinRoomCardTitle;

  /// No description provided for @joinRoomCardSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Enter the room code to join'**
  String get joinRoomCardSubtitle;

  /// No description provided for @myRoomsTitle.
  ///
  /// In en, this message translates to:
  /// **'Rooms you joined'**
  String get myRoomsTitle;

  /// No description provided for @roomCodeParticipants.
  ///
  /// In en, this message translates to:
  /// **'Code: {code} • {count} players'**
  String roomCodeParticipants(String code, int count);

  /// No description provided for @activeCompetitionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Active competitions'**
  String get activeCompetitionsTitle;

  /// No description provided for @noActiveCompetitions.
  ///
  /// In en, this message translates to:
  /// **'No active competitions right now'**
  String get noActiveCompetitions;

  /// No description provided for @competitionSubtitle.
  ///
  /// In en, this message translates to:
  /// **'{participants} participants • {puzzles} puzzles'**
  String competitionSubtitle(int participants, int puzzles);

  /// No description provided for @join.
  ///
  /// In en, this message translates to:
  /// **'Join'**
  String get join;

  /// No description provided for @statusActive.
  ///
  /// In en, this message translates to:
  /// **'Active'**
  String get statusActive;

  /// No description provided for @statusFinished.
  ///
  /// In en, this message translates to:
  /// **'Finished'**
  String get statusFinished;

  /// No description provided for @joinRoomDialogTitle.
  ///
  /// In en, this message translates to:
  /// **'Join a room'**
  String get joinRoomDialogTitle;

  /// No description provided for @roomCodeLabel.
  ///
  /// In en, this message translates to:
  /// **'Room code'**
  String get roomCodeLabel;

  /// No description provided for @roomCodeHint.
  ///
  /// In en, this message translates to:
  /// **'Enter the 6-character code'**
  String get roomCodeHint;

  /// No description provided for @roomCodeLengthError.
  ///
  /// In en, this message translates to:
  /// **'Code must be 6 characters'**
  String get roomCodeLengthError;

  /// No description provided for @roomQuestionCount.
  ///
  /// In en, this message translates to:
  /// **'Question {current}/{total}'**
  String roomQuestionCount(int current, int total);

  /// No description provided for @roomOutOfTotal.
  ///
  /// In en, this message translates to:
  /// **'of {total}'**
  String roomOutOfTotal(int total);

  /// No description provided for @roomWaitingPuzzle.
  ///
  /// In en, this message translates to:
  /// **'Waiting for puzzle...'**
  String get roomWaitingPuzzle;

  /// No description provided for @roomLoadingPuzzle.
  ///
  /// In en, this message translates to:
  /// **'Loading puzzle...'**
  String get roomLoadingPuzzle;

  /// No description provided for @roomHintLabel.
  ///
  /// In en, this message translates to:
  /// **'Hint: {hint}'**
  String roomHintLabel(String hint);

  /// No description provided for @roomStartFrom.
  ///
  /// In en, this message translates to:
  /// **'Start from: {word}'**
  String roomStartFrom(String word);

  /// No description provided for @roomEndAt.
  ///
  /// In en, this message translates to:
  /// **'End at: {word}'**
  String roomEndAt(String word);

  /// No description provided for @roomSettings.
  ///
  /// In en, this message translates to:
  /// **'Room settings'**
  String get roomSettings;

  /// No description provided for @roomManagePlayers.
  ///
  /// In en, this message translates to:
  /// **'Manage players'**
  String get roomManagePlayers;

  /// No description provided for @roomSkipQuestion.
  ///
  /// In en, this message translates to:
  /// **'Skip current question'**
  String get roomSkipQuestion;

  /// No description provided for @roomResetScores.
  ///
  /// In en, this message translates to:
  /// **'Reset scores'**
  String get roomResetScores;

  /// No description provided for @roomChangeDifficulty.
  ///
  /// In en, this message translates to:
  /// **'Change difficulty'**
  String get roomChangeDifficulty;

  /// No description provided for @roomDelete.
  ///
  /// In en, this message translates to:
  /// **'Delete room'**
  String get roomDelete;

  /// No description provided for @roomRefreshStatus.
  ///
  /// In en, this message translates to:
  /// **'Refresh status'**
  String get roomRefreshStatus;

  /// No description provided for @roomBackToLobby.
  ///
  /// In en, this message translates to:
  /// **'Back to room'**
  String get roomBackToLobby;

  /// No description provided for @roomResetScoresTitle.
  ///
  /// In en, this message translates to:
  /// **'Reset scores'**
  String get roomResetScoresTitle;

  /// No description provided for @roomResetScoresConfirm.
  ///
  /// In en, this message translates to:
  /// **'Do you want to reset all players\' scores?'**
  String get roomResetScoresConfirm;

  /// No description provided for @confirm.
  ///
  /// In en, this message translates to:
  /// **'Confirm'**
  String get confirm;

  /// No description provided for @difficultyTitle.
  ///
  /// In en, this message translates to:
  /// **'Change difficulty'**
  String get difficultyTitle;

  /// No description provided for @currentDifficulty.
  ///
  /// In en, this message translates to:
  /// **'Current difficulty: {value}'**
  String currentDifficulty(int value);

  /// No description provided for @save.
  ///
  /// In en, this message translates to:
  /// **'Save'**
  String get save;

  /// No description provided for @managePlayersTitle.
  ///
  /// In en, this message translates to:
  /// **'Manage players'**
  String get managePlayersTitle;

  /// No description provided for @playerLabel.
  ///
  /// In en, this message translates to:
  /// **'Player'**
  String get playerLabel;

  /// No description provided for @pointsRole.
  ///
  /// In en, this message translates to:
  /// **'Points: {points} • Role: {role}'**
  String pointsRole(int points, String role);

  /// No description provided for @roleManager.
  ///
  /// In en, this message translates to:
  /// **'Manager'**
  String get roleManager;

  /// No description provided for @roleAdmin.
  ///
  /// In en, this message translates to:
  /// **'Admin'**
  String get roleAdmin;

  /// No description provided for @roleCoManager.
  ///
  /// In en, this message translates to:
  /// **'Co-manager'**
  String get roleCoManager;

  /// No description provided for @freeze.
  ///
  /// In en, this message translates to:
  /// **'Freeze'**
  String get freeze;

  /// No description provided for @unfreeze.
  ///
  /// In en, this message translates to:
  /// **'Unfreeze'**
  String get unfreeze;

  /// No description provided for @promoteCoManager.
  ///
  /// In en, this message translates to:
  /// **'Promote to co-manager'**
  String get promoteCoManager;

  /// No description provided for @kick.
  ///
  /// In en, this message translates to:
  /// **'Kick'**
  String get kick;

  /// No description provided for @close.
  ///
  /// In en, this message translates to:
  /// **'Close'**
  String get close;

  /// No description provided for @deleteRoomTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete room'**
  String get deleteRoomTitle;

  /// No description provided for @deleteRoomConfirm.
  ///
  /// In en, this message translates to:
  /// **'Do you want to delete this room? All players will be removed and this action cannot be undone.'**
  String get deleteRoomConfirm;

  /// No description provided for @roomNoActiveRoom.
  ///
  /// In en, this message translates to:
  /// **'No active room'**
  String get roomNoActiveRoom;

  /// No description provided for @playersCountLabel.
  ///
  /// In en, this message translates to:
  /// **'Players: {count}'**
  String playersCountLabel(int count);

  /// No description provided for @loadingQuestion.
  ///
  /// In en, this message translates to:
  /// **'Loading question...'**
  String get loadingQuestion;

  /// No description provided for @chatHint.
  ///
  /// In en, this message translates to:
  /// **'Write a message...'**
  String get chatHint;

  /// No description provided for @sendMessageFailed.
  ///
  /// In en, this message translates to:
  /// **'Failed to send message. Please check your connection.'**
  String get sendMessageFailed;

  /// No description provided for @readyStatusReady.
  ///
  /// In en, this message translates to:
  /// **'You are ready ✓'**
  String get readyStatusReady;

  /// No description provided for @readyStatusAnnounce.
  ///
  /// In en, this message translates to:
  /// **'Announce ready'**
  String get readyStatusAnnounce;

  /// No description provided for @startingGame.
  ///
  /// In en, this message translates to:
  /// **'Starting...'**
  String get startingGame;

  /// No description provided for @fetchCurrentQuestion.
  ///
  /// In en, this message translates to:
  /// **'Fetch current question'**
  String get fetchCurrentQuestion;

  /// No description provided for @nextQuestion.
  ///
  /// In en, this message translates to:
  /// **'Next question ▶️'**
  String get nextQuestion;

  /// No description provided for @reopenRoom.
  ///
  /// In en, this message translates to:
  /// **'Reopen room'**
  String get reopenRoom;

  /// No description provided for @questionUnavailable.
  ///
  /// In en, this message translates to:
  /// **'Question not available'**
  String get questionUnavailable;

  /// No description provided for @roundFinishedForYou.
  ///
  /// In en, this message translates to:
  /// **'Round finished for you!'**
  String get roundFinishedForYou;

  /// No description provided for @puzzleLabel.
  ///
  /// In en, this message translates to:
  /// **'Puzzle'**
  String get puzzleLabel;

  /// No description provided for @chainLabel.
  ///
  /// In en, this message translates to:
  /// **'Chain'**
  String get chainLabel;

  /// No description provided for @hintUseful.
  ///
  /// In en, this message translates to:
  /// **'Helpful hint'**
  String get hintUseful;

  /// No description provided for @optionsAvailable.
  ///
  /// In en, this message translates to:
  /// **'Available options:'**
  String get optionsAvailable;

  /// No description provided for @timeRemaining.
  ///
  /// In en, this message translates to:
  /// **'Time left: {seconds} seconds'**
  String timeRemaining(Object seconds);

  /// No description provided for @copyRoomCode.
  ///
  /// In en, this message translates to:
  /// **'Copy room code'**
  String get copyRoomCode;

  /// No description provided for @roomCodeCopied.
  ///
  /// In en, this message translates to:
  /// **'Code copied: {code}'**
  String roomCodeCopied(String code);

  /// No description provided for @refreshRoom.
  ///
  /// In en, this message translates to:
  /// **'Refresh room'**
  String get refreshRoom;

  /// No description provided for @leaveRoom.
  ///
  /// In en, this message translates to:
  /// **'Leave'**
  String get leaveRoom;

  /// No description provided for @deleteGroupTitle.
  ///
  /// In en, this message translates to:
  /// **'Delete group'**
  String get deleteGroupTitle;

  /// No description provided for @deleteGroupConfirm.
  ///
  /// In en, this message translates to:
  /// **'Are you sure you want to delete the group permanently? All members will be removed.'**
  String get deleteGroupConfirm;

  /// No description provided for @gameResultsTitle.
  ///
  /// In en, this message translates to:
  /// **'Game results 🎉'**
  String get gameResultsTitle;

  /// No description provided for @gameResultsIntro.
  ///
  /// In en, this message translates to:
  /// **'Congrats everyone! Here are the final results:'**
  String get gameResultsIntro;

  /// No description provided for @puzzlesSolvedLabel.
  ///
  /// In en, this message translates to:
  /// **'Puzzles solved: {count}'**
  String puzzlesSolvedLabel(int count);

  /// No description provided for @pointsLabel.
  ///
  /// In en, this message translates to:
  /// **'{points} points'**
  String pointsLabel(int points);

  /// No description provided for @playAgain.
  ///
  /// In en, this message translates to:
  /// **'Play again'**
  String get playAgain;

  /// No description provided for @settingsLoadError.
  ///
  /// In en, this message translates to:
  /// **'Failed to load settings: {error}'**
  String settingsLoadError(String error);

  /// No description provided for @settingsSaveSuccess.
  ///
  /// In en, this message translates to:
  /// **'Settings saved successfully'**
  String get settingsSaveSuccess;

  /// No description provided for @settingsSaveError.
  ///
  /// In en, this message translates to:
  /// **'Failed to save settings: {error}'**
  String settingsSaveError(String error);

  /// No description provided for @roomSettingsHeader.
  ///
  /// In en, this message translates to:
  /// **'Room settings'**
  String get roomSettingsHeader;

  /// No description provided for @managerLabel.
  ///
  /// In en, this message translates to:
  /// **'Manager'**
  String get managerLabel;

  /// No description provided for @hintsSystemTitle.
  ///
  /// In en, this message translates to:
  /// **'Hints system'**
  String get hintsSystemTitle;

  /// No description provided for @hintsEnabledTitle.
  ///
  /// In en, this message translates to:
  /// **'Enable hints'**
  String get hintsEnabledTitle;

  /// No description provided for @hintsEnabledSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Allow players to use hints'**
  String get hintsEnabledSubtitle;

  /// No description provided for @hintsPerPlayerLabel.
  ///
  /// In en, this message translates to:
  /// **'Hints per player: {count}'**
  String hintsPerPlayerLabel(int count);

  /// No description provided for @hintPenaltyLabel.
  ///
  /// In en, this message translates to:
  /// **'Hint penalty: {percent}%'**
  String hintPenaltyLabel(int percent);

  /// No description provided for @gameSettingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Game settings'**
  String get gameSettingsTitle;

  /// No description provided for @autoAdvanceLabel.
  ///
  /// In en, this message translates to:
  /// **'Auto advance after wrong answer: {seconds} seconds'**
  String autoAdvanceLabel(int seconds);

  /// No description provided for @minTimeLabel.
  ///
  /// In en, this message translates to:
  /// **'Minimum time before advance: {seconds} seconds'**
  String minTimeLabel(int seconds);

  /// No description provided for @otherOptionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Other options'**
  String get otherOptionsTitle;

  /// No description provided for @shuffleOptionsTitle.
  ///
  /// In en, this message translates to:
  /// **'Shuffle answer options'**
  String get shuffleOptionsTitle;

  /// No description provided for @shuffleOptionsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Randomize options order'**
  String get shuffleOptionsSubtitle;

  /// No description provided for @showRankingsTitle.
  ///
  /// In en, this message translates to:
  /// **'Show live rankings'**
  String get showRankingsTitle;

  /// No description provided for @showRankingsSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Display rankings during the game'**
  String get showRankingsSubtitle;

  /// No description provided for @allowReportTitle.
  ///
  /// In en, this message translates to:
  /// **'Allow reporting bad questions'**
  String get allowReportTitle;

  /// No description provided for @allowReportSubtitle.
  ///
  /// In en, this message translates to:
  /// **'Let players report question issues'**
  String get allowReportSubtitle;

  /// No description provided for @saveChanges.
  ///
  /// In en, this message translates to:
  /// **'Save changes'**
  String get saveChanges;

  /// No description provided for @helpersEnabledLabel.
  ///
  /// In en, this message translates to:
  /// **'Hints enabled'**
  String get helpersEnabledLabel;

  /// No description provided for @yes.
  ///
  /// In en, this message translates to:
  /// **'Yes'**
  String get yes;

  /// No description provided for @no.
  ///
  /// In en, this message translates to:
  /// **'No'**
  String get no;

  /// No description provided for @hintsPerPlayerValue.
  ///
  /// In en, this message translates to:
  /// **'{count} hints'**
  String hintsPerPlayerValue(int count);

  /// No description provided for @hintPenaltyValue.
  ///
  /// In en, this message translates to:
  /// **'{percent}%'**
  String hintPenaltyValue(int percent);

  /// No description provided for @autoAdvanceValue.
  ///
  /// In en, this message translates to:
  /// **'{seconds} seconds'**
  String autoAdvanceValue(int seconds);

  /// No description provided for @enabled.
  ///
  /// In en, this message translates to:
  /// **'Enabled'**
  String get enabled;

  /// No description provided for @disabled.
  ///
  /// In en, this message translates to:
  /// **'Disabled'**
  String get disabled;

  /// No description provided for @levelLabel.
  ///
  /// In en, this message translates to:
  /// **'Level {level}'**
  String levelLabel(int level);

  /// No description provided for @levelsDebugTooltip.
  ///
  /// In en, this message translates to:
  /// **'Test API (20 Questions)'**
  String get levelsDebugTooltip;

  /// No description provided for @levelsDebugMessage.
  ///
  /// In en, this message translates to:
  /// **'Use admin panel to generate puzzles'**
  String get levelsDebugMessage;

  /// No description provided for @generatingPuzzles.
  ///
  /// In en, this message translates to:
  /// **'Generating puzzles...'**
  String get generatingPuzzles;

  /// No description provided for @gameOverTitle.
  ///
  /// In en, this message translates to:
  /// **'Game over'**
  String get gameOverTitle;

  /// No description provided for @outOfLives.
  ///
  /// In en, this message translates to:
  /// **'You ran out of lives!'**
  String get outOfLives;

  /// No description provided for @exit.
  ///
  /// In en, this message translates to:
  /// **'Exit'**
  String get exit;

  /// No description provided for @retry.
  ///
  /// In en, this message translates to:
  /// **'Retry'**
  String get retry;

  /// No description provided for @puzzleProgress.
  ///
  /// In en, this message translates to:
  /// **'Puzzle {current}/{total}'**
  String puzzleProgress(int current, int total);

  /// No description provided for @scoreLabel.
  ///
  /// In en, this message translates to:
  /// **'Score: {score}'**
  String scoreLabel(int score);

  /// No description provided for @livesLabel.
  ///
  /// In en, this message translates to:
  /// **'Lives'**
  String get livesLabel;

  /// No description provided for @timeLabel.
  ///
  /// In en, this message translates to:
  /// **'Time'**
  String get timeLabel;

  /// No description provided for @hintTitle.
  ///
  /// In en, this message translates to:
  /// **'Hint: {hint}'**
  String hintTitle(String hint);

  /// No description provided for @spotDiffTitle.
  ///
  /// In en, this message translates to:
  /// **'Spot the Difference'**
  String get spotDiffTitle;

  /// No description provided for @spotDiffEmptyResponse.
  ///
  /// In en, this message translates to:
  /// **'Empty response'**
  String get spotDiffEmptyResponse;

  /// No description provided for @spotDiffGenerateErrorLog.
  ///
  /// In en, this message translates to:
  /// **'SpotDiff generate error: {error}'**
  String spotDiffGenerateErrorLog(String error);

  /// No description provided for @spotDiffGenerateStackLog.
  ///
  /// In en, this message translates to:
  /// **'SpotDiff stack: {stack}'**
  String spotDiffGenerateStackLog(String stack);

  /// No description provided for @spotDiffAllFound.
  ///
  /// In en, this message translates to:
  /// **'Great! You found all differences.'**
  String get spotDiffAllFound;

  /// No description provided for @spotDiffStartPrompt.
  ///
  /// In en, this message translates to:
  /// **'Tap Generate to start.'**
  String get spotDiffStartPrompt;

  /// No description provided for @spotDiffProgressLabel.
  ///
  /// In en, this message translates to:
  /// **'Mental progress: {found}/{total}'**
  String spotDiffProgressLabel(int found, int total);

  /// No description provided for @spotDiffThemeHint.
  ///
  /// In en, this message translates to:
  /// **'Theme (optional)'**
  String get spotDiffThemeHint;

  /// No description provided for @spotDiffDifferencesLabel.
  ///
  /// In en, this message translates to:
  /// **'Differences: {count}'**
  String spotDiffDifferencesLabel(int count);

  /// No description provided for @spotDiffGenerate.
  ///
  /// In en, this message translates to:
  /// **'Generate'**
  String get spotDiffGenerate;

  /// No description provided for @spotDiffHint.
  ///
  /// In en, this message translates to:
  /// **'Hint'**
  String get spotDiffHint;

  /// No description provided for @spotDiffHintsLeft.
  ///
  /// In en, this message translates to:
  /// **'Hints left: {count}'**
  String spotDiffHintsLeft(int count);

  /// No description provided for @spotDiffFoundLabel.
  ///
  /// In en, this message translates to:
  /// **'Found: {found}/{total}'**
  String spotDiffFoundLabel(int found, int total);

  /// No description provided for @spotDiffFindFirst.
  ///
  /// In en, this message translates to:
  /// **'Find differences first.'**
  String get spotDiffFindFirst;

  /// No description provided for @spotDiffExplanationsTitle.
  ///
  /// In en, this message translates to:
  /// **'Explanations'**
  String get spotDiffExplanationsTitle;

  /// No description provided for @spotDiffChooseDecision.
  ///
  /// In en, this message translates to:
  /// **'Choose your decision'**
  String get spotDiffChooseDecision;

  /// No description provided for @spotDiffImageALabel.
  ///
  /// In en, this message translates to:
  /// **'Image A'**
  String get spotDiffImageALabel;

  /// No description provided for @spotDiffImageBLabel.
  ///
  /// In en, this message translates to:
  /// **'Image B'**
  String get spotDiffImageBLabel;

  /// No description provided for @featureDisabledDesktop.
  ///
  /// In en, this message translates to:
  /// **'⚠️ Feature currently disabled on Desktop.\nPlease try on Mobile.'**
  String get featureDisabledDesktop;

  /// No description provided for @featureDisabledWeb.
  ///
  /// In en, this message translates to:
  /// **'⚠️ Vision scanning is not supported on Web yet.'**
  String get featureDisabledWeb;

  /// No description provided for @xpRewardLabel.
  ///
  /// In en, this message translates to:
  /// **'⚡ +{xp} XP'**
  String xpRewardLabel(int xp);

  /// No description provided for @completedLabel.
  ///
  /// In en, this message translates to:
  /// **'Completed'**
  String get completedLabel;

  /// No description provided for @scoreTitle.
  ///
  /// In en, this message translates to:
  /// **'Score'**
  String get scoreTitle;

  /// No description provided for @secondsShort.
  ///
  /// In en, this message translates to:
  /// **'{seconds}s'**
  String secondsShort(int seconds);

  /// No description provided for @placeholderOptionOne.
  ///
  /// In en, this message translates to:
  /// **'Option One'**
  String get placeholderOptionOne;

  /// No description provided for @placeholderOptionTwo.
  ///
  /// In en, this message translates to:
  /// **'Option Two'**
  String get placeholderOptionTwo;

  /// No description provided for @placeholderOptionThree.
  ///
  /// In en, this message translates to:
  /// **'Option Three'**
  String get placeholderOptionThree;

  /// No description provided for @placeholderOptionFour.
  ///
  /// In en, this message translates to:
  /// **'Option Four'**
  String get placeholderOptionFour;

  /// No description provided for @roomLogButtonTapped.
  ///
  /// In en, this message translates to:
  /// **'Button tapped - Option: {option} (index: {index})'**
  String roomLogButtonTapped(String option, int index);

  /// No description provided for @roomLogSubmittingIgnored.
  ///
  /// In en, this message translates to:
  /// **'Currently submitting, ignoring tap'**
  String get roomLogSubmittingIgnored;

  /// No description provided for @roomLogSameOptionSubmitting.
  ///
  /// In en, this message translates to:
  /// **'Same option selected, submitting...'**
  String get roomLogSameOptionSubmitting;

  /// No description provided for @roomLogSelectingOption.
  ///
  /// In en, this message translates to:
  /// **'Selecting option...'**
  String get roomLogSelectingOption;

  /// No description provided for @roomLogDelayComplete.
  ///
  /// In en, this message translates to:
  /// **'Delay complete, preparing to submit'**
  String get roomLogDelayComplete;

  /// No description provided for @roomLogSubmittingAfterDelay.
  ///
  /// In en, this message translates to:
  /// **'Submitting after delay...'**
  String get roomLogSubmittingAfterDelay;

  /// No description provided for @roomLogAlreadySubmitting.
  ///
  /// In en, this message translates to:
  /// **'Already submitting, ignoring duplicate submission'**
  String get roomLogAlreadySubmitting;

  /// No description provided for @roomLogSubmittingAnswer.
  ///
  /// In en, this message translates to:
  /// **'Submitting answer at index: {index}'**
  String roomLogSubmittingAnswer(int index);

  /// No description provided for @roomLogCallingSubmit.
  ///
  /// In en, this message translates to:
  /// **'Calling submitQuizAnswer({index})'**
  String roomLogCallingSubmit(int index);

  /// No description provided for @roomLogSubmittedSuccess.
  ///
  /// In en, this message translates to:
  /// **'Answer submitted successfully'**
  String get roomLogSubmittedSuccess;

  /// No description provided for @roomLogSubmitError.
  ///
  /// In en, this message translates to:
  /// **'Error submitting answer: {error}'**
  String roomLogSubmitError(String error);

  /// No description provided for @roomLogResettingState.
  ///
  /// In en, this message translates to:
  /// **'Resetting state...'**
  String get roomLogResettingState;
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
