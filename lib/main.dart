import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:provider/single_child_widget.dart';
import 'package:app_links/app_links.dart';
import 'views/home_view.dart';
import 'core/app_theme.dart';
import 'controllers/game_provider.dart';
import 'controllers/locale_provider.dart';
import 'providers/auth_provider.dart';
import 'providers/competition_provider.dart';
import 'providers/rewards_provider.dart';
import 'providers/avatar_provider.dart';
import 'providers/tournament_provider.dart';
import 'providers/story_provider.dart';
import 'providers/achievements_provider.dart';
import 'providers/alerts_provider.dart';
import 'widgets/alert_display_widget.dart';
import 'l10n/app_localizations.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WonderLinkApp());
}

/// Deep link handler for handling app navigation from external URLs
class DeepLinkHandler extends StatefulWidget {
  final Widget child;

  const DeepLinkHandler({super.key, required this.child});

  @override
  State<DeepLinkHandler> createState() => _DeepLinkHandlerState();
}

class _DeepLinkHandlerState extends State<DeepLinkHandler> {
  late AppLinks _appLinks;
  StreamSubscription<Uri>? _linkSubscription;

  @override
  void initState() {
    super.initState();
    _initializeDeepLinks();
  }

  /// Initialize deep link listener
  void _initializeDeepLinks() {
    _appLinks = AppLinks();
    _linkSubscription = _appLinks.uriLinkStream.listen(_handleDeepLink);
  }

  /// Handle incoming deep link
  void _handleDeepLink(Uri uri) async {
    if (uri.path == '/join') {
      _handleJoinRoomLink(uri);
    }
  }

  /// Handle join room deep link
  void _handleJoinRoomLink(Uri uri) {
    final code = uri.queryParameters['code'];
    if (code == null || !mounted) return;

    try {
      context.read<CompetitionProvider>().joinRoom(code.toUpperCase());
    } catch (e) {
      _showErrorMessage('Failed to join room: $e');
    }
  }

  /// Show error snackbar
  void _showErrorMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(SnackBar(content: Text(message)));
  }

  @override
  void dispose() {
    _linkSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

/// Main application widget
class WonderLinkApp extends StatelessWidget {
  const WonderLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: _buildProviders(),
      child: DeepLinkHandler(
        child: Consumer<LocaleProvider>(
          builder: (context, localeProvider, child) {
            return MaterialApp(
              title: 'Wonder Link',
              debugShowCheckedModeBanner: false,
              theme: AppTheme.lightTheme,
              locale: localeProvider.locale,
              localizationsDelegates: _getLocalizationDelegates(),
              supportedLocales: const [Locale('en'), Locale('ar')],
              home: _buildHome(),
            );
          },
        ),
      ),
    );
  }

  /// Build provider list
  List<SingleChildWidget> _buildProviders() {
    return [
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
      ChangeNotifierProvider(create: (_) => RewardsProvider()),
      ChangeNotifierProvider(create: (_) => AvatarProvider()),
      ChangeNotifierProvider(create: (_) => TournamentProvider()),
      ChangeNotifierProvider(create: (_) => StoryProvider()),
      ChangeNotifierProvider(create: (_) => AchievementsProvider()),
      ChangeNotifierProvider(create: (_) => AlertsProvider()),
    ];
  }

  /// Get localization delegates
  List<LocalizationsDelegate> _getLocalizationDelegates() {
    return const [
      AppLocalizations.delegate,
      GlobalMaterialLocalizations.delegate,
      GlobalWidgetsLocalizations.delegate,
      GlobalCupertinoLocalizations.delegate,
    ];
  }

  /// Build home screen
  Widget _buildHome() {
    return Stack(
      children: [
        Consumer<AuthProvider>(
          builder: (context, auth, _) {
            if (auth.isLoading) {
              return _buildLoadingScreen();
            }
            return const HomeView();
          },
        ),
        const Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: AlertDisplayWidget(),
        ),
      ],
    );
  }

  /// Build loading screen
  Widget _buildLoadingScreen() {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(),
            SizedBox(height: 20),
            Text(
              'Wonder Link',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}
