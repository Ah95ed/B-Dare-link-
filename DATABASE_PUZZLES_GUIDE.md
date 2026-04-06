# نظام جلب الأسئلة من قاعدة البيانات أو Gemini API

## 📋 نظرة عامة

تم تعديل نظام توليد الأسئلة لدعم مصدرين:
1. **Database** (قاعدة البيانات المحلية) - المصدر الافتراضي
2. **AI** (Gemini API) - احتياطي عند عدم توفر أسئلة في قاعدة البيانات

---

## ⚙️ التعديلات المُنفَّذة

### 1. تحديث `backend/src/game.js`

#### إضافة معامل `source`
```javascript
export async function generateLevel(request, env, headers) {
  const { language = 'ar', level = 1, fresh = false, source = 'database' } = await request.json();
  // ...
}
```

#### منطق الجلب من قاعدة البيانات
```javascript
if (source === 'database' && env?.DB && !fresh) {
  // جلب عدد الأسئلة المتوفرة للمستوى واللغة
  const countRow = await env.DB
    .prepare('SELECT COUNT(*) AS c FROM puzzles WHERE level = ? AND lang = ?')
    .bind(Number(level), language)
    .first();
  
  const count = Number(countRow?.c ?? 0);
  
  if (count >= bankMin && count > 0) {
    // جلب سؤال عشوائي
    const row = await env.DB
      .prepare('SELECT json FROM puzzles WHERE level = ? AND lang = ? ORDER BY RANDOM() LIMIT 1')
      .bind(Number(level), language)
      .first();
    
    if (row?.json) {
      const cached = JSON.parse(row.json);
      if (!isBadPuzzle(cached)) {
        generationProvider = 'd1_database';
        return new Response(JSON.stringify(cached), ...);
      }
    }
  }
}
```

### 2. تحديث `backend/wrangler.toml`
```toml
[vars]
PUZZLE_BANK_MIN = "1"  # قبل: 30 (الآن يكفي سؤال واحد)
```

### 3. إضافة بيانات تجريبية في `backend/seed.sql`

تم  إضافة 8 أسئلة بصيغة `logical_chain`:

| ID | Level | اللغة | السؤال |
|----|-------|-------|---------|
| 1  | 1     | ar    | حليب → زبدة |
| 2  | 1     | ar    | بذرة → ثمرة |
| 3  | 2     | ar    | غابة → كتاب |
| 4  | 2     | ar    | سحاب → قوس قزح |
| 5  | 3     | en    | water → power |
| 6  | 3     | en    | sand → chip |
| 7  | 4     | ar    | فكرة → شركة |
| 8  | 5     | en    | atom → planet |

**ملاحظة:** عدد الخطوات (`steps`) يتناسب مع متطلبات كل مستوى:
- Levels 1-10: 2-3 خطوات
- Levels 11-30: 3-4 خطوات
- Levels 31-50: 4-5 خطوات
- Levels 50+: 5-6 خطوات

---

## 🚀 الاستخدام

### 1. طلب سؤال من قاعدة البيانات (الافتراضي)
```bash
POST /generate-level
Content-Type: application/json

{
  "language": "ar",
  "level": 1,
  "source": "database"
}
```

**النتيجة:**
```json
{
  "type": "logical_chain",
  "startWord": "حليب",
  "endWord": "زبدة",
  "steps": [
    {"word": "خض", "options": ["خض", "تسخين", "تبريد", "تجميد"]},
    {"word": "كريمة", "options": ["كريمة", "ماء", "سكر", "ملح"]}
  ],
  "hint": "فكّر في تحويل الحليب إلى منتج ألذ",
  "puzzleId": "db-ar-l1-1"
}
```

**معرف المصدر:** `puzzleId` يبدأ بـ `db-` للدلالة على أنه من قاعدة البيانات.

### 2. طلب سؤال من Gemini API
```bash
POST /generate-level
Content-Type: application/json

{
  "language": "en",
  "level": 10,
  "source": "ai"
}
```

**النتيجة:** سؤال مُولَّد بواسطة Gemini API (يتطلب `GEMINI_API_KEY` صالح).

### 3. تجاهل قاعدة البيانات وتوليد سؤال جديد
```bash
POST /generate-level
Content-Type: application/json

{
  "language": "ar",
  "level": 1,
  "source": "database",
  "fresh": true
}
```

---

## 🧪 الاختبار المحلي

### 1. تهيئة قاعدة البيانات
```powershell
cd backend
npm run db:init:local
```

### 2. إدخال البيانات التجريبية
```powershell
npx wrangler d1 execute wonder-link-db --local --file=seed.sql --config ./wrangler.toml
```

### 3. تشغيل السيرفر المحلي
```powershell
npm run dev:local
```

### 4. اختبار جلب سؤال
```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8787/generate-level" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"language":"ar","level":1,"source":"database"}' `
  | Select-Object puzzleId,startWord,endWord
```

**النتيجة المتوقعة:**
```
puzzleId   startWord endWord
--------   --------- -------
db-ar-l1-1 حليب     زبدة
```

---

## 📊 مثال عملي: تشغيل الاختبارات

### إعادة بناء قاعدة البيانات وتشغيل الاختبارات
```powershell
# 1. إعادة تهيئة قاعدة البيانات
cd d:\wonder_link_game\backend
Remove-Item .wrangler\state\v3\d1\*.sqlite* -Force
npm run db:init:local
npx wrangler d1 execute wonder-link-db --local --file=seed.sql --config ./wrangler.toml

# 2. تشغيل السيرفر في خلفية (terminal منفصل)
npm run dev:local

# 3. تشغيل الاختبارات
npm run test:run
```

**النتيجة:**
```
✓ tests/database.test.js (3)
✓ tests/api.test.js (12)

Test Files  2 passed (2)
Tests  15 passed (15)
Duration  2.65s
```

---

## 🔄 المنطق عند فشل قاعدة البيانات

إذا:
1. لم يكن `env.DB` متوفرًا
2. أو لم توجد أسئلة كافية للمستوى المطلوب
3. أو فشل السؤال في التحقق (`isBadPuzzle`)

**سيتم التراجع إلى:**
- Gemini API (إذا كان `GEMINI_API_KEY` موجود)
- OpenAI API (إذا كان `OPENAI_API_KEY` موجود)
- Workers AI (إذا كان `env.AI` متوفر)
- Groq API (إذا كان `GROQ_API_KEY` موجود)
- Fallback Templates (كملاذ أخير)

---

## ✅ التحقق من النجاح

### علامات النجاح
✅ `puzzleId` يبدأ بـ `db-` (Database)  
✅ `X-AI-Provider: d1_database` في response headers  
✅ الأسئلة تتغير بشكل عشوائي عند تكرار الطلب  

### علامات الفشل
❌ `puzzleId` يبدأ بـ `fallback-`  
❌ `debugError: gemini_http_400`  
❌ رسائل خطأ في console السيرفر  

---

## 🎯 الخلاصة

النظام الآن:
- ✅ يجلب الأسئلة من قاعدة البيانات أولاً
- ✅ يدعم التبديل بين Database و AI عبر معامل `source`
- ✅ يحتوي على 8 أسئلة تجريبية جاهزة للاختبار
- ✅ يتراجع تلقائيًا إلى Gemini API عند الحاجة
- ✅ مُختبر ويعمل محليًا بدون مشاكل

---

## 📝 ملاحظات مهمة

1. **عدد الخطوات:** تأكد من أن عدد `steps` في كل سؤال يتناسب مع المستوى:
   - Level 1-10: min=2, max=3
   - Level 11-30: min=3, max=4
   - إلخ...

2. **GEMINI_API_KEY:** إذا كان منتهي الصلاحية، أضف مفتاح جديد في `backend/.dev.vars`

3. **PUZZLE_BANK_MIN:** الحد الأدنى من الأسئلة المطلوب في قاعدة البيانات لكل مستوى ولغة (حاليًا = 1)

---

تم التطوير بنجاح! 🎉
