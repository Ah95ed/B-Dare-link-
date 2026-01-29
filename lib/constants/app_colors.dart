import 'package:flutter/material.dart';

/// Application-wide color constants
abstract class AppColors {
  // Primary Colors
  static const Color cyan = Color(0xFF00D9FF);
  static const Color magenta = Color(0xFFFF006E);

  // Transparency Variants - Cyan
  static const Color cyanOpacity80 = Color.fromARGB(204, 0, 217, 255);
  static const Color cyanOpacity50 = Color.fromARGB(127, 0, 217, 255);
  static const Color cyanOpacity30 = Color.fromARGB(76, 0, 217, 255);
  static const Color cyanOpacity20 = Color.fromARGB(51, 0, 217, 255);
  static const Color cyanOpacity15 = Color.fromARGB(38, 0, 217, 255);
  static const Color cyanOpacity10 = Color.fromARGB(25, 0, 217, 255);
  static const Color cyanOpacity08 = Color.fromARGB(20, 0, 217, 255);
  static const Color cyanOpacity05 = Color.fromARGB(12, 0, 217, 255);

  // Transparency Variants - Magenta
  static const Color magentaOpacity80 = Color.fromARGB(204, 255, 0, 110);
  static const Color magentaOpacity50 = Color.fromARGB(127, 255, 0, 110);
  static const Color magentaOpacity30 = Color.fromARGB(76, 255, 0, 110);
  static const Color magentaOpacity20 = Color.fromARGB(51, 255, 0, 110);
  static const Color magentaOpacity15 = Color.fromARGB(38, 255, 0, 110);
  static const Color magentaOpacity10 = Color.fromARGB(25, 255, 0, 110);
  static const Color magentaOpacity08 = Color.fromARGB(20, 255, 0, 110);

  // Background Colors
  static const Color darkBackground = Color(0xFF0F1729);
  static const Color cardBackground = Color(0xFF1A1F3A);

  // Text Colors
  static const Color secondaryText = Color(0xFFA0A8C8);
  static const Color lightText = Color(0xFFFFFFFF);

  // Status Colors
  static const Color success = Color(0xFF00D9FF);
  static const Color error = Color(0xFFFF006E);
  static const Color warning = Color(0xFFFF6B00);

  // Gradients
  static LinearGradient cyanMagentaGradient = const LinearGradient(
    colors: [cyan, magenta],
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

  static RadialGradient magentaRadialGradient = RadialGradient(
    colors: [magenta.withOpacity(0.1), magenta.withOpacity(0)],
  );
}
