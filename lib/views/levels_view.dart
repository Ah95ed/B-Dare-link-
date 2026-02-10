import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../models/game_level.dart';
import '../data/level_data.dart';
import '../controllers/game_provider.dart';
import '../controllers/locale_provider.dart';
import '../core/app_colors.dart';
import '../core/auth_guard.dart';
import 'game_play_view.dart';
import '../l10n/app_localizations.dart';

class LevelsView extends StatelessWidget {
  const LevelsView({super.key});
  // level
  @override
  Widget build(BuildContext context) {
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          l10n.soloPlay,
          style: TextStyle(
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
            fontSize: 22.sp,
          ),
        ),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        centerTitle: true,
        actions: [
          Container(
            margin: EdgeInsets.only(right: 8.w),
            decoration: BoxDecoration(
              color: AppColors.purple.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12.r),
              border: Border.all(
                color: AppColors.purple.withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: IconButton(
              icon: const Icon(Icons.bug_report, color: AppColors.purple),
              tooltip: l10n.levelsDebugTooltip,
              onPressed: () {
                // Debug functionality removed - use admin panel instead
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text(l10n.levelsDebugMessage)),
                );
              },
            ),
          ),
        ],
      ),
      body: Consumer<GameProvider>(
        builder: (context, provider, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Theme.of(context).scaffoldBackgroundColor,
                  Color(0xFF1A1F3A).withOpacity(0.5),
                ],
              ),
            ),
            child: GridView.builder(
              padding: EdgeInsets.all(20.r),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16.w,
                mainAxisSpacing: 16.h,
                childAspectRatio: 1.0,
              ),
              itemCount: LevelData.totalLevels,
              itemBuilder: (context, index) {
                final levelId = index + 1;
                final level = LevelData.getLevelShell(levelId);
                return _buildLevelCard(
                  context,
                  level,
                  isArabic,
                  provider.unlockedLevelId,
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildLevelCard(
    BuildContext context,
    GameLevel level,
    bool isArabic,
    int unlockedLevelId,
  ) {
    bool isLocked = level.id > unlockedLevelId;
    final l10n = AppLocalizations.of(context)!;
    return GestureDetector(
      onTap: isLocked
          ? null
          : () async {
              final authed = await AuthGuard.requireLogin(context);
              if (!authed) return;
              Provider.of<GameProvider>(
                context,
                listen: false,
              ).loadLevel(level, isArabic);
              Provider.of<GameProvider>(
                context,
                listen: false,
              ).setGameMode(GameMode.multipleChoice);
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (_, __, ___) => const GamePlayView(),
                  transitionsBuilder: (_, animation, __, child) {
                    return FadeTransition(opacity: animation, child: child);
                  },
                ),
              );
            },
      child: Container(
        decoration: BoxDecoration(
          gradient: isLocked
              ? LinearGradient(
                  colors: [
                    Color(0xFF3B4A5A).withOpacity(0.6),
                    Color(0xFF2A313E).withOpacity(0.6),
                  ],
                )
              : LinearGradient(
                  colors: [
                    Color(0xFF00D9FF).withOpacity(0.1),
                    AppColors.purple.withOpacity(0.08),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.circular(20.r),
          border: Border.all(
            color: isLocked
                ? Color(0xFF6B7499).withOpacity(0.3)
                : Color(0xFF00D9FF).withOpacity(0.25),
            width: 2,
          ),
          boxShadow: isLocked
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.2),
                    blurRadius: 10.r,
                    offset: Offset(0, 4.h),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Color(0xFF00D9FF).withOpacity(0.15),
                    blurRadius: 20.r,
                    spreadRadius: 3.r,
                  ),
                  BoxShadow(
                    color: AppColors.purple.withOpacity(0.08),
                    blurRadius: 15.r,
                    spreadRadius: 1.r,
                  ),
                ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLocked)
              Container(
                width: 70.w,
                height: 70.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF6B7499).withOpacity(0.2),
                ),
                child: const Icon(
                  Icons.lock,
                  size: 40,
                  color: Color(0xFF6B7499),
                ),
              )
            else ...[
              // Level Number with Gradient
              ShaderMask(
                shaderCallback: (bounds) => LinearGradient(
                  colors: [Color(0xFF00D9FF), AppColors.purple],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(bounds),
                child: Container(
                  width: 70.w,
                  height: 70.w,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Color(0xFF00D9FF).withOpacity(0.1),
                    border: Border.all(
                      color: Color(0xFF00D9FF).withOpacity(0.3),
                      width: 2,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      "${level.id}",
                      style: TextStyle(
                        fontSize: 32.sp,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ),
              SizedBox(height: 12.h),
              Text(
                l10n.levelLabel(level.id),
                style: TextStyle(
                  fontSize: 16.sp,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF0F4FF),
                  letterSpacing: 0.5,
                ),
              ),
              SizedBox(height: 4.h),
              // Star rating or difficulty
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  3,
                  (i) => Icon(
                    Icons.star,
                    size: 16,
                    color: i < (level.id % 3 + 1)
                        ? Color(0xFFFFC857)
                        : Color(0xFF6B7499).withOpacity(0.3),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
