import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/achievements_model.dart' as achievement_models;

class AchievementsProvider extends ChangeNotifier {
  late SharedPreferences _prefs;
  List<achievement_models.Achievement> _unlockedAchievements = [];
  List<achievement_models.Badge> _earnedBadges = [];
  int _totalXP = 0;
  final List<achievement_models.Reward> _pendingRewards = [];

  List<achievement_models.Achievement> get unlockedAchievements =>
      _unlockedAchievements;
  List<achievement_models.Badge> get earnedBadges => _earnedBadges;
  int get totalXP => _totalXP;
  List<achievement_models.Reward> get pendingRewards => _pendingRewards;

  // الإنجازات المتاحة مع حالة الفتح
  List<achievement_models.Achievement> get allAchievementsWithStatus {
    return achievement_models.AchievementsList.allAchievements.map((
      achievement,
    ) {
      final isUnlocked = _unlockedAchievements.any(
        (u) => u.id == achievement.id,
      );
      final unlockedOne = _unlockedAchievements.firstWhere(
        (u) => u.id == achievement.id,
        orElse: () => achievement,
      );
      return achievement_models.Achievement(
        id: achievement.id,
        nameAr: achievement.nameAr,
        nameEn: achievement.nameEn,
        descriptionAr: achievement.descriptionAr,
        descriptionEn: achievement.descriptionEn,
        icon: achievement.icon,
        rewardXP: achievement.rewardXP,
        isUnlocked: isUnlocked,
        unlockedAt: unlockedOne.unlockedAt,
      );
    }).toList();
  }

  // عدد الإنجازات المفتوحة
  int get unlockedCount => _unlockedAchievements.length;
  int get totalCount =>
      achievement_models.AchievementsList.allAchievements.length;
  double get unlockedPercentage => unlockedCount / totalCount;

  AchievementsProvider() {
    _init();
  }

  Future<void> _init() async {
    _prefs = await SharedPreferences.getInstance();
    await _loadAchievements();
    await _loadBadges();
    await _loadXP();
  }

  // تحميل الإنجازات المفتوحة
  Future<void> _loadAchievements() async {
    final json = _prefs.getStringList('unlocked_achievements') ?? [];
    _unlockedAchievements = json.map((j) {
      final map = jsonDecode(j) as Map<String, dynamic>;
      final achievement = achievement_models.AchievementsList.allAchievements
          .firstWhere(
            (a) => a.id == map['id'],
            orElse: () =>
                achievement_models.AchievementsList.allAchievements.first,
          );
      return achievement_models.Achievement(
        id: achievement.id,
        nameAr: achievement.nameAr,
        nameEn: achievement.nameEn,
        descriptionAr: achievement.descriptionAr,
        descriptionEn: achievement.descriptionEn,
        icon: achievement.icon,
        rewardXP: achievement.rewardXP,
        isUnlocked: true,
        unlockedAt: DateTime.parse(map['unlockedAt'] as String),
      );
    }).toList();
  }

  // حفظ الإنجازات
  Future<void> _saveAchievements() async {
    final json = _unlockedAchievements.map((a) {
      return jsonEncode({
        'id': a.id,
        'unlockedAt': a.unlockedAt?.toIso8601String(),
      });
    }).toList();
    await _prefs.setStringList('unlocked_achievements', json);
  }

  // تحميل الشارات
  Future<void> _loadBadges() async {
    final json = _prefs.getStringList('earned_badges') ?? [];
    _earnedBadges = json.map((j) {
      final map = jsonDecode(j) as Map<String, dynamic>;
      final badge = achievement_models.AchievementsList.allBadges.firstWhere(
        (b) => b.id == map['id'],
        orElse: () => achievement_models.AchievementsList.allBadges.first,
      );
      return achievement_models.Badge(
        id: badge.id,
        nameAr: badge.nameAr,
        nameEn: badge.nameEn,
        icon: badge.icon,
        level: badge.level,
        requiredPuzzles: badge.requiredPuzzles,
        isEarned: true,
      );
    }).toList();
  }

  // حفظ الشارات
  Future<void> _saveBadges() async {
    final json = _earnedBadges
        .map((b) {
          return jsonEncode({'id': b.id});
        })
        .toList()
        .cast<String>();
    await _prefs.setStringList('earned_badges', json);
  }

  // تحميل نقاط الخبرة
  Future<void> _loadXP() async {
    _totalXP = _prefs.getInt('total_xp') ?? 0;
  }

  // حفظ نقاط الخبرة
  Future<void> _saveXP() async {
    await _prefs.setInt('total_xp', _totalXP);
  }

  // فتح إنجاز
  Future<void> unlockAchievement(String achievementId) async {
    if (_unlockedAchievements.any((a) => a.id == achievementId)) {
      return; // بالفعل مفتوح
    }

    final achievement = achievement_models.AchievementsList.allAchievements
        .firstWhere(
          (a) => a.id == achievementId,
          orElse: () => throw Exception('Achievement not found'),
        );

    final unlockedAchievement = achievement_models.Achievement(
      id: achievement.id,
      nameAr: achievement.nameAr,
      nameEn: achievement.nameEn,
      descriptionAr: achievement.descriptionAr,
      descriptionEn: achievement.descriptionEn,
      icon: achievement.icon,
      rewardXP: achievement.rewardXP,
      isUnlocked: true,
      unlockedAt: DateTime.now(),
    );

    _unlockedAchievements.add(unlockedAchievement);
    _totalXP += achievement.rewardXP;

    // إضافة جائزة
    _pendingRewards.add(
      achievement_models.Reward(
        type: achievement_models.RewardType.xp,
        amount: achievement.rewardXP,
        titleAr: 'إنجاز جديد: ${achievement.nameAr}',
        titleEn: 'New Achievement: ${achievement.nameEn}',
        descriptionAr: 'لقد فتحت الإنجاز: ${achievement.nameAr}',
        descriptionEn: 'You unlocked: ${achievement.nameEn}',
        icon: achievement.icon,
        earnedAt: DateTime.now(),
      ),
    );

    await _saveAchievements();
    await _saveXP();
    notifyListeners();
  }

  // فتح شارة
  Future<void> unlockBadge(String badgeId) async {
    if (_earnedBadges.any((b) => b.id == badgeId)) {
      return; // بالفعل مفتوحة
    }

    final badge = achievement_models.AchievementsList.allBadges.firstWhere(
      (b) => b.id == badgeId,
      orElse: () => throw Exception('Badge not found'),
    );

    final earnedBadge = achievement_models.Badge(
      id: badge.id,
      nameAr: badge.nameAr,
      nameEn: badge.nameEn,
      icon: badge.icon,
      level: badge.level,
      requiredPuzzles: badge.requiredPuzzles,
      isEarned: true,
    );

    _earnedBadges.add(earnedBadge);

    // إضافة جائزة
    _pendingRewards.add(
      achievement_models.Reward(
        type: achievement_models.RewardType.badges,
        amount: 1,
        titleAr: 'شارة جديدة: ${badge.nameAr}',
        titleEn: 'New Badge: ${badge.nameEn}',
        icon: badge.icon,
        earnedAt: DateTime.now(),
      ),
    );

    await _saveBadges();
    notifyListeners();
  }

  // إضافة جائزة معينة
  Future<void> addReward(achievement_models.Reward reward) async {
    _pendingRewards.add(reward);
    notifyListeners();
  }

  // الحصول على الجائزة المعلقة التالية وحذفها
  achievement_models.Reward? getAndRemoveNextReward() {
    if (_pendingRewards.isEmpty) return null;
    final reward = _pendingRewards.removeAt(0);
    notifyListeners();
    return reward;
  }

  // التحقق من تحديث الشارات بناءً على عدد الألغاز المكتملة
  Future<void> updateBadgesForCompletedPuzzles(int completedPuzzles) async {
    for (final badge in achievement_models.AchievementsList.allBadges) {
      if (completedPuzzles >= badge.requiredPuzzles &&
          !_earnedBadges.any((b) => b.id == badge.id)) {
        await unlockBadge(badge.id);
      }
    }
  }

  // الحصول على عدد الإنجازات المتبقية
  int get remainingAchievements => totalCount - unlockedCount;

  // الحصول على الإنجاز التالي المتاح
  achievement_models.Achievement? get nextAvailableAchievement {
    final locked = achievement_models.AchievementsList.allAchievements
        .where((a) => !_unlockedAchievements.any((u) => u.id == a.id))
        .toList();
    return locked.isNotEmpty ? locked.first : null;
  }
}
