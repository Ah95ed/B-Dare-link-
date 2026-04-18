import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'dart:math';
import '../../controllers/game_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../constants/app_constants.dart';
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
  int? _selectedPathIndex;
  int? _feedbackPathIndex;
  bool? _isCorrectFeedback;
  bool _isEvaluating = false;
  late final GameProvider? _provider;
  String? _lastPuzzleKey;
  List<List<String>> _pathOptions = const [];
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
      final levelPuzzles =
          provider.currentLevel?.puzzles ?? const <GamePuzzle>[];
      _lastPuzzleKey = key;
      setState(() {
        _selectedPathIndex = null;
        _feedbackPathIndex = null;
        _isCorrectFeedback = null;
        _isEvaluating = false;
        _pathOptions = _buildPathOptions(puzzle, steps, levelPuzzles, isArabic);
      });
    }
  }

  Future<void> _onPathTapped(int optionIndex) async {
    if (_isEvaluating) return;

    final provider = Provider.of<GameProvider>(context, listen: false);
    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final puzzle = provider.currentPuzzle;

    if (puzzle == null) return;

    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    if (steps.isEmpty) return;

    if (optionIndex < 0 || optionIndex >= _pathOptions.length) {
      return;
    }

    final isCorrect = optionIndex == _correctAnswerIndex;

    setState(() {
      _isEvaluating = true;
      _selectedPathIndex = optionIndex;
      _feedbackPathIndex = optionIndex;
      _isCorrectFeedback = isCorrect;
    });

    await Future.delayed(const Duration(milliseconds: 280));
    if (!mounted) return;

    if (isCorrect) {
      provider.incrementScore(AppConstants.stepScore);
    } else {
      provider.decrementLives();
    }

    await provider.advancePuzzle();

    if (!mounted) return;

    if (provider.isLevelComplete) {
      setState(() {
        _isEvaluating = false;
      });
      _showLevelCompleteDialog(context, isArabic);
      return;
    }

    // If the puzzle changed, the provider listener will rebuild the next question.
    if (mounted) {
      setState(() {
        _isEvaluating = false;
      });
    }
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
              final navigator = Navigator.of(context);
              navigator.pop(); // Close dialog
              if (navigator.canPop()) {
                navigator.pop(); // Return to existing LevelsView
              } else {
                navigator.pushReplacement(
                  MaterialPageRoute(builder: (_) => const LevelsView()),
                );
              }
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

      if (provider.totalPuzzles == 0) {
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.quiz_outlined, color: Colors.amber, size: 48),
                const SizedBox(height: 16),
                Text(
                  isArabic
                      ? 'لا توجد ألغاز في هذه المرحلة.\nافتح Run/Logcat وابحث عن [SoloD1] للتشخيص.'
                      : 'No puzzles for this level.\nCheck Run/Logcat for [SoloD1] lines.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 15,
                    color: Colors.white70,
                    height: 1.35,
                  ),
                ),
              ],
            ),
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
    final questionText = l10n.whatLinks(startWord, endWord);

    if (_pathOptions.length != 4) {
      _pathOptions = _buildPathOptions(
        puzzle,
        steps,
        provider.currentLevel?.puzzles ?? const <GamePuzzle>[],
        isArabic,
      );
    }

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

            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 4,
              itemBuilder: (context, idx) {
                final optionLabel = String.fromCharCode(65 + idx);
                final selected = _selectedPathIndex == idx;
                final feedbackTarget = _feedbackPathIndex == idx;
                final successFlash =
                    feedbackTarget && _isCorrectFeedback == true;
                final errorFlash =
                    feedbackTarget && _isCorrectFeedback == false;
                final words = _pathOptions[idx];

                return Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: GestureDetector(
                    onTap: provider.isLoading || _isEvaluating
                        ? null
                        : () => _onPathTapped(idx),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: successFlash
                              ? [
                                  Colors.greenAccent.withOpacity(0.36),
                                  Colors.green.withOpacity(0.20),
                                ]
                              : errorFlash
                              ? [
                                  Colors.redAccent.withOpacity(0.38),
                                  Colors.red.withOpacity(0.20),
                                ]
                              : selected
                              ? [
                                  const Color(0xFF00AEEF).withOpacity(0.32),
                                  const Color(0xFF22C55E).withOpacity(0.20),
                                ]
                              : [
                                  Colors.white.withOpacity(0.08),
                                  Colors.white.withOpacity(0.04),
                                ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: successFlash
                              ? Colors.greenAccent
                              : errorFlash
                              ? Colors.redAccent
                              : selected
                              ? const Color(0xFF00D1FF).withOpacity(0.9)
                              : Colors.white.withOpacity(0.2),
                          width: selected ? 2.4 : 1.6,
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 34,
                            height: 34,
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(
                                selected ? 0.28 : 0.12,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                optionLabel,
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  fontSize: 18,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              words.join(' - '),
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.95),
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                                height: 1.3,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
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

  static const List<String> _arabicFallbackWords = [
    'كتاب',
    'قلم',
    'نور',
    'علم',
    'باب',
    'صوت',
    'ورق',
    'فكر',
    'بحر',
    'شمس',
  ];

  static const List<String> _englishFallbackWords = [
    'Book',
    'Pen',
    'Light',
    'Mind',
    'Door',
    'Sound',
    'Paper',
    'Idea',
    'Sea',
    'Sun',
  ];

  List<String> _normalizeToFourWords(
    List<String> source,
    bool isArabic,
    List<String> extraPool,
  ) {
    final fallbackWords = isArabic
        ? _arabicFallbackWords
        : _englishFallbackWords;
    final seen = <String>{};
    final normalized = <String>[];

    void addWord(String word) {
      final cleaned = word.trim();
      if (cleaned.isEmpty) return;
      if (RegExp(r'[0-9_]').hasMatch(cleaned)) return;
      final key = cleaned.toLowerCase();
      if (seen.contains(key)) return;
      seen.add(key);
      normalized.add(cleaned);
    }

    for (final word in source) {
      addWord(word);
      if (normalized.length >= 4) break;
    }

    if (normalized.length < 4) {
      for (final word in extraPool) {
        addWord(word);
        if (normalized.length >= 4) break;
      }
    }

    for (final word in fallbackWords) {
      if (normalized.length >= 4) break;
      addWord(word);
    }

    while (normalized.length < 4) {
      for (final word in fallbackWords) {
        if (normalized.length >= 4) break;
        addWord(word);
      }
      if (normalized.length < 4) break;
    }

    if (normalized.isEmpty) {
      return const ['-', '-', '-', '-'];
    }

    if (normalized.length > 4) {
      return normalized.take(4).toList();
    }

    return normalized;
  }

  List<List<String>> _buildPathOptions(
    GamePuzzle puzzle,
    List<dynamic> steps,
    List<GamePuzzle> puzzlePool,
    bool isArabic,
  ) {
    final baseSteps = steps.map((s) => s.word.toString().trim()).toList();
    final poolWords = <String>[
      ...baseSteps,
      ...puzzlePool.expand(
        (puzzle) => isArabic
            ? puzzle.stepsAr.map((s) => s.word)
            : puzzle.stepsEn.map((s) => s.word),
      ),
    ];
    final targetFour = _normalizeToFourWords(baseSteps, isArabic, poolWords);

    final backendPathOptions = puzzle.pathOptions;
    if (backendPathOptions != null && backendPathOptions.length == 4) {
      final parsed = backendPathOptions
          .map((option) => option.split(RegExp(r'\s+')).toList())
          .map((words) => _normalizeToFourWords(words, isArabic, poolWords))
          .toList();

      if (parsed.length == 4) {
        final targetKey = targetFour.map((w) => w.toLowerCase()).join('|');
        final correctPath = parsed.firstWhere(
          (option) =>
              option.map((w) => w.toLowerCase()).join('|') == targetKey,
          orElse: () {
            final idx = puzzle.correctPathIndex;
            if (idx != null && idx >= 0 && idx < 4) {
              return parsed[idx];
            }
            return parsed.first;
          },
        );

        final shuffled = List<List<String>>.from(parsed);
        shuffled.shuffle(
          Random(
            (puzzle.puzzleId ?? steps.map((s) => s.word).join('|')).hashCode,
          ),
        );

        _correctAnswerIndex = shuffled.indexWhere(
          (option) =>
              option.map((w) => w.toLowerCase()).join('|') ==
              correctPath.map((w) => w.toLowerCase()).join('|'),
        );
        if (_correctAnswerIndex < 0) {
          _correctAnswerIndex = 0;
        }

        return shuffled;
      }
    }

    final optionA = targetFour;

    String keyOf(List<String> list) => list.join('|');

    final used = <String>{keyOf(optionA)};
    final wrongOptions = <List<String>>[];

    void addOption(List<String> option) {
      final normalized = _normalizeToFourWords(option, isArabic, poolWords);
      final key = keyOf(normalized);
      if (normalized.toSet().length != normalized.length) return;
      if (used.contains(key)) return;
      used.add(key);
      wrongOptions.add(normalized);
    }

    for (final puzzle in puzzlePool) {
      final words = (isArabic ? puzzle.stepsAr : puzzle.stepsEn)
          .map((s) => s.word)
          .toList();
      addOption(words);
      if (wrongOptions.length >= 3) break;
    }

    addOption(baseSteps.reversed.toList());
    if (baseSteps.length > 1) {
      addOption([...baseSteps.skip(1), baseSteps.first]);
    }

    int seed = baseSteps.join().hashCode ^ 0x9E3779B9;
    int attempts = 0;
    while (wrongOptions.length < 3 && attempts < 50) {
      final shuffled = List<String>.from(baseSteps);
      if (shuffled.length > 1) {
        final random = Random(seed + attempts * 97);
        shuffled.shuffle(random);
      }
      addOption(shuffled);
      attempts++;
    }

    while (wrongOptions.length < 3) {
      addOption([...baseSteps, ...poolWords]);
      if (wrongOptions.length < 3) {
        addOption([optionA[1], optionA[0], optionA[3], optionA[2]]);
      }
      if (wrongOptions.length < 3) {
        addOption([optionA[2], optionA[3], optionA[0], optionA[1]]);
      }
      if (wrongOptions.length < 3) break;
    }

    final options = [
      {'words': optionA, 'isCorrect': true},
      {'words': wrongOptions[0], 'isCorrect': false},
      {'words': wrongOptions[1], 'isCorrect': false},
      {'words': wrongOptions[2], 'isCorrect': false},
    ];

    final random = Random(baseSteps.join().hashCode ^ 0x00C0FFEE);
    options.shuffle(random);

    _correctAnswerIndex = options.indexWhere((e) => e['isCorrect'] == true);

    return options.map((e) => e['words'] as List<String>).toList();
  }
}
