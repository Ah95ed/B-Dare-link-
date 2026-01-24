import 'package:flutter/material.dart';

/// Color Palette for Modern 2026 Design
class AppColors {
  // Primary Colors - Dark Mode Excellence
  static const Color darkBackground = Color(0xFF0A0E27); // Near-black
  static const Color darkSurface = Color(0xFF1A1F3A); // Dark card surface
  static const Color darkSurfaceLight = Color(0xFF252D48); // Lighter surface

  // Accent Colors - Neon & Cyberpunk
  static const Color cyan = Color(0xFF00D9FF); // Electric cyan
  static const Color cyanLight = Color(0xFF33E6FF); // Lighter cyan
  static const Color cyanDark = Color(0xFF0099CC); // Darker cyan

  static const Color magenta = Color(0xFFFF006E); // Vibrant magenta
  static const Color magentaLight = Color(0xFFFF4DA6); // Lighter magenta
  static const Color magentaDark = Color(0xFFCC0056); // Darker magenta

  // Status Colors - Modern
  static const Color success = Color(0xFF00D084); // Vibrant green
  static const Color successLight = Color(0xFF33E09F); // Light green
  static const Color warning = Color(0xFFFFA500); // Vivid orange
  static const Color error = Color(0xFFFF1744); // Bright red
  static const Color info = Color(0xFF00D9FF); // Cyan (same as primary)

  // Text Colors
  static const Color textPrimary = Color(0xFFF0F4FF); // Nearly white
  static const Color textSecondary = Color(0xFFA0A8C8); // Muted light
  static const Color textTertiary = Color(0xFF6B7499); // Further muted
  static const Color textDisabled = Color(0xFF4A5379); // Disabled text

  // Utility Colors
  static const Color divider = Color(0xFF252D48); // Divider color
  static const Color shadow = Color(0xFF000000); // Shadow color

  // Gradients
  static const LinearGradient gradientCyanToMagenta = LinearGradient(
    colors: [cyan, magenta],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientAurora = LinearGradient(
    colors: [cyan, magenta, darkBackground],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientSuccess = LinearGradient(
    colors: [success, successLight],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient gradientError = LinearGradient(
    colors: [error, magenta],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Box Shadows
  static List<BoxShadow> shadowSoft = [
    BoxShadow(
      color: shadow.withOpacity(0.1),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> shadowMedium = [
    BoxShadow(
      color: shadow.withOpacity(0.15),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> shadowDeep = [
    BoxShadow(
      color: shadow.withOpacity(0.2),
      blurRadius: 32,
      offset: const Offset(0, 12),
    ),
  ];

  static List<BoxShadow> shadowGlow(Color glowColor) => [
    BoxShadow(
      color: glowColor.withOpacity(0.25),
      blurRadius: 24,
      spreadRadius: 6,
    ),
    BoxShadow(
      color: glowColor.withOpacity(0.12),
      blurRadius: 48,
      spreadRadius: 12,
    ),
  ];

  // Border Radius Constants
  static const double radiusSmall = 8.0;
  static const double radiusMedium = 12.0;
  static const double radiusLarge = 16.0;
  static const double radiusXLarge = 20.0;
  static const double radiusRound = 999.0;

  // Opacity Constants
  static const double opacityLight = 0.1;
  static const double opacityMedium = 0.15;
  static const double opacityStrong = 0.25;
}

/// Extended Color Utilities
extension ColorExtension on Color {
  /// Get contrast color (white or dark) for readability
  Color get contrastColor {
    final luminance = computeLuminance();
    return luminance > 0.5 ? Colors.black : Colors.white;
  }

  /// Create a lighter shade
  Color lighten([double amount = 0.1]) {
    final hsl = HSLColor.fromColor(this);
    final hslLight = hsl.withLightness(
      (hsl.lightness + amount).clamp(0.0, 1.0),
    );
    return hslLight.toColor();
  }

  /// Create a darker shade
  Color darken([double amount = 0.1]) {
    final hsl = HSLColor.fromColor(this);
    final hslDark = hsl.withLightness((hsl.lightness - amount).clamp(0.0, 1.0));
    return hslDark.toColor();
  }

  /// Add opacity
  Color withAlpha(double opacity) {
    return withOpacity(opacity);
  }
}
