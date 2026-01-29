import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

/// Handles all animation logic for home view
class HomeAnimations {
  /// Initialize animation controllers
  static void initializeAnimations(
    TickerProvider vsync, {
    required Function(AnimationController) onController1,
    required Function(AnimationController) onController2,
    required Function(AnimationController) onController3,
  }) {
    final controller1 = AnimationController(
      duration: const Duration(seconds: 8),
      vsync: vsync,
    )..repeat(reverse: true);

    final controller2 = AnimationController(
      duration: const Duration(seconds: 6),
      vsync: vsync,
    )..repeat(reverse: true);

    final controller3 = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: vsync,
    )..repeat(reverse: true);

    onController1(controller1);
    onController2(controller2);
    onController3(controller3);
  }

  /// Build animated aurora gradient background
  static Widget buildAuroraBackground(
    Color backgroundColor,
    AnimationController controller3,
  ) {
    return AnimatedBuilder(
      animation: controller3,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: AppColors.auroraGradient(
              backgroundColor,
              0.3 + controller3.value * 0.3,
            ),
          ),
        );
      },
    );
  }

  /// Build animated background circles
  static Widget buildBackgroundCircles(
    AnimationController controller1,
    AnimationController controller2,
  ) {
    return Stack(
      children: [
        // Circle 1 - Top Right
        AnimatedBuilder(
          animation: controller1,
          builder: (context, child) {
            return Positioned(
              top: -100 + (controller1.value * 50),
              right: -100 + (controller1.value * 30),
              child: _buildCircle(300, AppColors.cyanRadialGradient),
            );
          },
        ),
        // Circle 2 - Bottom Left
        AnimatedBuilder(
          animation: controller2,
          builder: (context, child) {
            return Positioned(
              bottom: -150 + (controller2.value * 40),
              left: -100 + (controller2.value * 25),
              child: _buildCircle(350, AppColors.magentaRadialGradient),
            );
          },
        ),
      ],
    );
  }

  /// Build a single animated circle
  static Widget _buildCircle(double size, RadialGradient gradient) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, gradient: gradient),
    );
  }

  /// Build floating particles effect
  static Widget buildParticles(AnimationController controller1) {
    return Stack(
      children: List.generate(8, (index) {
        return AnimatedBuilder(
          animation: controller1,
          builder: (context, child) {
            final offset = (index * 0.3 + controller1.value) % 1.0;
            final isOdd = index % 2 == 0;
            final height = MediaQuery.of(context).size.height;
            return Positioned(
              top: height * offset,
              left: (isOdd ? 50.0 : 300.0) + (controller1.value * 30),
              child: _buildParticle(isOdd),
            );
          },
        );
      }),
    );
  }

  /// Build a single particle
  static Widget _buildParticle(bool isOdd) {
    final color = isOdd ? AppColors.cyan : AppColors.magenta;
    return Opacity(
      opacity: 0.3,
      child: Container(
        width: 4,
        height: 4,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: color,
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.5),
              blurRadius: 8,
              spreadRadius: 2,
            ),
          ],
        ),
      ),
    );
  }
}
