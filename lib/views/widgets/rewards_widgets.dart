import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/rewards_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../core/app_colors.dart';

/// Compact rewards display widget for home screen
class RewardsDisplayWidget extends StatelessWidget {
  const RewardsDisplayWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final rewards = context.watch<RewardsProvider>();
    final isArabic =
        context.watch<LocaleProvider>().locale.languageCode == 'ar';

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.cyan.withOpacity(0.15),
            AppColors.magenta.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // Coins
          _buildStatItem(
            icon: Icons.monetization_on,
            iconColor: Colors.amber,
            value: '${rewards.coins}',
            label: isArabic ? 'عملات' : 'Coins',
          ),

          // Streak
          _buildStatItem(
            icon: Icons.local_fire_department,
            iconColor: Colors.orange,
            value: '${rewards.currentStreak}',
            label: isArabic ? 'سلسلة' : 'Streak',
          ),

          // Achievements
          _buildStatItem(
            icon: Icons.emoji_events,
            iconColor: AppColors.cyan,
            value:
                '${rewards.unlockedAchievements.length}/${RewardsProvider.achievements.length}',
            label: isArabic ? 'إنجازات' : 'Badges',
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required Color iconColor,
    required String value,
    required String label,
  }) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: iconColor, size: 20),
            const SizedBox(width: 4),
            Text(
              value,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
      ],
    );
  }
}

/// Daily login bonus popup
class DailyBonusDialog extends StatelessWidget {
  final int bonusEarned;
  final int streak;
  final bool streakBroken;

  const DailyBonusDialog({
    super.key,
    required this.bonusEarned,
    required this.streak,
    required this.streakBroken,
  });

  @override
  Widget build(BuildContext context) {
    final isArabic =
        context.watch<LocaleProvider>().locale.languageCode == 'ar';

    return AlertDialog(
      backgroundColor: AppColors.darkSurface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.celebration, color: Colors.amber, size: 28),
          const SizedBox(width: 8),
          Text(
            isArabic ? 'مكافأة يومية!' : 'Daily Bonus!',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Coins earned
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.amber.withOpacity(0.2),
                  Colors.orange.withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.monetization_on, color: Colors.amber, size: 32),
                const SizedBox(width: 8),
                Text(
                  '+$bonusEarned',
                  style: TextStyle(
                    color: Colors.amber,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Streak info
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                streakBroken ? Icons.heart_broken : Icons.local_fire_department,
                color: streakBroken ? Colors.red : Colors.orange,
              ),
              const SizedBox(width: 8),
              Text(
                streakBroken
                    ? (isArabic ? 'بداية سلسلة جديدة' : 'New streak started')
                    : (isArabic
                          ? 'سلسلة: $streak أيام'
                          : 'Streak: $streak days'),
                style: TextStyle(color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            isArabic ? 'رائع!' : 'Awesome!',
            style: TextStyle(
              color: AppColors.cyan,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}

/// Achievement unlocked popup
class AchievementUnlockedDialog extends StatelessWidget {
  final Achievement achievement;
  final bool isArabic;

  const AchievementUnlockedDialog({
    super.key,
    required this.achievement,
    required this.isArabic,
  });

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.darkSurface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.emoji_events, color: AppColors.cyan, size: 28),
          const SizedBox(width: 8),
          Text(
            isArabic ? 'إنجاز جديد!' : 'Achievement Unlocked!',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Achievement icon
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [
                  AppColors.cyan.withOpacity(0.3),
                  AppColors.magenta.withOpacity(0.2),
                ],
              ),
            ),
            child: Icon(achievement.icon, color: AppColors.cyan, size: 40),
          ),

          const SizedBox(height: 16),

          // Achievement name
          Text(
            achievement.getName(isArabic),
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 8),

          // Description
          Text(
            achievement.getDescription(isArabic),
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary),
          ),

          const SizedBox(height: 12),

          // Reward
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.monetization_on, color: Colors.amber, size: 20),
              const SizedBox(width: 4),
              Text(
                '+${achievement.reward}',
                style: TextStyle(
                  color: Colors.amber,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text(
            isArabic ? 'تم!' : 'Got it!',
            style: TextStyle(
              color: AppColors.cyan,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }
}
