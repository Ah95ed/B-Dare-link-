# 🔧 إصلاح مشكلة إنشاء الغرف - Room Creation Fix

## 🐛 المشكلة
عند إنشاء غرفة جديدة، لا يمكن رؤيتها أو الدخول لها.

## 🔍 السبب
عند إضافة نظام الصلاحيات، أضفنا حقول جديدة في قاعدة البيانات:
- `room_participants.role` (manager/co_manager/player)
- `room_participants.is_frozen`
- `room_participants.is_kicked`
- `room_settings` (جدول جديد مع 17 حقل)
- `manager_actions` (جدول جديد)

**المشكلة:** الغرف القديمة تعمل، لكن الغرف الجديدة لا تُنشأ `room_settings` تلقائياً.

## ✅ الحل

### 1️⃣ تحديث competitions.js
أضفنا إنشاء `room_settings` تلقائياً عند إنشاء غرفة جديدة:

```javascript
// بعد إنشاء room_participants
await env.DB.prepare(`
  INSERT INTO room_settings (
    room_id, 
    hints_enabled, 
    hints_per_player,
    // ... 17 حقل بقيم افتراضية
  ) VALUES (?, ?, ?, ...)
`).bind(roomId, 1, 3, ...).run();
```

### 2️⃣ تطبيق Migration على قاعدة البيانات
لتحديث الغرف الموجودة وإضافة الحقول الناقصة:

```bash
# تطبيق migration على D1 المحلية
wrangler d1 execute wonderlink-db --local --file=migrations/0001_manager_permissions.sql

# تطبيق migration على D1 البعيدة (Production)
wrangler d1 execute wonderlink-db --remote --file=migrations/0001_manager_permissions.sql
```

### 3️⃣ أو إعادة إنشاء قاعدة البيانات (للتطوير فقط)
```bash
# حذف القاعدة الحالية وإعادة إنشائها
wrangler d1 execute wonderlink-db --local --file=schema.sql
```

## 📋 التحديثات المطبقة

### ✅ competitions.js
- إضافة إنشاء `room_settings` تلقائياً
- جميع الحقول تأخذ قيم افتراضية معقولة

### ✅ migrations/0001_manager_permissions.sql
```sql
-- إضافة حقول جديدة لـ room_participants
ALTER TABLE room_participants ADD COLUMN role TEXT DEFAULT 'player';
ALTER TABLE room_participants ADD COLUMN is_frozen BOOLEAN DEFAULT FALSE;
ALTER TABLE room_participants ADD COLUMN is_kicked BOOLEAN DEFAULT FALSE;

-- تحديث المنشئين ليكونوا managers
UPDATE room_participants 
SET role = 'manager' 
WHERE user_id IN (SELECT created_by FROM rooms WHERE id = room_participants.room_id);

-- إضافة حقول جديدة لـ room_settings
ALTER TABLE room_settings ADD COLUMN manager_can_skip_puzzle BOOLEAN DEFAULT TRUE;
-- ... بقية الحقول

-- إنشاء جدول manager_actions
CREATE TABLE IF NOT EXISTS manager_actions (...);
```

### ✅ wrangler.toml
```toml
[[d1_databases]]
binding = "DB"
database_name = "wonder-link-db"
migrations_dir = "migrations"  # جديد
```

## 🧪 الاختبار

### 1. اختبار إنشاء غرفة جديدة
```bash
curl -X POST https://wonder-link-backend.amhmeed31.workers.dev/competitions/rooms \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "اختبار جديد",
    "puzzleCount": 5,
    "difficulty": 3
  }'
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "room": {
    "id": 123,
    "name": "اختبار جديد",
    "code": "ABC123",
    "status": "waiting",
    ...
  }
}
```

### 2. اختبار الدخول للغرفة
```bash
curl -X GET "https://wonder-link-backend.amhmeed31.workers.dev/rooms/status?roomId=123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة:**
```json
{
  "room": { ... },
  "participants": [
    {
      "user_id": 456,
      "username": "أحمد",
      "role": "manager",  // ✅
      "is_frozen": false, // ✅
      "is_kicked": false, // ✅
      "score": 0
    }
  ],
  "currentPuzzle": null
}
```

### 3. اختبار رؤية الغرفة في قائمتي
```bash
curl -X GET "https://wonder-link-backend.amhmeed31.workers.dev/rooms/my" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**النتيجة المتوقعة:**
```json
{
  "rooms": [
    {
      "id": 123,
      "name": "اختبار جديد",
      "code": "ABC123",
      "status": "waiting",
      ...
    }
  ]
}
```

## 🚀 خطوات النشر

### للتطوير المحلي:
```bash
# 1. تطبيق migration
wrangler d1 execute wonderlink-db --local --file=migrations/0001_manager_permissions.sql

# 2. تشغيل dev server
wrangler dev
```

### للإنتاج (Production):
```bash
# 1. تطبيق migration على قاعدة البيانات البعيدة
wrangler d1 execute wonderlink-db --remote --file=migrations/0001_manager_permissions.sql

# 2. نشر Worker
wrangler deploy
```

## 🔄 إصلاح الغرف الموجودة (اختياري)

إذا كانت هناك غرف موجودة بدون `room_settings`:

```sql
-- إنشاء settings للغرف التي لا تملك واحدة
INSERT INTO room_settings (
  room_id, 
  hints_enabled, 
  hints_per_player,
  hint_penalty_percent,
  allow_report_bad_puzzle,
  auto_advance_seconds,
  shuffle_options,
  show_rankings_live,
  allow_skip_puzzle,
  min_time_per_puzzle,
  manager_can_skip_puzzle,
  manager_can_reset_scores,
  manager_can_freeze_players,
  manager_can_kick_players,
  manager_can_change_difficulty,
  allow_co_managers,
  show_detailed_stats_to_all
)
SELECT 
  r.id,
  1, 3, 10, 1, 2, 1, 1, 0, 5, 1, 1, 1, 1, 1, 1, 0
FROM rooms r
LEFT JOIN room_settings rs ON r.id = rs.room_id
WHERE rs.id IS NULL;
```

## ✅ قائمة التحقق

- [x] تحديث `createRoom()` لإنشاء `room_settings`
- [x] إنشاء migration script
- [x] تحديث wrangler.toml
- [x] نشر التحديثات
- [ ] تطبيق migration على D1 المحلية
- [ ] تطبيق migration على D1 البعيدة
- [ ] اختبار إنشاء غرفة جديدة
- [ ] اختبار الدخول للغرفة
- [ ] اختبار رؤية الغرفة في القائمة

## 📝 ملاحظات

1. **Migration تلقائي:** عند تشغيل `wrangler dev` أو `wrangler deploy` في المستقبل، سيطبق migrations تلقائياً
2. **Backward compatible:** الكود الجديد يعمل مع الغرف القديمة والجديدة
3. **القيم الافتراضية:** جميع الحقول الجديدة لها قيم افتراضية معقولة
4. **الأمان:** منشئ الغرفة يصبح `manager` تلقائياً، الباقي `player`

---

**الحالة:** ✅ تم النشر - يحتاج لتطبيق migration على D1
**التاريخ:** 2026-01-10
