import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Manages user rewards, coins, streaks, and achievements
class RewardsProvider extends ChangeNotifier {
  // === Coin System ===
  int _coins = 0;
  int get coins => _coins;

  // === Streak System ===
  int _currentStreak = 0;
  int get currentStreak => _currentStreak;

  DateTime? _lastLoginDate;

  // === Achievements ===
  final Set<String> _unlockedAchievements = {};
  Set<String> get unlockedAchievements =>
      Set.unmodifiable(_unlockedAchievements);

  // Achievement definitions
  static const Map<String, Achievement> achievements = {
    'first_puzzle': Achievement(
      id: 'first_puzzle',
      nameAr: 'البداية',
      nameEn: 'First Steps',
      descAr: 'أكمل أول لغز',
      descEn: 'Complete your first puzzle',
      icon: Icons.star,
      reward: 10,
    ),
    'streak_3': Achievement(
      id: 'streak_3',
      nameAr: 'مثابر',
      nameEn: 'Consistent',
      descAr: 'احتفظ بسلسلة 3 أيام',
      descEn: 'Maintain a 3-day streak',
      icon: Icons.local_fire_department,
      reward: 50,
    ),
    'streak_7': Achievement(
      id: 'streak_7',
      nameAr: 'أسبوع كامل',
      nameEn: 'Week Warrior',
      descAr: 'احتفظ بسلسلة 7 أيام',
      descEn: 'Maintain a 7-day streak',
      icon: Icons.whatshot,
      reward: 100,
    ),
    'level_10': Achievement(
      id: 'level_10',
      nameAr: 'متقدم',
      nameEn: 'Advanced',
      descAr: 'أكمل 10 مراحل',
      descEn: 'Complete 10 levels',
      icon: Icons.military_tech,
      reward: 200,
    ),
    'perfect_level': Achievement(
      id: 'perfect_level',
      nameAr: 'مثالي',
      nameEn: 'Perfect',
      descAr: 'أكمل مرحلة بدون أخطاء',
      descEn: 'Complete a level with no mistakes',
      icon: Icons.verified,
      reward: 75,
    ),
    'speed_demon': Achievement(
      id: 'speed_demon',
      nameAr: 'سريع البرق',
      nameEn: 'Speed Demon',
      descAr: 'أكمل لغز في أقل من 10 ثواني',
      descEn: 'Complete a puzzle in under 10 seconds',
      icon: Icons.flash_on,
      reward: 50,
    ),
  };

  // === Coin Rewards Config ===
  static const int coinsPerPuzzle = 5;
  static const int coinsPerLevel = 25;
  static const int dailyLoginBonus = 10;
  static const int streakBonusMultiplier = 5; // bonus per streak day

  // === Persistence Keys ===
  static const String _coinsKey = 'rewards_coins';
  static const String _streakKey = 'rewards_streak';
  static const String _lastLoginKey = 'rewards_last_login';
  static const String _achievementsKey = 'rewards_achievements';

  RewardsProvider() {
    _loadRewards();
  }

  Future<void> _loadRewards() async {
    final prefs = await SharedPreferences.getInstance();
    _coins = prefs.getInt(_coinsKey) ?? 0;
    _currentStreak = prefs.getInt(_streakKey) ?? 0;

    final lastLoginStr = prefs.getString(_lastLoginKey);
    if (lastLoginStr != null) {
      _lastLoginDate = DateTime.tryParse(lastLoginStr);
    }

    final achievementsList = prefs.getStringList(_achievementsKey) ?? [];
    _unlockedAchievements.addAll(achievementsList);

    notifyListeners();
  }

  Future<void> _saveRewards() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt(_coinsKey, _coins);
    await prefs.setInt(_streakKey, _currentStreak);
    if (_lastLoginDate != null) {
      await prefs.setString(_lastLoginKey, _lastLoginDate!.toIso8601String());
    }
    await prefs.setStringList(_achievementsKey, _unlockedAchievements.toList());
  }

  /// Called when app starts or user logs in
  Future<Map<String, dynamic>> checkDailyLogin() async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);

    int bonusEarned = 0;
    bool streakBroken = false;
    bool isNewDay = false;

    if (_lastLoginDate != null) {
      final lastLogin = DateTime(
        _lastLoginDate!.year,
        _lastLoginDate!.month,
        _lastLoginDate!.day,
      );
      final daysDiff = today.difference(lastLogin).inDays;

      if (daysDiff == 0) {
        // Same day, no bonus
        return {'bonusEarned': 0, 'streak': _currentStreak, 'isNewDay': false};
      } else if (daysDiff == 1) {
        // Consecutive day - streak continues!
        _currentStreak++;
        isNewDay = true;
      } else {
        // Streak broken
        _currentStreak = 1;
        streakBroken = true;
        isNewDay = true;
      }
    } else {
      // First login ever
      _currentStreak = 1;
      isNewDay = true;
    }

    // Calculate bonus
    bonusEarned = dailyLoginBonus + (_currentStreak * streakBonusMultiplier);
    _coins += bonusEarned;
    _lastLoginDate = now;

    // Check streak achievements
    if (_currentStreak >= 3) {
      await unlockAchievement('streak_3');
    }
    if (_currentStreak >= 7) {
      await unlockAchievement('streak_7');
    }

    await _saveRewards();
    notifyListeners();

    return {
      'bonusEarned': bonusEarned,
      'streak': _currentStreak,
      'streakBroken': streakBroken,
      'isNewDay': isNewDay,
    };
  }

  /// Award coins for completing a puzzle
  Future<void> awardPuzzleComplete({int bonus = 0}) async {
    _coins += coinsPerPuzzle + bonus;

    // Check first puzzle achievement
    await unlockAchievement('first_puzzle');

    await _saveRewards();
    notifyListeners();
  }

  /// Award coins for completing a level
  Future<void> awardLevelComplete({
    bool perfect = false,
    int levelId = 0,
  }) async {
    _coins += coinsPerLevel;

    if (perfect) {
      await unlockAchievement('perfect_level');
    }

    if (levelId >= 10) {
      await unlockAchievement('level_10');
    }

    await _saveRewards();
    notifyListeners();
  }

  /// Award coins for fast puzzle completion
  Future<void> awardSpeedBonus(int timeTakenSeconds) async {
    if (timeTakenSeconds < 10) {
      await unlockAchievement('speed_demon');
      _coins += 25; // Extra speed bonus
      await _saveRewards();
      notifyListeners();
    }
  }

  /// Unlock an achievement
  Future<bool> unlockAchievement(String achievementId) async {
    if (_unlockedAchievements.contains(achievementId)) {
      return false; // Already unlocked
    }

    final achievement = achievements[achievementId];
    if (achievement == null) return false;

    _unlockedAchievements.add(achievementId);
    _coins += achievement.reward;

    await _saveRewards();
    notifyListeners();

    return true; // Newly unlocked
  }

  /// Spend coins (for future purchases like hints, avatars)
  Future<bool> spendCoins(int amount) async {
    if (_coins < amount) return false;

    _coins -= amount;
    await _saveRewards();
    notifyListeners();
    return true;
  }

  /// Check if achievement is unlocked
  bool hasAchievement(String id) => _unlockedAchievements.contains(id);

  /// Get achievement progress (for display)
  Map<String, dynamic> getAchievementProgress() {
    return {
      'unlocked': _unlockedAchievements.length,
      'total': achievements.length,
      'percentage': ((_unlockedAchievements.length / achievements.length) * 100)
          .round(),
    };
  }
}

/// Achievement data class
class Achievement {
  final String id;
  final String nameAr;
  final String nameEn;
  final String descAr;
  final String descEn;
  final IconData icon;
  final int reward;

  const Achievement({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.descAr,
    required this.descEn,
    required this.icon,
    required this.reward,
  });

  String getName(bool isArabic) => isArabic ? nameAr : nameEn;
  String getDescription(bool isArabic) => isArabic ? descAr : descEn;
}
