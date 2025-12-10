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
}
