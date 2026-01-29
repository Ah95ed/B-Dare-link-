import 'dart:math';
import '../../models/game_puzzle.dart';

/// Handles multiple choice game logic and option generation
class MultipleChoiceGameLogic {
  /// Builds 4 different option chains and shuffles them
  /// The correct answer (optionA) will be placed at a random but consistent position
  /// Returns the shuffled options and updates correctAnswerIndex
  static List<List<String>> buildPaths(
    List<dynamic> steps,
    List<GamePuzzle> puzzlePool,
    bool isArabic,
  ) {
    final baseSteps = steps.map((s) => s.word as String).toList();

    if (baseSteps.isEmpty) {
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

    // Correct answer index is tracked for UI feedback
    // (not currently used in return value)
    optionsWithIndex.indexWhere((item) => item['isCorrect'] == true);

    return optionsWithIndex
        .map((item) => item['option'] as List<String>)
        .toList();
  }
}
