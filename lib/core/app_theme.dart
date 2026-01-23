import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Game-first palette: vibrant, high-contrast, friendly
  static const Color primary = Color(0xFF6C5CE7); // Vibrant Purple
  static const Color secondary = Color(0xFF00B894); // Mint Green
  static const Color accent = Color(0xFFFFC857); // Warm Gold
  static const Color background = Color(0xFFF6F7FB); // Very light neutral
  static const Color surface = Color(0xFFFFFFFF);
  static const Color text = Color(0xFF2E2E3A); // Dark slate
  static const Color success = Color(0xFF06D6A0);
  static const Color error = Color(0xFFEF476F);

  // Gradients and helpers
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF6C5CE7), Color(0xFF4C6EF5)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get lightTheme {
    final scheme =
        ColorScheme.fromSeed(
          seedColor: primary,
          brightness: Brightness.light,
        ).copyWith(
          primary: primary,
          secondary: secondary,
          tertiary: accent,
          surface: surface,
          error: error,
        );

    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: scheme,
      textTheme: GoogleFonts.poppinsTextTheme().apply(
        bodyColor: text,
        displayColor: text,
      ),
      // Use cardColor + shadowColor for broad compatibility
      cardColor: surface,
      shadowColor: primary.withOpacity(0.18),
      dividerTheme: DividerThemeData(
        color: Colors.black.withOpacity(0.06),
        thickness: 1,
        space: 1,
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: surface,
        foregroundColor: scheme.onSurface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          color: scheme.onSurface,
        ),
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: const Color(0xFF111827),
        contentTextStyle: GoogleFonts.poppins(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ),
      dialogTheme: DialogThemeData(
        backgroundColor: surface,
        elevation: 20,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 16,
          fontWeight: FontWeight.w800,
          color: scheme.onSurface,
        ),
        contentTextStyle: GoogleFonts.poppins(
          fontSize: 13,
          height: 1.35,
          fontWeight: FontWeight.w500,
          color: scheme.onSurface.withOpacity(0.8),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: scheme.surface,
        selectedColor: scheme.primary.withOpacity(0.14),
        checkmarkColor: scheme.primary,
        labelStyle: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: scheme.onSurface,
        ),
        side: BorderSide(color: Colors.black.withOpacity(0.08)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: scheme.primary,
        linearTrackColor: Colors.black.withOpacity(0.06),
        circularTrackColor: Colors.black.withOpacity(0.06),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: scheme.primary,
        inactiveTrackColor: scheme.primary.withOpacity(0.18),
        thumbColor: scheme.primary,
        overlayColor: scheme.primary.withOpacity(0.12),
        valueIndicatorColor: scheme.primary,
        valueIndicatorTextStyle: GoogleFonts.poppins(
          color: Colors.white,
          fontWeight: FontWeight.w700,
        ),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return scheme.primary;
          return Colors.grey.shade400;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return scheme.primary.withOpacity(0.35);
          }
          return Colors.black.withOpacity(0.12);
        }),
      ),
      listTileTheme: ListTileThemeData(
        iconColor: scheme.onSurface.withOpacity(0.75),
        textColor: scheme.onSurface,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: scheme.onSurface,
        ),
        subtitleTextStyle: GoogleFonts.poppins(
          fontSize: 12,
          height: 1.25,
          fontWeight: FontWeight.w500,
          color: scheme.onSurface.withOpacity(0.75),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: Colors.white,
          elevation: 8,
          shadowColor: primary.withOpacity(0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: scheme.primary,
          side: BorderSide(color: scheme.primary.withOpacity(0.3)),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: scheme.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          textStyle: GoogleFonts.poppins(fontWeight: FontWeight.w700),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        hintStyle: GoogleFonts.poppins(
          fontSize: 13,
          fontWeight: FontWeight.w500,
          color: scheme.onSurface.withOpacity(0.55),
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: primary, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
      ),
    );
  }
}
