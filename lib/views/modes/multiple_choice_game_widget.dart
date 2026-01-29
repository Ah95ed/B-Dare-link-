import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import '../../controllers/game_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../models/game_puzzle.dart';
import '../auth/login_screen.dart';
import '../levels_view.dart';
import '../../l10n/app_localizations.dart';

class MultipleChoiceGameWidget extends StatefulWidget {
  const MultipleChoiceGameWidget({super.key});

  @override
  State<MultipleChoiceGameWidget> createState() =>
      _MultipleChoiceGameWidgetState();
}

class _MultipleChoiceGameWidgetState extends State<MultipleChoiceGameWidget> {
  /// Tracks selected path index (0=A, 1=B, 2=C, 3=D)
  int? _selectedPathIndex;
  late final GameProvider? _provider;
  String? _lastPuzzleKey;

  /// Index of correct answer after shuffling (0-3)
  int _correctAnswerIndex = 0;

  @override
  void initState() {
    super.initState();
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
        _selectedPathIndex = null;
      });
    }
  }

  /// Handles answer selection with proper validation
  void _handleAnswerSelected(int optionIndex) {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final puzzle = provider.currentPuzzle;

    if (puzzle == null || _selectedPathIndex != null) return;

    setState(() {
      _selectedPathIndex = optionIndex;
    });

    // Check if selected option matches the correct answer index
    final isCorrect = optionIndex == _correctAnswerIndex;

    if (isCorrect) {
      provider.incrementScore(10);
      Future.delayed(const Duration(milliseconds: 600), () {
        if (mounted) {
          _showCorrectDialog(context, isArabic);
        }
      });
    } else {
      provider.decrementLives();
      Future.delayed(const Duration(milliseconds: 800), () {
        if (mounted) {
          setState(() {
            _selectedPathIndex = null;
          });
          final l10n = AppLocalizations.of(context)!;
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                l10n.tryAgain,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              backgroundColor: Colors.red.shade700,
              duration: const Duration(milliseconds: 1800),
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          );
        }
      });
    }
  }

  void _showCorrectDialog(BuildContext context, bool isArabic) {
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text("🎉"),
        content: Text(l10n.greatJob),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              final provider = Provider.of<GameProvider>(
                context,
                listen: false,
              );
              provider.advancePuzzle().then((_) {
                setState(() {
                  _selectedPathIndex = null;
                });
                if (mounted && provider.isLevelComplete) {
                  _showLevelCompleteDialog(context, isArabic);
                }
              });
            },
            child: Text(l10n.next),
          ),
        ],
      ),
    );
  }

  void _showLevelCompleteDialog(BuildContext context, bool isArabic) {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final requiresAuth = provider.requiresAuthToAdvance;
    final l10n = AppLocalizations.of(context)!;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: Text(requiresAuth ? "🔒" : "✅"),
        content: Text(requiresAuth ? l10n.authRequired : l10n.levelCompleted),
        actions: [
          if (requiresAuth)
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              child: Text(l10n.login),
            ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close dialog
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LevelsView()),
              );
            },
            child: Text(l10n.backToLevels),
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
    if (puzzle == null) {
      if (provider.isLevelComplete) {
        final requiresAuth = provider.requiresAuthToAdvance;
        final l10n = AppLocalizations.of(context)!;
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 48),
              const SizedBox(height: 16),
              Text(
                l10n.levelComplete,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (requiresAuth) ...[
                const SizedBox(height: 8),
                Text(
                  l10n.cantAdvanceWithoutLogin,
                  style: const TextStyle(fontSize: 14, color: Colors.white70),
                  textAlign: TextAlign.center,
                ),
              ],
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => _showLevelCompleteDialog(context, isArabic),
                child: Text(l10n.continueButton),
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
                style: const TextStyle(fontSize: 16, color: Colors.white),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        );
      }

      return const Center(child: CircularProgressIndicator());
    }

    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    final startWord = isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final endWord = isArabic ? puzzle.endWordAr : puzzle.endWordEn;
    final hint = isArabic ? puzzle.hintAr : puzzle.hintEn;
    final l10n = AppLocalizations.of(context)!;
    final questionText = isArabic
        ? 'ما الذي يربط بين "$startWord" و "$endWord"؟'
        : 'What links "$startWord" and "$endWord"?';

    final paths = _buildPaths(
      steps,
      provider.currentLevel?.puzzles ?? const <GamePuzzle>[],
      isArabic,
    );

    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Question Header
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.blueGrey.shade900.withOpacity(0.95),
                    Colors.blueGrey.shade800.withOpacity(0.7),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.cyanAccent.withOpacity(0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    questionText,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    l10n.chooseCorrectOption,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.cyanAccent.withOpacity(0.85),
                      fontWeight: FontWeight.w600,
                      height: 1.4,
                    ),
                  ),
                  if (hint.isNotEmpty) ...[
                    const SizedBox(height: 14),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.cyanAccent.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: Colors.cyanAccent.withOpacity(0.3),
                        ),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('💡', style: TextStyle(fontSize: 18)),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              hint,
                              style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13,
                                height: 1.4,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Options Grid - Modern Card Design
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 4,
              itemBuilder: (context, idx) {
                final optionLabel = String.fromCharCode(65 + idx);
                final isSelected = _selectedPathIndex == idx;
                final isCorrect = idx == _correctAnswerIndex;
                final showResult = isSelected;
                final pathSteps = paths[idx];

                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: GestureDetector(
                    onTap: () => _handleAnswerSelected(idx),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 400),
                      curve: Curves.easeInOut,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: showResult
                              ? (isCorrect
                                    ? [
                                        const Color(
                                          0xFF10B981,
                                        ).withOpacity(0.25),
                                        const Color(
                                          0xFF059669,
                                        ).withOpacity(0.15),
                                      ]
                                    : [
                                        const Color(
                                          0xFFEF4444,
                                        ).withOpacity(0.25),
                                        const Color(
                                          0xFFDC2626,
                                        ).withOpacity(0.15),
                                      ])
                              : [
                                  Colors.white.withOpacity(0.08),
                                  Colors.white.withOpacity(0.04),
                                ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: showResult
                              ? (isCorrect
                                    ? const Color(0xFF10B981).withOpacity(0.7)
                                    : const Color(0xFFEF4444).withOpacity(0.7))
                              : Colors.white.withOpacity(0.2),
                          width: showResult ? 3 : 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: showResult
                                ? (isCorrect
                                      ? const Color(0xFF10B981).withOpacity(0.4)
                                      : const Color(
                                          0xFFEF4444,
                                        ).withOpacity(0.4))
                                : Colors.black.withOpacity(0.15),
                            blurRadius: showResult ? 16 : 8,
                            spreadRadius: showResult ? 2 : 0,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            // Option Label (A, B, C, D)
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: showResult
                                    ? (isCorrect
                                          ? const Color(0xFF10B981)
                                          : const Color(0xFFEF4444))
                                    : Colors.white.withOpacity(0.1),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: showResult
                                      ? Colors.white.withOpacity(0.5)
                                      : Colors.white.withOpacity(0.3),
                                  width: 2,
                                ),
                              ),
                              child: Center(
                                child: showResult && isCorrect
                                    ? const Icon(
                                        Icons.check_rounded,
                                        color: Colors.white,
                                        size: 24,
                                      )
                                    : showResult && !isCorrect
                                    ? const Icon(
                                        Icons.close_rounded,
                                        color: Colors.white,
                                        size: 24,
                                      )
                                    : Text(
                                        optionLabel,
                                        style: const TextStyle(
                                          fontSize: 20,
                                          fontWeight: FontWeight.w900,
                                          color: Colors.white,
                                        ),
                                      ),
                              ),
                            ),

                            const SizedBox(width: 16),

                            // Option Chain - Simple Horizontal Display
                            Expanded(
                              child: Text(
                                pathSteps.join(' - '),
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: showResult
                                      ? Colors.white.withOpacity(0.95)
                                      : Colors.white.withOpacity(0.85),
                                  height: 1.4,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),

            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  /// Builds 4 different option chains and shuffles them
  /// The correct answer (optionA) will be placed at a random but consistent position
  /// Returns the shuffled options and updates _correctAnswerIndex
  List<List<String>> _buildPaths(
    List<dynamic> steps,
    List<GamePuzzle> puzzlePool,
    bool isArabic,
  ) {
    final baseSteps = steps.map((s) => s.word as String).toList();

    if (baseSteps.isEmpty) {
      _correctAnswerIndex = 0;
      return [
        ['خيار', 'واحد'],
        ['خيار', 'اثنان'],
        ['خيار', 'ثلاثة'],
        ['خيار', 'أربعة'],
      ];
    }

    String buildKey(List<String> option) => option.join(' - ').trim();

    List<String> stepsFromPuzzle(GamePuzzle puzzle) {
      final puzzleSteps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
      return puzzleSteps
          .map((s) => s.word)
          .where((w) => w.trim().isNotEmpty)
          .toList();
    }

    void addUniqueOption(
      List<String> option,
      List<List<String>> wrongOptions,
      Set<String> usedOptions,
    ) {
      if (option.isEmpty) return;
      final key = buildKey(option);
      if (!usedOptions.contains(key)) {
        wrongOptions.add(option);
        usedOptions.add(key);
      }
    }

    final optionA = List<String>.from(baseSteps);
    final wrongOptions = <List<String>>[];
    final usedOptions = <String>{};
    usedOptions.add(buildKey(optionA));

    final otherPaths = <List<String>>[];
    for (final puzzle in puzzlePool) {
      final stepsList = stepsFromPuzzle(puzzle);
      if (stepsList.isNotEmpty && buildKey(stepsList) != buildKey(baseSteps)) {
        otherPaths.add(stepsList);
      }
    }
    final otherSeed = baseSteps.join().hashCode ^ 0x6D2B79F5;
    otherPaths.shuffle(Random(otherSeed));
    for (final option in otherPaths) {
      addUniqueOption(option, wrongOptions, usedOptions);
      if (wrongOptions.length >= 3) break;
    }

    addUniqueOption(baseSteps.reversed.toList(), wrongOptions, usedOptions);
    if (baseSteps.length > 1) {
      addUniqueOption(
        [...baseSteps.skip(1), baseSteps.first],
        wrongOptions,
        usedOptions,
      );
    }
    if (baseSteps.length > 2) {
      addUniqueOption(
        [...baseSteps.skip(2), ...baseSteps.take(2)],
        wrongOptions,
        usedOptions,
      );
    }

    int seed = baseSteps.join().hashCode;
    int attempts = 0;
    while (wrongOptions.length < 3 && attempts < 60) {
      seed = (seed * 31 + attempts * 7919) ^ (baseSteps.length * 1009);
      final shuffled = List<String>.from(baseSteps);
      if (shuffled.length > 1) {
        final random = Random(seed);
        for (int pass = 0; pass < 2; pass++) {
          for (int i = shuffled.length - 1; i > 0; i--) {
            final j = random.nextInt(i + 1);
            final temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
          }
        }
      }
      addUniqueOption(shuffled, wrongOptions, usedOptions);
      attempts++;
    }

    if (baseSteps.length >= 3) {
      for (int i = 0; i < baseSteps.length && wrongOptions.length < 3; i++) {
        final variant = List<String>.from(baseSteps)..removeAt(i);
        addUniqueOption(variant, wrongOptions, usedOptions);
      }
    }

    if (baseSteps.length <= 2) {
      addUniqueOption(
        [baseSteps.first, ...baseSteps],
        wrongOptions,
        usedOptions,
      );
      addUniqueOption(
        [...baseSteps, baseSteps.last],
        wrongOptions,
        usedOptions,
      );
      if (baseSteps.length == 2) {
        addUniqueOption(
          [baseSteps[1], baseSteps[0], baseSteps[1]],
          wrongOptions,
          usedOptions,
        );
      }
    }

    int repeatCount = 1;
    while (wrongOptions.length < 3 && repeatCount <= 4) {
      final extended = List<String>.from(baseSteps);
      for (int i = 0; i < repeatCount; i++) {
        extended.add(baseSteps[i % baseSteps.length]);
      }
      addUniqueOption(extended, wrongOptions, usedOptions);
      repeatCount++;
    }

    while (wrongOptions.length > 3) {
      wrongOptions.removeLast();
    }
    while (wrongOptions.length < 3) {
      final extended = [...baseSteps, ...baseSteps];
      addUniqueOption(extended, wrongOptions, usedOptions);
      if (wrongOptions.length < 3) {
        addUniqueOption(
          [...extended, baseSteps.first],
          wrongOptions,
          usedOptions,
        );
      }
      if (wrongOptions.length < 3) {
        break;
      }
    }

    final optionsWithIndex = [
      {'option': optionA, 'isCorrect': true, 'originalIndex': 0},
      {'option': wrongOptions[0], 'isCorrect': false, 'originalIndex': 1},
      {'option': wrongOptions[1], 'isCorrect': false, 'originalIndex': 2},
      {'option': wrongOptions[2], 'isCorrect': false, 'originalIndex': 3},
    ];

    final shuffleSeed = baseSteps.join().hashCode ^ 99999;
    final shuffleRandom = Random(shuffleSeed);
    optionsWithIndex.shuffle(shuffleRandom);

    _correctAnswerIndex = optionsWithIndex.indexWhere(
      (item) => item['isCorrect'] == true,
    );

    return optionsWithIndex
        .map((item) => item['option'] as List<String>)
        .toList();
  }
}
