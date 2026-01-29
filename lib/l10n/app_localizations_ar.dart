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
  String get startGame => 'ابدأ اللعب';

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
}
