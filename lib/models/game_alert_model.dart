import 'package:flutter/material.dart';

/// نوع التنبيه
enum AlertType {
  success, // ✅ نجاح
  error, // ❌ خطأ
  warning, // ⚠️ تحذير
  info, // ℹ️ معلومات
  achievement, // 🏆 إنجاز
  reward, // 🎁 جائزة
  milestone, // ⭐ علامة فارقة
}

/// فئة التنبيه
class GameAlert {
  final AlertType type;
  final String titleAr;
  final String titleEn;
  final String? messageAr;
  final String? messageEn;
  final String? iconPath;
  final Duration duration;
  final VoidCallback? onTap;
  final bool showConfetti;

  GameAlert({
    required this.type,
    required this.titleAr,
    required this.titleEn,
    this.messageAr,
    this.messageEn,
    this.iconPath,
    this.duration = const Duration(seconds: 3),
    this.onTap,
    this.showConfetti = false,
  });

  /// الحصول على العنوان بناءً على اللغة
  String getTitle(bool isArabic) => isArabic ? titleAr : titleEn;

  /// الحصول على الرسالة بناءً على اللغة
  String? getMessage(bool isArabic) => isArabic ? messageAr : messageEn;

  /// الحصول على اللون بناءً على نوع التنبيه
  Color getColor() {
    switch (type) {
      case AlertType.success:
        return const Color(0xFF10B981); // أخضر
      case AlertType.error:
        return const Color(0xFFEF4444); // أحمر
      case AlertType.warning:
        return const Color(0xFFF59E0B); // برتقالي
      case AlertType.info:
        return const Color(0xFF3B82F6); // أزرق
      case AlertType.achievement:
        return const Color(0xFFD946EF); // بنفسجي
      case AlertType.reward:
        return const Color(0xFFFB923C); // ذهبي
      case AlertType.milestone:
        return const Color(0xFF06B6D4); // سماوي
    }
  }

  /// الحصول على الرمز بناءً على نوع التنبيه
  String getIcon() {
    switch (type) {
      case AlertType.success:
        return '✅';
      case AlertType.error:
        return '❌';
      case AlertType.warning:
        return '⚠️';
      case AlertType.info:
        return 'ℹ️';
      case AlertType.achievement:
        return '🏆';
      case AlertType.reward:
        return '🎁';
      case AlertType.milestone:
        return '⭐';
    }
  }
}

/// مصنع التنبيهات المحددة مسبقاً
class AlertFactory {
  // ✅ تنبيهات النجاح
  static GameAlert correctAnswer({bool isArabic = true}) {
    return GameAlert(
      type: AlertType.success,
      titleAr: '✅ إجابة صحيحة!',
      titleEn: '✅ Correct Answer!',
      messageAr: 'رائع! لقد اخترت الإجابة الصحيحة',
      messageEn: 'Great! You chose the right answer',
      duration: const Duration(seconds: 2),
      showConfetti: true,
    );
  }

  static GameAlert levelComplete({bool isArabic = true, int score = 0}) {
    return GameAlert(
      type: AlertType.success,
      titleAr: '🎉 تم إكمال المستوى!',
      titleEn: '🎉 Level Complete!',
      messageAr: 'عظيم! لقد أكملت المستوى بـ $score نقطة',
      messageEn: 'Awesome! You completed the level with $score points',
      duration: const Duration(seconds: 4),
      showConfetti: true,
    );
  }

  // ❌ تنبيهات الأخطاء
  static GameAlert incorrectAnswer({bool isArabic = true}) {
    return GameAlert(
      type: AlertType.error,
      titleAr: '❌ إجابة خاطئة',
      titleEn: '❌ Wrong Answer',
      messageAr: 'حاول مرة أخرى! أنت قريب من الإجابة الصحيحة',
      messageEn: 'Try again! You\'re getting closer',
      duration: const Duration(seconds: 2),
    );
  }

  static GameAlert noInternetConnection({bool isArabic = true}) {
    return GameAlert(
      type: AlertType.error,
      titleAr: '❌ لا يوجد اتصال بالإنترنت',
      titleEn: '❌ No Internet Connection',
      messageAr: 'يرجى التحقق من اتصالك بالإنترنت',
      messageEn: 'Please check your internet connection',
      duration: const Duration(seconds: 4),
    );
  }

  static GameAlert gameError(String errorMessage) {
    return GameAlert(
      type: AlertType.error,
      titleAr: '❌ حدث خطأ',
      titleEn: '❌ An Error Occurred',
      messageAr: errorMessage,
      messageEn: errorMessage,
      duration: const Duration(seconds: 3),
    );
  }

  // ⚠️ تنبيهات التحذير
  static GameAlert livesWarning({bool isArabic = true, int livesLeft = 1}) {
    return GameAlert(
      type: AlertType.warning,
      titleAr: '⚠️ تحذير!',
      titleEn: '⚠️ Warning!',
      messageAr: 'تحذير! تم تقليل الأرواح. المتبقي: $livesLeft أرواح فقط',
      messageEn: 'Warning! Lives reduced. Remaining: $livesLeft lives only',
      duration: const Duration(seconds: 3),
    );
  }

  static GameAlert sessionExpired({bool isArabic = true}) {
    return GameAlert(
      type: AlertType.warning,
      titleAr: '⚠️ انتهت الجلسة',
      titleEn: '⚠️ Session Expired',
      messageAr: 'انتهت جلسة اللعبة. يرجى تسجيل الدخول مرة أخرى',
      messageEn: 'Your session has expired. Please log in again',
      duration: const Duration(seconds: 4),
    );
  }

  // ℹ️ تنبيهات معلومات
  static GameAlert levelUnlocked({bool isArabic = true, int levelId = 0}) {
    return GameAlert(
      type: AlertType.info,
      titleAr: '🔓 تم فتح مستوى جديد!',
      titleEn: '🔓 New Level Unlocked!',
      messageAr: 'تم فتح المستوى $levelId. هل أنت مستعد للتحدي؟',
      messageEn:
          'Level $levelId is now unlocked. Are you ready for the challenge?',
      duration: const Duration(seconds: 3),
      showConfetti: true,
    );
  }

  static GameAlert saveProgress({bool isArabic = true}) {
    return GameAlert(
      type: AlertType.info,
      titleAr: 'ℹ️ جاري الحفظ...',
      titleEn: 'ℹ️ Saving...',
      messageAr: 'يتم حفظ تقدمك',
      messageEn: 'Your progress is being saved',
      duration: const Duration(seconds: 2),
    );
  }

  static GameAlert mustLoginToPlay({bool isArabic = true}) {
    return GameAlert(
      type: AlertType.info,
      titleAr: 'ℹ️ تسجيل الدخول مطلوب',
      titleEn: 'ℹ️ Login Required',
      messageAr: 'يجب عليك تسجيل الدخول لحفظ تقدمك والاستمتاع بجميع الميزات',
      messageEn: 'You must log in to save your progress and enjoy all features',
      duration: const Duration(seconds: 4),
    );
  }

  // 🏆 تنبيهات الإنجازات
  static GameAlert achievementUnlocked({
    bool isArabic = true,
    required String titleAr,
    required String titleEn,
    required String icon,
  }) {
    return GameAlert(
      type: AlertType.achievement,
      titleAr: '🏆 إنجاز جديد: $titleAr',
      titleEn: '🏆 New Achievement: $titleEn',
      messageAr: 'تم فتح الإنجاز: $titleAr $icon',
      messageEn: 'You unlocked: $titleEn $icon',
      duration: const Duration(seconds: 4),
      showConfetti: true,
    );
  }

  // 🎁 تنبيهات الجوائز
  static GameAlert rewardClaimed({
    bool isArabic = true,
    required String titleAr,
    required String titleEn,
    int amount = 0,
  }) {
    return GameAlert(
      type: AlertType.reward,
      titleAr: '🎁 جائزة جديدة: $titleAr',
      titleEn: '🎁 New Reward: $titleEn',
      messageAr: 'لقد ربحت $amount من $titleAr',
      messageEn: 'You won $amount $titleEn',
      duration: const Duration(seconds: 3),
      showConfetti: true,
    );
  }

  static GameAlert dailyBonus({bool isArabic = true, int coinBonus = 100}) {
    return GameAlert(
      type: AlertType.reward,
      titleAr: '🎁 مكافأة يومية!',
      titleEn: '🎁 Daily Bonus!',
      messageAr: 'تم إضافة $coinBonus عملة كمكافأة يومية',
      messageEn: 'You received $coinBonus coins as daily bonus',
      duration: const Duration(seconds: 3),
      showConfetti: true,
    );
  }

  // ⭐ تنبيهات الإحصائيات
  static GameAlert newPersonalBest({bool isArabic = true, int score = 0}) {
    return GameAlert(
      type: AlertType.milestone,
      titleAr: '⭐ أفضل نتيجة شخصية!',
      titleEn: '⭐ New Personal Best!',
      messageAr: 'لقد حققت رقماً قياسياً جديداً: $score نقطة',
      messageEn: 'You set a new personal record: $score points',
      duration: const Duration(seconds: 4),
      showConfetti: true,
    );
  }

  static GameAlert rankingChanged({
    bool isArabic = true,
    int newRank = 0,
    int oldRank = 0,
  }) {
    final change = oldRank - newRank;
    final changeText = change > 0 ? '+$change' : '$change';
    return GameAlert(
      type: AlertType.milestone,
      titleAr: '⭐ تحسّن الترتيب!',
      titleEn: '⭐ Ranking Improved!',
      messageAr: 'تحسّن ترتيبك من $oldRank إلى $newRank ($changeText)',
      messageEn: 'Your rank improved from $oldRank to $newRank ($changeText)',
      duration: const Duration(seconds: 3),
      showConfetti: true,
    );
  }
}
