import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/game_level.dart';
import '../data/level_data.dart';
import '../controllers/game_provider.dart';
import '../controllers/locale_provider.dart';
import 'game_mode_selection_view.dart';

class LevelsView extends StatelessWidget {
  const LevelsView({super.key});

  @override
  Widget build(BuildContext context) {
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(
          isArabic ? "المراحل" : "Levels",
          style: TextStyle(
            fontWeight: FontWeight.w900,
            letterSpacing: 1,
            fontSize: 22,
          ),
        ),
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            decoration: BoxDecoration(
              color: Color(0xFFFF006E).withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: Color(0xFFFF006E).withOpacity(0.3),
                width: 1.5,
              ),
            ),
            child: IconButton(
              icon: const Icon(Icons.bug_report, color: Color(0xFFFF006E)),
              tooltip: "Test API (20 Questions)",
              onPressed: () {
                Provider.of<GameProvider>(
                  context,
                  listen: false,
                ).debugGeneratePuzzles(isArabic);
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
              padding: const EdgeInsets.all(20),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
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

    return GestureDetector(
      onTap: isLocked
          ? null
          : () {
              Provider.of<GameProvider>(
                context,
                listen: false,
              ).loadLevel(level, isArabic);
              Navigator.push(
                context,
                PageRouteBuilder(
                  pageBuilder: (_, __, ___) =>
                      GameModeSelectionView(level: level, isArabic: isArabic),
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
                    Color(0xFFFF006E).withOpacity(0.08),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
          borderRadius: BorderRadius.circular(20),
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
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Color(0xFF00D9FF).withOpacity(0.15),
                    blurRadius: 20,
                    spreadRadius: 3,
                  ),
                  BoxShadow(
                    color: Color(0xFFFF006E).withOpacity(0.08),
                    blurRadius: 15,
                    spreadRadius: 1,
                  ),
                ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLocked)
              Container(
                width: 70,
                height: 70,
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
                  colors: [Color(0xFF00D9FF), Color(0xFFFF006E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ).createShader(bounds),
                child: Container(
                  width: 70,
                  height: 70,
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
                        fontSize: 32,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                isArabic ? "مرحلة ${level.id}" : "Level ${level.id}",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFFF0F4FF),
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 4),
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
