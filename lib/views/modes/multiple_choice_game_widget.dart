import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/game_provider.dart';
import '../../controllers/locale_provider.dart';

class MultipleChoiceGameWidget extends StatefulWidget {
  const MultipleChoiceGameWidget({super.key});

  @override
  State<MultipleChoiceGameWidget> createState() =>
      _MultipleChoiceGameWidgetState();
}

class _MultipleChoiceGameWidgetState extends State<MultipleChoiceGameWidget> {
  // Track current step index user is solving
  int _currentStepIndex = 0;
  List<String> _currentOptions = [];

  @override
  void initState() {
    super.initState();
    _generateOptions();
  }

  @override
  void didUpdateWidget(covariant MultipleChoiceGameWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    _generateOptions();
  }

  void _generateOptions() {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) return;

    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final solution = isArabic ? puzzle.solutionStepsAr : puzzle.solutionStepsEn;

    if (_currentStepIndex >= solution.length) {
      // Should trigger next puzzle
      return;
    }

    final correctWord = solution[_currentStepIndex];

    // Mock distractors
    List<String> distractors = isArabic
        ? ["جبل", "سماء", "نار", "صخرة"]
        : ["Mountain", "Sky", "Fire", "Rock"];

    distractors.shuffle();
    final options = [correctWord, distractors[0], distractors[1]];
    options.shuffle();

    setState(() {
      _currentOptions = options;
    });
  }

  void _handleOptionSelected(String selectedWord) {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';

    if (provider.checkStep(selectedWord, _currentStepIndex, isArabic)) {
      // Correct
      provider.incrementScore(10); // Reward
      setState(() {
        _currentStepIndex++;
      });

      final puzzle = provider.currentPuzzle!;
      final solution = isArabic
          ? puzzle.solutionStepsAr
          : puzzle.solutionStepsEn;

      if (_currentStepIndex >= solution.length) {
        // Win Condition for this puzzle
        provider.incrementScore(50); // Completion Bonus
        _showPuzzleCompleteDialog(context, isArabic);
      } else {
        // Next step
        _generateOptions();
      }
    } else {
      // Incorrect
      provider.decrementLives();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(isArabic ? "حاول مرة أخرى!" : "Try again!"),
          backgroundColor: Colors.red,
          duration: Duration(milliseconds: 500),
        ),
      );
    }
  }

  void _showPuzzleCompleteDialog(BuildContext context, bool isArabic) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text("🎉"),
        content: Text(
          isArabic ? "أحسنت! اللغز مكتمل." : "Great Job! Puzzle Solved.",
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close Dialog
              // Advance
              final provider = Provider.of<GameProvider>(
                context,
                listen: false,
              );
              provider.advancePuzzle().then((_) {
                setState(() {
                  _currentStepIndex = 0;
                });
                _generateOptions();
              });
            },
            child: const Text("Next"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = Provider.of<GameProvider>(context);
    final puzzle = provider.currentPuzzle;

    // If no puzzle (level complete), show nothing or loading
    if (puzzle == null) return Center(child: Text("Level Complete!"));

    final isArabic =
        Provider.of<LocaleProvider>(context).locale.languageCode == 'ar';
    final solution = isArabic ? puzzle.solutionStepsAr : puzzle.solutionStepsEn;

    // Safety check if we switched puzzles and index is out of bounds
    if (_currentStepIndex > solution.length) _currentStepIndex = 0;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Path Visualization
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildNode(
                isArabic ? puzzle.startWordAr : puzzle.startWordEn,
                true,
              ),
              ...List.generate(solution.length, (index) {
                String text = (index < _currentStepIndex)
                    ? solution[index]
                    : "?";
                bool isSolved = index < _currentStepIndex;
                bool isCurrent = index == _currentStepIndex;
                return Expanded(
                  child: Row(
                    children: [
                      Expanded(
                        child: Divider(
                          thickness: 2,
                          color: isSolved ? Colors.green : Colors.grey,
                        ),
                      ),
                      _buildStepNode(text, isSolved, isCurrent),
                      Expanded(
                        child: Divider(
                          thickness: 2,
                          color: (index == solution.length - 1 && isSolved)
                              ? Colors.green
                              : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                );
              }),
              _buildNode(isArabic ? puzzle.endWordAr : puzzle.endWordEn, true),
            ],
          ),

          const Spacer(),

          // Questions Area
          if (_currentStepIndex < solution.length &&
              _currentOptions.isNotEmpty) ...[
            Text(
              isArabic ? "اختر الخطوة القادمة:" : "Choose the next step:",
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Wrap(
              spacing: 15,
              runSpacing: 15,
              alignment: WrapAlignment.center,
              children: _currentOptions.map((word) {
                return ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 30,
                      vertical: 15,
                    ),
                    textStyle: const TextStyle(fontSize: 18),
                  ),
                  onPressed: () => _handleOptionSelected(word),
                  child: Text(word),
                );
              }).toList(),
            ),
          ],

          const Spacer(),
        ],
      ),
    );
  }

  Widget _buildNode(String text, bool isEnd) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: isEnd ? Colors.blueAccent : Colors.grey.shade300,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: isEnd ? Colors.white : Colors.black,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildStepNode(String text, bool isSolved, bool isCurrent) {
    return Container(
      width: 50,
      height: 50,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: isSolved
            ? Colors.green.shade100
            : (isCurrent ? Colors.orange.shade100 : Colors.grey.shade100),
        shape: BoxShape.circle,
        border: Border.all(
          color: isSolved
              ? Colors.green
              : (isCurrent ? Colors.orange : Colors.grey),
          width: 2,
        ),
      ),
      child: Text(
        text.length > 4 ? "${text.substring(0, 3)}.." : text,
        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
        textAlign: TextAlign.center,
      ),
    );
  }
}
