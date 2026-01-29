import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/game_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../l10n/app_localizations.dart';

class DragDropGameWidget extends StatefulWidget {
  const DragDropGameWidget({super.key});

  @override
  State<DragDropGameWidget> createState() => _DragDropGameWidgetState();
}

class _DragDropGameWidgetState extends State<DragDropGameWidget> {
  List<String> _shuffledSteps = [];
  bool _isChecked = false;

  @override
  void initState() {
    super.initState();
    _initSteps();
  }

  void _initSteps() {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) return;

    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    final solution = steps.map((s) => s.word).toList();

    // Create a copy and shuffle
    _shuffledSteps = List.from(solution);
    _shuffledSteps.shuffle();
    _isChecked = false;
  }

  void _checkOrder() {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle!;
    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    final solution = steps.map((s) => s.word).toList();

    bool isCorrect = true;
    for (int i = 0; i < solution.length; i++) {
      if (_shuffledSteps[i] != solution[i]) {
        isCorrect = false;
        break;
      }
    }

    setState(() {
      _isChecked = true;
    });

    if (isCorrect) {
      provider.incrementScore(100); // Big reward for solving all at once
      _showPuzzleCompleteDialog(context, isArabic);
    } else {
      provider.decrementLives();
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.incorrectOrder),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showPuzzleCompleteDialog(BuildContext context, bool isArabic) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text("🎉"),
        content: Text(l10n.excellent),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              final provider = Provider.of<GameProvider>(
                context,
                listen: false,
              );
              provider.advancePuzzle().then((_) {
                _initSteps();
                setState(() {});
              });
            },
            child: Text(l10n.next),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<GameProvider>(context);
    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';
    final puzzle = provider.currentPuzzle;
    final l10n = AppLocalizations.of(context)!;

    if (puzzle == null) return Center(child: Text(l10n.levelComplete));

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          // Start Node
          _buildStaticNode(
            isArabic ? puzzle.startWordAr : puzzle.startWordEn,
            Colors.blue,
          ),

          const Icon(Icons.arrow_downward, color: Colors.grey),

          // Reorderable List
          Expanded(
            child: ReorderableListView(
              padding: const EdgeInsets.symmetric(vertical: 10),
              children: [
                for (int index = 0; index < _shuffledSteps.length; index++)
                  Card(
                    key: Key(_shuffledSteps[index]),
                    color: Colors.white,
                    elevation: 3,
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    child: ListTile(
                      title: Text(
                        _shuffledSteps[index],
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      leading: const Icon(Icons.drag_handle),
                      trailing: _isChecked
                          // Show checkmark or cross if checked?
                          // Currently we just show global snackbar, but here we could show per-item
                          ? null
                          : null,
                    ),
                  ),
              ],
              onReorder: (oldIndex, newIndex) {
                setState(() {
                  if (oldIndex < newIndex) {
                    newIndex -= 1;
                  }
                  final item = _shuffledSteps.removeAt(oldIndex);
                  _shuffledSteps.insert(newIndex, item);
                  _isChecked = false; // Reset check status on move
                });
              },
            ),
          ),

          const Icon(Icons.arrow_downward, color: Colors.grey),

          // End Node
          _buildStaticNode(
            isArabic ? puzzle.endWordAr : puzzle.endWordEn,
            Colors.blue,
          ),

          const SizedBox(height: 20),

          // Check Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _checkOrder,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.all(16),
                backgroundColor: Theme.of(context).primaryColor,
              ),
              child: Text(
                l10n.checkAnswer,
                style: const TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStaticNode(String text, Color color) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
