// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Arabic (`ar`).
class AppLocalizationsAr extends AppLocalizations {
  AppLocalizationsAr([String locale = 'ar']) : super(locale);

  @override
  String get appTitle => 'الرابط العجيب';

  @override
  String get startGame => 'ابدأ اللعبة';

  @override
  String get linkStart => 'الكلمة الأولى';

  @override
  String get linkEnd => 'الكلمة الأخيرة';

  @override
  String get yourLink => 'كيف ربطت بينهم؟';

  @override
  String get submit => 'اربط!';

  @override
  String get loading => 'جاري التحقق...';

  @override
  String get winMessage => 'مذهل! لقد وجدت الرابط!';

  @override
  String get loseMessage => 'حاول مرة أخرى!';

  @override
  String get steps => 'خطوات';

  @override
  String get changeLanguage => 'English';
}
