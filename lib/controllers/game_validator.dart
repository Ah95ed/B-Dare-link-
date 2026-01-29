import '../models/game_puzzle.dart';

/// Validates game moves and puzzle chains
class GameValidator {
  /// Banned words for validation
  static final Set<String> bannedMetaWordsAr = {
    'بداية',
    'نهاية',
    'كلمة',
    'خطوة',
    'لغز',
    'سؤال',
    'جواب',
    'إجابة',
    'رابط',
    'سلسلة',
    'مستوى',
    'مرحلة',
  };

  static final Set<String> bannedMetaWordsEn = {
    'start',
    'end',
    'word',
    'step',
    'puzzle',
    'question',
    'answer',
    'chain',
    'level',
    'stage',
    'new',
  };

  /// Check if answer is correct
  static bool isAnswerCorrect(
    List<String> userSteps,
    GamePuzzle puzzle,
    bool isArabic,
  ) {
    final correctSteps = isArabic ? puzzle.stepsAr : puzzle.stepsEn;
    if (userSteps.length != correctSteps.length) return false;

    for (int i = 0; i < userSteps.length; i++) {
      final userWord = userSteps[i].trim().toLowerCase();
      final correctWord = correctSteps[i].word.trim().toLowerCase();
      if (userWord != correctWord) return false;
    }
    return true;
  }

  /// Check if word is banned meta word
  static bool isBannedMetaWord(String word, bool isArabic) {
    final normalized = word.trim().toLowerCase();
    final bannedSet = isArabic ? bannedMetaWordsAr : bannedMetaWordsEn;
    return bannedSet.contains(normalized);
  }
}
