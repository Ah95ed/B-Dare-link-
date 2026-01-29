import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/locale_provider.dart';
import '../l10n/app_localizations.dart';
import 'home_animations.dart';
import 'home_content.dart';
import 'home_navigation.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});

  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> with TickerProviderStateMixin {
  late AnimationController _controller1;
  late AnimationController _controller2;
  late AnimationController _controller3;

  @override
  void initState() {
    super.initState();
    HomeAnimations.initializeAnimations(
      this,
      onController1: (controller) => _controller1 = controller,
      onController2: (controller) => _controller2 = controller,
      onController3: (controller) => _controller3 = controller,
    );
  }

  @override
  void dispose() {
    _controller1.dispose();
    _controller2.dispose();
    _controller3.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: Stack(
        children: [
          HomeAnimations.buildAuroraBackground(
            Theme.of(context).scaffoldBackgroundColor,
            _controller3,
          ),
          HomeAnimations.buildBackgroundCircles(_controller1, _controller2),
          HomeAnimations.buildParticles(_controller1),
          HomeContent.buildContent(context, l10n, isArabic),
          HomeNavigation.buildTopNavigation(context, isArabic),
        ],
      ),
    );
  }
}
