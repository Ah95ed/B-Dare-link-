# 📍 خريطة التنفيذ الكاملة

## 🎯 نقطة الدخول الرئيسية

### 1. زر الإعدادات في AppBar
**الموقع:** `lib/views/competitions/room_game_view.dart` (الأسطر: 50-80)

```dart
AppBar(
  actions: [
    IconButton(
      icon: const Icon(Icons.settings),
      onPressed: () => _showSettingsDialog(context),
    ),
  ],
)
```

**ماذا يفعل:**
- يفتح dialog الإعدادات عند الضغط
- يعرض الإعدادات الحالية من قاعدة البيانات
- يسمح للمديرين بتعديل الإعدادات والتحكم بالاعبين

---

## 🔧 الإعدادات الرئيسية

### ملف الواجهة:
**`lib/views/competitions/room_game_view.dart` (~1332 سطر)**

#### الدوال الرئيسية:
```dart
1. _showSettingsDialog(BuildContext context)
   - فتح dialog الإعدادات
   - تحميل الإعدادات من قاعدة البيانات
   - عرض SlideButtons والخيارات

2. _skipPuzzle(BuildContext context, CompetitionProvider provider)
   - تخطي السؤال الحالي
   - إظهار تأكيد قبل التنفيذ
   - تحديث الواجهة بعد النجاح

3. _resetScores(BuildContext context, CompetitionProvider provider)
   - إعادة تعيين نقاط جميع اللاعبين
   - إظهار تحذير قبل التنفيذ
   - تحديث البيانات المحلية

4. _showDifficultyDialog(BuildContext context, CompetitionProvider provider)
   - فتح dialog اختيار الصعوبة
   - Slider من 1-10
   - تطبيق التغيير على قاعدة البيانات

5. _showPlayersDialog(BuildContext context, CompetitionProvider provider)
   - عرض قائمة اللاعبين
   - خيارات للتجميد والطرد والترقية
   - معالجة كل إجراء مع feedback

6. _getCurrentUserRole(CompetitionProvider provider)
   - الحصول على دور المستخدم الحالي
   - يرجع: 'manager', 'co_manager', 'player'

7. _isManager(CompetitionProvider provider)
   - التحقق من أن المستخدم مدير
   - يرجع: true/false

8. _buildSettingSection(String title, List<Widget> children)
   - بناء قسم واحد من الإعدادات
   - تنسيق موحد لجميع الأقسام
```

---

## 🔌 طبقة Provider

### ملف الـ Provider:
**`lib/providers/competition_provider.dart` (~980 سطر)**

#### الخصائص الجديدة:
```dart
int? get currentDifficulty => _currentRoom?['difficulty'] as int?;
```

#### الدوال الجديدة:
```dart
1. Future<void> skipPuzzle(int roomId)
   - استدعاء service.skipPuzzle()
   - تحديث الحالة المحلية
   - إخطار المستمعين (notifyListeners)

2. Future<void> resetScores(int roomId)
   - استدعاء service.resetScores()
   - مسح جميع النقاط محلياً
   - تحديث قائمة اللاعبين

3. Future<void> changeDifficulty(int roomId, int difficulty)
   - استدعاء service.changeDifficulty()
   - تحديث _currentRoom
   - إخطار المستمعين

4. Future<void> freezePlayer(int roomId, String userId, bool freeze)
   - استدعاء service.freezePlayer()
   - تحديث is_frozen في البيانات المحلية
   - إخطار المستمعين

5. Future<void> kickPlayer(int roomId, String userId)
   - استدعاء service.kickPlayer()
   - حذف اللاعب من القائمة المحلية
   - إخطار المستمعين

6. Future<void> promoteToCoManager(int roomId, String userId)
   - استدعاء service.promoteToCoManager()
   - تحديث دور اللاعب إلى co_manager
   - إخطار المستمعين
```

---

## 🌐 طبقة Service

### ملف الـ Service:
**`lib/services/competition_service.dart` (~430 سطر)**

#### الدوال الجديدة:
```dart
1. Future<void> skipPuzzle(int roomId)
   - POST /manager/skip-puzzle
   - Body: { roomId }

2. Future<void> resetScores(int roomId)
   - POST /manager/reset-scores
   - Body: { roomId }

3. Future<void> changeDifficulty(int roomId, int difficulty)
   - POST /manager/change-difficulty
   - Body: { roomId, difficulty }

4. Future<void> freezePlayer(int roomId, String userId, bool freeze)
   - POST /manager/freeze
   - Body: { roomId, userId, freeze }

5. Future<void> kickPlayer(int roomId, String userId)
   - POST /manager/kick
   - Body: { roomId, userId }

6. Future<void> promoteToCoManager(int roomId, String userId)
   - POST /manager/promote
   - Body: { roomId, userId }
```

---

## 🖥️ الخادم الخلفي

### ملف المدير (backend):
**`backend/src/manager_permissions.js` (~600 سطر)**

#### الدوال المتاحة:
```javascript
1. kickPlayer(roomId, adminId, userId)
   - التحقق من الصلاحيات
   - تعليم اللاعب كـ "مطرود"
   - تسجيل الإجراء

2. freezePlayer(roomId, adminId, userId, freeze)
   - تحديث is_frozen في قاعدة البيانات
   - تسجيل الإجراء
   - إرجاع الحالة الجديدة

3. resetScores(roomId, adminId)
   - مسح جميع النقاط في الغرفة
   - إعادة تعيين puzzles_solved
   - تسجيل الإجراء

4. skipPuzzle(roomId, adminId)
   - زيادة puzzle_index
   - نقل جميع اللاعبين للسؤال التالي
   - تسجيل الإجراء

5. changeDifficulty(roomId, adminId, difficulty)
   - تحديث difficulty في room_settings
   - تسجيل الإجراء
   - إرجاع الصعوبة الجديدة

6. promoteToCoManager(roomId, adminId, targetId)
   - التحقق من أن المنشئ هو manager (ليس co_manager)
   - تحديث الدور إلى co_manager
   - تسجيل الإجراء

7. transferManager(roomId, adminId, targetId)
   - نقل دور manager من شخص لآخر
   - تحديث الأدوار في قاعدة البيانات
   - تسجيل الإجراء

8. getManagerLogs(roomId, adminId)
   - جلب سجل جميع الإجراءات
   - مرشح حسب نوع الإجراء
   - معلومات المنفذ والوقت

9. getDetailedStats(roomId, adminId)
   - إحصائيات مفصلة عن اللعبة
   - إحصائيات لكل لاعب
   - سرعة الإجابة، الدقة، إلخ
```

---

## 💾 قاعدة البيانات

### الجداول المستخدمة:

#### `room_participants` (تحديثات):
```sql
ALTER TABLE room_participants ADD COLUMN role TEXT DEFAULT 'player';
ALTER TABLE room_participants ADD COLUMN is_frozen BOOLEAN DEFAULT false;
ALTER TABLE room_participants ADD COLUMN is_kicked BOOLEAN DEFAULT false;
```

#### `room_settings` (تحديثات):
```sql
-- الأعمدة الجديدة:
manager_can_skip_puzzle BOOLEAN DEFAULT false
manager_can_reset_scores BOOLEAN DEFAULT false
manager_can_freeze_players BOOLEAN DEFAULT false
manager_can_kick_players BOOLEAN DEFAULT false
manager_can_change_difficulty BOOLEAN DEFAULT false
allow_co_managers BOOLEAN DEFAULT false
show_detailed_stats_to_all BOOLEAN DEFAULT false
```

#### `manager_actions` (جديد):
```sql
CREATE TABLE manager_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  admin_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id TEXT,
  details JSONB,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔄 سير العمل الكامل

### مثال: اختيار اللاعب للتجميد

```
1️⃣ UI (room_game_view.dart)
   └─ المستخدم يضغط على "تجميد" في قائمة اللاعب
   
2️⃣ Event Handler (_showPlayersDialog)
   └─ onSelected('freeze')
   └─ استدعاء provider.freezePlayer(roomId, userId, true)
   
3️⃣ Provider (competition_provider.dart)
   └─ await service.freezePlayer(roomId, userId, true)
   └─ تحديث _roomParticipants محلياً
   └─ notifyListeners()
   
4️⃣ Service (competition_service.dart)
   └─ POST /manager/freeze
   └─ جسم الطلب: { roomId, userId, freeze: true }
   
5️⃣ Backend (manager_permissions.js)
   └─ freezePlayer(roomId, adminId, userId, true)
   └─ التحقق من الصلاحيات
   └─ تحديث is_frozen في قاعدة البيانات
   └─ تسجيل الإجراء في manager_actions
   
6️⃣ استجابة API
   └─ الحالة الجديدة { is_frozen: true, ... }
   
7️⃣ UI يتحدث
   └─ notifyListeners() يعيد بناء الواجهة
   └─ يظهر "إلغاء التجميد" بدلاً من "تجميد"
   └─ Snackbar: "تم تجميد اللاعب بنجاح" ✅
```

---

## 🎨 مكونات الواجهة

### الحوارات الرئيسية:

#### 1. Settings Dialog
```dart
StatefulBuilder(
  builder: (context, setState) => AlertDialog(
    title: 'إعدادات الغرفة',
    content: SingleChildScrollView(
      child: Column(
        children: [
          // أقسام الإعدادات
          _buildSettingSection('الرموز', [...]),
          _buildSettingSection('الخيارات', [...]),
          _buildSettingSection('الوقت', [...]),
          // قائمة المدير
          if (_isManager(provider)) PopupMenuButton(...),
        ],
      ),
    ),
    actions: [
      TextButton('إلغاء'),
      ElevatedButton('حفظ'),
    ],
  ),
)
```

#### 2. Difficulty Dialog
```dart
AlertDialog(
  title: 'تغيير الصعوبة',
  content: Column(
    children: [
      Text('الصعوبة: $difficulty / 10'),
      Slider(
        value: difficulty.toDouble(),
        min: 1,
        max: 10,
        divisions: 9,
        onChanged: (value) => setState(...),
      ),
    ],
  ),
  actions: [
    TextButton('إلغاء'),
    ElevatedButton('تطبيق'),
  ],
)
```

#### 3. Players Dialog
```dart
AlertDialog(
  title: 'إدارة اللاعبين',
  content: ListView.builder(
    itemCount: provider.roomParticipants.length,
    itemBuilder: (context, index) => ListTile(
      title: Text(participant['username']),
      subtitle: Text('النقاط: ${participant['score']}'),
      trailing: PopupMenuButton(
        itemBuilder: (context) => [
          PopupMenuItem('تجميد'),
          PopupMenuItem('إلغاء التجميد'),
          PopupMenuItem('ترقية'),
          PopupMenuItem('طرد'),
        ],
        onSelected: (value) => handleAction(value),
      ),
    ),
  ),
  actions: [TextButton('إغلاق')],
)
```

---

## ✅ قائمة الفحص

### الاختبار:
- [ ] الإعدادات تفتح بدون أخطاء
- [ ] الإعدادات تُحفظ بشكل صحيح
- [ ] المديرين يرون PopupMenuButton
- [ ] اللاعبين العاديين لا يرون PopupMenuButton
- [ ] تخطي السؤال يعمل
- [ ] إعادة تعيين النقاط تعمل
- [ ] تغيير الصعوبة يعمل
- [ ] تجميد اللاعب يعمل
- [ ] فتح اللاعب يعمل
- [ ] طرد اللاعب يعمل
- [ ] رسائل الخطأ تظهر بشكل صحيح
- [ ] الحالة تُحدّث بشكل فوري

---

## 📚 الملفات المتعلقة

### التوثيق:
- 📄 `SETTINGS_MANAGER_GUIDE.md` - دليل المستخدم
- 📄 `IMPLEMENTATION_COMPLETE.md` - ملخص التحديثات
- 📄 `MAP_IMPLEMENTATION.md` - هذا الملف

### الأكواد:
- 📝 `lib/views/competitions/room_game_view.dart` (UI + Event Handlers)
- 📝 `lib/providers/competition_provider.dart` (State Management)
- 📝 `lib/services/competition_service.dart` (API Calls)
- 📝 `backend/src/manager_permissions.js` (Business Logic)

---

## 🚀 نقاط الدخول الرئيسية

| النقطة | الملف | الدالة | الوصف |
|--------|--------|--------|-------|
| 🎯 Start | room_game_view.dart | AppBar IconButton | يفتح الإعدادات |
| 🔌 Dialog | room_game_view.dart | _showSettingsDialog() | عرض الإعدادات |
| ⚙️ Manager Menu | room_game_view.dart | PopupMenuButton | خيارات المدير |
| 🎬 Skip | room_game_view.dart | _skipPuzzle() | تخطي السؤال |
| 🔄 Reset | room_game_view.dart | _resetScores() | إعادة تعيين |
| 📊 Difficulty | room_game_view.dart | _showDifficultyDialog() | تغيير الصعوبة |
| 👥 Players | room_game_view.dart | _showPlayersDialog() | إدارة اللاعبين |
| 🗄️ API | competition_service.dart | skipPuzzle() إلخ | استدعاء الخادم |
| 🖥️ Server | manager_permissions.js | skipPuzzle() إلخ | معالجة الطلب |

---

**آخر تحديث:** اليوم
**الحالة:** ✅ تم توثيق كل شيء
