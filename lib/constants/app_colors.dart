import 'package:flutter/material.dart';

/// Application-wide color constants
abstract class AppColors {
  // Primary Colors - Wonder Theme
  static const Color cyan = Color(0xFF00D9FF); // Link/Connection
  static const Color purple = Color(0xFF9D4EDD); // Wonder/Magic

  // Legacy magenta (deprecated)
  @Deprecated('Use purple instead')
  static const Color magenta = Color(0xFF9D4EDD); // Maps to purple

  // Transparency Variants - Cyan
  static const Color cyanOpacity80 = Color.fromARGB(204, 0, 217, 255);
  static const Color cyanOpacity50 = Color.fromARGB(127, 0, 217, 255);
  static const Color cyanOpacity30 = Color.fromARGB(76, 0, 217, 255);
  static const Color cyanOpacity20 = Color.fromARGB(51, 0, 217, 255);
  static const Color cyanOpacity15 = Color.fromARGB(38, 0, 217, 255);
  static const Color cyanOpacity10 = Color.fromARGB(25, 0, 217, 255);
  static const Color cyanOpacity08 = Color.fromARGB(20, 0, 217, 255);
  static const Color cyanOpacity05 = Color.fromARGB(12, 0, 217, 255);

  // Transparency Variants - Purple (Wonder)
  static const Color purpleOpacity80 = Color.fromARGB(
    204,
    157,
    78,
    221,
  ); // 0xFF9D4EDD
  static const Color purpleOpacity50 = Color.fromARGB(127, 157, 78, 221);
  static const Color purpleOpacity30 = Color.fromARGB(76, 157, 78, 221);
  static const Color purpleOpacity20 = Color.fromARGB(51, 157, 78, 221);
  static const Color purpleOpacity15 = Color.fromARGB(38, 157, 78, 221);
  static const Color purpleOpacity10 = Color.fromARGB(25, 157, 78, 221);
  static const Color purpleOpacity08 = Color.fromARGB(20, 157, 78, 221);

  // Legacy magenta opacity (deprecated)
  @Deprecated('Use purpleOpacity80 instead')
  static const Color magentaOpacity80 = Color.fromARGB(204, 157, 78, 221);
  @Deprecated('Use purpleOpacity50 instead')
  static const Color magentaOpacity50 = Color.fromARGB(127, 157, 78, 221);
  @Deprecated('Use purpleOpacity30 instead')
  static const Color magentaOpacity30 = Color.fromARGB(76, 157, 78, 221);
  @Deprecated('Use purpleOpacity20 instead')
  static const Color magentaOpacity20 = Color.fromARGB(51, 157, 78, 221);
  @Deprecated('Use purpleOpacity15 instead')
  static const Color magentaOpacity15 = Color.fromARGB(38, 157, 78, 221);
  @Deprecated('Use purpleOpacity10 instead')
  static const Color magentaOpacity10 = Color.fromARGB(25, 157, 78, 221);
  @Deprecated('Use purpleOpacity08 instead')
  static const Color magentaOpacity08 = Color.fromARGB(20, 157, 78, 221);

  // Background Colors
  static const Color darkBackground = Color(0xFF0F1729);
  static const Color cardBackground = Color(0xFF1A1F3A);

  // Text Colors
  static const Color secondaryText = Color(0xFFA0A8C8);
  static const Color lightText = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF00D9FF);
  static const Color error = Color(0xFFFF1744); // Bright red (not purple)
  static const Color warning = Color(0xFFFF6B00);

  // Achievement Colors
  static const Color gold = Color(0xFFFFD60A);

  // Gradients - Wonder Theme
  static LinearGradient cyanPurpleGradient = const LinearGradient(
    colors: [cyan, purple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  @Deprecated('Use cyanPurpleGradient instead')
  static LinearGradient cyanMagentaGradient = const LinearGradient(
    colors: [cyan, purple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient auroraGradient(Color background, double opacity) =>
      LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          background,
          const Color(0xFF1A1F3A).withOpacity(opacity),
          background,
        ],
      );

  // Radial Gradients
  static RadialGradient cyanRadialGradient = RadialGradient(
    colors: [cyan.withOpacity(0.15), cyan.withOpacity(0)],
  );

  static RadialGradient purpleRadialGradient = RadialGradient(
    colors: [purple.withOpacity(0.1), purple.withOpacity(0)],
  );

  @Deprecated('Use purpleRadialGradient instead')
  static RadialGradient magentaRadialGradient = RadialGradient(
    colors: [purple.withOpacity(0.1), purple.withOpacity(0)],
  );
}
