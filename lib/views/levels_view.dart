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
      appBar: AppBar(
        title: Text(isArabic ? "المراحل" : "Levels"),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.bug_report, color: Colors.red),
            tooltip: "Test API (20 Questions)",
            onPressed: () {
              Provider.of<GameProvider>(
                context,
                listen: false,
              ).debugGeneratePuzzles(isArabic);
            },
          ),
        ],
      ),
      body: Consumer<GameProvider>(
        builder: (context, provider, child) {
          return GridView.builder(
            padding: const EdgeInsets.all(20),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 15,
              mainAxisSpacing: 15,
              childAspectRatio: 1.1,
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
              // Ensure we don't listen here since it's a callback
              Provider.of<GameProvider>(
                context,
                listen: false,
              ).loadLevel(level, isArabic);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) =>
                      GameModeSelectionView(level: level, isArabic: isArabic),
                ),
              );
            },
      child: Container(
        decoration: BoxDecoration(
          color: isLocked ? Colors.grey.shade300 : Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isLocked)
              const Icon(Icons.lock, size: 50, color: Colors.grey)
            else ...[
              Container(
                padding: const EdgeInsets.all(15),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Text(
                  "${level.id}",
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                isArabic ? "مرحلة ${level.id}" : "Level ${level.id}",
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
