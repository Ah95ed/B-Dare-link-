import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../controllers/game_provider.dart';
import '../l10n/app_localizations.dart';

class GameView extends StatefulWidget {
  const GameView({super.key});

  @override
  State<GameView> createState() => _GameViewState();
}

class _GameViewState extends State<GameView> {
  final TextEditingController _startController = TextEditingController();
  final TextEditingController _endController = TextEditingController();
  final List<TextEditingController> _stepControllers = [
    TextEditingController(),
    TextEditingController(),
    TextEditingController(),
  ];

  // Persistent selection indices for current puzzle multiple-choice answers
  List<int?> _selectedIndices = [];
  String _puzzleKey = '';

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final gameProvider = Provider.of<GameProvider>(context);

    // Determine current puzzle steps (prefer English if available)
    final puzzle = gameProvider.currentPuzzle;
    final steps = puzzle == null
        ? null
        : (puzzle.stepsEn.isNotEmpty ? puzzle.stepsEn : puzzle.stepsAr);

    // Initialize persistent selected indices when puzzle changes
    if (steps != null) {
      final p = puzzle!;
      final key = '${p.startWordEn}-${p.endWordEn}-${steps.length}';
      if (_puzzleKey != key) {
        _puzzleKey = key;
        _selectedIndices = List<int?>.filled(steps.length, null);
      }
    } else {
      _puzzleKey = '';
      _selectedIndices = [];
    }

    // Initial fill from provider if controllers are empty and provider has data
    if (_startController.text.isEmpty &&
        (gameProvider.currentRound?.startWord.isNotEmpty ?? false)) {
      _startController.text = gameProvider.currentRound!.startWord;
    }
    if (_endController.text.isEmpty &&
        (gameProvider.currentRound?.endWord.isNotEmpty ?? false)) {
      _endController.text = gameProvider.currentRound!.endWord;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.appTitle),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(8.r),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // HUD: lives, score, timer
            Card(
              child: Padding(
                padding: EdgeInsets.all(8.r),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    Column(
                      children: [
                        Text(l10n.livesLabel),
                        Text('${gameProvider.lives}'),
                      ],
                    ),
                    Column(
                      children: [
                        Text(l10n.scoreTitle),
                        Text('${gameProvider.score}'),
                      ],
                    ),
                    Column(
                      children: [
                        Text(l10n.timeLabel),
                        Text(l10n.secondsShort(gameProvider.timeLeft)),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: 12.h),

            // If there's a current puzzle, show MCQ UI
            if (puzzle != null && steps != null) ...[
              Text(
                '${l10n.linkStart}: ${gameProvider.currentRound?.startWord ?? ''}',
                style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8.h),
              ...List.generate(steps.length, (i) {
                final step = steps[i];
                return Padding(
                  padding: EdgeInsets.symmetric(vertical: 6.h),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${l10n.steps} ${i + 1}',
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      SizedBox(height: 6.h),
                      Wrap(
                        spacing: 8.w,
                        runSpacing: 8.h,
                        children: List.generate(step.options.length, (
                          optIndex,
                        ) {
                          final option = step.options[optIndex];
                          final selected =
                              _selectedIndices.length > i &&
                              _selectedIndices[i] == optIndex;
                          return ChoiceChip(
                            label: Text(option),
                            selected: selected,
                            onSelected: (v) {
                              setState(() {
                                if (_selectedIndices.length > i) {
                                  _selectedIndices[i] = v ? optIndex : null;
                                }
                              });
                            },
                          );
                        }),
                      ),
                    ],
                  ),
                );
              }),
              SizedBox(height: 12.h),
              Text(
                '${l10n.linkEnd}: ${gameProvider.currentRound?.endWord ?? ''}',
                style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold),
              ),
              if (puzzle.hintEn.isNotEmpty || puzzle.hintAr.isNotEmpty)
                Padding(
                  padding: EdgeInsets.only(top: 8.h),
                  child: Text(
                    l10n.hintTitle(
                      puzzle.hintEn.isNotEmpty ? puzzle.hintEn : puzzle.hintAr,
                    ),
                  ),
                ),
              SizedBox(height: 20.h),
              SizedBox(
                width: double.infinity,
                height: 55.h,
                child: ElevatedButton(
                  onPressed: gameProvider.isLoading
                      ? null
                      : () async {
                          // collect selected words (fall back to empty strings)
                          final chosen = <String>[];
                          for (int i = 0; i < steps.length; i++) {
                            final sel = (_selectedIndices.length > i)
                                ? _selectedIndices[i]
                                : null;
                            if (sel == null ||
                                sel < 0 ||
                                sel >= steps[i].options.length) {
                              chosen.add('');
                            } else {
                              chosen.add(steps[i].options[sel]);
                            }
                          }

                          await gameProvider.validateChain(chosen);
                          if (gameProvider.currentRound?.isCompleted ?? false) {
                            _showWinDialog(context, l10n);
                          }
                        },
                  child: gameProvider.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          l10n.submit,
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ] else
            // Legacy manual input fallback
            ...[
              // Start & End inputs
              _buildWordInput(
                l10n.linkStart,
                _startController,
                Icons.trip_origin,
              ),
              SizedBox(height: 20.h),

              // The Chain steps (legacy fixed 3 fields)
              ...List.generate(_stepControllers.length, (index) {
                return Padding(
                  padding: EdgeInsets.symmetric(vertical: 8.h),
                  child: Row(
                    children: [
                      Column(
                        children: [
                          Container(
                            width: 2.w,
                            height: 20.h,
                            color: Colors.grey.shade300,
                          ),
                          Icon(
                            Icons.link,
                            color: Theme.of(context).primaryColor,
                            size: 24,
                          ),
                          Container(
                            width: 2.w,
                            height: 20.h,
                            color: Colors.grey.shade300,
                          ),
                        ],
                      ),
                      SizedBox(width: 10.w),
                      Expanded(
                        child: TextField(
                          controller: _stepControllers[index],
                          decoration: InputDecoration(
                            hintText: "${l10n.steps} ${index + 1}",
                            prefixIcon: const Icon(Icons.lightbulb_outline),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),

              SizedBox(height: 20.h),
              Icon(
                Icons.arrow_downward,
                color: Theme.of(context).colorScheme.secondary,
              ),
              SizedBox(height: 20.h),

              _buildWordInput(l10n.linkEnd, _endController, Icons.location_on),

              SizedBox(height: 40.h),

              if (gameProvider.errorMessage != null)
                Container(
                  padding: EdgeInsets.all(10.r),
                  margin: EdgeInsets.only(bottom: 20.h),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.errorContainer,
                    borderRadius: BorderRadius.circular(10.r),
                  ),
                  child: Text(
                    gameProvider.errorMessage!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.error,
                    ),
                  ),
                ),

              SizedBox(
                width: double.infinity,
                height: 55.h,
                child: ElevatedButton(
                  onPressed: gameProvider.isLoading
                      ? null
                      : () {
                          final steps = _stepControllers
                              .map((c) => c.text)
                              .toList();
                          gameProvider.startNewGame(
                            _startController.text,
                            _endController.text,
                          );
                          gameProvider.validateChain(steps).then((_) {
                            if (gameProvider.currentRound?.isCompleted ??
                                false) {
                              _showWinDialog(context, l10n);
                            }
                          });
                        },
                  child: gameProvider.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          l10n.submit,
                          style: TextStyle(
                            fontSize: 18.sp,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildWordInput(
    String label,
    TextEditingController controller,
    IconData icon,
  ) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Theme.of(context).primaryColor),
        filled: true,
        fillColor: Colors.white,
      ),
    );
  }

  void _showWinDialog(BuildContext context, AppLocalizations l10n) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("🎉"),
        content: Text(l10n.winMessage),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // potentially clear fields
            },
            child: Text(l10n.gotIt),
          ),
        ],
      ),
    );
  }
}
