import 'package:flutter/material.dart';

/// Modern 2026 Animation Utilities - Simplified Version
class ModernAnimations {
  // Curve Presets
  static const Curve easeInOutCubic = Cubic(0.645, 0.045, 0.355, 1.0);
  static const Curve easeOutQuart = Cubic(0.165, 0.84, 0.44, 1.0);
  static const Curve easeInQuart = Cubic(0.77, 0, 0.175, 1.0);

  // Duration Presets
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 300);
  static const Duration durationMedium = Duration(milliseconds: 500);
  static const Duration durationSlow = Duration(milliseconds: 800);

  /// Pulse Animation Widget
  static Widget pulseAnimation({
    required Widget child,
    required Color pulseColor,
    Duration duration = const Duration(milliseconds: 500),
  }) {
    return _PulseWidget(
      pulseColor: pulseColor,
      duration: duration,
      child: child,
    );
  }

  /// Glow Animation Widget
  static Widget glowAnimation({
    required Widget child,
    required Color glowColor,
    Duration duration = const Duration(milliseconds: 500),
  }) {
    return _GlowWidget(glowColor: glowColor, duration: duration, child: child);
  }

  /// Bounce Animation
  static Widget bounceAnimation({
    required Widget child,
    Duration duration = const Duration(milliseconds: 500),
  }) {
    return _BounceWidget(duration: duration, child: child);
  }

  /// Shimmer Animation (Loading Effect)
  static Widget shimmerAnimation({
    required Widget child,
    Duration duration = const Duration(milliseconds: 500),
  }) {
    return _ShimmerWidget(duration: duration, child: child);
  }
}

/// Pulse Animation Widget
class _PulseWidget extends StatefulWidget {
  final Widget child;
  final Color pulseColor;
  final Duration duration;

  const _PulseWidget({
    required this.child,
    required this.pulseColor,
    required this.duration,
  });

  @override
  State<_PulseWidget> createState() => _PulseWidgetState();
}

class _PulseWidgetState extends State<_PulseWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)
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
      builder: (context, child) => Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: widget.pulseColor.withOpacity(0.3 * _controller.value),
              blurRadius: 20 * _controller.value,
              spreadRadius: 10 * _controller.value,
            ),
          ],
        ),
        child: child,
      ),
      child: widget.child,
    );
  }
}

/// Glow Animation Widget
class _GlowWidget extends StatefulWidget {
  final Widget child;
  final Color glowColor;
  final Duration duration;

  const _GlowWidget({
    required this.child,
    required this.glowColor,
    required this.duration,
  });

  @override
  State<_GlowWidget> createState() => _GlowWidgetState();
}

class _GlowWidgetState extends State<_GlowWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)
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
      builder: (context, child) => Container(
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          boxShadow: [
            BoxShadow(
              color: widget.glowColor.withOpacity(0.4 * _controller.value),
              blurRadius: 30 * _controller.value,
              spreadRadius: 15 * _controller.value,
            ),
          ],
        ),
        child: child,
      ),
      child: widget.child,
    );
  }
}

/// Bounce Animation Widget
class _BounceWidget extends StatefulWidget {
  final Widget child;
  final Duration duration;

  const _BounceWidget({required this.child, required this.duration});

  @override
  State<_BounceWidget> createState() => _BounceWidgetState();
}

class _BounceWidgetState extends State<_BounceWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)
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
      builder: (context, child) => Transform.translate(
        offset: Offset(0, -10 * _controller.value),
        child: child,
      ),
      child: widget.child,
    );
  }
}

/// Shimmer Animation Widget
class _ShimmerWidget extends StatefulWidget {
  final Widget child;
  final Duration duration;

  const _ShimmerWidget({required this.child, required this.duration});

  @override
  State<_ShimmerWidget> createState() => _ShimmerWidgetState();
}

class _ShimmerWidgetState extends State<_ShimmerWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.duration)
      ..repeat();
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
      builder: (context, child) => Opacity(
        opacity: 0.5 + (0.5 * (1 - (_controller.value - 0.5).abs() * 2)),
        child: child,
      ),
      child: widget.child,
    );
  }
}

/// Staggered Animation
class StaggeredAnimationWidget extends StatefulWidget {
  final List<Widget> children;
  final Duration duration;
  final Duration delayBetween;

  const StaggeredAnimationWidget({
    super.key,
    required this.children,
    this.duration = const Duration(milliseconds: 400),
    this.delayBetween = const Duration(milliseconds: 100),
  });

  @override
  State<StaggeredAnimationWidget> createState() =>
      _StaggeredAnimationWidgetState();
}

class _StaggeredAnimationWidgetState extends State<StaggeredAnimationWidget>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.children.length,
      (i) => AnimationController(duration: widget.duration, vsync: this),
    );

    for (int i = 0; i < _controllers.length; i++) {
      Future.delayed(widget.delayBetween * i, () {
        if (mounted) _controllers[i].forward();
      });
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(
        widget.children.length,
        (i) => FadeTransition(
          opacity: _controllers[i],
          child: SlideTransition(
            position:
                Tween<Offset>(
                  begin: const Offset(-0.1, 0),
                  end: Offset.zero,
                ).animate(
                  CurvedAnimation(
                    parent: _controllers[i],
                    curve: Curves.easeOutQuad,
                  ),
                ),
            child: widget.children[i],
          ),
        ),
      ),
    );
  }
}
