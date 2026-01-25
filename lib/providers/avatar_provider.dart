import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Avatar data model
class AvatarData {
  final String id;
  final String nameAr;
  final String nameEn;
  final String emoji; // Using emoji for easy display
  final int unlockCost; // 0 = free
  final String?
  unlockAchievement; // Achievement ID to unlock, null = purchasable

  const AvatarData({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    required this.emoji,
    this.unlockCost = 0,
    this.unlockAchievement,
  });

  String getName(bool isArabic) => isArabic ? nameAr : nameEn;
  bool get isFree => unlockCost == 0 && unlockAchievement == null;
}

/// Manages user avatar selection and unlocks
class AvatarProvider extends ChangeNotifier {
  String _selectedAvatarId = 'default';
  String get selectedAvatarId => _selectedAvatarId;

  final Set<String> _unlockedAvatars = {
    'default',
  }; // Default is always unlocked
  Set<String> get unlockedAvatars => Set.unmodifiable(_unlockedAvatars);

  // Avatar catalog
  static const List<AvatarData> avatars = [
    // Free avatars
    AvatarData(
      id: 'default',
      nameAr: 'مستكشف',
      nameEn: 'Explorer',
      emoji: '🧑‍🚀',
    ),
    AvatarData(id: 'thinker', nameAr: 'مفكر', nameEn: 'Thinker', emoji: '🤔'),
    AvatarData(id: 'genius', nameAr: 'عبقري', nameEn: 'Genius', emoji: '🧠'),

    // Purchasable avatars
    AvatarData(
      id: 'wizard',
      nameAr: 'ساحر',
      nameEn: 'Wizard',
      emoji: '🧙',
      unlockCost: 50,
    ),
    AvatarData(
      id: 'ninja',
      nameAr: 'نينجا',
      nameEn: 'Ninja',
      emoji: '🥷',
      unlockCost: 75,
    ),
    AvatarData(
      id: 'robot',
      nameAr: 'آلي',
      nameEn: 'Robot',
      emoji: '🤖',
      unlockCost: 100,
    ),
    AvatarData(
      id: 'alien',
      nameAr: 'فضائي',
      nameEn: 'Alien',
      emoji: '👽',
      unlockCost: 100,
    ),
    AvatarData(
      id: 'dragon',
      nameAr: 'تنين',
      nameEn: 'Dragon',
      emoji: '🐉',
      unlockCost: 150,
    ),

    // Achievement-locked avatars
    AvatarData(
      id: 'fire',
      nameAr: 'ملتهب',
      nameEn: 'On Fire',
      emoji: '🔥',
      unlockAchievement: 'streak_7',
    ),
    AvatarData(
      id: 'star',
      nameAr: 'نجم',
      nameEn: 'Star',
      emoji: '⭐',
      unlockAchievement: 'perfect_level',
    ),
    AvatarData(
      id: 'lightning',
      nameAr: 'برق',
      nameEn: 'Lightning',
      emoji: '⚡',
      unlockAchievement: 'speed_demon',
    ),
    AvatarData(
      id: 'crown',
      nameAr: 'ملك',
      nameEn: 'King',
      emoji: '👑',
      unlockAchievement: 'level_10',
    ),
  ];

  static const String _selectedKey = 'avatar_selected';
  static const String _unlockedKey = 'avatar_unlocked';

  AvatarProvider() {
    _loadAvatarData();
  }

  Future<void> _loadAvatarData() async {
    final prefs = await SharedPreferences.getInstance();
    _selectedAvatarId = prefs.getString(_selectedKey) ?? 'default';

    final savedUnlocked = prefs.getStringList(_unlockedKey);
    if (savedUnlocked != null) {
      _unlockedAvatars.addAll(savedUnlocked);
    }

    // Ensure free avatars are always unlocked
    for (final avatar in avatars) {
      if (avatar.isFree) {
        _unlockedAvatars.add(avatar.id);
      }
    }

    notifyListeners();
  }

  Future<void> _saveAvatarData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_selectedKey, _selectedAvatarId);
    await prefs.setStringList(_unlockedKey, _unlockedAvatars.toList());
  }

  /// Get the currently selected avatar data
  AvatarData get selectedAvatar {
    return avatars.firstWhere(
      (a) => a.id == _selectedAvatarId,
      orElse: () => avatars.first,
    );
  }

  /// Select an avatar (must be unlocked)
  Future<bool> selectAvatar(String avatarId) async {
    if (!_unlockedAvatars.contains(avatarId)) {
      return false; // Not unlocked
    }

    _selectedAvatarId = avatarId;
    await _saveAvatarData();
    notifyListeners();
    return true;
  }

  /// Unlock an avatar with coins (returns true if successful)
  Future<bool> unlockWithCoins(
    String avatarId,
    int userCoins,
    Function(int) spendCoins,
  ) async {
    final avatar = avatars.firstWhere(
      (a) => a.id == avatarId,
      orElse: () => avatars.first,
    );

    if (_unlockedAvatars.contains(avatarId)) {
      return false; // Already unlocked
    }

    if (avatar.unlockCost > 0 && userCoins >= avatar.unlockCost) {
      final success = await spendCoins(avatar.unlockCost);
      if (success == true) {
        // Casting from dynamic
        _unlockedAvatars.add(avatarId);
        await _saveAvatarData();
        notifyListeners();
        return true;
      }
    }

    return false;
  }

  /// Unlock avatar via achievement
  Future<void> unlockByAchievement(String achievementId) async {
    for (final avatar in avatars) {
      if (avatar.unlockAchievement == achievementId) {
        _unlockedAvatars.add(avatar.id);
      }
    }
    await _saveAvatarData();
    notifyListeners();
  }

  /// Check if avatar is unlocked
  bool isUnlocked(String avatarId) => _unlockedAvatars.contains(avatarId);

  /// Get avatar by ID
  static AvatarData? getAvatarById(String id) {
    try {
      return avatars.firstWhere((a) => a.id == id);
    } catch (_) {
      return null;
    }
  }
}
