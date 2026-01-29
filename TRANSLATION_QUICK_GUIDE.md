# دليل الاستخدام السريع للترجمات - Quick Translation Usage Guide

## ✅ تم إنشاء ملفات الترجمة بنجاح!

تم توليد الملفات التالية:
- `lib/l10n/app_localizations.dart` (الملف الرئيسي)
- `lib/l10n/app_localizations_en.dart` (الترجمة الإنجليزية)
- `lib/l10n/app_localizations_ar.dart` (الترجمة العربية)

---

## 📖 كيفية الاستخدام

### 1. استيراد المكتبة
```dart
import '../l10n/app_localizations.dart';
// أو
import 'package:wonder_link_game/l10n/app_localizations.dart';
```

### 2. استخدام الترجمات في UI

#### نص بسيط:
```dart
Text(AppLocalizations.of(context)!.levelComplete)
// النتيجة بالعربية: "اكتملت المرحلة!"
// النتيجة بالإنجليزية: "Level Complete!"
```

#### نص مع متغيرات:
```dart
// في ARB:
// "otpSent": "تم إرسال رمز التحقق إلى {email}"

Text(AppLocalizations.of(context)!.otpSent('user@example.com'))
// النتيجة: "تم إرسال رمز التحقق إلى user@example.com"
```

#### زر مع ترجمة:
```dart
ElevatedButton(
  onPressed: () {},
  child: Text(AppLocalizations.of(context)!.continueButton),
)
```

### 3. الحصول على اللغة الحالية:
```dart
final l10n = AppLocalizations.of(context)!;
final isArabic = Localizations.localeOf(context).languageCode == 'ar';

// أو باستخدام Provider
final isArabic = Provider.of<LocaleProvider>(context)
    .locale.languageCode == 'ar';
```

---

## 🔄 أمثلة للاستبدال

### قبل:
```dart
Text(isArabic ? "تسجيل الدخول" : "Login")
```

### بعد:
```dart
Text(AppLocalizations.of(context)!.login)
```

---

## 📝 قائمة النصوص المتاحة

### التنقل:
- `appTitle` - "رابط العجائب" / "Wonder Link"
- `soloPlay` - "اللعب الفردي" / "Solo Play"
- `tournaments` - "البطولات" / "Tournaments"
- `profile` - "الملف الشخصي" / "Profile"

### المصادقة:
- `login` - "تسجيل الدخول" / "Login"
- `register` - "إنشاء حساب" / "Register"
- `welcomeBack` - "مرحباً بعودتك!" / "Welcome Back!"
- `email` - "البريد الإلكتروني" / "Email"
- `password` - "كلمة المرور" / "Password"
- `forgotPassword` - "نسيت كلمة المرور؟" / "Forgot Password?"

### اللعب:
- `levelComplete` - "اكتملت المرحلة!" / "Level Complete!"
- `continueButton` - "متابعة" / "Continue"
- `next` - "التالي" / "Next"
- `tryAgain` - "حاول مرة أخرى!" / "Try again!"
- `checkAnswer` - "تحقق" / "Check"
- `chooseCorrectOption` - "اختر الإجابة الصحيحة" / "Choose the correct option"

### المكافآت:
- `coins` - "العملات" / "Coins"
- `streak` - "السلسلة" / "Streak"
- `badges` - "الأوسمة" / "Badges"
- `dailyBonus` - "مكافأة يومية!" / "Daily Bonus!"
- `achievementUnlocked` - "إنجاز جديد!" / "Achievement Unlocked!"

### البطولات:
- `daily` - "اليومي" / "Daily"
- `weekly` - "الأسبوعي" / "Weekly"
- `dailyChallenge` - "التحدي اليومي" / "Daily Challenge"
- `yourScore` - "نتيجتك" / "Your Score"
- `yourRank` - "ترتيبك" / "Your Rank"
- `playNow` - "العب الآن" / "Play Now"

### الواقع المعزز:
- `arMode` - "الواقع المعزز" / "AR Mode"
- `camera` - "الكاميرا" / "Camera"
- `gallery` - "المعرض" / "Gallery"
- `analyzingImage` - "جاري تحليل الصورة..." / "Analyzing Image..."

---

## 🔧 إضافة ترجمات جديدة

### 1. أضف النص في `lib/l10n/app_en.arb`:
```json
"myNewText": "My New Text"
```

### 2. أضف الترجمة في `lib/l10n/app_ar.arb`:
```json
"myNewText": "النص الجديد"
```

### 3. ولّد الملفات:
```bash
flutter gen-l10n
```

### 4. استخدم النص:
```dart
Text(AppLocalizations.of(context)!.myNewText)
```

---

## ⚠️ ملاحظات مهمة

1. **الكلمات المحجوزة**: تجنب استخدام كلمات Dart المحجوزة (مثل `continue`, `class`, `return`)
   - استخدم بدلاً منها: `continueButton`, `className`, `returnButton`

2. **المتغيرات**: عند إضافة متغيرات، يجب تعريف placeholders:
```json
"greeting": "Hello {name}!",
"@greeting": {
  "placeholders": {
    "name": {"type": "String"}
  }
}
```

3. **إعادة التوليد**: بعد كل تعديل على ملفات ARB، شغل:
```bash
flutter gen-l10n
```

---

## 📁 الملفات المرتبطة

- [lib/l10n/app_en.arb](lib/l10n/app_en.arb) - الترجمة الإنجليزية
- [lib/l10n/app_ar.arb](lib/l10n/app_ar.arb) - الترجمة العربية
- [l10n.yaml](l10n.yaml) - إعدادات الترجمة
- [TRANSLATION_IMPROVEMENTS.md](TRANSLATION_IMPROVEMENTS.md) - التوثيق الشامل

---

## ✨ استخدم السكريبت للتوليد التلقائي:

### Windows PowerShell:
```powershell
.\generate_translations.ps1
```

---

**تم التحديث**: يناير 2026  
**الحالة**: ✅ جاهز للاستخدام
