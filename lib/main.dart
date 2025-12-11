import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:wonder_link_game/views/api_google.dart';
import 'package:wonder_link_game/views/home_view.dart';
import 'core/app_theme.dart';
import 'controllers/game_provider.dart';
import 'controllers/locale_provider.dart';
import 'l10n/app_localizations.dart';

void main() {
  runApp(const WonderLinkApp());
}

class WonderLinkApp extends StatelessWidget {
  const WonderLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => GameProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
      ],
      child: Consumer<LocaleProvider>(
        builder: (context, localeProvider, child) {
          return MaterialApp(
            title: 'Wonder Link',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            locale: localeProvider.locale,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [Locale('en'), Locale('ar')],
            builder: (context, child) {
              return child!;
            },
            home: const GeminiRequestExample(),
          );
        },
      ),
    );
  }
}
