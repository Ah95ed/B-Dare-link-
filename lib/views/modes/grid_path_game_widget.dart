import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../controllers/game_provider.dart';
import '../../controllers/locale_provider.dart';
import '../../models/game_puzzle.dart';
import 'dart:math';
import '../../l10n/app_localizations.dart';

class GridPathGameWidget extends StatefulWidget {
  const GridPathGameWidget({super.key});

  @override
  State<GridPathGameWidget> createState() => _GridPathGameWidgetState();
}

class _GridPathGameWidgetState extends State<GridPathGameWidget> {
  // Grid State
  List<String> _gridWords = [];
  int _gridSize = 3; // 3x3 grid
  final List<int> _selectedIndices = [];
  String? _puzzleKey;

  @override
  void initState() {
    super.initState();
    _generateGrid();
  }

  @override
  void didUpdateWidget(covariant GridPathGameWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    final provider = Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) return;

    final nextKey = _puzzleKeyFor(puzzle);
    if (_puzzleKey != nextKey) {
      setState(() {
        _selectedIndices.clear();
        _puzzleKey = nextKey;
        _generateGrid();
      });
    }
  }

  String _puzzleKeyFor(GamePuzzle puzzle) {
    final id = puzzle.puzzleId;
    if (id != null && id.isNotEmpty) return id;

    return '${puzzle.startWordEn}|${puzzle.endWordEn}|${puzzle.startWordAr}|${puzzle.endWordAr}|${puzzle.stepsEn.length}|${puzzle.stepsAr.length}';
  }

  void _generateGrid() {
    final provider = Provider.of<GameProvider>(context, listen: false);
    final puzzle = provider.currentPuzzle;
    if (puzzle == null) return;

    _puzzleKey = _puzzleKeyFor(puzzle);

    final isArabic =
        Provider.of<LocaleProvider>(
          context,
          listen: false,
        ).locale.languageCode ==
        'ar';
    final steps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    final solution = steps.map((s) => s.word).toList();
    final start = isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final end = isArabic ? puzzle.endWordAr : puzzle.endWordEn;

    // Full path: Start -> ...Steps... -> End
    List<String> fullPath = [start, ...solution, end];

    // Determine grid size based on path length (at least ensure path fits)
    int requiredCells = fullPath.length;
    _gridSize = sqrt(requiredCells).ceil();
    if (_gridSize < 3) _gridSize = 3; // Minimum 3x3

    int totalCells = _gridSize * _gridSize;

    // Fill grid with random words first
    List<String> randomWords = isArabic
        ? [
            "ماء",
            "هواء",
            "تراب",
            "نار",
            "شجر",
            "حجر",
            "فضاء",
            "كوكب",
            "نجوم",
            "قمر",
          ]
        : [
            "Water",
            "Air",
            "Earth",
            "Fire",
            "Tree",
            "Stone",
            "Space",
            "Planet",
            "Star",
            "Moon",
          ];

    _gridWords = List.generate(
      totalCells,
      (_) => randomWords[Random().nextInt(randomWords.length)],
    );

    Set<int> usedIndices = {};

    // Place Start/Steps/End
    for (var word in fullPath) {
      int idx;
      do {
        idx = Random().nextInt(totalCells);
      } while (usedIndices.contains(idx));

      _gridWords[idx] = word;
      usedIndices.add(idx);
    }
  }

  void _handleTap(int index) {
    if (_selectedIndices.contains(index)) return; // Already selected

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
    final start = isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final end = isArabic ? puzzle.endWordAr : puzzle.endWordEn;

    List<String> fullPath = [start, ...solution, end];

    // Check if the tapped word is the NEXT expected word
    // Expected index in path = _selectedIndices.length
    String tappedWord = _gridWords[index];
    String expectedWord = fullPath[_selectedIndices.length];

    if (tappedWord == expectedWord) {
      provider.incrementScore(1);
      setState(() {
        _selectedIndices.add(index);
      });

      if (_selectedIndices.length == fullPath.length) {
        provider.incrementScore(5);
        _showPuzzleCompleteDialog(context, isArabic);
      }
    } else {
      // Wrong tap
      provider.decrementLives();
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.wrongChoice),
          backgroundColor: Colors.red,
          duration: Duration(milliseconds: 500),
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
        content: Text(l10n.amazing),
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
                  _selectedIndices.clear();
                  _generateGrid();
                });
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

    final start = isArabic ? puzzle.startWordAr : puzzle.startWordEn;
    final end = isArabic ? puzzle.endWordAr : puzzle.endWordEn;
    final instructionText = isArabic
        ? 'اضغط على الكلمات بالترتيب: $start <- ... <- $end'
        : "Tap words in order: $start -> ... -> $end";

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text(
            instructionText,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.all(20),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: _gridSize,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemCount: _gridWords.length,
            itemBuilder: (context, index) {
              bool isSelected = _selectedIndices.contains(index);
              return GestureDetector(
                onTap: () => _handleTap(index),
                child: Container(
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.green : Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(15),
                    border: Border.all(color: Colors.blue.shade200),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    _gridWords[index],
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                      fontSize: 16,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
