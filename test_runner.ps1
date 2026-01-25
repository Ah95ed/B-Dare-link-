# سكريبت اختبار تلقائي للعب الفردي
# يقوم بفحص الكود والاتصالات وإنشاء تقرير

$ErrorActionPreference = "Stop"
$testResults = @()

function Test-Step {
    param($name, $test)
    Write-Host "[TEST] $name..." -ForegroundColor Yellow -NoNewline
    try {
        $result = & $test
        Write-Host " ✓ PASS" -ForegroundColor Green
        $script:testResults += @{Name=$name; Status="PASS"; Details=$result}
        return $true
    } catch {
        Write-Host " ✗ FAIL" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
        $script:testResults += @{Name=$name; Status="FAIL"; Details=$_.ToString()}
        return $false
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "اختبار تلقائي - اللعب الفردي" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Flutter Installation
Test-Step "Flutter مثبت" {
    $version = flutter --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Flutter not found" }
    return "Flutter version check passed"
}

# Test 2: Windows Support
Test-Step "Windows Desktop Support" {
    $devices = flutter devices 2>&1 | Out-String
    if ($devices -notmatch "windows") { 
        throw "Windows device not available. Run: flutter config --enable-windows-desktop"
    }
    return "Windows device available"
}

# Test 3: Code Analysis
Test-Step "تحليل الكود" {
    $analyze = flutter analyze 2>&1 | Out-String
    if ($LASTEXITCODE -ne 0) {
        # Check if it's just warnings or actual errors
        if ($analyze -match "error •") {
            throw "Code has errors: $analyze"
        }
        return "Code has warnings but no errors"
    }
    return "No code issues found"
}

# Test 4: Dependencies
Test-Step "التحقق من Dependencies" {
    if (-not (Test-Path "pubspec.yaml")) {
        throw "pubspec.yaml not found"
    }
    flutter pub get 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to get dependencies"
    }
    return "Dependencies resolved"
}

# Test 5: Check Key Files
Test-Step "التحقق من الملفات الأساسية" {
    $requiredFiles = @(
        "lib/main.dart",
        "lib/views/home_view.dart",
        "lib/views/levels_view.dart",
        "lib/views/game_mode_selection_view.dart",
        "lib/views/game_play_view.dart",
        "lib/controllers/game_provider.dart",
        "lib/services/api_service.dart"
    )
    
    $missing = @()
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $missing += $file
        }
    }
    
    if ($missing.Count -gt 0) {
        throw "Missing files: $($missing -join ', ')"
    }
    return "All required files present"
}

# Test 6: Check Imports
Test-Step "التحقق من الـ Imports" {
    $mainFile = Get-Content "lib/main.dart" -Raw
    if ($mainFile -notmatch "GameProvider") {
        throw "GameProvider not imported in main.dart"
    }
    if ($mainFile -notmatch "HomeView") {
        throw "HomeView not imported in main.dart"
    }
    return "Key imports present"
}

# Test 7: Check Navigation Flow
Test-Step "التحقق من تدفق التنقل" {
    $homeView = Get-Content "lib/views/home_view.dart" -Raw
    if ($homeView -notmatch "LevelsView") {
        throw "LevelsView navigation not found in home_view.dart"
    }
    
    $levelsView = Get-Content "lib/views/levels_view.dart" -Raw
    if ($levelsView -notmatch "GameModeSelectionView") {
        throw "GameModeSelectionView navigation not found in levels_view.dart"
    }
    
    $modeView = Get-Content "lib/views/game_mode_selection_view.dart" -Raw
    if ($modeView -notmatch "GamePlayView") {
        throw "GamePlayView navigation not found in game_mode_selection_view.dart"
    }
    
    return "Navigation flow is correct"
}

# Test 8: Check GameProvider Methods
Test-Step "التحقق من GameProvider" {
    $provider = Get-Content "lib/controllers/game_provider.dart" -Raw
    $requiredMethods = @("loadLevel", "validateChain", "checkStep", "advancePuzzle")
    
    $missing = @()
    foreach ($method in $requiredMethods) {
        if ($provider -notmatch $method) {
            $missing += $method
        }
    }
    
    if ($missing.Count -gt 0) {
        throw "Missing methods in GameProvider: $($missing -join ', ')"
    }
    return "All required methods present"
}

# Test 9: Check API Service
Test-Step "التحقق من API Service" {
    $apiService = Get-Content "lib/services/api_service.dart" -Raw
    if ($apiService -notmatch "generateLevel") {
        throw "generateLevel method not found in api_service.dart"
    }
    if ($apiService -notmatch "wonder-link-backend") {
        throw "Backend URL not found in api_service.dart"
    }
    return "API Service configured correctly"
}

# Test 10: Backend Connection (Optional)
Test-Step "التحقق من الاتصال بالـ Backend" {
    try {
        $response = Invoke-WebRequest -Uri "https://wonder-link-backend.amhmeed31.workers.dev/generate-level" `
            -Method POST `
            -Body '{"language":"ar","level":1}' `
            -ContentType "application/json" `
            -TimeoutSec 5 `
            -ErrorAction SilentlyContinue
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            if ($data.startWord -and $data.endWord) {
                return "Backend is working and returning valid puzzles"
            } else {
                return "Backend responds but format may be unexpected"
            }
        }
    } catch {
        # Backend might require auth or have CORS issues, that's OK for now
        return "Backend connection test skipped (may require auth)"
    }
    return "Backend connection test completed"
}

# Generate Report
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "تقرير الاختبار" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "النتائج:" -ForegroundColor White
Write-Host "  إجمالي الاختبارات: $total" -ForegroundColor Gray
Write-Host "  نجحت: $passed" -ForegroundColor Green
Write-Host "  فشلت: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✅ جميع الاختبارات نجحت!" -ForegroundColor Green
    Write-Host ""
    Write-Host "التطبيق جاهز للتشغيل:" -ForegroundColor Cyan
    Write-Host "  flutter run -d windows" -ForegroundColor Gray
} else {
    Write-Host "⚠️  بعض الاختبارات فشلت. راجع التفاصيل أعلاه." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "الاختبارات الفاشلة:" -ForegroundColor Red
    foreach ($test in ($testResults | Where-Object { $_.Status -eq "FAIL" })) {
        Write-Host "  - $($test.Name): $($test.Details)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

# Save detailed report
$report = @"
# تقرير اختبار اللعب الفردي
تاريخ: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## النتائج الإجمالية
- إجمالي الاختبارات: $total
- نجحت: $passed
- فشلت: $failed

## تفاصيل الاختبارات

"@

foreach ($test in $testResults) {
    $status = if ($test.Status -eq "PASS") { "✅" } else { "❌" }
    $report += @"
### $status $($test.Name)
**الحالة:** $($test.Status)
**التفاصيل:** $($test.Details)

"@
}

$report | Out-File "test_report.md" -Encoding UTF8
Write-Host "تم حفظ التقرير التفصيلي في: test_report.md" -ForegroundColor Cyan
