/// نوع المكافأة
enum RewardType { stars, coins, gems, xp, badges, specialItems }

/// الجائزة
class Reward {
  final RewardType type;
  final int amount;
  final String? titleAr;
  final String? titleEn;
  final String? descriptionAr;
  final String? descriptionEn;
  final String? icon;
  final DateTime earnedAt;

  Reward({
    required this.type,
    required this.amount,
    this.titleAr,
    this.titleEn,
    this.descriptionAr,
    this.descriptionEn,
    this.icon,
    required this.earnedAt,
  });

  String getTitle(bool isArabic) =>
      isArabic ? (titleAr ?? 'جائزة') : (titleEn ?? 'Reward');
  String getDescription(bool isArabic) =>
      isArabic ? (descriptionAr ?? '') : (descriptionEn ?? '');
}

/// الإنجاز
class Achievement {
  final String id;
  final String nameAr;
  final String nameEn;
  final String? descriptionAr;
  final String? descriptionEn;
  final String icon;
  final int rewardXP;
  final bool isSecret;
  final bool isUnlocked;
  final DateTime? unlockedAt;

  Achievement({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    this.descriptionAr,
    this.descriptionEn,
    required this.icon,
    required this.rewardXP,
    this.isSecret = false,
    this.isUnlocked = false,
    this.unlockedAt,
  });

  String getName(bool isArabic) => isArabic ? nameAr : nameEn;
  String getDescription(bool isArabic) =>
      isArabic ? (descriptionAr ?? '') : (descriptionEn ?? '');
}

/// الشارة
class Badge {
  final String id;
  final String nameAr;
  final String nameEn;
  final String icon;
  final int level; // 1-5 (Bronze, Silver, Gold, Platinum, Legend)
  final int requiredPuzzles;
  final bool isEarned;

  Badge({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.icon,
    required this.level,
    required this.requiredPuzzles,
    this.isEarned = false,
  });

  String getName(bool isArabic) => isArabic ? nameAr : nameEn;

  String getLevelName(bool isArabic) {
    if (isArabic) {
      switch (level) {
        case 1:
          return 'برونزي';
        case 2:
          return 'فضي';
        case 3:
          return 'ذهبي';
        case 4:
          return 'بلاتيني';
        case 5:
          return 'أسطورة';
        default:
          return '';
      }
    } else {
      switch (level) {
        case 1:
          return 'Bronze';
        case 2:
          return 'Silver';
        case 3:
          return 'Gold';
        case 4:
          return 'Platinum';
        case 5:
          return 'Legend';
        default:
          return '';
      }
    }
  }
}

/// قائمة الإنجازات المحددة مسبقاً
class AchievementsList {
  static final List<Achievement> allAchievements = [
    Achievement(
      id: 'first_step',
      nameAr: '🌟 الخطوة الأولى',
      nameEn: '🌟 First Step',
      descriptionAr: 'أكمل اللغز الأول بنجاح',
      descriptionEn: 'Complete your first puzzle successfully',
      icon: '🌟',
      rewardXP: 10,
    ),
    Achievement(
      id: 'on_fire',
      nameAr: '🔥 في القمة',
      nameEn: '🔥 On Fire',
      descriptionAr: 'حقق 5 إجابات صحيحة متتالية',
      descriptionEn: 'Get 5 correct answers in a row',
      icon: '🔥',
      rewardXP: 50,
    ),
    Achievement(
      id: 'speed_demon',
      nameAr: '⚡ سريع البرق',
      nameEn: '⚡ Speed Demon',
      descriptionAr: 'أكمل لغز في أقل من 20 ثانية',
      descriptionEn: 'Complete a puzzle in less than 20 seconds',
      icon: '⚡',
      rewardXP: 30,
    ),
    Achievement(
      id: 'brain_master',
      nameAr: '🧠 سيد الذكاء',
      nameEn: '🧠 Brain Master',
      descriptionAr: 'أكمل 10 ألغاز متتالية بدون أخطاء',
      descriptionEn: 'Complete 10 puzzles without any mistakes',
      icon: '🧠',
      rewardXP: 100,
    ),
    Achievement(
      id: 'world_explorer',
      nameAr: '🌍 مستكشف العالم',
      nameEn: '🌍 World Explorer',
      descriptionAr: 'افتح جميع المستويات',
      descriptionEn: 'Unlock all levels',
      icon: '🌍',
      rewardXP: 200,
    ),
    Achievement(
      id: 'collector',
      nameAr: '💰 جامع العملات',
      nameEn: '💰 Collector',
      descriptionAr: 'اجمع 1000 عملة',
      descriptionEn: 'Collect 1000 coins',
      icon: '💰',
      rewardXP: 75,
    ),
    Achievement(
      id: 'perfectionist',
      nameAr: '🎯 الكمالي',
      nameEn: '🎯 Perfectionist',
      descriptionAr: 'احصل على 3 نجوم في 50 لغز',
      descriptionEn: 'Get 3 stars in 50 puzzles',
      icon: '🎯',
      rewardXP: 150,
    ),
    Achievement(
      id: 'daily_champion',
      nameAr: '🏆 بطل اليوم',
      nameEn: '🏆 Daily Champion',
      descriptionAr: 'احصل على أعلى نقاط في اليوم',
      descriptionEn: 'Get the highest score of the day',
      icon: '🏆',
      rewardXP: 50,
    ),
    Achievement(
      id: 'night_owl',
      nameAr: '🌙 طير الليل',
      nameEn: '🌙 Night Owl',
      descriptionAr: 'العب بين الساعة 10 مساءً و 6 صباحاً',
      descriptionEn: 'Play between 10 PM and 6 AM',
      icon: '🌙',
      rewardXP: 25,
    ),
    Achievement(
      id: 'comeback_king',
      nameAr: '👑 ملك العودة',
      nameEn: '👑 Comeback King',
      descriptionAr: 'ارجع للعبة بعد 7 أيام بدون لعب',
      descriptionEn: 'Return to the game after 7 days of not playing',
      icon: '👑',
      rewardXP: 40,
    ),
  ];

  static final List<Badge> allBadges = [
    Badge(
      id: 'novice',
      nameAr: 'المبتدئ',
      nameEn: 'Novice',
      icon: '🥉',
      level: 1,
      requiredPuzzles: 5,
    ),
    Badge(
      id: 'intermediate',
      nameAr: 'المتوسط',
      nameEn: 'Intermediate',
      icon: '🥈',
      level: 2,
      requiredPuzzles: 25,
    ),
    Badge(
      id: 'advanced',
      nameAr: 'المتقدم',
      nameEn: 'Advanced',
      icon: '🥇',
      level: 3,
      requiredPuzzles: 100,
    ),
    Badge(
      id: 'expert',
      nameAr: 'الخبير',
      nameEn: 'Expert',
      icon: '💎',
      level: 4,
      requiredPuzzles: 250,
    ),
    Badge(
      id: 'legend',
      nameAr: 'الأسطورة',
      nameEn: 'Legend',
      icon: '👑',
      level: 5,
      requiredPuzzles: 500,
    ),
  ];
}
