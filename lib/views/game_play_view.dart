import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/game_provider.dart';
import 'game_view.dart';
import 'modes/multiple_choice_game_widget.dart';
import 'modes/grid_path_game_widget.dart';
import 'modes/drag_drop_game_widget.dart';
import '../controllers/locale_provider.dart';

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

    if (provider.isLoading) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 20),
              Text("Generating Puzzles..."),
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
            title: const Text("Game Over"),
            content: const Text("You ran out of lives!"),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to levels
                  // No need to reset flag as we are leaving
                },
                child: const Text("Exit"),
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
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ],
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
