import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
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
        constraints: BoxConstraints(maxWidth: 400.w),
        padding: EdgeInsets.all(24.r),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: AppColors.cyan.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: AppColors.cyan.withOpacity(0.1),
              blurRadius: 20.r,
              spreadRadius: 5.r,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Chapter title
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: AppColors.cyan.withOpacity(0.1),
                borderRadius: BorderRadius.circular(20.r),
              ),
              child: Text(
                l10n.levelLabel(story.levelId),
                style: TextStyle(
                  color: AppColors.cyan,
                  fontSize: 12.sp,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),

            SizedBox(height: 12.h),

            // Level title
            Text(
              story.getTitle(isArabic),
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 22.sp,
                fontWeight: FontWeight.bold,
              ),
              textAlign: TextAlign.center,
            ),

            SizedBox(height: 24.h),

            // Character with emoji
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 60.w,
                  height: 60.w,
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
                      style: TextStyle(fontSize: 32.sp),
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: 8.h),

            // Character name
            Text(
              story.getCharacter(isArabic),
              style: TextStyle(
                color: AppColors.cyan,
                fontSize: 14.sp,
                fontWeight: FontWeight.bold,
              ),
            ),

            SizedBox(height: 16.h),

            // Story text
            Container(
              padding: EdgeInsets.all(16.r),
              decoration: BoxDecoration(
                color: AppColors.darkBackground.withOpacity(0.5),
                borderRadius: BorderRadius.circular(12.r),
              ),
              child: Text(
                story.getIntro(isArabic),
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 15.sp,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
            ),

            SizedBox(height: 24.h),

            // Continue button
            ElevatedButton(
              onPressed: onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.cyan,
                foregroundColor: AppColors.darkBackground,
                padding: EdgeInsets.symmetric(horizontal: 40.w, vertical: 14.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    l10n.continueButton,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16.sp,
                    ),
                  ),
                  SizedBox(width: 8.w),
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
        constraints: BoxConstraints(maxWidth: 400.w),
        padding: EdgeInsets.all(24.r),
        decoration: BoxDecoration(
          color: AppColors.darkSurface,
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: AppColors.success.withOpacity(0.5)),
          boxShadow: [
            BoxShadow(
              color: AppColors.success.withOpacity(0.2),
              blurRadius: 20.r,
              spreadRadius: 5.r,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Success icon
            Container(
              width: 80.w,
              height: 80.w,
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

            SizedBox(height: 16.h),

            // Completed title
            Text(
              l10n.levelComplete,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 22.sp,
                fontWeight: FontWeight.bold,
              ),
            ),

            SizedBox(height: 8.h),

            Text(
              story.getTitle(isArabic),
              style: TextStyle(color: AppColors.success, fontSize: 16.sp),
            ),

            if (completionText != null) ...[
              SizedBox(height: 16.h),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(story.characterEmoji, style: TextStyle(fontSize: 24.sp)),
                  SizedBox(width: 8.w),
                  Text(
                    story.getCharacter(isArabic),
                    style: TextStyle(
                      color: AppColors.cyan,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),

              SizedBox(height: 12.h),

              Container(
                padding: EdgeInsets.all(16.r),
                decoration: BoxDecoration(
                  color: AppColors.darkBackground.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Text(
                  completionText,
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 14.sp,
                    height: 1.5,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ],

            SizedBox(height: 24.h),

            ElevatedButton(
              onPressed: onContinue,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.success,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(horizontal: 40.w, vertical: 14.h),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12.r),
                ),
              ),
              child: Text(
                l10n.continueButton,
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
