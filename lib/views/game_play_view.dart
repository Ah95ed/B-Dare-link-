import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_provider.dart';
import 'game_view.dart';
import 'modes/multiple_choice_game_widget.dart';
import 'modes/grid_path_game_widget.dart';
import 'modes/drag_drop_game_widget.dart';
import '../controllers/locale_provider.dart';

class GamePlayView extends StatelessWidget {
  const GamePlayView({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<GameProvider>(context);
    final mode = provider.selectedMode;
    final isGameOver = provider.isGameOver;

    // Show Game Over Dialog if needed
    if (isGameOver) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text("Game Over"),
            content: const Text("You ran out of lives!"),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to levels
                },
                child: const Text("Exit"),
              ),
              TextButton(
                onPressed: () {
                  // Retry
                  final level = provider.currentLevel;
                  // We need isArabic here, but it's not easily accessible in this build context
                  // without Provider lookup again or passing it.
                  final isArabic =
                      Provider.of<LocaleProvider>(
                        context,
                        listen: false,
                      ).locale.languageCode ==
                      'ar';
                  Navigator.pop(context);
                  if (level != null) provider.loadLevel(level, isArabic);
                },
                child: const Text("Retry"),
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

            // Puzzle Progress
            Column(
              children: [
                Text(
                  "Level ${provider.currentLevel?.id ?? 0}",
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  "Puzzle ${provider.currentPuzzleIndex + 1}/${provider.totalPuzzles}",
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),

            // Score
            Text(
              "Score: ${provider.score}",
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
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
