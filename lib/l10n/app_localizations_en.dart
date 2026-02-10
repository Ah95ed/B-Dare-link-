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
  String get startGame => 'Start game';

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
  String get otpLabel => 'OTP';

  @override
  String otpSentLog(String status) {
    return 'OTP sent: $status';
  }

  @override
  String otpVerifyLog(String status) {
    return 'OTP verify result: $status';
  }

  @override
  String otpSendErrorLog(String error) {
    return 'OTP send error: $error';
  }

  @override
  String otpVerifyErrorLog(String error) {
    return 'OTP verify error: $error';
  }

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

  @override
  String get competitionsTitle => 'Competitions & Rooms';

  @override
  String get refresh => 'Refresh';

  @override
  String get searchRoom => 'Search rooms';

  @override
  String get roomLabel => 'Room';

  @override
  String get competitionLabel => 'Competition';

  @override
  String get searchByCodeHint => 'Search by code (e.g., ABCD12)';

  @override
  String joinError(String error) {
    return 'Join error: $error';
  }

  @override
  String get createRoomCardTitle => 'Create new room';

  @override
  String get createRoomCardSubtitle => 'Create a room and invite friends';

  @override
  String get joinRoomCardTitle => 'Join a room';

  @override
  String get joinRoomCardSubtitle => 'Enter the room code to join';

  @override
  String get myRoomsTitle => 'Rooms you joined';

  @override
  String roomCodeParticipants(String code, int count) {
    return 'Code: $code • $count players';
  }

  @override
  String get activeCompetitionsTitle => 'Active competitions';

  @override
  String get noActiveCompetitions => 'No active competitions right now';

  @override
  String competitionSubtitle(int participants, int puzzles) {
    return '$participants participants • $puzzles puzzles';
  }

  @override
  String get join => 'Join';

  @override
  String get statusActive => 'Active';

  @override
  String get statusFinished => 'Finished';

  @override
  String get joinRoomDialogTitle => 'Join a room';

  @override
  String get roomCodeLabel => 'Room code';

  @override
  String get roomCodeHint => 'Enter the 6-character code';

  @override
  String get roomCodeLengthError => 'Code must be 6 characters';

  @override
  String roomQuestionCount(int current, int total) {
    return 'Question $current/$total';
  }

  @override
  String roomOutOfTotal(int total) {
    return 'of $total';
  }

  @override
  String get roomWaitingPuzzle => 'Waiting for puzzle...';

  @override
  String get roomLoadingPuzzle => 'Loading puzzle...';

  @override
  String roomHintLabel(String hint) {
    return 'Hint: $hint';
  }

  @override
  String roomStartFrom(String word) {
    return 'Start from: $word';
  }

  @override
  String roomEndAt(String word) {
    return 'End at: $word';
  }

  @override
  String get roomSettings => 'Room settings';

  @override
  String get roomManagePlayers => 'Manage players';

  @override
  String get roomSkipQuestion => 'Skip current question';

  @override
  String get roomResetScores => 'Reset scores';

  @override
  String get roomChangeDifficulty => 'Change difficulty';

  @override
  String get roomDelete => 'Delete room';

  @override
  String get roomRefreshStatus => 'Refresh status';

  @override
  String get roomBackToLobby => 'Back to room';

  @override
  String get roomResetScoresTitle => 'Reset scores';

  @override
  String get roomResetScoresConfirm =>
      'Do you want to reset all players\' scores?';

  @override
  String get confirm => 'Confirm';

  @override
  String get difficultyTitle => 'Change difficulty';

  @override
  String currentDifficulty(int value) {
    return 'Current difficulty: $value';
  }

  @override
  String get save => 'Save';

  @override
  String get managePlayersTitle => 'Manage players';

  @override
  String get playerLabel => 'Player';

  @override
  String pointsRole(int points, String role) {
    return 'Points: $points • Role: $role';
  }

  @override
  String get roleManager => 'Manager';

  @override
  String get roleAdmin => 'Admin';

  @override
  String get roleCoManager => 'Co-manager';

  @override
  String get freeze => 'Freeze';

  @override
  String get unfreeze => 'Unfreeze';

  @override
  String get promoteCoManager => 'Promote to co-manager';

  @override
  String get kick => 'Kick';

  @override
  String get close => 'Close';

  @override
  String get deleteRoomTitle => 'Delete room';

  @override
  String get deleteRoomConfirm =>
      'Do you want to delete this room? All players will be removed and this action cannot be undone.';

  @override
  String get roomNoActiveRoom => 'No active room';

  @override
  String playersCountLabel(int count) {
    return 'Players: $count';
  }

  @override
  String get loadingQuestion => 'Loading question...';

  @override
  String get chatHint => 'Write a message...';

  @override
  String get sendMessageFailed =>
      'Failed to send message. Please check your connection.';

  @override
  String get readyStatusReady => 'You are ready ✓';

  @override
  String get readyStatusAnnounce => 'Announce ready';

  @override
  String get startingGame => 'Starting...';

  @override
  String get fetchCurrentQuestion => 'Fetch current question';

  @override
  String get nextQuestion => 'Next question ▶️';

  @override
  String get reopenRoom => 'Reopen room';

  @override
  String get questionUnavailable => 'Question not available';

  @override
  String get roundFinishedForYou => 'Round finished for you!';

  @override
  String get puzzleLabel => 'Puzzle';

  @override
  String get chainLabel => 'Chain';

  @override
  String get hintUseful => 'Helpful hint';

  @override
  String get optionsAvailable => 'Available options:';

  @override
  String timeRemaining(Object seconds) {
    return 'Time left: $seconds seconds';
  }

  @override
  String get copyRoomCode => 'Copy room code';

  @override
  String roomCodeCopied(String code) {
    return 'Code copied: $code';
  }

  @override
  String get refreshRoom => 'Refresh room';

  @override
  String get leaveRoom => 'Leave';

  @override
  String get deleteGroupTitle => 'Delete group';

  @override
  String get deleteGroupConfirm =>
      'Are you sure you want to delete the group permanently? All members will be removed.';

  @override
  String get gameResultsTitle => 'Game results 🎉';

  @override
  String get gameResultsIntro =>
      'Congrats everyone! Here are the final results:';

  @override
  String puzzlesSolvedLabel(int count) {
    return 'Puzzles solved: $count';
  }

  @override
  String pointsLabel(int points) {
    return '$points points';
  }

  @override
  String get playAgain => 'Play again';

  @override
  String settingsLoadError(String error) {
    return 'Failed to load settings: $error';
  }

  @override
  String get settingsSaveSuccess => 'Settings saved successfully';

  @override
  String settingsSaveError(String error) {
    return 'Failed to save settings: $error';
  }

  @override
  String get roomSettingsHeader => 'Room settings';

  @override
  String get managerLabel => 'Manager';

  @override
  String get hintsSystemTitle => 'Hints system';

  @override
  String get hintsEnabledTitle => 'Enable hints';

  @override
  String get hintsEnabledSubtitle => 'Allow players to use hints';

  @override
  String hintsPerPlayerLabel(int count) {
    return 'Hints per player: $count';
  }

  @override
  String hintPenaltyLabel(int percent) {
    return 'Hint penalty: $percent%';
  }

  @override
  String get gameSettingsTitle => 'Game settings';

  @override
  String autoAdvanceLabel(int seconds) {
    return 'Auto advance after wrong answer: $seconds seconds';
  }

  @override
  String minTimeLabel(int seconds) {
    return 'Minimum time before advance: $seconds seconds';
  }

  @override
  String get otherOptionsTitle => 'Other options';

  @override
  String get shuffleOptionsTitle => 'Shuffle answer options';

  @override
  String get shuffleOptionsSubtitle => 'Randomize options order';

  @override
  String get showRankingsTitle => 'Show live rankings';

  @override
  String get showRankingsSubtitle => 'Display rankings during the game';

  @override
  String get allowReportTitle => 'Allow reporting bad questions';

  @override
  String get allowReportSubtitle => 'Let players report question issues';

  @override
  String get saveChanges => 'Save changes';

  @override
  String get helpersEnabledLabel => 'Hints enabled';

  @override
  String get yes => 'Yes';

  @override
  String get no => 'No';

  @override
  String hintsPerPlayerValue(int count) {
    return '$count hints';
  }

  @override
  String hintPenaltyValue(int percent) {
    return '$percent%';
  }

  @override
  String autoAdvanceValue(int seconds) {
    return '$seconds seconds';
  }

  @override
  String get enabled => 'Enabled';

  @override
  String get disabled => 'Disabled';

  @override
  String levelLabel(int level) {
    return 'Level $level';
  }

  @override
  String get levelsDebugTooltip => 'Test API (20 Questions)';

  @override
  String get levelsDebugMessage => 'Use admin panel to generate puzzles';

  @override
  String get generatingPuzzles => 'Generating puzzles...';

  @override
  String get gameOverTitle => 'Game over';

  @override
  String get outOfLives => 'You ran out of lives!';

  @override
  String get exit => 'Exit';

  @override
  String get retry => 'Retry';

  @override
  String puzzleProgress(int current, int total) {
    return 'Puzzle $current/$total';
  }

  @override
  String scoreLabel(int score) {
    return 'Score: $score';
  }

  @override
  String get livesLabel => 'Lives';

  @override
  String get timeLabel => 'Time';

  @override
  String hintTitle(String hint) {
    return 'Hint: $hint';
  }

  @override
  String get spotDiffTitle => 'Spot the Difference';

  @override
  String get spotDiffEmptyResponse => 'Empty response';

  @override
  String spotDiffGenerateErrorLog(String error) {
    return 'SpotDiff generate error: $error';
  }

  @override
  String spotDiffGenerateStackLog(String stack) {
    return 'SpotDiff stack: $stack';
  }

  @override
  String get spotDiffAllFound => 'Great! You found all differences.';

  @override
  String get spotDiffStartPrompt => 'Tap Generate to start.';

  @override
  String spotDiffProgressLabel(int found, int total) {
    return 'Mental progress: $found/$total';
  }

  @override
  String get spotDiffThemeHint => 'Theme (optional)';

  @override
  String spotDiffDifferencesLabel(int count) {
    return 'Differences: $count';
  }

  @override
  String get spotDiffGenerate => 'Generate';

  @override
  String get spotDiffHint => 'Hint';

  @override
  String spotDiffHintsLeft(int count) {
    return 'Hints left: $count';
  }

  @override
  String spotDiffFoundLabel(int found, int total) {
    return 'Found: $found/$total';
  }

  @override
  String get spotDiffFindFirst => 'Find differences first.';

  @override
  String get spotDiffExplanationsTitle => 'Explanations';

  @override
  String get spotDiffChooseDecision => 'Choose your decision';

  @override
  String get spotDiffImageALabel => 'Image A';

  @override
  String get spotDiffImageBLabel => 'Image B';

  @override
  String get featureDisabledDesktop =>
      '⚠️ Feature currently disabled on Desktop.\nPlease try on Mobile.';

  @override
  String get featureDisabledWeb =>
      '⚠️ Vision scanning is not supported on Web yet.';

  @override
  String xpRewardLabel(int xp) {
    return '⚡ +$xp XP';
  }

  @override
  String get completedLabel => 'Completed';

  @override
  String get scoreTitle => 'Score';

  @override
  String secondsShort(int seconds) {
    return '${seconds}s';
  }

  @override
  String get placeholderOptionOne => 'Option One';

  @override
  String get placeholderOptionTwo => 'Option Two';

  @override
  String get placeholderOptionThree => 'Option Three';

  @override
  String get placeholderOptionFour => 'Option Four';

  @override
  String roomLogButtonTapped(String option, int index) {
    return 'Button tapped - Option: $option (index: $index)';
  }

  @override
  String get roomLogSubmittingIgnored => 'Currently submitting, ignoring tap';

  @override
  String get roomLogSameOptionSubmitting =>
      'Same option selected, submitting...';

  @override
  String get roomLogSelectingOption => 'Selecting option...';

  @override
  String get roomLogDelayComplete => 'Delay complete, preparing to submit';

  @override
  String get roomLogSubmittingAfterDelay => 'Submitting after delay...';

  @override
  String get roomLogAlreadySubmitting =>
      'Already submitting, ignoring duplicate submission';

  @override
  String roomLogSubmittingAnswer(int index) {
    return 'Submitting answer at index: $index';
  }

  @override
  String roomLogCallingSubmit(int index) {
    return 'Calling submitQuizAnswer($index)';
  }

  @override
  String get roomLogSubmittedSuccess => 'Answer submitted successfully';

  @override
  String roomLogSubmitError(String error) {
    return 'Error submitting answer: $error';
  }

  @override
  String get roomLogResettingState => 'Resetting state...';
}
