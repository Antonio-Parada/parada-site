# Verification Script for OneDrive Setup
# This script verifies that all portfolio components are properly organized in OneDrive Documents

Write-Host "=== OneDrive Portfolio Setup Verification ===" -ForegroundColor Green
Write-Host "Checking that all components are properly organized..." -ForegroundColor Yellow

$success = $true

# Check main portfolio directory
$portfolioPath = "C:\Users\apara\OneDrive\Documents\parada-site"
Write-Host "`n[1/5] Checking portfolio site directory..." -ForegroundColor Cyan
if (Test-Path $portfolioPath) {
    Write-Host "✅ Portfolio site found at: $portfolioPath" -ForegroundColor Green
} else {
    Write-Host "❌ Portfolio site NOT found at: $portfolioPath" -ForegroundColor Red
    $success = $false
}

# Check Obsidian vault
$obsidianPath = "C:\Users\apara\OneDrive\Documents\Obsidian Vault"
Write-Host "`n[2/5] Checking Obsidian vault..." -ForegroundColor Cyan
if (Test-Path $obsidianPath) {
    Write-Host "✅ Obsidian vault found at: $obsidianPath" -ForegroundColor Green
    
    # Check blog content structure
    $blogPath = Join-Path $obsidianPath "blog\content"
    if (Test-Path $blogPath) {
        Write-Host "✅ Blog content structure found" -ForegroundColor Green
        
        $postsPath = Join-Path $blogPath "posts"
        if (Test-Path $postsPath) {
            Write-Host "✅ Posts directory exists" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Posts directory not found - you can create it later" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Blog content structure not found - you can create it later" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Obsidian vault NOT found at: $obsidianPath" -ForegroundColor Red
    $success = $false
}

# Check key files in portfolio directory
Write-Host "`n[3/5] Checking key portfolio files..." -ForegroundColor Cyan
$keyFiles = @(
    "hugo.toml",
    "sync-obsidian.ps1", 
    "sync-and-deploy.ps1",
    "setup.ps1",
    ".github\workflows\deploy.yml"
)

foreach ($file in $keyFiles) {
    $filePath = Join-Path $portfolioPath $file
    if (Test-Path $filePath) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file NOT found" -ForegroundColor Red
        $success = $false
    }
}

# Check Git repository
Write-Host "`n[4/5] Checking Git repository..." -ForegroundColor Cyan
$gitPath = Join-Path $portfolioPath ".git"
if (Test-Path $gitPath) {
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    
    # Check for themes
    $themePath = Join-Path $portfolioPath "themes\PaperMod"
    if (Test-Path $themePath) {
        Write-Host "✅ PaperMod theme found" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PaperMod theme not found - may need to reinitialize submodules" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Git repository NOT initialized" -ForegroundColor Red
    $success = $false
}

# Check OneDrive sync status
Write-Host "`n[5/5] Checking OneDrive sync status..." -ForegroundColor Cyan
$oneDriveStatus = Get-Process -Name "OneDrive" -ErrorAction SilentlyContinue
if ($oneDriveStatus) {
    Write-Host "✅ OneDrive is running and should sync your files" -ForegroundColor Green
} else {
    Write-Host "⚠️  OneDrive process not detected - make sure OneDrive is running" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== Verification Summary ===" -ForegroundColor Green
if ($success) {
    Write-Host "🎉 All components are properly organized in OneDrive Documents!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your setup includes:" -ForegroundColor White
    Write-Host "📁 Portfolio Site: C:\Users\apara\OneDrive\Documents\parada-site" -ForegroundColor Cyan
    Write-Host "📁 Obsidian Vault: C:\Users\apara\OneDrive\Documents\Obsidian Vault" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Run: .\setup.ps1 -GitHubUsername 'YOUR_USERNAME'" -ForegroundColor White
    Write-Host "2. Configure GitHub Pages and DNS as shown in README" -ForegroundColor White
    Write-Host "3. Start creating content in your Obsidian vault" -ForegroundColor White
    Write-Host "4. Deploy with: .\sync-and-deploy.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Some components are missing or incorrectly configured" -ForegroundColor Red
    Write-Host "Please review the issues above and fix them before proceeding" -ForegroundColor Yellow
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Green
