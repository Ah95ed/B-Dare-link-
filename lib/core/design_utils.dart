import 'package:flutter/material.dart';

/// Modern 2026 Design Utilities and Builders
class DesignUtils {
  // Modern box shadows with depth
  static List<BoxShadow> get softShadow => [
    BoxShadow(
      color: Colors.black.withOpacity(0.08),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> get mediumShadow => [
    BoxShadow(
      color: Colors.black.withOpacity(0.12),
      blurRadius: 20,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> get deepShadow => [
    BoxShadow(
      color: Colors.black.withOpacity(0.16),
      blurRadius: 32,
      offset: const Offset(0, 12),
    ),
  ];

  static List<BoxShadow> glowShadow(Color glowColor, {double opacity = 0.3}) =>
      [
        BoxShadow(
          color: glowColor.withOpacity(opacity),
          blurRadius: 24,
          spreadRadius: 8,
        ),
        BoxShadow(
          color: glowColor.withOpacity(opacity * 0.5),
          blurRadius: 48,
          spreadRadius: 16,
        ),
      ];

  // Modern gradients - Wonder Theme
  static LinearGradient get cyanToPurpleGradient => LinearGradient(
    colors: [Color(0xFF00D9FF), Color(0xFF9D4EDD)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  @Deprecated('Use cyanToPurpleGradient instead')
  static LinearGradient get cyanToMagentaGradient => LinearGradient(
    colors: [Color(0xFF00D9FF), Color(0xFF9D4EDD)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient get auroraGradient => LinearGradient(
    colors: [Color(0xFF00D9FF), Color(0xFF9D4EDD), Color(0xFF0F1729)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static LinearGradient get darkGradient => LinearGradient(
    colors: [Color(0xFF14182F), Color(0xFF0A0E27)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Modern decoration builders
  static BoxDecoration modernCard({
    required BuildContext context,
    Color? backgroundColor,
    bool hasBorder = true,
    Color? borderColor,
    double borderRadius = 16,
  }) {
    return BoxDecoration(
      color:
          backgroundColor ??
          (Theme.of(context).brightness == Brightness.dark
              ? Color(0xFF1A1F3A)
              : Colors.white),
      borderRadius: BorderRadius.circular(borderRadius),
      border: hasBorder
          ? Border.all(
              color: borderColor ?? Color(0xFF00D9FF).withOpacity(0.15),
              width: 1.5,
            )
          : null,
      boxShadow: softShadow,
    );
  }

  static BoxDecoration modernGradientCard({
    required LinearGradient gradient,
    double borderRadius = 16,
    bool hasBorder = false,
  }) {
    return BoxDecoration(
      gradient: gradient,
      borderRadius: BorderRadius.circular(borderRadius),
      border: hasBorder
          ? Border.all(color: Colors.white.withOpacity(0.2), width: 1.5)
          : null,
      boxShadow: deepShadow,
    );
  }

  // Glassmorphism effect
  static BoxDecoration glassEffect({
    required BuildContext context,
    double opacity = 0.1,
    double borderRadius = 16,
  }) {
    return BoxDecoration(
      color: Colors.white.withOpacity(opacity),
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(color: Colors.white.withOpacity(0.2), width: 1.5),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.1),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ],
    );
  }

  // Modern button styles
  static ButtonStyle modernElevatedButton({
    required Color backgroundColor,
    required Color foregroundColor,
    double borderRadius = 16,
  }) {
    return ElevatedButton.styleFrom(
      backgroundColor: backgroundColor,
      foregroundColor: foregroundColor,
      elevation: 8,
      shadowColor: backgroundColor.withOpacity(0.4),
      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      textStyle: const TextStyle(
        fontWeight: FontWeight.w700,
        fontSize: 15,
        letterSpacing: 0.5,
      ),
    );
  }

  static ButtonStyle modernOutlinedButton({
    required Color foregroundColor,
    double borderRadius = 16,
    double borderWidth = 2,
  }) {
    return OutlinedButton.styleFrom(
      foregroundColor: foregroundColor,
      side: BorderSide(
        color: foregroundColor.withOpacity(0.5),
        width: borderWidth,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(borderRadius),
      ),
      textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
    );
  }

  // Modern input decoration
  static InputDecoration modernInput({
    required String hintText,
    required IconData prefixIcon,
    Color? prefixIconColor,
    Color? borderColor,
    double borderRadius = 16,
  }) {
    return InputDecoration(
      hintText: hintText,
      prefixIcon: Icon(prefixIcon),
      filled: true,
      fillColor: Color(0xFF1A1F3A).withOpacity(0.5),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(borderRadius),
        borderSide: BorderSide(
          color: borderColor ?? Color(0xFF00D9FF).withOpacity(0.3),
          width: 1.5,
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(borderRadius),
        borderSide: BorderSide(
          color: borderColor ?? Color(0xFF00D9FF).withOpacity(0.2),
          width: 1.5,
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(borderRadius),
        borderSide: BorderSide(
          color: borderColor ?? Color(0xFF00D9FF),
          width: 2.5,
        ),
      ),
    );
  }

  // Animated container builders
  static Widget buildAnimatedGradientText({
    required String text,
    required TextStyle baseStyle,
    required LinearGradient gradient,
  }) {
    return ShaderMask(
      shaderCallback: (bounds) => gradient.createShader(bounds),
      child: Text(text, style: baseStyle.copyWith(color: Colors.white)),
    );
  }

  // Modern chip style
  static ChipThemeData modernChipTheme({
    required Color backgroundColor,
    required Color selectedColor,
  }) {
    return ChipThemeData(
      backgroundColor: backgroundColor.withOpacity(0.5),
      selectedColor: selectedColor.withOpacity(0.2),
      checkmarkColor: selectedColor,
      labelStyle: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
      side: BorderSide(color: selectedColor.withOpacity(0.4), width: 1.5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    );
  }

  // Loading animation with modern design
  static Widget buildModernLoader({required Color color, double size = 50}) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(colors: [color, color.withOpacity(0.5)]),
        boxShadow: glowShadow(color),
      ),
      child: const CircularProgressIndicator(
        valueColor: AlwaysStoppedAnimation(Colors.white),
        strokeWidth: 3,
      ),
    );
  }

  // Modern snackbar content
  static SnackBar buildModernSnackBar({
    required String message,
    required IconData icon,
    required Color backgroundColor,
    Color? textColor,
    Duration duration = const Duration(seconds: 3),
  }) {
    return SnackBar(
      content: Row(
        children: [
          Icon(icon, color: textColor ?? Colors.white),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              message,
              style: TextStyle(
                color: textColor ?? Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
      backgroundColor: backgroundColor,
      duration: duration,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 12,
      margin: const EdgeInsets.all(12),
    );
  }
}
