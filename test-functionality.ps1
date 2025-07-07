# Test Script for Complete Functionality Verification
# This script helps verify that all systems are working properly

Write-Host "🧪 Blog Platform Functionality Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if site is accessible
Write-Host "📡 Test 1: Checking site accessibility..." -ForegroundColor Yellow
$siteUrl = "https://antonio-parada.github.io/parada-site/"
try {
    $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Site returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Site is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Check if GitHub Actions workflow exists
Write-Host "🔧 Test 2: Checking GitHub Actions backend..." -ForegroundColor Yellow
if (Test-Path ".github/workflows/backend-api.yml") {
    Write-Host "✅ GitHub Actions workflow file exists" -ForegroundColor Green
    $workflowContent = Get-Content ".github/workflows/backend-api.yml" -Raw
    if ($workflowContent -match "create-blog") {
        Write-Host "✅ Backend API workflow is configured for blog creation" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend API workflow is missing blog creation support" -ForegroundColor Red
    }
} else {
    Write-Host "❌ GitHub Actions workflow file not found" -ForegroundColor Red
}
Write-Host ""

# Test 3: Check if frontend files are present
Write-Host "🌐 Test 3: Checking frontend files..." -ForegroundColor Yellow
$frontendFiles = @(
    "static/js/google-auth.js",
    "static/js/github-api-client.js", 
    "static/js/auth-debug.js",
    "static/js/auth-fix.js",
    "content/create-blog.md"
)

$missingFiles = @()
foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file is missing" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "✅ All frontend files are present" -ForegroundColor Green
} else {
    Write-Host "❌ Missing files: $($missingFiles -join ', ')" -ForegroundColor Red
}
Write-Host ""

# Test 4: Check data directories
Write-Host "💾 Test 4: Checking data structure..." -ForegroundColor Yellow
$dataDirs = @("data", "data/users", "data/blogs")
foreach ($dir in $dataDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir directory exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir directory is missing" -ForegroundColor Red
    }
}
Write-Host ""

# Test 5: Check OAuth configuration
Write-Host "🔐 Test 5: Checking OAuth configuration..." -ForegroundColor Yellow
if (Test-Path "static/js/google-auth.js") {
    $authContent = Get-Content "static/js/google-auth.js" -Raw
    if ($authContent -match "717968394179-ldu9da3rq27aridcm93gnjskujd5usv9.apps.googleusercontent.com") {
        Write-Host "✅ Google OAuth Client ID is configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Google OAuth Client ID not found" -ForegroundColor Red
    }
    
    if ($authContent -match "antonio-parada.github.io") {
        Write-Host "✅ OAuth redirect URI is configured for GitHub Pages" -ForegroundColor Green
    } else {
        Write-Host "❌ OAuth redirect URI not configured for GitHub Pages" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Google OAuth file not found" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "📋 Test Summary" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Live Site: $siteUrl" -ForegroundColor White
Write-Host "📝 Create Blog: ${siteUrl}create-blog/" -ForegroundColor White
Write-Host "📊 Dashboard: ${siteUrl}dashboard/" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Manual Testing Steps:" -ForegroundColor Yellow
Write-Host "1. Visit the create-blog page" -ForegroundColor White
Write-Host "2. Fill out the form with test data" -ForegroundColor White  
Write-Host "3. Submit and watch for GitHub Issue creation" -ForegroundColor White
Write-Host "4. Check GitHub Actions for workflow execution" -ForegroundColor White
Write-Host "5. Verify new files are created in data/ directories" -ForegroundColor White
Write-Host "6. Test OAuth authentication flow" -ForegroundColor White
Write-Host "7. Use debug tools (Ctrl+Shift+D) to monitor" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Debug Commands (in browser console):" -ForegroundColor Yellow
Write-Host "- testBackend() - Test GitHub backend" -ForegroundColor White
Write-Host "- listBlogs() - List all blogs" -ForegroundColor White
Write-Host "- listUsers() - List all users" -ForegroundColor White
Write-Host "- Ctrl+Shift+D - Open debug UI" -ForegroundColor White
Write-Host "- Ctrl+Shift+A - Show auth status" -ForegroundColor White
Write-Host ""

if ($missingFiles.Count -eq 0) {
    Write-Host "🎉 All systems appear to be properly configured!" -ForegroundColor Green
    Write-Host "Ready for functionality testing on the live site." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some issues detected. Please review the test results above." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to open the live site for testing..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open test pages
Start-Process "https://antonio-parada.github.io/parada-site/"
Start-Sleep 2
Start-Process "https://antonio-parada.github.io/parada-site/create-blog/"
