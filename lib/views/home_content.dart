import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/locale_provider.dart';
import '../l10n/app_localizations.dart';
import '../constants/app_colors.dart';
import 'levels_view.dart';
import 'competitions/competitions_view.dart';
import 'groups/create_group_view.dart';
import 'groups/join_group_view.dart';
import 'modes/spot_diff_view.dart';

/// Handles home view content and action buttons
class HomeContent {
  /// Build main content
  static Widget buildContent(
    BuildContext context,
    AppLocalizations l10n,
    bool isArabic,
  ) {
    return Center(
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildHeroIcon(),
            const SizedBox(height: 24),
            _buildTitle(context, l10n),
            const SizedBox(height: 12),
            _buildSubtitle(context),
            const SizedBox(height: 60),
            _buildActionButtons(context, l10n, isArabic),
          ],
        ),
      ),
    );
  }

  /// Build hero icon with glow effect
  static Widget _buildHeroIcon() {
    return Container(
      width: 120,
      height: 120,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [
            AppColors.cyan.withOpacity(0.2),
            AppColors.magenta.withOpacity(0.2),
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.cyan.withOpacity(0.3),
            blurRadius: 30,
            spreadRadius: 10,
          ),
        ],
      ),
      child: const Center(
        child: Icon(Icons.auto_awesome, size: 80, color: AppColors.cyan),
      ),
    );
  }

  /// Build app title with gradient
  static Widget _buildTitle(BuildContext context, AppLocalizations l10n) {
    return ShaderMask(
      shaderCallback: (bounds) =>
          AppColors.cyanMagentaGradient.createShader(bounds),
      child: Text(
        l10n.appTitle,
        style: Theme.of(context).textTheme.displayLarge?.copyWith(
          fontWeight: FontWeight.w900,
          fontSize: 48,
          letterSpacing: 1.2,
        ),
      ),
    );
  }

  /// Build app subtitle
  static Widget _buildSubtitle(BuildContext context) {
    return Text(
      "Discover the hidden connection!",
      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
        fontSize: 16,
        letterSpacing: 0.5,
        color: AppColors.secondaryText,
      ),
    );
  }

  /// Build main action buttons
  static Widget _buildActionButtons(
    BuildContext context,
    AppLocalizations l10n,
    bool isArabic,
  ) {
    return Consumer<LocaleProvider>(
      builder: (context, _, __) {
        return Column(
          children: [
            _buildSoloPlayButton(context, l10n),
            const SizedBox(height: 12),
            _buildSpotDiffButton(context, isArabic),
            const SizedBox(height: 12),
            _buildCompetitionsButton(context, l10n),
            const SizedBox(height: 12),
            _buildGroupButtons(context, isArabic),
          ],
        );
      },
    );
  }

  static Widget _buildSpotDiffButton(BuildContext context, bool isArabic) {
    return ElevatedButton.icon(
      onPressed: () => _navigateTo(context, const SpotDiffView()),
      icon: const Icon(Icons.find_in_page),
      label: Text(
        isArabic ? 'اكتشف الفروق' : 'Spot the Difference',
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.magenta,
        foregroundColor: const Color(0xFF0F1729),
        elevation: 10,
        shadowColor: AppColors.magenta.withOpacity(0.35),
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  /// Build Solo Play button
  static Widget _buildSoloPlayButton(
    BuildContext context,
    AppLocalizations l10n,
  ) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.cyan.withOpacity(0.2),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: () => _navigateTo(context, const LevelsView()),
        icon: const Icon(Icons.play_circle_fill),
        label: Text(
          l10n.soloPlay,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.cyan.withOpacity(0.15),
          foregroundColor: AppColors.cyan,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: AppColors.cyan.withOpacity(0.4), width: 2),
          ),
        ),
      ),
    );
  }

  /// Build Competitions button
  static Widget _buildCompetitionsButton(
    BuildContext context,
    AppLocalizations l10n,
  ) {
    return ElevatedButton.icon(
      onPressed: () => _navigateTo(context, const CompetitionsView()),
      icon: const Icon(Icons.emoji_events),
      label: Text(
        l10n.tournaments,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.5,
        ),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.cyan,
        foregroundColor: const Color(0xFF0F1729),
        elevation: 12,
        shadowColor: AppColors.cyan.withOpacity(0.4),
        padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    );
  }

  /// Build Create/Join group buttons
  static Widget _buildGroupButtons(BuildContext context, bool isArabic) {
    return Row(
      children: [
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _navigateTo(context, const CreateGroupView()),
            icon: const Icon(Icons.group_add, size: 18),
            label: Text(
              isArabic ? 'إنشاء' : 'Create',
              style: const TextStyle(fontSize: 14),
            ),
            style: _buildSecondaryButtonStyle(AppColors.magenta),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton.icon(
            onPressed: () => _navigateTo(context, const JoinGroupView()),
            icon: const Icon(Icons.group, size: 18),
            label: Text(
              isArabic ? 'انضم' : 'Join',
              style: const TextStyle(fontSize: 14),
            ),
            style: _buildSecondaryButtonStyle(AppColors.magenta),
          ),
        ),
      ],
    );
  }

  /// Build secondary button style
  static ButtonStyle _buildSecondaryButtonStyle(Color color) {
    return ElevatedButton.styleFrom(
      backgroundColor: color.withOpacity(0.15),
      foregroundColor: color,
      elevation: 0,
      padding: const EdgeInsets.symmetric(vertical: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: color.withOpacity(0.4), width: 1.5),
      ),
    );
  }

  /// Navigate to a widget with fade transition
  static void _navigateTo(BuildContext context, Widget widget) {
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (_, __, ___) => widget,
        transitionsBuilder: (_, animation, __, child) {
          return FadeTransition(opacity: animation, child: child);
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }
}
