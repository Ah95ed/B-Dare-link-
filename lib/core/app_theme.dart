import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // 🎨 Modern 2026 Palette: Aurora & Cyberpunk vibes with depth
  // Primary: Deep Indigo with cyan undertones
  static const Color primary = Color(0xFF0F1729); // Deep Navy-Indigo
  static const Color primaryLight = Color(0xFF3B4A8A); // Lighter Indigo
  static const Color primaryAccent = Color(0xFF00D9FF); // Cyan Glow

  // Secondary: Teal/Cyan for premium feel
  static const Color secondary = Color(0xFF00D9FF); // Electric Cyan
  static const Color secondaryDark = Color(0xFF0099CC); // Deep Teal

  // Accent: Purple/Violet for Wonder & Magic
  static const Color accent = Color(0xFF9D4EDD); // Mystical Purple
  static const Color accentLight = Color(0xFFC77DFF); // Soft Purple

  // Background: Ultra-dark for modern feel
  static const Color background = Color(0xFF0A0E27); // Near-black dark
  static const Color backgroundLight = Color(0xFF14182F); // Slightly lighter

  // Surface: Dark cards with subtle gradient
  static const Color surface = Color(0xFF1A1F3A); // Dark surface
  static const Color surfaceLight = Color(0xFF252D48); // Lighter surface

  // Text: High contrast light text
  static const Color text = Color(0xFFF0F4FF); // Nearly white
  static const Color textSecondary = Color(0xFFA0A8C8); // Muted light
  static const Color textTertiary = Color(0xFF6B7499); // Further muted

  // Status colors: Updated for 2026
  static const Color success = Color(0xFF00D084); // Vibrant Green
  static const Color warning = Color(0xFFFFA500); // Vivid Orange
  static const Color error = Color(0xFFFF1744); // Bright Red
  static const Color info = Color(0xFF00D9FF); // Cyan Info

  // Gradients: Wonder-inspired, magical 2026 style
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF0F1729), Color(0xFF00D9FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient auroraGradient = LinearGradient(
    colors: [Color(0xFF00D9FF), Color(0xFF9D4EDD), Color(0xFF0F1729)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF00D084), Color(0xFF00B86B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient errorGradient = LinearGradient(
    colors: [Color(0xFFFF1744), Color(0xFFCC0033)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get lightTheme {
    final scheme =
        ColorScheme.fromSeed(
          seedColor: primary,
          brightness: Brightness.dark, // Dark mode for 2026
        ).copyWith(
          primary: primary,
          secondary: secondary,
          tertiary: accent,
          surface: surface,
          error: error,
          onPrimary: text,
          onSecondary: Color(0xFF0F1729),
          onSurface: text,
          onError: Color(0xFFFFFFFF),
        );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: scheme,
      textTheme: GoogleFonts.poppinsTextTheme(
        const TextTheme(
          displayLarge: TextStyle(color: text, fontWeight: FontWeight.bold),
          displayMedium: TextStyle(color: text, fontWeight: FontWeight.bold),
          displaySmall: TextStyle(color: text, fontWeight: FontWeight.bold),
          headlineLarge: TextStyle(color: text, fontWeight: FontWeight.bold),
          headlineMedium: TextStyle(color: text, fontWeight: FontWeight.w700),
          headlineSmall: TextStyle(color: text, fontWeight: FontWeight.w700),
          titleLarge: TextStyle(color: text, fontWeight: FontWeight.w700),
          titleMedium: TextStyle(color: text, fontWeight: FontWeight.w600),
          titleSmall: TextStyle(color: text, fontWeight: FontWeight.w600),
          bodyLarge: TextStyle(color: textSecondary),
          bodyMedium: TextStyle(color: textSecondary),
          bodySmall: TextStyle(color: textTertiary),
          labelLarge: TextStyle(color: text, fontWeight: FontWeight.w600),
          labelMedium: TextStyle(color: textSecondary),
          labelSmall: TextStyle(color: textTertiary),
        ),
      ).apply(bodyColor: textSecondary, displayColor: text),
      // Enhanced shadow and card styling
      cardColor: surface,
      shadowColor: Color(0xFF000000).withOpacity(0.4),
      dividerTheme: DividerThemeData(
        color: surfaceLight.withOpacity(0.3),
        thickness: 1,
        space: 1,
      ),
      // Modern AppBar
      appBarTheme: AppBarTheme(
        backgroundColor: backgroundLight,
        foregroundColor: text,
        elevation: 0,
        centerTitle: false,
        scrolledUnderElevation: 0,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: text,
          letterSpacing: 0.5,
        ),
        toolbarHeight: 64,
        shape: const Border(
          bottom: BorderSide(color: Color.fromARGB(30, 0, 217, 255), width: 1),
        ),
      ),
      // Modern SnackBar with glassmorphism effect
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: surface.withOpacity(0.9),
        contentTextStyle: GoogleFonts.poppins(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: text,
        ),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 12,
      ),
      // Modern Dialog
      dialogTheme: DialogThemeData(
        backgroundColor: surface,
        elevation: 24,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: text,
          letterSpacing: 0.5,
        ),
        contentTextStyle: GoogleFonts.poppins(
          fontSize: 14,
          height: 1.5,
          fontWeight: FontWeight.w500,
          color: textSecondary,
        ),
      ),
      // Modern Chips
      chipTheme: ChipThemeData(
        backgroundColor: surfaceLight.withOpacity(0.5),
        selectedColor: primaryAccent.withOpacity(0.2),
        checkmarkColor: secondary,
        labelStyle: GoogleFonts.poppins(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: text,
        ),
        side: BorderSide(color: surfaceLight.withOpacity(0.4), width: 1.5),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
      // Modern Progress Indicators
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: secondary,
        linearTrackColor: surfaceLight.withOpacity(0.3),
        circularTrackColor: surfaceLight.withOpacity(0.3),
      ),
      // Modern Slider
      sliderTheme: SliderThemeData(
        activeTrackColor: secondary,
        inactiveTrackColor: surfaceLight.withOpacity(0.3),
        thumbColor: secondary,
        overlayColor: secondary.withOpacity(0.2),
        valueIndicatorColor: primary,
        valueIndicatorTextStyle: GoogleFonts.poppins(
          color: text,
          fontWeight: FontWeight.w700,
          fontSize: 12,
        ),
        trackHeight: 6,
      ),
      // Modern Switch
      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return secondary;
          return textTertiary;
        }),
        trackColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) {
            return secondary.withOpacity(0.3);
          }
          return surfaceLight.withOpacity(0.4);
        }),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      // Modern ListTile
      listTileTheme: ListTileThemeData(
        iconColor: secondary,
        textColor: text,
        titleTextStyle: GoogleFonts.poppins(
          fontSize: 15,
          fontWeight: FontWeight.w600,
          color: text,
        ),
        subtitleTextStyle: GoogleFonts.poppins(
          fontSize: 12,
          height: 1.4,
          fontWeight: FontWeight.w500,
          color: textSecondary,
        ),
        tileColor: surfaceLight.withOpacity(0.3),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      // Modern ElevatedButton with gradient effect
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primary,
          foregroundColor: text,
          elevation: 8,
          shadowColor: secondary.withOpacity(0.4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
          textStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 15,
            letterSpacing: 0.5,
          ),
        ),
      ),
      // Modern OutlinedButton
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: secondary,
          side: BorderSide(color: secondary.withOpacity(0.5), width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 14,
          ),
        ),
      ),
      // Modern TextButton
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: secondary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          textStyle: GoogleFonts.poppins(
            fontWeight: FontWeight.w700,
            fontSize: 14,
            letterSpacing: 0.5,
          ),
        ),
      ),
      // Modern Input Decoration with glassmorphism
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surfaceLight.withOpacity(0.4),
        hintStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textTertiary,
        ),
        labelStyle: GoogleFonts.poppins(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: text,
        ),
        prefixIconColor: secondary,
        suffixIconColor: secondary,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(
            color: surfaceLight.withOpacity(0.3),
            width: 1.5,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(
            color: surfaceLight.withOpacity(0.3),
            width: 1.5,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: secondary, width: 2.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: error, width: 2.5),
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 18,
          vertical: 16,
        ),
        isDense: false,
      ),
      // Modern Checkbox
      checkboxTheme: CheckboxThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return secondary;
          return surfaceLight.withOpacity(0.3);
        }),
        checkColor: WidgetStateProperty.all(Color(0xFF0F1729)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        side: BorderSide(color: secondary.withOpacity(0.5), width: 2),
      ),
      // Modern Radio
      radioTheme: RadioThemeData(
        fillColor: WidgetStateProperty.resolveWith((states) {
          if (states.contains(WidgetState.selected)) return secondary;
          return Colors.transparent;
        }),
      ),
    );
  }
}
