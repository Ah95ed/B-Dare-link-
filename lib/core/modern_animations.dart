import 'package:flutter/material.dart';

class ModernAnimations {
  static const Curve easeInOutCubic = Cubic(0.645, 0.045, 0.355, 1.0);
  static const Curve easeOutQuart = Cubic(0.165, 0.84, 0.44, 1.0);
  static const Curve easeInQuart = Cubic(0.77, 0, 0.175, 1.0);
  static const Curve easeOutBack = Cubic(0.175, 0.885, 0.32, 1.275);

  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 300);
  static const Duration durationMedium = Duration(milliseconds: 500);
  static const Duration durationSlow = Duration(milliseconds: 800);
  static const Duration durationXSlow = Duration(milliseconds: 1200);

  static PageRouteBuilder fadeInTransition(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, animation, __, child) =>
          FadeTransition(opacity: animation, child: child),
      transitionDuration: durationNormal,
    );
  }

  static PageRouteBuilder slideUpTransition(Widget page) {
    return PageRouteBuilder(
      pageBuilder: (_, __, ___) => page,
      transitionsBuilder: (_, animation, __, child) => SlideTransition(
        position: Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero)
            .animate(CurvedAnimation(parent: animation, curve: easeOutQuart)),
        child: child,
      ),
      transitionDuration: durationNormal,
    );
  }
}
