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

/// 🎯 Pulse Button with Neon Glow Effect
class PulseButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final bool enabled;
  final bool isPrimary;
  final IconData? icon;
  final double? width;
  final double? height;

  const PulseButton({
    required this.label,
    required this.onPressed,
    this.enabled = true,
    this.isPrimary = true,
    this.icon,
    this.width,
    this.height = 56,
    super.key,
  });

  @override
  State<PulseButton> createState() => _PulseButtonState();
}

class _PulseButtonState extends State<PulseButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);

    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: 1.03,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));

    _glowAnimation = Tween<double>(
      begin: 0.4,
      end: 0.8,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final glowColor = widget.isPrimary ? AppColors.cyan : AppColors.purple;
    final bgColor = widget.isPrimary ? AppColors.cyan : AppColors.darkSurface;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            width: widget.width,
            height: widget.height,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                // Primary glow
                BoxShadow(
                  color: glowColor.withOpacity(_glowAnimation.value),
                  blurRadius: 24 + (_glowAnimation.value * 8),
                  spreadRadius: 2 + (_glowAnimation.value * 4),
                ),
                // Secondary glow (darker)
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 12,
                  spreadRadius: 0,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: widget.enabled ? widget.onPressed : null,
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: widget.enabled ? bgColor : bgColor.withOpacity(0.5),
                    border: Border.all(
                      color: widget.enabled
                          ? glowColor.withOpacity(0.5)
                          : glowColor.withOpacity(0.2),
                      width: 1.5,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(widget.icon, color: Colors.white, size: 20),
                        const SizedBox(width: 12),
                      ],
                      Text(
                        widget.label,
                        style: TextStyle(
                          color: widget.isPrimary
                              ? Colors.white
                              : AppColors.textPrimary,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

/// 🌈 Gradient Button with Glow
class GradientButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isPrimary;
  final IconData? icon;
  final bool enabled;

  const GradientButton({
    required this.label,
    required this.onPressed,
    this.isPrimary = true,
    this.icon,
    this.enabled = true,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final colors = isPrimary
        ? [AppColors.cyan, AppColors.purple]
        : [AppColors.darkSurfaceLight, AppColors.darkSurface];

    final glowColor = isPrimary ? AppColors.cyan : AppColors.darkSurfaceLight;

    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: glowColor.withOpacity(enabled ? 0.5 : 0.2),
            blurRadius: 12,
            spreadRadius: 2,
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: enabled ? onPressed : null,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (icon != null) ...[
                  Icon(
                    icon,
                    color: isPrimary ? Colors.white : AppColors.textPrimary,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                ],
                Text(
                  label,
                  style: TextStyle(
                    color: isPrimary ? Colors.white : AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 🌊 Animated Background with Moving Gradient
class AnimatedBackgroundGradient extends StatefulWidget {
  final Widget child;
  final Duration? duration;

  const AnimatedBackgroundGradient({
    required this.child,
    this.duration = const Duration(seconds: 8),
    super.key,
  });

  @override
  State<AnimatedBackgroundGradient> createState() =>
      _AnimatedBackgroundGradientState();
}

class _AnimatedBackgroundGradientState extends State<AnimatedBackgroundGradient>
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
      builder: (context, child) {
        final value = _controller.value;
        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment(-1.0 + value * 2.0, -1.0 + value),
              end: Alignment(1.0 - value * 2.0, 1.0 - value),
              colors: [
                AppColors.darkBackground,
                AppColors.darkSurface,
                AppColors.darkBackground,
              ],
            ),
          ),
          child: widget.child,
        );
      },
    );
  }
}

/// 🌊 Wave Loading Widget with Animated Waves
class WaveLoadingWidget extends StatefulWidget {
  final String? label;
  final Color waveColor;

  const WaveLoadingWidget({
    this.label,
    this.waveColor = const Color(0xFF00D9FF),
    super.key,
  });

  @override
  State<WaveLoadingWidget> createState() => _WaveLoadingWidgetState();
}

class _WaveLoadingWidgetState extends State<WaveLoadingWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return SizedBox(
                width: 200,
                height: 100,
                child: CustomPaint(
                  painter: WavePainter(
                    animation: _controller.value,
                    color: widget.waveColor,
                  ),
                ),
              );
            },
          ),
          if (widget.label != null) ...[
            const SizedBox(height: 24),
            Text(
              widget.label!,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.0,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Wave painter for loading animation
class WavePainter extends CustomPainter {
  final double animation;
  final Color color;

  WavePainter({required this.animation, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    final waveHeight = 20.0;
    const frequency = 2;
    final pi = 3.14159265359;

    // Draw 3 waves with different phases
    for (int waveIndex = 0; waveIndex < 3; waveIndex++) {
      final offset = animation * 360 + (waveIndex * 120);
      final wavePaint = Paint()
        ..color = color.withOpacity(0.3 - (waveIndex * 0.08))
        ..style = PaintingStyle.fill;

      path.moveTo(0, size.height / 2);
      for (double x = 0; x <= size.width; x += 5) {
        final y =
            size.height / 2 +
            waveHeight *
                sin((x / size.width * frequency * pi + offset * pi / 180));
        path.lineTo(x, y);
      }
      path.lineTo(size.width, size.height);
      path.lineTo(0, size.height);
      path.close();

      canvas.drawPath(path, wavePaint);
      path.reset();
    }
  }

  double sin(double value) {
    return (value).sign;
  }

  @override
  bool shouldRepaint(WavePainter oldDelegate) =>
      oldDelegate.animation != animation;
}
