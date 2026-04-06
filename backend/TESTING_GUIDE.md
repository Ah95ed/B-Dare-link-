# Backend Testing Guide

## تشغيل الاختبارات

### الخطوة 1: شغّل الباكيند محلياً
```powershell
# في ترمينال منفصل
cd D:\wonder_link_game\backend
npm run dev:local
```

### الخطوة 2: شغّل الاختبارات
```powershell
# في ترمينال آخر
cd D:\wonder_link_game\backend
npm test              # watch mode
npm run test:run      # run once
```

## ما الذي يتم اختباره

✅ **Auth Endpoints**
- Register (مستخدم جديد)
- Login (دخول)
- Validation (حقول مفقودة)

✅ **Game Endpoints**
- Generate Puzzle (Arabic & English)
- Puzzle Structure Validation
- Options Validation

✅ **Tournament Endpoints**
- Daily Challenge
- Daily Leaderboard

✅ **Admin Endpoints**
- List Puzzles (مع التحقق من التصلاح)

✅ **CORS & Health**
- Preflight Requests
- Server Stability

## ملاحظات مهمة

- الاختبارات تحتاج سيرفر محلي يشتغل على `http://127.0.0.1:8787`
- كل اختبار مستقل ولا يعتمد على آخر
- التايمآوت الافتراضي 30 ثانية

## قبل النشر (إجباري)

### تدفق العمل المقترح
```powershell
cd D:\wonder_link_game\backend
npm run test:run   # تحقق محلي سريع
npm run deploy     # سيشغّل test:run تلقائيًا عبر predeploy
```

إذا فشل الاختبار، لن يبدأ النشر حتى يتم حل المشكلة.
