// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'رابط العجائب';

  @override
  String get appSubtitle => 'اكتشف الصلة الخفية!';

  @override
  String get startGame => 'ابدأ اللعبة';

  @override
  String get linkStart => 'الكلمة الأولى';

  @override
  String get linkEnd => 'الكلمة الأخيرة';

  @override
  String get yourLink => 'كيف ربطت بينهما؟';

  @override
  String get submit => 'اربط!';

  @override
  String get loading => 'جاري التحقق...';

  @override
  String get winMessage => 'رائع! لقد وجدت الرابط!';

  @override
  String get loseMessage => 'حاول مرة أخرى!';

  @override
  String get steps => 'خطوات';

  @override
  String get changeLanguage => 'English';

  @override
  String get levelsTitle => 'المراحل';

  @override
  String get soloPlay => 'اللعب الفردي';

  @override
  String get tournaments => 'البطولات';

  @override
  String get profile => 'الملف الشخصي';

  @override
  String get settings => 'الإعدادات';

  @override
  String get login => 'تسجيل الدخول';

  @override
  String get register => 'إنشاء حساب';

  @override
  String get logout => 'تسجيل الخروج';

  @override
  String get deleteAccount => 'حذف الحساب';

  @override
  String get loginTitle => 'تسجيل الدخول';

  @override
  String get registerTitle => 'إنشاء حساب جديد';

  @override
  String get welcomeBack => 'مرحباً بعودتك!';

  @override
  String get createAccount => 'إنشاء حساب';

  @override
  String get username => 'اسم المستخدم';

  @override
  String get email => 'البريد الإلكتروني';

  @override
  String get password => 'كلمة المرور';

  @override
  String get newPassword => 'كلمة المرور الجديدة';

  @override
  String get forgotPassword => 'نسيت كلمة المرور؟';

  @override
  String get resetPassword => 'إعادة تعيين كلمة المرور';

  @override
  String get dontHaveAccount => 'ليس لديك حساب؟ سجل الآن';

  @override
  String get enterValidEmail => 'أدخل بريداً إلكترونياً صحيحاً';

  @override
  String get enterUsername => 'أدخل اسم المستخدم';

  @override
  String get passwordTooShort => 'كلمة المرور قصيرة جداً';

  @override
  String get loginFailed => 'فشل تسجيل الدخول';

  @override
  String get registrationFailed => 'فشل إنشاء الحساب';

  @override
  String get resetPasswordInstructions =>
      'أدخل بريدك الإلكتروني المسجل لتلقي رمز التحقق.';

  @override
  String get sendOTP => 'إرسال رمز التحقق';

  @override
  String get verifyAndReset => 'تحقق وأعد التعيين';

  @override
  String get otpLabel => 'رمز التحقق';

  @override
  String otpSentLog(String status) {
    return 'تم إرسال رمز التحقق: $status';
  }

  @override
  String otpVerifyLog(String status) {
    return 'نتيجة التحقق من الرمز: $status';
  }

  @override
  String otpSendErrorLog(String error) {
    return 'خطأ في إرسال الرمز: $error';
  }

  @override
  String otpVerifyErrorLog(String error) {
    return 'خطأ في التحقق من الرمز: $error';
  }

  @override
  String otpSent(String email) {
    return 'تم إرسال رمز التحقق إلى $email';
  }

  @override
  String get failedToSendOTP => 'فشل إرسال رمز التحقق';

  @override
  String errorSendingOTP(String error) {
    return 'خطأ في إرسال رمز التحقق: $error';
  }

  @override
  String get passwordResetSuccessful => 'تم إعادة تعيين كلمة المرور بنجاح';

  @override
  String get invalidOTP => 'رمز التحقق غير صحيح';

  @override
  String errorVerifyingOTP(String error) {
    return 'خطأ في التحقق من الرمز: $error';
  }

  @override
  String get levelComplete => 'اكتملت المرحلة!';

  @override
  String get levelCompleted => 'تم إكمال المرحلة!';

  @override
  String get continueButton => 'متابعة';

  @override
  String get next => 'التالي';

  @override
  String get tryAgain => 'حاول مرة أخرى!';

  @override
  String get checkAnswer => 'تحقق';

  @override
  String get amazing => 'رائع! وجدت الطريق.';

  @override
  String get excellent => 'ممتاز! الترتيب صحيح.';

  @override
  String get wrongChoice => 'اختيار خاطئ! اتبع السلسلة.';

  @override
  String get incorrectOrder => 'الترتيب غير صحيح!';

  @override
  String get greatJob => 'عظيم! لقد وجدت الإجابة الصحيحة.';

  @override
  String get chooseCorrectOption => 'اختر الإجابة الصحيحة';

  @override
  String whatLinks(String start, String end) {
    return 'ما الذي يربط بين \"$start\" و \"$end\"؟';
  }

  @override
  String tapWordsInOrder(String start, String end) {
    return 'اضغط على الكلمات بالترتيب: $start <- ... <- $end';
  }

  @override
  String get authRequired =>
      'للمتابعة بعد المرحلة الثالثة، يرجى التسجيل أو تسجيل الدخول.';

  @override
  String get cantAdvanceWithoutLogin => 'لا يمكنك المتابعة دون تسجيل الدخول.';

  @override
  String get backToLevels => 'العودة للمراحل';

  @override
  String get coins => 'العملات';

  @override
  String get streak => 'السلسلة';

  @override
  String get badges => 'الأوسمة';

  @override
  String get dailyBonus => 'مكافأة يومية!';

  @override
  String get newStreakStarted => 'بدأت سلسلة جديدة';

  @override
  String streakDays(int days) {
    return 'السلسلة: $days أيام';
  }

  @override
  String get awesome => 'رائع!';

  @override
  String get achievementUnlocked => 'إنجاز جديد!';

  @override
  String get gotIt => 'حسناً!';

  @override
  String get daily => 'اليومي';

  @override
  String get weekly => 'الأسبوعي';

  @override
  String get dailyChallenge => 'التحدي اليومي';

  @override
  String get weeklyChampionship => 'بطولة الأسبوع';

  @override
  String get yourScore => 'نتيجتك';

  @override
  String get yourRank => 'ترتيبك';

  @override
  String get playNow => 'العب الآن';

  @override
  String get todaysLeaders => 'المتصدرون اليوم';

  @override
  String get weeklyStandings => 'ترتيب الأسبوع';

  @override
  String get accumulatePointsWeekly => 'اجمع النقاط طوال الأسبوع!';

  @override
  String nextChallengeIn(int hours, int minutes) {
    return 'التحدي القادم خلال: $hours ساعة و $minutes دقيقة';
  }

  @override
  String get noDataYet => 'لا توجد بيانات بعد';

  @override
  String get unknown => 'غير معروف';

  @override
  String get dailyChallengeWillOpen => 'سيفتح التحدي اليومي هنا!';

  @override
  String get totalScore => 'النقاط الإجمالية';

  @override
  String get deleteAccountConfirm => 'هل تريد حذف الحساب؟';

  @override
  String get deleteAccountWarning =>
      'لا يمكن التراجع عن هذا الإجراء. سيتم فقدان كل التقدم.';

  @override
  String get cancel => 'إلغاء';

  @override
  String get delete => 'حذف';

  @override
  String get arMode => 'الواقع المعزز';

  @override
  String get contextualRealityStart => 'الواقع المعزز بالمعنى';

  @override
  String get arInstructions =>
      'التقط صورة وسنحولها إلى لغز فريد ينطلق من عالمك!';

  @override
  String get analyzingImage => 'جاري تحليل الصورة...';

  @override
  String get camera => 'الكاميرا';

  @override
  String get gallery => 'المعرض';

  @override
  String get visionNotSupported => 'المسح البصري غير مدعوم على الويب حالياً.';

  @override
  String get scannerNotSupported =>
      'الماسح غير مدعوم على سطح المكتب حالياً.\nاستخدم Android أو iOS.';

  @override
  String errorPickingImage(String error) {
    return 'خطأ في اختيار الصورة: $error';
  }

  @override
  String get failedToAnalyzeImage => 'فشل تحليل الصورة. حاول مرة أخرى.';

  @override
  String get chooseGameMode => 'اختر نمط اللعب';

  @override
  String get choices => 'خيارات متعددة';

  @override
  String get competitionsTitle => 'المسابقات والغرف';

  @override
  String get refresh => 'تحديث';

  @override
  String get searchRoom => 'بحث عن غرفة';

  @override
  String get roomLabel => 'غرفة';

  @override
  String get competitionLabel => 'مسابقة';

  @override
  String get searchByCodeHint => 'ابحث بالكود (مثال: ABCD12)';

  @override
  String joinError(String error) {
    return 'خطأ في الانضمام: $error';
  }

  @override
  String get createRoomCardTitle => 'إنشاء غرفة جديدة';

  @override
  String get createRoomCardSubtitle => 'أنشئ غرفة وادعُ أصدقاءك للعب';

  @override
  String get joinRoomCardTitle => 'الانضمام إلى غرفة';

  @override
  String get joinRoomCardSubtitle => 'ادخل كود الغرفة للانضمام';

  @override
  String get myRoomsTitle => 'الغرف التي انضممت إليها';

  @override
  String roomCodeParticipants(String code, int count) {
    return 'كود: $code • $count لاعب';
  }

  @override
  String get activeCompetitionsTitle => 'المسابقات النشطة';

  @override
  String get noActiveCompetitions => 'لا توجد مسابقات نشطة حالياً';

  @override
  String competitionSubtitle(int participants, int puzzles) {
    return '$participants مشارك • $puzzles لغز';
  }

  @override
  String get join => 'انضم';

  @override
  String get statusActive => 'جارية';

  @override
  String get statusFinished => 'منتهية';

  @override
  String get joinRoomDialogTitle => 'الانضمام إلى غرفة';

  @override
  String get roomCodeLabel => 'كود الغرفة';

  @override
  String get roomCodeHint => 'أدخل الكود المكون من 6 أحرف';

  @override
  String get roomCodeLengthError => 'الكود يجب أن يكون 6 أحرف';

  @override
  String roomQuestionCount(int current, int total) {
    return 'السؤال $current/$total';
  }

  @override
  String roomOutOfTotal(int total) {
    return 'من $total';
  }

  @override
  String get roomWaitingPuzzle => 'انتظار اللغز...';

  @override
  String get roomLoadingPuzzle => 'جاري تحميل اللغز...';

  @override
  String roomHintLabel(String hint) {
    return 'تلميح: $hint';
  }

  @override
  String roomStartFrom(String word) {
    return 'ابدأ من: $word';
  }

  @override
  String roomEndAt(String word) {
    return 'انتهِ عند: $word';
  }

  @override
  String get roomSettings => 'إعدادات الغرفة';

  @override
  String get roomManagePlayers => 'إدارة اللاعبين';

  @override
  String get roomSkipQuestion => 'تخطي السؤال الحالي';

  @override
  String get roomResetScores => 'إعادة تعيين النقاط';

  @override
  String get roomChangeDifficulty => 'تغيير الصعوبة';

  @override
  String get roomDelete => 'حذف الغرفة';

  @override
  String get roomRefreshStatus => 'تحديث الحالة';

  @override
  String get roomBackToLobby => 'العودة للغرفة';

  @override
  String get roomResetScoresTitle => 'إعادة تعيين النقاط';

  @override
  String get roomResetScoresConfirm =>
      'هل تريد إعادة تعيين نقاط جميع اللاعبين؟';

  @override
  String get confirm => 'تأكيد';

  @override
  String get difficultyTitle => 'تغيير الصعوبة';

  @override
  String currentDifficulty(int value) {
    return 'الصعوبة الحالية: $value';
  }

  @override
  String get save => 'حفظ';

  @override
  String get managePlayersTitle => 'إدارة اللاعبين';

  @override
  String get playerLabel => 'لاعب';

  @override
  String pointsRole(int points, String role) {
    return 'النقاط: $points • الدور: $role';
  }

  @override
  String get roleManager => 'مدير';

  @override
  String get roleAdmin => 'مسؤول';

  @override
  String get roleCoManager => 'مدير مساعد';

  @override
  String get freeze => 'تجميد';

  @override
  String get unfreeze => 'إلغاء التجميد';

  @override
  String get promoteCoManager => 'ترقية لمدير مساعد';

  @override
  String get kick => 'طرد';

  @override
  String get close => 'إغلاق';

  @override
  String get deleteRoomTitle => 'حذف الغرفة';

  @override
  String get deleteRoomConfirm =>
      'هل تريد حذف هذه الغرفة؟ سيتم طرد جميع اللاعبين ولا يمكن التراجع عن هذا الإجراء.';

  @override
  String get roomNoActiveRoom => 'لا توجد غرفة نشطة';

  @override
  String playersCountLabel(int count) {
    return 'عدد اللاعبين: $count';
  }

  @override
  String get loadingQuestion => 'جاري تحميل السؤال...';

  @override
  String get chatHint => 'اكتب رسالة...';

  @override
  String get sendMessageFailed => 'فشل إرسال الرسالة، يرجى التأكد من الاتصال';

  @override
  String get readyStatusReady => 'أنت جاهز ✓';

  @override
  String get readyStatusAnnounce => 'إعلان الجاهزية';

  @override
  String get startingGame => 'جاري البدء...';

  @override
  String get fetchCurrentQuestion => 'جلب السؤال الحالي';

  @override
  String get nextQuestion => 'السؤال التالي ▶️';

  @override
  String get reopenRoom => 'إعادة فتح الغرفة';

  @override
  String get questionUnavailable => 'سؤال غير متوفر';

  @override
  String get roundFinishedForYou => 'انتهت الجولة بالنسبة لك!';

  @override
  String get puzzleLabel => 'اللغز';

  @override
  String get chainLabel => 'السلسلة';

  @override
  String get hintUseful => 'تلميح مفيد';

  @override
  String get optionsAvailable => 'الخيارات المتاحة:';

  @override
  String timeRemaining(Object seconds) {
    return 'الوقت المتبقي: $seconds ثانية';
  }

  @override
  String get copyRoomCode => 'نسخ كود الغرفة';

  @override
  String roomCodeCopied(String code) {
    return 'تم نسخ الكود: $code';
  }

  @override
  String get refreshRoom => 'تحديث الغرفة';

  @override
  String get leaveRoom => 'مغادرة';

  @override
  String get deleteGroupTitle => 'حذف المجموعة';

  @override
  String get deleteGroupConfirm =>
      'هل أنت متأكد من رغبتك في حذف المجموعة نهائياً؟ سيتم طرد جميع الأعضاء.';

  @override
  String get gameResultsTitle => 'نتائج اللعبة 🎉';

  @override
  String get gameResultsIntro => 'تهانينا للجميع! إليكم النتائج النهائية:';

  @override
  String puzzlesSolvedLabel(int count) {
    return 'ألغاز محلولة: $count';
  }

  @override
  String pointsLabel(int points) {
    return '$points نقطة';
  }

  @override
  String get playAgain => 'لعب مرة أخرى';

  @override
  String settingsLoadError(String error) {
    return 'خطأ في تحميل الإعدادات: $error';
  }

  @override
  String get settingsSaveSuccess => 'تم حفظ الإعدادات بنجاح';

  @override
  String settingsSaveError(String error) {
    return 'خطأ في حفظ الإعدادات: $error';
  }

  @override
  String get roomSettingsHeader => 'إعدادات الغرفة';

  @override
  String get managerLabel => 'مدير';

  @override
  String get hintsSystemTitle => 'نظام المساعدات';

  @override
  String get hintsEnabledTitle => 'تفعيل المساعدات';

  @override
  String get hintsEnabledSubtitle => 'اسمح للاعبين باستخدام المساعدات';

  @override
  String hintsPerPlayerLabel(int count) {
    return 'عدد المساعدات لكل لاعب: $count';
  }

  @override
  String hintPenaltyLabel(int percent) {
    return 'خصم النقاط عند استخدام المساعدة: $percent%';
  }

  @override
  String get gameSettingsTitle => 'إعدادات اللعبة';

  @override
  String autoAdvanceLabel(int seconds) {
    return 'الانتقال التلقائي بعد الإجابة الخاطئة: $seconds ثانية';
  }

  @override
  String minTimeLabel(int seconds) {
    return 'الحد الأدنى للوقت قبل الانتقال: $seconds ثانية';
  }

  @override
  String get otherOptionsTitle => 'خيارات أخرى';

  @override
  String get shuffleOptionsTitle => 'خلط خيارات الإجابة';

  @override
  String get shuffleOptionsSubtitle => 'تغيير ترتيب الخيارات عشوائياً';

  @override
  String get showRankingsTitle => 'عرض الترتيب الحي';

  @override
  String get showRankingsSubtitle => 'إظهار الترتيب أثناء اللعبة';

  @override
  String get allowReportTitle => 'السماح بالإبلاغ عن الأسئلة السيئة';

  @override
  String get allowReportSubtitle => 'اسمح للاعبين بالإبلاغ عن مشاكل الأسئلة';

  @override
  String get saveChanges => 'حفظ التغييرات';

  @override
  String get helpersEnabledLabel => 'المساعدات مفعلة';

  @override
  String get yes => 'نعم';

  @override
  String get no => 'لا';

  @override
  String hintsPerPlayerValue(int count) {
    return '$count مساعدات';
  }

  @override
  String hintPenaltyValue(int percent) {
    return '$percent%';
  }

  @override
  String autoAdvanceValue(int seconds) {
    return '$seconds ثانية';
  }

  @override
  String get enabled => 'مفعل';

  @override
  String get disabled => 'معطل';

  @override
  String levelLabel(int level) {
    return 'مرحلة $level';
  }

  @override
  String get levelsDebugTooltip => 'اختبار الواجهة (20 سؤال)';

  @override
  String get levelsDebugMessage => 'استخدم لوحة الإدارة لتوليد الألغاز';

  @override
  String get generatingPuzzles => 'جاري توليد الألغاز...';

  @override
  String get gameOverTitle => 'انتهت اللعبة';

  @override
  String get outOfLives => 'نفدت المحاولات لديك!';

  @override
  String get exit => 'خروج';

  @override
  String get retry => 'إعادة المحاولة';

  @override
  String puzzleProgress(int current, int total) {
    return 'اللغز $current/$total';
  }

  @override
  String scoreLabel(int score) {
    return 'النقاط: $score';
  }

  @override
  String get livesLabel => 'المحاولات';

  @override
  String get timeLabel => 'الوقت';

  @override
  String hintTitle(String hint) {
    return 'تلميح: $hint';
  }

  @override
  String get spotDiffTitle => 'اكتشف الفروق';

  @override
  String get spotDiffEmptyResponse => 'استجابة فارغة';

  @override
  String spotDiffGenerateErrorLog(String error) {
    return 'خطأ توليد اكتشف الفروق: $error';
  }

  @override
  String spotDiffGenerateStackLog(String stack) {
    return 'تفاصيل الخطأ: $stack';
  }

  @override
  String get spotDiffAllFound => 'أحسنت! تم العثور على كل الفروق.';

  @override
  String get spotDiffStartPrompt => 'اضغط توليد لبدء اللعبة.';

  @override
  String spotDiffProgressLabel(int found, int total) {
    return 'التقدم الذهني: $found/$total';
  }

  @override
  String get spotDiffThemeHint => 'سمة الصورة (اختياري)';

  @override
  String spotDiffDifferencesLabel(int count) {
    return 'عدد الفروق: $count';
  }

  @override
  String get spotDiffGenerate => 'توليد';

  @override
  String get spotDiffHint => 'تلميح';

  @override
  String spotDiffHintsLeft(int count) {
    return 'التلميحات المتبقية: $count';
  }

  @override
  String spotDiffFoundLabel(int found, int total) {
    return 'تم العثور: $found/$total';
  }

  @override
  String get spotDiffFindFirst => 'ابحث عن الاختلافات أولاً.';

  @override
  String get spotDiffExplanationsTitle => 'التفسيرات';

  @override
  String get spotDiffChooseDecision => 'اختر قرارك';

  @override
  String get spotDiffImageALabel => 'الصورة A';

  @override
  String get spotDiffImageBLabel => 'الصورة B';

  @override
  String get featureDisabledDesktop =>
      '⚠️ الميزة معطلة حالياً على سطح المكتب.\nيرجى المحاولة على الهاتف.';

  @override
  String get featureDisabledWeb => '⚠️ فحص الرؤية غير مدعوم على الويب حالياً.';

  @override
  String xpRewardLabel(int xp) {
    return '⚡ +$xp خبرة';
  }

  @override
  String get completedLabel => 'مكتملة';

  @override
  String get scoreTitle => 'النقاط';

  @override
  String secondsShort(int seconds) {
    return '$secondsث';
  }

  @override
  String get placeholderOptionOne => 'خيار واحد';

  @override
  String get placeholderOptionTwo => 'خيار اثنان';

  @override
  String get placeholderOptionThree => 'خيار ثلاثة';

  @override
  String get placeholderOptionFour => 'خيار أربعة';

  @override
  String roomLogButtonTapped(String option, int index) {
    return 'تم الضغط - الخيار: $option (الفهرس: $index)';
  }

  @override
  String get roomLogSubmittingIgnored => 'جارٍ الإرسال، تجاهل الضغط';

  @override
  String get roomLogSameOptionSubmitting =>
      'تم اختيار نفس الخيار، جارٍ الإرسال...';

  @override
  String get roomLogSelectingOption => 'جارٍ اختيار الخيار...';

  @override
  String get roomLogDelayComplete => 'انتهى التأخير، التحضير للإرسال';

  @override
  String get roomLogSubmittingAfterDelay => 'جارٍ الإرسال بعد التأخير...';

  @override
  String get roomLogAlreadySubmitting =>
      'جارٍ الإرسال بالفعل، تجاهل الإرسال المتكرر';

  @override
  String roomLogSubmittingAnswer(int index) {
    return 'جارٍ إرسال الإجابة عند الفهرس: $index';
  }

  @override
  String roomLogCallingSubmit(int index) {
    return 'استدعاء submitQuizAnswer($index)';
  }

  @override
  String get roomLogSubmittedSuccess => 'تم إرسال الإجابة بنجاح';

  @override
  String roomLogSubmitError(String error) {
    return 'خطأ في إرسال الإجابة: $error';
  }

  @override
  String get roomLogResettingState => 'جارٍ إعادة الضبط...';
}
