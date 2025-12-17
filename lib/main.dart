import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:wonder_link_game/views/home_view.dart';
import 'core/app_theme.dart';
import 'controllers/game_provider.dart';
import 'controllers/locale_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/competition_provider.dart';
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
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => LocaleProvider()),
        ChangeNotifierProxyProvider<AuthProvider, GameProvider>(
          create: (_) => GameProvider(),
          update: (_, auth, game) => game!..updateAuthProvider(auth),
        ),
        ChangeNotifierProxyProvider<AuthProvider, CompetitionProvider>(
          create: (_) => CompetitionProvider(),
          update: (_, auth, competition) => competition!..setAuthProvider(auth),
        ),
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
            home: Consumer<AuthProvider>(
              builder: (context, auth, _) {
                // Show loading screen while checking auth status
                if (auth.isLoading) {
                  return const Scaffold(
                    body: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 20),
                          Text(
                            'Wonder Link',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return const HomeView();
              },
            ),
          );
        },
      ),
    );
  }
}
