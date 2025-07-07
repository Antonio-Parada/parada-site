# GitHub Pages Platform Test Script
# Simple verification without unicode characters

Write-Host "GitHub Pages Integration Test" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Test 1: Repository Status
Write-Host "`nTesting repository status..." -ForegroundColor Cyan
try {
    $repo = git remote get-url origin
    $branch = git branch --show-current
    Write-Host "OK - Repository: $repo" -ForegroundColor Green
    Write-Host "OK - Branch: $branch" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Git not configured" -ForegroundColor Red
}

# Test 2: CNAME File
Write-Host "`nTesting CNAME configuration..." -ForegroundColor Cyan
if (Test-Path "CNAME") {
    $domain = Get-Content "CNAME"
    Write-Host "OK - Custom domain: $domain" -ForegroundColor Green
} else {
    Write-Host "ERROR - CNAME file missing" -ForegroundColor Red
}

# Test 3: Hugo Config
Write-Host "`nTesting Hugo configuration..." -ForegroundColor Cyan
if (Test-Path "hugo.toml") {
    $config = Get-Content "hugo.toml" -Raw
    if ($config -like "*blog.mypp.site*") {
        Write-Host "OK - BaseURL configured" -ForegroundColor Green
    } else {
        Write-Host "WARNING - BaseURL needs review" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR - Hugo config missing" -ForegroundColor Red
}

# Test 4: GitHub Actions
Write-Host "`nTesting GitHub Actions..." -ForegroundColor Cyan
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "OK - Deploy workflow exists" -ForegroundColor Green
    try {
        gh run list --limit 1 | Out-Host
    } catch {
        Write-Host "WARNING - Cannot check run status" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERROR - Deploy workflow missing" -ForegroundColor Red
}

# Test 5: OAuth Setup
Write-Host "`nTesting OAuth configuration..." -ForegroundColor Cyan
if (Test-Path "static/js/google-auth.js") {
    $auth = Get-Content "static/js/google-auth.js" -Raw
    if ($auth -like "*blog.mypp.site*") {
        Write-Host "OK - OAuth domain configured" -ForegroundColor Green
    }
    if ($auth -like "*clientId*") {
        Write-Host "OK - Client ID found" -ForegroundColor Green
    }
} else {
    Write-Host "ERROR - OAuth script missing" -ForegroundColor Red
}

# Test 6: Site Accessibility
Write-Host "`nTesting site accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://blog.mypp.site" -UseBasicParsing -TimeoutSec 10
    Write-Host "OK - Site accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "ERROR - Site not accessible" -ForegroundColor Red
}

# Summary
Write-Host "`nSUMMARY" -ForegroundColor Green
Write-Host "=======" -ForegroundColor Green
Write-Host "`nKey URLs to test:" -ForegroundColor Cyan
Write-Host "  Platform: https://blog.mypp.site/" -ForegroundColor White
Write-Host "  Your Blog: https://blog.mypp.site/parada/" -ForegroundColor White
Write-Host "  Create Blog: https://blog.mypp.site/create-blog/" -ForegroundColor White

Write-Host "`nManagement Scripts:" -ForegroundColor Cyan
Write-Host "  .\sync-and-deploy.ps1 - Sync and deploy" -ForegroundColor White
Write-Host "  .\blog-platform-api.ps1 - User management" -ForegroundColor White

Write-Host "`nMonitoring:" -ForegroundColor Cyan
Write-Host "  GitHub Actions: https://github.com/Antonio-Parada/parada-site/actions" -ForegroundColor White

Write-Host "`nPlatform ready for testing!" -ForegroundColor Green
