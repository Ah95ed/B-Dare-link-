# سكريبت اختبار اللعب الفردي على Windows
# قم بتشغيله من PowerShell: .\test_single_player_windows.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "اختبار اللعب الفردي - Wonder Link Game" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# التحقق من Flutter
Write-Host "[1/5] التحقق من Flutter..." -ForegroundColor Yellow
$flutterVersion = flutter --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Flutter مثبت" -ForegroundColor Green
} else {
    Write-Host "✗ Flutter غير مثبت أو غير موجود في PATH" -ForegroundColor Red
    exit 1
}

# التحقق من الأجهزة المتاحة
Write-Host ""
Write-Host "[2/5] التحقق من الأجهزة المتاحة..." -ForegroundColor Yellow
$devices = flutter devices 2>&1
if ($devices -match "windows") {
    Write-Host "✓ Windows device متاح" -ForegroundColor Green
} else {
    Write-Host "✗ Windows device غير متاح" -ForegroundColor Red
    Write-Host "تأكد من تثبيت Windows desktop support:" -ForegroundColor Yellow
    Write-Host "  flutter config --enable-windows-desktop" -ForegroundColor Yellow
    exit 1
}

# التحقق من الاتصال بالإنترنت
Write-Host ""
Write-Host "[3/5] التحقق من الاتصال بالـ Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://wonder-link-backend.amhmeed31.workers.dev/generate-level" -Method POST -Body '{"language":"ar","level":1}' -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend متاح ويعمل" -ForegroundColor Green
    } else {
        Write-Host "⚠ Backend يستجيب لكن بحالة غير متوقعة: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ لا يمكن الوصول للـ Backend (قد يكون طبيعي إذا كان يحتاج auth)" -ForegroundColor Yellow
    Write-Host "  سيستخدم التطبيق الألغاز الافتراضية" -ForegroundColor Yellow
}

# التحقق من الكود
Write-Host ""
Write-Host "[4/5] التحقق من الكود..." -ForegroundColor Yellow
$analyze = flutter analyze 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ لا توجد أخطاء في الكود" -ForegroundColor Green
} else {
    Write-Host "⚠ هناك تحذيرات في الكود:" -ForegroundColor Yellow
    Write-Host $analyze
}

# جاهز للاختبار
Write-Host ""
Write-Host "[5/5] جاهز للاختبار!" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "الخطوات التالية:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. شغّل التطبيق:" -ForegroundColor White
Write-Host "   flutter run -d windows" -ForegroundColor Gray
Write-Host ""
Write-Host "2. اتبع دليل الاختبار في:" -ForegroundColor White
Write-Host "   WINDOWS_TEST_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "3. اختبر التدفق:" -ForegroundColor White
Write-Host "   - الصفحة الرئيسية → اللعب الفردي" -ForegroundColor Gray
Write-Host "   - اختيار المستوى 1" -ForegroundColor Gray
Write-Host "   - اختيار نمط 'اختيارات'" -ForegroundColor Gray
Write-Host "   - حل الألغاز" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
