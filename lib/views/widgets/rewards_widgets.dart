import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../providers/rewards_provider.dart';
import '../../core/app_colors.dart';
import '../../l10n/app_localizations.dart';

/// Compact rewards display widget for home screen
class RewardsDisplayWidget extends StatelessWidget {
  const RewardsDisplayWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final rewards = context.watch<RewardsProvider>();
    final l10n = AppLocalizations.of(context)!;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.cyan.withOpacity(0.15),
            AppColors.magenta.withOpacity(0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(16.r),
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
            label: l10n.coins,
          ),

          // Streak
          _buildStatItem(
            icon: Icons.local_fire_department,
            iconColor: Colors.orange,
            value: '${rewards.currentStreak}',
            label: l10n.streak,
          ),

          // Achievements
          _buildStatItem(
            icon: Icons.emoji_events,
            iconColor: AppColors.cyan,
            value:
                '${rewards.unlockedAchievements.length}/${RewardsProvider.achievements.length}',
            label: l10n.badges,
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
            SizedBox(width: 4.w),
            Text(
              value,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.bold,
                fontSize: 16.sp,
              ),
            ),
          ],
        ),
        SizedBox(height: 2.h),
        Text(
          label,
          style: TextStyle(color: AppColors.textSecondary, fontSize: 12.sp),
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
    final l10n = AppLocalizations.of(context)!;

    return AlertDialog(
      backgroundColor: AppColors.darkSurface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.celebration, color: Colors.amber, size: 28),
          SizedBox(width: 8.w),
          Text(
            l10n.dailyBonus,
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
            padding: EdgeInsets.all(16.r),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.amber.withOpacity(0.2),
                  Colors.orange.withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.monetization_on, color: Colors.amber, size: 32),
                SizedBox(width: 8.w),
                Text(
                  '+$bonusEarned',
                  style: TextStyle(
                    color: Colors.amber,
                    fontSize: 28.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: 16.h),

          // Streak info
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                streakBroken ? Icons.heart_broken : Icons.local_fire_department,
                color: streakBroken ? Colors.red : Colors.orange,
              ),
              SizedBox(width: 8.w),
              Text(
                streakBroken ? l10n.newStreakStarted : l10n.streakDays(streak),
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
            l10n.awesome,
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
    final l10n = AppLocalizations.of(context)!;
    return AlertDialog(
      backgroundColor: AppColors.darkSurface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20.r)),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.emoji_events, color: AppColors.cyan, size: 28),
          SizedBox(width: 8.w),
          Text(
            l10n.achievementUnlocked,
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
            width: 80.w,
            height: 80.w,
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

          SizedBox(height: 16.h),

          // Achievement name
          Text(
            achievement.getName(isArabic),
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20.sp,
              fontWeight: FontWeight.bold,
            ),
          ),

          SizedBox(height: 8.h),

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
              SizedBox(width: 4.w),
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
            l10n.gotIt,
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
