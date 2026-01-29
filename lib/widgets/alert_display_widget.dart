import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:wonder_link_game/controllers/locale_provider.dart';
import '../providers/alerts_provider.dart';

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
            padding: const EdgeInsets.all(16),
            child: GestureDetector(
              onTap: alertsProvider.dismissCurrentAlert,
              child: Container(
                decoration: BoxDecoration(
                  color: alert.getColor(),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: alert.getColor().withOpacity(0.4),
                      blurRadius: 16,
                      spreadRadius: 2,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // العنوان مع الرمز
                      Row(
                        children: [
                          Text(
                            alert.getIcon(),
                            style: const TextStyle(fontSize: 28),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              alert.getTitle(isArabic),
                              style: const TextStyle(
                                fontSize: 18,
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
                        const SizedBox(height: 8),
                        Text(
                          alert.getMessage(isArabic)!,
                          style: const TextStyle(
                            fontSize: 14,
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
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: 1.0,
                          minHeight: 3,
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

    return ScaleTransition(
      scale: _scaleAnimation,
      child: Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
            borderRadius: BorderRadius.circular(20),
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // الرمز الكبير
              ScaleTransition(
                scale: _scaleAnimation,
                child: Text(widget.icon, style: const TextStyle(fontSize: 80)),
              ),
              const SizedBox(height: 24),

              // العنوان
              Text(
                isArabic ? widget.titleAr : widget.titleEn,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),

              // الوصف
              if ((isArabic ? widget.descriptionAr : widget.descriptionEn) !=
                  null)
                Text(
                  isArabic ? widget.descriptionAr! : widget.descriptionEn!,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    height: 1.4,
                  ),
                  textAlign: TextAlign.center,
                ),
              const SizedBox(height: 20),

              // جائزة XP
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '⚡ +${widget.xpReward} XP',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // زر الإغلاق
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: const Color(0xFFD946EF),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  isArabic ? 'رائع!' : 'Awesome!',
                  style: const TextStyle(
                    fontSize: 16,
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
