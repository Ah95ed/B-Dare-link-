# 👑 نظام الصلاحيات والإعدادات - Manager Permissions System

## 📋 نظرة عامة - Overview

تم إضافة نظام شامل للصلاحيات يميز بين:
- **👑 المدير (Manager):** منشئ الغرفة - صلاحيات كاملة
- **🔧 المدير المساعد (Co-Manager):** صلاحيات إدارية محدودة
- **🎮 اللاعب (Player):** صلاحيات أساسية فقط

---

## 🎯 الصلاحيات حسب الدور

### 👑 المدير الرئيسي (Manager)
**صلاحيات حصرية:**
- ✅ طرد اللاعبين من الغرفة
- ✅ تجميد/إلغاء تجميد اللاعبين
- ✅ إعادة تعيين جميع النقاط
- ✅ تخطي السؤال الحالي
- ✅ تغيير صعوبة الأسئلة أثناء اللعبة
- ✅ نقل صلاحية المدير لشخص آخر
- ✅ ترقية لاعبين إلى مديرين مساعدين
- ✅ تعديل إعدادات الغرفة المتقدمة
- ✅ رؤية سجل تصرفات المديرين
- ✅ رؤية الإحصائيات التفصيلية لكل لاعب
- ✅ حذف الغرفة
- ✅ إعادة فتح الغرفة
- ✅ بدء اللعبة يدوياً

### 🔧 المدير المساعد (Co-Manager)
**صلاحيات محدودة:**
- ✅ تجميد/إلغاء تجميد اللاعبين (حسب الإعدادات)
- ✅ تخطي السؤال (حسب الإعدادات)
- ✅ تغيير الصعوبة (حسب الإعدادات)
- ✅ رؤية سجل التصرفات
- ✅ رؤية الإحصائيات التفصيلية
- ❌ **لا يستطيع:** طرد اللاعبين
- ❌ **لا يستطيع:** إعادة تعيين النقاط
- ❌ **لا يستطيع:** نقل صلاحية المدير
- ❌ **لا يستطيع:** حذف الغرفة

### 🎮 اللاعب العادي (Player)
**صلاحيات أساسية:**
- ✅ الإجابة على الأسئلة
- ✅ طلب مساعدة (hints) إذا كانت مفعّلة
- ✅ الإبلاغ عن أسئلة سيئة
- ✅ رؤية الترتيب الحي (إذا كان مفعّلاً)
- ✅ رؤية إحصائياته الخاصة
- ✅ مغادرة الغرفة
- ❌ **لا يستطيع:** أي صلاحيات إدارية

---

## ⚙️ الإعدادات الجديدة - New Settings

### إعدادات صلاحيات المدير
```json
{
  "manager_can_skip_puzzle": true,           // المدير يستطيع تخطي الأسئلة
  "manager_can_reset_scores": true,          // المدير يستطيع إعادة تعيين النقاط
  "manager_can_freeze_players": true,        // المدير يستطيع تجميد اللاعبين
  "manager_can_kick_players": true,          // المدير يستطيع طرد اللاعبين
  "manager_can_change_difficulty": true,     // المدير يستطيع تغيير الصعوبة
  "allow_co_managers": true,                 // السماح بمديرين مساعدين
  "show_detailed_stats_to_all": false        // إظهار الإحصائيات التفصيلية للجميع
}
```

### الإعدادات الموجودة سابقاً
```json
{
  "hints_enabled": true,                     // تفعيل المساعدات
  "hints_per_player": 3,                     // عدد المساعدات لكل لاعب
  "hint_penalty_percent": 10,                // نسبة خصم النقاط عند استخدام مساعدة
  "allow_report_bad_puzzle": true,           // السماح بالإبلاغ عن أسئلة سيئة
  "auto_advance_seconds": 2,                 // الانتقال التلقائي للسؤال التالي
  "shuffle_options": true,                   // خلط الخيارات
  "show_rankings_live": true,                // إظهار الترتيب الحي
  "allow_skip_puzzle": false,                // السماح بتخطي الأسئلة (للجميع)
  "min_time_per_puzzle": 5                   // الحد الأدنى من الوقت لكل سؤال
}
```

---

## 🔌 API Endpoints الجديدة

### 1️⃣ طرد لاعب (Manager Only)
**Endpoint:** `POST /manager/kick`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456,        // المدير
  "targetUserId": 789   // اللاعب المراد طرده
}
```

**Response:**
```json
{
  "success": true,
  "message": "Player kicked"
}
```

---

### 2️⃣ تجميد/إلغاء تجميد لاعب
**Endpoint:** `POST /manager/freeze`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456,
  "targetUserId": 789,
  "freeze": true        // true = تجميد, false = إلغاء تجميد
}
```

**Response:**
```json
{
  "success": true,
  "message": "Player frozen"
}
```

**ملاحظة:** اللاعب المجمد لا يستطيع إرسال إجابات (يظهر له خطأ 403).

---

### 3️⃣ إعادة تعيين جميع النقاط (Main Manager Only)
**Endpoint:** `POST /manager/reset-scores`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "All scores reset"
}
```

**النتيجة:** كل اللاعبين في الغرفة يعودون إلى 0 نقطة و 0 أسئلة محلولة.

---

### 4️⃣ تخطي السؤال الحالي
**Endpoint:** `POST /manager/skip-puzzle`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Puzzle skipped",
  "newIndex": 3
}
```

**النتيجة:** الانتقال للسؤال التالي مباشرة دون إجابات.

---

### 5️⃣ تغيير الصعوبة أثناء اللعبة
**Endpoint:** `POST /manager/change-difficulty`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456,
  "newDifficulty": 5    // 1-10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Difficulty updated",
  "newDifficulty": 5
}
```

**النتيجة:** الأسئلة القادمة ستكون بالصعوبة الجديدة.

---

### 6️⃣ نقل صلاحية المدير (Main Manager Only)
**Endpoint:** `POST /manager/transfer`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456,           // المدير الحالي
  "newManagerUserId": 789  // المدير الجديد
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manager role transferred"
}
```

**النتيجة:**
- المدير القديم يصبح co_manager
- المدير الجديد يصبح manager
- تحديث created_by في جدول rooms

---

### 7️⃣ ترقية لاعب إلى مدير مساعد (Main Manager Only)
**Endpoint:** `POST /manager/promote`

**Request:**
```json
{
  "roomId": 123,
  "userId": 456,        // المدير
  "targetUserId": 789   // اللاعب المراد ترقيته
}
```

**Response:**
```json
{
  "success": true,
  "message": "Player promoted to co-manager"
}
```

**شرط:** `allow_co_managers` يجب أن يكون `true` في الإعدادات.

---

### 8️⃣ رؤية سجل تصرفات المديرين
**Endpoint:** `GET /manager/logs?roomId=123&userId=456`

**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": 1,
      "room_id": 123,
      "manager_user_id": 456,
      "manager_name": "أحمد",
      "action_type": "kick",
      "target_user_id": 789,
      "target_name": "محمد",
      "details": null,
      "created_at": "2026-01-10T10:30:00Z"
    },
    {
      "id": 2,
      "room_id": 123,
      "manager_user_id": 456,
      "manager_name": "أحمد",
      "action_type": "change_difficulty",
      "target_user_id": null,
      "target_name": null,
      "details": "{\"new_difficulty\": 7}",
      "created_at": "2026-01-10T10:35:00Z"
    }
  ]
}
```

**صلاحية:** فقط المديرين (manager و co_manager) يمكنهم رؤية السجل.

---

### 9️⃣ رؤية الإحصائيات التفصيلية
**Endpoint:** `GET /manager/detailed-stats?roomId=123&userId=456`

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "id": 1,
      "room_id": 123,
      "user_id": 789,
      "username": "محمد",
      "email": "mohamed@example.com",
      "score": 250,
      "puzzles_solved": 5,
      "is_ready": true,
      "role": "player",
      "is_frozen": false,
      "hints_used": 2,
      "hints_available": 1,
      "total_attempts": 8,
      "correct_answers": 5,
      "avg_time": 12500
    }
  ]
}
```

**صلاحية:**
- إذا `show_detailed_stats_to_all = true`: الجميع يستطيع رؤيتها
- إذا `show_detailed_stats_to_all = false`: فقط المديرين

---

## 🗃️ التغييرات في قاعدة البيانات

### جدول `room_participants` (محدّث)
```sql
CREATE TABLE room_participants (
  ...
  role TEXT DEFAULT 'player',        -- جديد: 'manager', 'co_manager', 'player'
  is_frozen BOOLEAN DEFAULT FALSE,   -- جديد: المدير يستطيع تجميد اللاعب
  is_kicked BOOLEAN DEFAULT FALSE,   -- جديد: المدير طرد اللاعب
  ...
);
```

### جدول `room_settings` (محدّث)
```sql
CREATE TABLE room_settings (
  ...
  -- إعدادات صلاحيات المدير (جديدة)
  manager_can_skip_puzzle BOOLEAN DEFAULT TRUE,
  manager_can_reset_scores BOOLEAN DEFAULT TRUE,
  manager_can_freeze_players BOOLEAN DEFAULT TRUE,
  manager_can_kick_players BOOLEAN DEFAULT TRUE,
  manager_can_change_difficulty BOOLEAN DEFAULT TRUE,
  allow_co_managers BOOLEAN DEFAULT TRUE,
  show_detailed_stats_to_all BOOLEAN DEFAULT FALSE,
  ...
);
```

### جدول `manager_actions` (جديد)
```sql
CREATE TABLE manager_actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room_id INTEGER NOT NULL,
  manager_user_id INTEGER NOT NULL,
  action_type TEXT NOT NULL,         -- 'kick', 'freeze', 'unfreeze', etc.
  target_user_id INTEGER,            -- إذا كان الإجراء يستهدف لاعب معين
  details TEXT,                      -- JSON مع تفاصيل إضافية
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ...
);
```

**الهدف:** شفافية كاملة - كل إجراء مدير يُسجّل ويمكن مراجعته.

---

## 📱 التكامل مع Frontend

### 1. التحقق من دور المستخدم
```dart
// في competition_provider.dart
Future<String?> getUserRole(int roomId, int userId) async {
  final participants = await getRoomStatus(roomId);
  final me = participants.firstWhere((p) => p.userId == userId);
  return me.role; // 'manager', 'co_manager', أو 'player'
}

bool isManager(String? role) {
  return role == 'manager' || role == 'co_manager';
}

bool isMainManager(String? role) {
  return role == 'manager';
}
```

### 2. إظهار أزرار المدير فقط
```dart
// في room_game_view.dart
Widget _buildManagerActions() {
  if (!isManager(_currentUserRole)) {
    return SizedBox.shrink(); // لا شيء للاعبين العاديين
  }

  return Row(
    children: [
      if (isMainManager(_currentUserRole)) ...[
        IconButton(
          icon: Icon(Icons.refresh),
          onPressed: _resetScores,
          tooltip: 'إعادة تعيين النقاط',
        ),
      ],
      IconButton(
        icon: Icon(Icons.skip_next),
        onPressed: _skipPuzzle,
        tooltip: 'تخطي السؤال',
      ),
      IconButton(
        icon: Icon(Icons.tune),
        onPressed: _changeDifficulty,
        tooltip: 'تغيير الصعوبة',
      ),
    ],
  );
}
```

### 3. عرض قائمة اللاعبين مع خيارات المدير
```dart
Widget _buildPlayerTile(Participant player) {
  return ListTile(
    leading: CircleAvatar(child: Text(player.username[0])),
    title: Text(player.username),
    subtitle: Text('النقاط: ${player.score}'),
    trailing: isManager(_currentUserRole) 
      ? PopupMenuButton(
          itemBuilder: (context) => [
            if (player.role == 'player') ...[
              PopupMenuItem(
                child: Text('تجميد'),
                value: 'freeze',
              ),
              PopupMenuItem(
                child: Text('ترقية لمدير مساعد'),
                value: 'promote',
              ),
            ],
            if (isMainManager(_currentUserRole)) ...[
              PopupMenuItem(
                child: Text('طرد'),
                value: 'kick',
              ),
              if (player.role == 'player')
                PopupMenuItem(
                  child: Text('نقل صلاحية المدير'),
                  value: 'transfer',
                ),
            ],
          ],
          onSelected: (value) => _handlePlayerAction(value, player),
        )
      : null,
  );
}
```

### 4. معالجة تجميد اللاعب
```dart
// في competition_provider.dart
Future<void> freezePlayer(int roomId, int userId, int targetUserId, bool freeze) async {
  final response = await _competitionService.freezePlayer(
    roomId: roomId,
    userId: userId,
    targetUserId: targetUserId,
    freeze: freeze,
  );
  
  if (response['success']) {
    // تحديث الحالة المحلية
    notifyListeners();
  }
}
```

### 5. إظهار رسالة للاعب المجمد
```dart
// في submitAnswer
try {
  await provider.submitAnswer(...);
} catch (e) {
  if (e.toString().contains('frozen')) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('❄️ مجمد'),
        content: Text('المدير قام بتجميدك مؤقتاً'),
        actions: [
          TextButton(
            child: Text('حسناً'),
            onPressed: () => Navigator.pop(ctx),
          ),
        ],
      ),
    );
  }
}
```

---

## 🎨 تصميم واجهة المدير (UI Design)

### لوحة تحكم المدير
```
┌─────────────────────────────────────┐
│  👑 لوحة تحكم المدير                │
├─────────────────────────────────────┤
│  ⚙️ الإعدادات                       │
│  👥 إدارة اللاعبين (5)              │
│  📊 الإحصائيات التفصيلية            │
│  📝 سجل التصرفات                    │
│  🔄 نقل الصلاحية                    │
└─────────────────────────────────────┘
```

### قائمة اللاعبين (للمدير)
```
محمد                 [250 نقطة]  🎮 لاعب
  ⋮ [تجميد | ترقية | طرد]

أحمد                 [180 نقطة]  🔧 مدير مساعد
  ⋮ [تجميد | تخفيض رتبة]

فاطمة                [150 نقطة]  🎮 لاعب
  ⋮ [تجميد | ترقية | طرد]
```

### أزرار سريعة (أسفل الشاشة)
```
┌──────────┬──────────┬──────────┬──────────┐
│ تخطي     │ صعوبة    │ إعادة    │ سجل      │
│ السؤال   │ +/-      │ النقاط   │ الأحداث  │
└──────────┴──────────┴──────────┴──────────┘
```

---

## 🔐 الأمان والتحقق - Security

### Middleware للتحقق من الصلاحيات
```javascript
// في كل endpoint للمدير
const manager = await isManager(env, roomId, userId);
if (!manager) {
  return new Response(JSON.stringify({ 
    error: 'Only managers can perform this action' 
  }), { status: 403 });
}
```

### منع الإساءة
1. **لا يمكن للمدير طرد نفسه**
2. **لا يمكن تجميد المدير الرئيسي**
3. **Co-managers لا يستطيعون طرد أحد**
4. **كل إجراء يُسجّل في manager_actions**
5. **التحقق من الإعدادات قبل تنفيذ كل إجراء**

---

## 📊 حالات الاستخدام - Use Cases

### سيناريو 1: لاعب يتصرف بشكل سيء
```
1. المدير يرى سلوك غير لائق
2. المدير يجمد اللاعب (freeze) مؤقتاً
3. اللاعب لا يستطيع إرسال إجابات
4. المدير يحذر اللاعب
5. إذا استمر: المدير يطرد اللاعب (kick)
6. كل الإجراءات تُسجّل في السجل
```

### سيناريو 2: تغيير الصعوبة أثناء اللعب
```
1. المدير يلاحظ أن الأسئلة سهلة جداً
2. المدير يفتح قائمة الإعدادات
3. يضغط على "تغيير الصعوبة"
4. يختار صعوبة 8 بدلاً من 3
5. الأسئلة القادمة تكون أصعب
6. الإجراء يُسجّل في السجل
```

### سيناريو 3: نقل الصلاحية
```
1. المدير الحالي يريد الانسحاب
2. يختار لاعب موثوق
3. يضغط "نقل صلاحية المدير"
4. اللاعب الجديد يصبح مدير
5. المدير القديم يصبح مدير مساعد
6. الإجراء يُسجّل
```

---

## ✅ قائمة التحقق - Checklist

### Backend ✅
- [x] تحديث schema.sql
- [x] إنشاء manager_permissions.js
- [x] إضافة routes في index.js
- [x] تحديث competitions.js لإضافة role
- [x] إضافة فحص is_frozen في submitAnswer
- [x] نظام تسجيل الإجراءات (manager_actions)

### Frontend (القادم)
- [ ] إضافة CompetitionService methods للـ API الجديدة
- [ ] تحديث CompetitionProvider
- [ ] إنشاء ManagerControlPanel view
- [ ] إضافة أزرار المدير في room_game_view
- [ ] إضافة قائمة popup للاعبين
- [ ] إظهار رسالة للاعب المجمد
- [ ] إظهار badge للدور (manager/co_manager/player)

---

## 🚀 الخطوات التالية

1. **اختبار Backend:**
   ```bash
   cd backend
   wrangler dev
   ```

2. **تحديث قاعدة البيانات:**
   ```bash
   # تطبيق schema الجديد
   wrangler d1 execute DB --file=schema.sql
   ```

3. **اختبار API:**
   ```bash
   # إنشاء غرفة (المنشئ يصبح manager)
   POST /competitions/rooms
   
   # طرد لاعب
   POST /manager/kick
   ```

4. **تطوير Frontend:**
   - إضافة UI للمديرين
   - تحديث Models
   - اختبار الميزات

---

**تاريخ التحديث:** ${new Date().toISOString()}
**الإصدار:** 3.0 - Manager Permissions System
**الحالة:** ✅ Backend جاهز - Frontend قادم
