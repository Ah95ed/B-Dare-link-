import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/avatar_provider.dart';
import '../../providers/rewards_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../core/app_colors.dart';

/// Avatar selection view - grid of avatars to choose from
class AvatarSelectionView extends StatelessWidget {
  const AvatarSelectionView({super.key});

  @override
  Widget build(BuildContext context) {
    final avatarProvider = context.watch<AvatarProvider>();
    final rewardsProvider = context.watch<RewardsProvider>();
    final isArabic =
        context.watch<LocaleProvider>().locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: AppColors.darkBackground,
      appBar: AppBar(
        title: Text(
          isArabic ? 'اختر شخصيتك' : 'Choose Your Avatar',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Current avatar display
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        AppColors.cyan.withOpacity(0.3),
                        AppColors.magenta.withOpacity(0.2),
                      ],
                    ),
                    border: Border.all(color: AppColors.cyan, width: 3),
                  ),
                  child: Center(
                    child: Text(
                      avatarProvider.selectedAvatar.emoji,
                      style: const TextStyle(fontSize: 50),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  avatarProvider.selectedAvatar.getName(isArabic),
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          // Coins display
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.amber.withOpacity(0.3)),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.monetization_on,
                  color: Colors.amber,
                  size: 24,
                ),
                const SizedBox(width: 8),
                Text(
                  '${rewardsProvider.coins}',
                  style: const TextStyle(
                    color: Colors.amber,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),

          // Avatar grid
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: AvatarProvider.avatars.length,
              itemBuilder: (context, index) {
                final avatar = AvatarProvider.avatars[index];
                final isSelected = avatar.id == avatarProvider.selectedAvatarId;
                final isUnlocked = avatarProvider.isUnlocked(avatar.id);

                return _buildAvatarCard(
                  context,
                  avatar: avatar,
                  isSelected: isSelected,
                  isUnlocked: isUnlocked,
                  coins: rewardsProvider.coins,
                  isArabic: isArabic,
                  onTap: () => _handleAvatarTap(
                    context,
                    avatar,
                    isUnlocked,
                    avatarProvider,
                    rewardsProvider,
                    isArabic,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvatarCard(
    BuildContext context, {
    required AvatarData avatar,
    required bool isSelected,
    required bool isUnlocked,
    required int coins,
    required bool isArabic,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isUnlocked
              ? (isSelected
                    ? AppColors.cyan.withOpacity(0.2)
                    : AppColors.darkSurface)
              : AppColors.darkSurface.withOpacity(0.5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.cyan : AppColors.divider,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Avatar emoji
            Stack(
              alignment: Alignment.center,
              children: [
                Text(
                  avatar.emoji,
                  style: TextStyle(
                    fontSize: 36,
                    color: isUnlocked ? null : Colors.grey,
                  ),
                ),
                if (!isUnlocked)
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.5),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.lock,
                      color: Colors.white54,
                      size: 24,
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 4),

            // Name
            Text(
              avatar.getName(isArabic),
              style: TextStyle(
                color: isUnlocked
                    ? AppColors.textPrimary
                    : AppColors.textDisabled,
                fontSize: 12,
                fontWeight: FontWeight.bold,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),

            // Price/status
            if (!isUnlocked && avatar.unlockCost > 0)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.monetization_on,
                    size: 12,
                    color: coins >= avatar.unlockCost
                        ? Colors.amber
                        : Colors.grey,
                  ),
                  const SizedBox(width: 2),
                  Text(
                    '${avatar.unlockCost}',
                    style: TextStyle(
                      color: coins >= avatar.unlockCost
                          ? Colors.amber
                          : Colors.grey,
                      fontSize: 11,
                    ),
                  ),
                ],
              )
            else if (!isUnlocked && avatar.unlockAchievement != null)
              Icon(Icons.emoji_events, size: 14, color: AppColors.textDisabled),
          ],
        ),
      ),
    );
  }

  void _handleAvatarTap(
    BuildContext context,
    AvatarData avatar,
    bool isUnlocked,
    AvatarProvider avatarProvider,
    RewardsProvider rewardsProvider,
    bool isArabic,
  ) async {
    if (isUnlocked) {
      // Just select it
      await avatarProvider.selectAvatar(avatar.id);
    } else if (avatar.unlockCost > 0) {
      // Try to purchase
      if (rewardsProvider.coins >= avatar.unlockCost) {
        final confirm = await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            backgroundColor: AppColors.darkSurface,
            title: Text(
              isArabic ? 'شراء الشخصية' : 'Purchase Avatar',
              style: const TextStyle(color: AppColors.textPrimary),
            ),
            content: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(avatar.emoji, style: const TextStyle(fontSize: 40)),
                const SizedBox(width: 12),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      avatar.getName(isArabic),
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(
                          Icons.monetization_on,
                          color: Colors.amber,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${avatar.unlockCost}',
                          style: const TextStyle(color: Colors.amber),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text(
                  isArabic ? 'إلغاء' : 'Cancel',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                child: Text(
                  isArabic ? 'شراء' : 'Buy',
                  style: const TextStyle(
                    color: AppColors.cyan,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        );

        if (confirm == true) {
          final success = await avatarProvider.unlockWithCoins(
            avatar.id,
            rewardsProvider.coins,
            (cost) async {
              return await rewardsProvider.spendCoins(cost);
            },
          );

          if (success && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  isArabic ? 'تم الشراء بنجاح!' : 'Purchase successful!',
                ),
                backgroundColor: AppColors.success,
              ),
            );
            await avatarProvider.selectAvatar(avatar.id);
          }
        }
      } else {
        // Not enough coins
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              isArabic ? 'لا تملك عملات كافية' : 'Not enough coins',
            ),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } else if (avatar.unlockAchievement != null) {
      // Achievement-locked
      final achievement =
          RewardsProvider.achievements[avatar.unlockAchievement];
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            isArabic
                ? 'أكمل إنجاز "${achievement?.getName(isArabic) ?? ''}" لفتح هذه الشخصية'
                : 'Complete "${achievement?.getName(isArabic) ?? ''}" achievement to unlock',
          ),
          backgroundColor: AppColors.warning,
        ),
      );
    }
  }
}
