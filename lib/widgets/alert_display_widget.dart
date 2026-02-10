import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wonder_link_game/controllers/locale_provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../providers/alerts_provider.dart';
import '../l10n/app_localizations.dart';

/// Widget لعرض التنبيهات
class AlertDisplayWidget extends StatefulWidget {
  const AlertDisplayWidget({super.key});

  @override
  State<AlertDisplayWidget> createState() => _AlertDisplayWidgetState();
}

class _AlertDisplayWidgetState extends State<AlertDisplayWidget>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOut));
  }

  @override
  void didUpdateWidget(AlertDisplayWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    final alertsProvider = Provider.of<AlertsProvider>(context, listen: false);
    if (alertsProvider.isShowingAlert) {
      _slideController.forward();
    } else {
      _slideController.reverse();
    }
  }

  @override
  void dispose() {
    _slideController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<AlertsProvider, LocaleProvider>(
      builder: (context, alertsProvider, localeProvider, _) {
        final alert = alertsProvider.currentAlert;
        final isArabic = localeProvider.locale.languageCode == 'ar';

        if (!alertsProvider.isShowingAlert || alert == null) {
          return const SizedBox.shrink();
        }

        return SlideTransition(
          position: _slideAnimation,
          child: Padding(
            padding: EdgeInsets.all(16.r),
            child: GestureDetector(
              onTap: alertsProvider.dismissCurrentAlert,
              child: Container(
                decoration: BoxDecoration(
                  color: alert.getColor(),
                  borderRadius: BorderRadius.circular(16.r),
                  boxShadow: [
                    BoxShadow(
                      color: alert.getColor().withOpacity(0.4),
                      blurRadius: 16.r,
                      spreadRadius: 2.r,
                      offset: Offset(0, 4.h),
                    ),
                  ],
                ),
                child: Padding(
                  padding: EdgeInsets.all(16.r),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // العنوان مع الرمز
                      Row(
                        children: [
                          Text(
                            alert.getIcon(),
                            style: TextStyle(fontSize: 28.sp),
                          ),
                          SizedBox(width: 12.w),
                          Expanded(
                            child: Text(
                              alert.getTitle(isArabic),
                              style: TextStyle(
                                fontSize: 18.sp,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      // الرسالة
                      if (alert.getMessage(isArabic) != null) ...[
                        SizedBox(height: 8.h),
                        Text(
                          alert.getMessage(isArabic)!,
                          style: TextStyle(
                            fontSize: 14.sp,
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                            height: 1.4,
                          ),
                          textAlign: isArabic
                              ? TextAlign.right
                              : TextAlign.left,
                        ),
                      ],
                      // شريط التقدم
                      SizedBox(height: 12.h),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4.r),
                        child: LinearProgressIndicator(
                          value: 1.0,
                          minHeight: 3.h,
                          backgroundColor: Colors.white.withOpacity(0.2),
                          valueColor: AlwaysStoppedAnimation(
                            Colors.white.withOpacity(0.7),
                          ),
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

/// Widget لعرض الإنجاز المفتوح
class AchievementUnlockedDialog extends StatefulWidget {
  final String icon;
  final String titleAr;
  final String titleEn;
  final String? descriptionAr;
  final String? descriptionEn;
  final int xpReward;

  const AchievementUnlockedDialog({
    super.key,
    required this.icon,
    required this.titleAr,
    required this.titleEn,
    this.descriptionAr,
    this.descriptionEn,
    required this.xpReward,
  });

  @override
  State<AchievementUnlockedDialog> createState() =>
      _AchievementUnlockedDialogState();
}

class _AchievementUnlockedDialogState extends State<AchievementUnlockedDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.elasticOut),
    );
    _scaleController.forward();
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';
    final l10n = AppLocalizations.of(context)!;

    return ScaleTransition(
      scale: _scaleAnimation,
      child: Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20.r),
        ),
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFFD946EF).withOpacity(0.9),
                const Color(0xFF9333EA).withOpacity(0.9),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20.r),
          ),
          padding: EdgeInsets.all(24.r),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // الرمز الكبير
              ScaleTransition(
                scale: _scaleAnimation,
                child: Text(widget.icon, style: TextStyle(fontSize: 80.sp)),
              ),
              SizedBox(height: 24.h),

              // العنوان
              Text(
                isArabic ? widget.titleAr : widget.titleEn,
                style: TextStyle(
                  fontSize: 24.sp,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 12.h),

              // الوصف
              if ((isArabic ? widget.descriptionAr : widget.descriptionEn) !=
                  null)
                Text(
                  isArabic ? widget.descriptionAr! : widget.descriptionEn!,
                  style: TextStyle(
                    fontSize: 14.sp,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              SizedBox(height: 20.h),

              // جائزة XP
              Container(
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Text(
                  l10n.xpRewardLabel(widget.xpReward),
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              SizedBox(height: 24.h),

              // زر الإغلاق
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFFD946EF),
                  padding: EdgeInsets.symmetric(
                    horizontal: 32.w,
                    vertical: 12.h,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                ),
                child: Text(
                  l10n.awesome,
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
