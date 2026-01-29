#!/usr/bin/env pwsh
# Script to regenerate localization files after updating ARB files

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Translation Files Generator" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if flutter is available
if (-not (Get-Command flutter -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Flutter not found in PATH" -ForegroundColor Red
    Write-Host "Please install Flutter or add it to your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Flutter found" -ForegroundColor Green
Write-Host ""

# Navigate to project root
Set-Location $PSScriptRoot

# Clean old generated files
Write-Host "🧹 Cleaning old generated files..." -ForegroundColor Yellow
$generatedFiles = @(
    "lib/l10n/app_localizations.dart",
    "lib/l10n/app_localizations_en.dart",
    "lib/l10n/app_localizations_ar.dart"
)

foreach ($file in $generatedFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  Removed: $file" -ForegroundColor Gray
    }
}

Write-Host ""

# Generate new localization files
Write-Host "🔨 Generating localization files..." -ForegroundColor Yellow
flutter gen-l10n

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Localization files generated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Generated files:" -ForegroundColor Cyan
    foreach ($file in $generatedFiles) {
        if (Test-Path $file) {
            Write-Host "  ✓ $file" -ForegroundColor Green
        }
    }
} else {
    Write-Host ""
    Write-Host "❌ Failed to generate localization files" -ForegroundColor Red
    Write-Host "Please check the ARB file syntax" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. Import AppLocalizations in your Dart files:" -ForegroundColor White
Write-Host "   import '../l10n/app_localizations.dart';" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Use translations:" -ForegroundColor White
Write-Host "   Text(AppLocalizations.of(context)!.levelComplete)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run the app to test:" -ForegroundColor White
Write-Host "   flutter run" -ForegroundColor Gray
Write-Host ""
