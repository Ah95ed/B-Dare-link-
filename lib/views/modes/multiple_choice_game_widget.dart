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
  // Track provider and last puzzle key to detect changes
  late final GameProvider? _provider;
  String? _lastPuzzleKey;

  @override
  void initState() {
    super.initState();
    _generateOptions();
    // Listen to provider changes so we can regenerate options
    // when the backend returns a new puzzle
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _provider = Provider.of<GameProvider>(context, listen: false);
      _provider?.addListener(_onProviderChanged);
    });
  }

  @override
  void didUpdateWidget(covariant MultipleChoiceGameWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    _generateOptions();
  }

  @override
  void dispose() {
    // Clean up provider listener
    try {
      _provider?.removeListener(_onProviderChanged);
    } catch (_) {}
    super.dispose();
  }

  void _onProviderChanged() {
    if (!mounted) return;
    final provider =
        _provider ?? Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) return;

    // Build a simple key to detect puzzle identity changes
    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final start = isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final end = isArabic ? puzzle.endWordAr : puzzle.endWordEn;
    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    final key =
        '$start|$end|${steps.length}|${steps.map((s) => s.word).join(',')}';

    if (key != _lastPuzzleKey) {
      _lastPuzzleKey = key;
      setState(() {
        _currentStepIndex = 0;
      });
      _generateOptions();
    }
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
    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;

    if (_currentStepIndex >= steps.length) {
      // Should trigger next puzzle
      return;
    }

    // Get options directly from the puzzle data
    List<String> options = List.from(steps[_currentStepIndex].options);
    String correctWord = steps[_currentStepIndex].word;

    // Safety check: Ensure correct word is in options
    bool found = options.any(
      (o) => o.trim().toLowerCase() == correctWord.trim().toLowerCase(),
    );
    if (!found) {
      if (options.isNotEmpty) options.removeLast(); // Make space
      options.add(correctWord);
    }

    setState(() {
      _currentOptions = options;
      // Options are already shuffled by backend, but we can shuffle again to be safe
      _currentOptions.shuffle();
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
      provider.incrementScore(1); // Reward
      setState(() {
        _currentStepIndex++;
      });

      final puzzle = provider.currentPuzzle!;
      final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;

      if (_currentStepIndex >= steps.length) {
        // Win Condition for this puzzle
        provider.incrementScore(5); // Completion Bonus
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
                if (mounted && provider.isLevelComplete) {
                  _showLevelCompleteDialog(context, isArabic);
                }
              });
            },
            child: const Text("Next"),
          ),
        ],
      ),
    );
  }

  void _showLevelCompleteDialog(BuildContext context, bool isArabic) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text("✅"),
        content: Text(
          isArabic
              ? "تم إكمال المرحلة! تم فتح المرحلة التالية."
              : "Level complete! The next level is unlocked.",
        ),
        actions: [
          TextButton(
            onPressed: () {
              // Close dialog, then pop GamePlayView and GameModeSelectionView back to LevelsView.
              Navigator.of(context)
                ..pop()
                ..pop()
                ..pop();
            },
            child: Text(isArabic ? "العودة للمراحل" : "Back to levels"),
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

    // If no puzzle, check if it's an error or actually complete
    if (puzzle == null) {
      if (provider.isLevelComplete) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 48),
              const SizedBox(height: 16),
              Text(
                isArabic ? "تم إكمال المرحلة!" : "Level Complete!",
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => _showLevelCompleteDialog(context, isArabic),
                child: Text(isArabic ? "متابعة" : "Continue"),
              ),
            ],
          ),
        );
      }

      if (provider.errorMessage != null) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text(
                provider.errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.red),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text("Go Back"),
              ),
            ],
          ),
        );
      }
      return const Center(
        child: Text(
          "Level Complete!",
          style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      );
    }

    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;

    // Safety check if we switched puzzles and index is out of bounds
    if (_currentStepIndex > steps.length) _currentStepIndex = 0;

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
              ...List.generate(steps.length, (index) {
                String text = (index < _currentStepIndex)
                    ? steps[index].word
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
                          color: (index == steps.length - 1 && isSolved)
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
          if (_currentStepIndex < steps.length &&
              _currentOptions.isNotEmpty) ...[
            Text(
              isArabic ? "اختر الخطوة القادمة:" : "Choose the next step:",
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),

            // Using GridView for better organization "خطأ تنظيمي"
            SizedBox(
              height: 250, // Fixed height for options area
              child: GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2, // 2 items per row = clean layout
                  childAspectRatio: 2.5, // rectangular buttons
                  crossAxisSpacing: 15,
                  mainAxisSpacing: 15,
                ),
                itemCount: _currentOptions.length,
                itemBuilder: (context, index) {
                  final word = _currentOptions[index];
                  return ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                      textStyle: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    onPressed: () => _handleOptionSelected(word),
                    child: Text(
                      word,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  );
                },
              ),
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
