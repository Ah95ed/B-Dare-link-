import 'package:flutter/material.dart';
import '../../providers/story_provider.dart';
import '../../core/app_colors.dart';
import '../../l10n/app_localizations.dart';

/// Story dialog shown before starting a level
class StoryDialogWidget extends StatelessWidget {
  final LevelStory story;
  final bool isArabic;
  final VoidCallback onContinue;

  const StoryDialogWidget({
    super.key,
    required this.story,
    required this.isArabic,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: AppColors.cyan.withOpacity(0.1),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Chapter title
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.cyan.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                isArabic
                    ? 'المرحلة ${story.levelId}'
                    : 'Level ${story.levelId}',
                style: TextStyle(
                  color: AppColors.cyan,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            const SizedBox(height: 12),

            // Level title
            Text(
              story.getTitle(isArabic),
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),

            const SizedBox(height: 24),

            // Character with emoji
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: [
                        AppColors.cyan.withOpacity(0.3),
                        AppColors.magenta.withOpacity(0.2),
                      ],
                    ),
                  ),
                  child: Center(
                    child: Text(
                      story.characterEmoji,
                      style: const TextStyle(fontSize: 32),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Character name
            Text(
              story.getCharacter(isArabic),
              style: TextStyle(
                color: AppColors.cyan,
                fontSize: 14,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 16),

            // Story text
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.darkBackground.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                story.getIntro(isArabic),
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 15,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            const SizedBox(height: 24),

            // Continue button
            ElevatedButton(
              onPressed: onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.cyan,
                foregroundColor: AppColors.darkBackground,
                padding: const EdgeInsets.symmetric(
                  horizontal: 40,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    l10n.continueButton,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Icon(
                    isArabic ? Icons.arrow_back : Icons.arrow_forward,
                    size: 18,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Completion dialog shown after finishing a level
class StoryCompletionDialog extends StatelessWidget {
  final LevelStory story;
  final bool isArabic;
  final VoidCallback onContinue;

  const StoryCompletionDialog({
    super.key,
    required this.story,
    required this.isArabic,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final completionText = story.getCompletion(isArabic);
    final l10n = AppLocalizations.of(context)!;

    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.success.withOpacity(0.5)),
          boxShadow: [
            BoxShadow(
              color: AppColors.success.withOpacity(0.2),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Success icon
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.success.withOpacity(0.2),
              ),
              child: const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 50,
              ),
            ),

            const SizedBox(height: 16),

            // Completed title
            Text(
              l10n.levelComplete,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),

            const SizedBox(height: 8),

            Text(
              story.getTitle(isArabic),
              style: TextStyle(color: AppColors.success, fontSize: 16),
            ),

            if (completionText != null) ...[
              const SizedBox(height: 16),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    story.characterEmoji,
                    style: const TextStyle(fontSize: 24),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    story.getCharacter(isArabic),
                    style: TextStyle(
                      color: AppColors.cyan,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.darkBackground.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  completionText,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],

            const SizedBox(height: 24),

            ElevatedButton(
              onPressed: onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 40,
                  vertical: 14,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                l10n.continueButton,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
