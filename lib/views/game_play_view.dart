import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_provider.dart';
import 'game_view.dart';
import 'modes/multiple_choice_game_widget.dart';
import 'modes/grid_path_game_widget.dart';
import 'modes/drag_drop_game_widget.dart';
import '../controllers/locale_provider.dart';
import '../l10n/app_localizations.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class GamePlayView extends StatefulWidget {
  const GamePlayView({super.key});

  @override
  State<GamePlayView> createState() => _GamePlayViewState();
}

class _GamePlayViewState extends State<GamePlayView> {
  bool _isDialogShown = false;

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<GameProvider>(context);
    final l10n = AppLocalizations.of(context)!;

    if (provider.isLoading) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 20.h),
              Text(l10n.generatingPuzzles),
            ],
          ),
        ),
      );
    }

    final mode = provider.selectedMode;
    final isGameOver = provider.isGameOver;

    // Show Game Over Dialog if needed
    if (isGameOver && !_isDialogShown) {
      _isDialogShown = true; // Mark as shown immediately
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: Text(l10n.gameOverTitle),
            content: Text(l10n.outOfLives),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to levels
                  // No need to reset flag as we are leaving
                },
                child: Text(l10n.exit),
              ),
              TextButton(
                onPressed: () {
                  // Retry
                  final level = provider.currentLevel;
                  final isArabic =
                      Provider.of<LocaleProvider>(
                        context,
                        listen: false,
                      ).locale.languageCode ==
                      'ar';
                  Navigator.pop(context);
                  _isDialogShown = false; // Reset flag for next time
                  if (level != null) provider.loadLevel(level, isArabic);
                },
                child: Text(l10n.retry),
              ),
            ],
          ),
        );
      });
    }

    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            // Lives
            Row(
              children: List.generate(
                3,
                (index) => Icon(
                  index < provider.lives
                      ? Icons.favorite
                      : Icons.favorite_border,
                  color: Colors.red,
                ),
              ),
            ),

            // Timer
            Stack(
              alignment: Alignment.center,
              children: [
                CircularProgressIndicator(
                  value: provider.timeLimit > 0
                      ? (provider.timeLeft / provider.timeLimit)
                      : 0,
                  color: provider.timeLeft < 10 ? Colors.red : Colors.green,
                  backgroundColor: Colors.grey.shade300,
                ),
                Text(
                  "${provider.timeLeft}",
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 12.sp,
                  ),
                ),
              ],
            ),

            // Puzzle Progress
            Column(
              children: [
                Text(
                  l10n.levelLabel(provider.currentLevel?.id ?? 0),
                  style: TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  l10n.puzzleProgress(
                    provider.currentPuzzleIndex + 1,
                    provider.totalPuzzles,
                  ),
                  style: TextStyle(fontSize: 12.sp),
                ),
              ],
            ),

            // Score
            Text(
              l10n.scoreLabel(provider.score),
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.sp),
            ),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        leading: BackButton(onPressed: () => Navigator.pop(context)),
      ),
      body: _buildGameBody(mode),
    );
  }

  Widget _buildGameBody(GameMode mode) {
    switch (mode) {
      case GameMode.multipleChoice:
        return const MultipleChoiceGameWidget();
      case GameMode.gridPath:
        return const GridPathGameWidget();
      case GameMode.dragDrop:
        return const DragDropGameWidget();
      case GameMode.fillBlank:
        return const GameView();
    }
  }
}
