import 'package:flutter/material.dart';
import 'app_colors.dart';

/// Modern Widget Extensions for 2026 Design System
extension ModernScaffoldExt on BuildContext {
  /// Show modern snackbar
  void showModernSnackBar(
    String message, {
    IconData icon = Icons.check_circle,
    SnackBarType type = SnackBarType.success,
    Duration duration = const Duration(seconds: 3),
  }) {
    final colors = _getSnackBarColors(type);
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: colors['text']),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: colors['text'] as Color,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: colors['bg'] as Color,
        duration: duration,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 12,
        margin: const EdgeInsets.all(12),
      ),
    );
  }

  /// Show modern dialog
  Future<T?> showModernDialog<T>({
    required String title,
    required String content,
    required List<ModernDialogButton> actions,
  }) {
    return showDialog<T>(
      context: this,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.darkSurface,
        elevation: 24,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: AppColors.textPrimary,
            letterSpacing: 0.5,
          ),
        ),
        content: Text(
          content,
          style: const TextStyle(
            fontSize: 14,
            height: 1.5,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
        ),
        actions: actions
            .map(
              (action) => Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: action.isPrimary
                      ? AppColors.shadowGlow(AppColors.cyan)
                      : [],
                ),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    action.onPressed?.call();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: action.isPrimary
                        ? AppColors.cyan
                        : AppColors.darkSurfaceLight,
                    foregroundColor: action.isPrimary
                        ? AppColors.darkBackground
                        : AppColors.textSecondary,
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 10,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    action.label,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }

  Map<String, dynamic> _getSnackBarColors(SnackBarType type) {
    switch (type) {
      case SnackBarType.success:
        return {'bg': AppColors.success.withOpacity(0.9), 'text': Colors.white};
      case SnackBarType.error:
        return {'bg': AppColors.error.withOpacity(0.9), 'text': Colors.white};
      case SnackBarType.warning:
        return {'bg': AppColors.warning.withOpacity(0.9), 'text': Colors.white};
      case SnackBarType.info:
        return {'bg': AppColors.info.withOpacity(0.9), 'text': Colors.white};
    }
  }
}

/// Modern Dialog Button
class ModernDialogButton {
  final String label;
  final VoidCallback? onPressed;
  final bool isPrimary;

  ModernDialogButton({
    required this.label,
    this.onPressed,
    this.isPrimary = false,
  });
}

/// Snackbar Type
enum SnackBarType { success, error, warning, info }

/// Modern Card Widget
class ModernCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  final LinearGradient? gradient;
  final List<BoxShadow>? shadows;
  final double borderRadius;
  final Color? backgroundColor;
  final Color? borderColor;
  final double borderWidth;
  final VoidCallback? onTap;

  const ModernCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.gradient,
    this.shadows,
    this.borderRadius = AppColors.radiusLarge,
    this.backgroundColor,
    this.borderColor,
    this.borderWidth = 1.5,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          gradient: gradient,
          color: backgroundColor ?? AppColors.darkSurface,
          borderRadius: BorderRadius.circular(borderRadius),
          border: borderColor != null
              ? Border.all(color: borderColor!, width: borderWidth)
              : null,
          boxShadow: shadows ?? AppColors.shadowSoft,
        ),
        child: child,
      ),
    );
  }
}

/// Modern Button with Glow Effect
class ModernGlowButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final Color glowColor;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;
  final bool isLoading;

  const ModernGlowButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.glowColor = AppColors.cyan,
    this.backgroundColor = AppColors.cyan,
    this.textColor = AppColors.darkBackground,
    this.icon,
    this.isLoading = false,
  });

  @override
  State<ModernGlowButton> createState() => _ModernGlowButtonState();
}

class _ModernGlowButtonState extends State<ModernGlowButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) => Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: widget.glowColor.withOpacity(0.3 * _controller.value),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: ElevatedButton.icon(
          onPressed: widget.isLoading ? null : widget.onPressed,
          icon: widget.isLoading
              ? SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation(widget.textColor),
                    strokeWidth: 2,
                  ),
                )
              : Icon(widget.icon ?? Icons.check),
          label: Text(
            widget.label,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 15,
              letterSpacing: 0.5,
            ),
          ),
          style: ElevatedButton.styleFrom(
            backgroundColor: widget.backgroundColor,
            foregroundColor: widget.textColor,
            elevation: 0,
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
      ),
    );
  }
}

/// Animated Gradient Text
class AnimatedGradientText extends StatefulWidget {
  final String text;
  final TextStyle baseStyle;
  final LinearGradient gradient;
  final Duration duration;

  const AnimatedGradientText({
    super.key,
    required this.text,
    required this.baseStyle,
    required this.gradient,
    this.duration = const Duration(seconds: 3),
  });

  @override
  State<AnimatedGradientText> createState() => _AnimatedGradientTextState();
}

class _AnimatedGradientTextState extends State<AnimatedGradientText>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: widget.duration, vsync: this)
      ..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) => ShaderMask(
        shaderCallback: (bounds) {
          final offset = _controller.value * bounds.width;
          return widget.gradient.createShader(
            Rect.fromLTWH(
              offset - bounds.width,
              0,
              bounds.width * 2,
              bounds.height,
            ),
          );
        },
        child: Text(
          widget.text,
          style: widget.baseStyle.copyWith(color: Colors.white),
        ),
      ),
    );
  }
}

/// Glassed Container (Glassmorphism Effect)
class GlassedContainer extends StatelessWidget {
  final Widget child;
  final double opacity;
  final double borderRadius;
  final Color borderColor;
  final double borderWidth;
  final EdgeInsets padding;

  const GlassedContainer({
    super.key,
    required this.child,
    this.opacity = 0.1,
    this.borderRadius = AppColors.radiusLarge,
    this.borderColor = Colors.white,
    this.borderWidth = 1.5,
    this.padding = const EdgeInsets.all(16),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(opacity),
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(
          color: borderColor.withOpacity(0.2),
          width: borderWidth,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
  }
}
