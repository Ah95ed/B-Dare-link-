import 'package:flutter/material.dart';

/// Story data for each level
class LevelStory {
  final int levelId;
  final String titleAr;
  final String titleEn;
  final String introAr;
  final String introEn;
  final String characterAr;
  final String characterEn;
  final String characterEmoji;
  final String? completionAr;
  final String? completionEn;

  const LevelStory({
    required this.levelId,
    required this.titleAr,
    required this.titleEn,
    required this.introAr,
    required this.introEn,
    required this.characterAr,
    required this.characterEn,
    required this.characterEmoji,
    this.completionAr,
    this.completionEn,
  });

  String getTitle(bool isArabic) => isArabic ? titleAr : titleEn;
  String getIntro(bool isArabic) => isArabic ? introAr : introEn;
  String getCharacter(bool isArabic) => isArabic ? characterAr : characterEn;
  String? getCompletion(bool isArabic) =>
      isArabic ? completionAr : completionEn;
}

/// Manages story/narrative progression
class StoryProvider extends ChangeNotifier {
  // Story data for all levels
  static const List<LevelStory> levelStories = [
    LevelStory(
      levelId: 1,
      titleAr: 'بداية الرحلة',
      titleEn: 'The Beginning',
      introAr:
          'مرحباً أيها المستكشف! أنا حكيم، سأكون دليلك في رحلة الروابط العجيبة. هيا نبدأ بتعلم كيفية ربط الأشياء...',
      introEn:
          'Hello explorer! I am Hakim, your guide on this journey of wonder links. Let us begin learning how to connect things...',
      characterAr: 'حكيم',
      characterEn: 'Hakim',
      characterEmoji: '🧙',
      completionAr: 'أحسنت! لقد أثبتّ أنك تفهم أساسيات الربط.',
      completionEn:
          'Well done! You have proven you understand the basics of linking.',
    ),
    LevelStory(
      levelId: 2,
      titleAr: 'عالم الطبيعة',
      titleEn: 'World of Nature',
      introAr:
          'الطبيعة مليئة بالروابط المخفية. دعنا نكتشف كيف ترتبط عناصر الطبيعة ببعضها...',
      introEn:
          'Nature is full of hidden connections. Let us discover how nature elements link together...',
      characterAr: 'حكيم',
      characterEn: 'Hakim',
      characterEmoji: '🌿',
      completionAr: 'رائع! أنت تفهم لغة الطبيعة الآن.',
      completionEn: 'Amazing! You now understand the language of nature.',
    ),
    LevelStory(
      levelId: 3,
      titleAr: 'سلسلة التحولات',
      titleEn: 'Chain of Transformations',
      introAr:
          'كل شيء يتحول إلى شيء آخر. الماء يصبح بخاراً، والبذرة تصبح شجرة...',
      introEn:
          'Everything transforms into something else. Water becomes steam, seeds become trees...',
      characterAr: 'حكيم',
      characterEn: 'Hakim',
      characterEmoji: '🔄',
    ),
    LevelStory(
      levelId: 4,
      titleAr: 'عالم الصناعة',
      titleEn: 'World of Industry',
      introAr:
          'البشر يحولون الموارد الطبيعية إلى أشياء مفيدة. دعنا نتتبع هذه التحولات...',
      introEn:
          'Humans transform natural resources into useful things. Let us trace these transformations...',
      characterAr: 'المخترع',
      characterEn: 'The Inventor',
      characterEmoji: '⚙️',
    ),
    LevelStory(
      levelId: 5,
      titleAr: 'شبكة المعرفة',
      titleEn: 'Web of Knowledge',
      introAr:
          'المعرفة مترابطة مثل شبكة العنكبوت. كل فكرة تؤدي إلى فكرة أخرى...',
      introEn:
          'Knowledge is interconnected like a spider web. Every idea leads to another...',
      characterAr: 'العالم',
      characterEn: 'The Scholar',
      characterEmoji: '📚',
    ),
    LevelStory(
      levelId: 6,
      titleAr: 'رحلة عبر الزمن',
      titleEn: 'Journey Through Time',
      introAr:
          'التاريخ سلسلة من الأحداث المترابطة. كل حدث يؤدي إلى الذي يليه...',
      introEn:
          'History is a chain of connected events. Each event leads to the next...',
      characterAr: 'المؤرخ',
      characterEn: 'The Historian',
      characterEmoji: '⏳',
    ),
    LevelStory(
      levelId: 7,
      titleAr: 'عالم العواطف',
      titleEn: 'World of Emotions',
      introAr: 'حتى مشاعرنا مترابطة. الخوف يؤدي للحذر، والحب يؤدي للعطاء...',
      introEn:
          'Even our emotions are connected. Fear leads to caution, love leads to giving...',
      characterAr: 'الفيلسوف',
      characterEn: 'The Philosopher',
      characterEmoji: '💭',
    ),
    LevelStory(
      levelId: 8,
      titleAr: 'الروابط الخفية',
      titleEn: 'Hidden Connections',
      introAr: 'بعض الروابط ليست واضحة للعين العادية. هل تستطيع رؤيتها؟',
      introEn:
          'Some connections are not visible to the ordinary eye. Can you see them?',
      characterAr: 'الباحث',
      characterEn: 'The Seeker',
      characterEmoji: '🔍',
    ),
    LevelStory(
      levelId: 9,
      titleAr: 'سيد الروابط',
      titleEn: 'Master of Links',
      introAr: 'لقد وصلت بعيداً! الآن حان الوقت لإثبات أنك سيد الروابط...',
      introEn:
          'You have come far! Now is the time to prove you are a master of links...',
      characterAr: 'الأستاذ',
      characterEn: 'The Master',
      characterEmoji: '👑',
    ),
    LevelStory(
      levelId: 10,
      titleAr: 'التحدي الأخير',
      titleEn: 'The Final Challenge',
      introAr: 'هذا هو التحدي الأخير. أثبت أنك ربطت كل المعرفة التي اكتسبتها!',
      introEn:
          'This is the final challenge. Prove you have connected all the knowledge you gained!',
      characterAr: 'حكيم',
      characterEn: 'Hakim',
      characterEmoji: '🏆',
      completionAr: 'مبروك! لقد أصبحت أسطورة في عالم الروابط العجيبة!',
      completionEn:
          'Congratulations! You have become a legend in the world of wonder links!',
    ),
  ];

  LevelStory? getStoryForLevel(int levelId) {
    try {
      return levelStories.firstWhere((s) => s.levelId == levelId);
    } catch (_) {
      return null;
    }
  }
}
