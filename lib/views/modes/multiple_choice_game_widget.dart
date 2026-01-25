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
  final List<String> _currentOptions = [];
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
    _onProviderChanged();
  }

  @override
  void dispose() {
    _provider?.removeListener(_onProviderChanged);
    super.dispose();
  }

  void _onProviderChanged() {
    if (!mounted) return;
    final provider =
        _provider ?? Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) return;

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
        '${provider.currentPuzzleIndex}|$start|$end|${steps.length}|${steps.map((s) => s.word).join(',')}';

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
      _currentOptions
        ..clear()
        ..addAll(options);
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
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
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
    final startWord = isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final endWord = isArabic ? puzzle.endWordAr : puzzle.endWordEn;
    final hint = isArabic ? puzzle.hintAr : puzzle.hintEn;
    final questionText = isArabic
        ? 'ما الرابط بين "$startWord" و"$endWord"؟'
        : 'What links "$startWord" and "$endWord"?';

    // Safety check if we switched puzzles and index is out of bounds
    if (_currentStepIndex > steps.length) _currentStepIndex = 0;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Question & Options Area (Modern Card)
          if (_currentStepIndex < steps.length &&
              _currentOptions.isNotEmpty) ...[
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.blueGrey.shade900.withOpacity(0.9),
                    Colors.blueGrey.shade800.withOpacity(0.6),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Colors.cyanAccent.withOpacity(0.25),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.25),
                    blurRadius: 16,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    questionText,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      height: 1.4,
                    ),
                    textAlign: TextAlign.start,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isArabic
                        ? 'اختر الخيار الصحيح لإكمال الرابط'
                        : 'Choose the correct option to complete the link',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.cyanAccent.withOpacity(0.8),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (hint.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.cyanAccent.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.cyanAccent.withOpacity(0.25),
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('💡', style: TextStyle(fontSize: 18)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              hint,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 12,
                                height: 1.4,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 2.4,
                          crossAxisSpacing: 12,
                          mainAxisSpacing: 12,
                        ),
                    itemCount: _currentOptions.length,
                    itemBuilder: (context, index) {
                      final word = _currentOptions[index];
                      final letter = String.fromCharCode(65 + index);
                      final chainWords = List<String>.from(
                        steps.map((s) => s.word),
                      );
                      if (_currentStepIndex < chainWords.length) {
                        chainWords[_currentStepIndex] = word;
                      }
                      final chainText = chainWords.join(' → ');
                      return InkWell(
                        borderRadius: BorderRadius.circular(14),
                        onTap: () => _handleOptionSelected(word),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: Colors.white.withOpacity(0.12),
                            ),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 28,
                                height: 28,
                                alignment: Alignment.center,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.cyanAccent.withOpacity(0.15),
                                  border: Border.all(
                                    color: Colors.cyanAccent.withOpacity(0.6),
                                  ),
                                ),
                                child: Text(
                                  letter,
                                  style: const TextStyle(
                                    color: Colors.cyanAccent,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  chainText,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 13,
                                    height: 1.2,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Widget buildNode(String text, bool isEnd) {
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

  Widget buildStepNode(String text, bool isSolved, bool isCurrent) {
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
