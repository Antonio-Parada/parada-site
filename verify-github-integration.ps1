# GitHub Pages Integration Verification Script
# Verifies all components are working properly with GitHub Pages

Write-Host "🔍 GitHub Pages Integration Verification" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check 1: GitHub Repository Status
Write-Host "`n[1/8] Checking GitHub repository status..." -ForegroundColor Cyan
try {
    $repoStatus = git remote get-url origin
    Write-Host "✅ Repository URL: $repoStatus" -ForegroundColor Green
    
    $branch = git branch --show-current
    Write-Host "✅ Current branch: $branch" -ForegroundColor Green
    
    if ($branch -ne "main") {
        Write-Host "⚠️  Warning: Not on main branch" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Git repository not configured properly" -ForegroundColor Red
}

# Check 2: CNAME Configuration
Write-Host "`n[2/8] Checking CNAME configuration..." -ForegroundColor Cyan
if (Test-Path "CNAME") {
    $cname = Get-Content "CNAME"
    Write-Host "✅ CNAME file exists: $cname" -ForegroundColor Green
} else {
    Write-Host "❌ CNAME file missing" -ForegroundColor Red
    Write-Host "   Creating CNAME file..." -ForegroundColor Yellow
    "blog.mypp.site" | Out-File "CNAME" -Encoding UTF8 -NoNewline
    Write-Host "✅ CNAME file created" -ForegroundColor Green
}

# Check 3: Hugo Configuration
Write-Host "`n[3/8] Checking Hugo configuration..." -ForegroundColor Cyan
if (Test-Path "hugo.toml") {
    $config = Get-Content "hugo.toml" -Raw
    if ($config -like "*blog.mypp.site*") {
        Write-Host "✅ Hugo baseURL configured correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Hugo baseURL might need updating" -ForegroundColor Yellow
    }
    
    if ($config -like "*content-platform*") {
        Write-Host "✅ Platform content directory configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Content directory configuration needs review" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Hugo configuration file missing" -ForegroundColor Red
}

# Check 4: GitHub Actions Workflow
Write-Host "`n[4/8] Checking GitHub Actions workflow..." -ForegroundColor Cyan
if (Test-Path ".github/workflows/deploy.yml") {
    Write-Host "✅ Deploy workflow exists" -ForegroundColor Green
    
    # Check recent workflow runs
    try {
        $runs = gh run list --limit 3 --json status,conclusion,headBranch,event | ConvertFrom-Json
        foreach ($run in $runs) {
            $status = if ($run.status -eq "completed") { 
                if ($run.conclusion -eq "success") { "✅" } else { "❌" }
            } else { "🟡" }
            Write-Host "   $status $($run.event) on $($run.headBranch) - $($run.status)" -ForegroundColor White
        }
    } catch {
        Write-Host "   ⚠️  Cannot access GitHub Actions (gh CLI not configured)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ GitHub Actions workflow missing" -ForegroundColor Red
}

# Check 5: OAuth Configuration
Write-Host "`n[5/8] Checking OAuth configuration..." -ForegroundColor Cyan
if (Test-Path "static/js/google-auth.js") {
    $authJs = Get-Content "static/js/google-auth.js" -Raw
    if ($authJs -like "*blog.mypp.site*") {
        Write-Host "✅ OAuth redirect URI configured for custom domain" -ForegroundColor Green
    } else {
        Write-Host "⚠️  OAuth configuration might need domain updates" -ForegroundColor Yellow
    }
    
    # Extract client ID
    if ($authJs -match "clientId = '([^']+)'") {
        $clientId = $matches[1]
        Write-Host "✅ OAuth Client ID configured: $($clientId.Substring(0,20))..." -ForegroundColor Green
    } else {
        Write-Host "❌ OAuth Client ID not found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Google Auth script missing" -ForegroundColor Red
}

# Check 6: Content Structure
Write-Host "`n[6/8] Checking content structure..." -ForegroundColor Cyan
$contentDirs = @("content-platform", "sites/parada", "static", "layouts")
foreach ($dir in $contentDirs) {
    if (Test-Path $dir) {
        $itemCount = (Get-ChildItem $dir -Recurse).Count
        Write-Host "✅ $dir exists ($itemCount items)" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir missing" -ForegroundColor Red
    }
}

# Check 7: Domain DNS Status
Write-Host "`n[7/8] Checking domain DNS status..." -ForegroundColor Cyan
try {
    $dnsResult = nslookup blog.mypp.site 2>$null
    if ($dnsResult -like "*antonio-parada.github.io*") {
        Write-Host "✅ DNS pointing to GitHub Pages correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠️  DNS configuration might need review" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Cannot verify DNS (nslookup not available)" -ForegroundColor Yellow
}

# Check 8: Site Accessibility
Write-Host "`n[8/8] Checking site accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://blog.mypp.site" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site is accessible at https://blog.mypp.site" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Site responded with status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Site not accessible or connection issues" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

# Summary and Recommendations
Write-Host "`n📋 SUMMARY & NEXT STEPS" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

Write-Host "`n🎯 Key URLs to test:" -ForegroundColor Cyan
Write-Host "   • Platform: https://blog.mypp.site/" -ForegroundColor White
Write-Host "   • Your Blog: https://blog.mypp.site/parada/" -ForegroundColor White
Write-Host "   • Create Blog: https://blog.mypp.site/create-blog/" -ForegroundColor White
Write-Host "   • Dashboard: https://blog.mypp.site/dashboard/" -ForegroundColor White

Write-Host "`n🔧 Content Management Scripts:" -ForegroundColor Cyan
Write-Host "   • .\sync-and-deploy.ps1 - Full sync and deploy" -ForegroundColor White
Write-Host "   • .\blog-platform-api.ps1 - User blog management" -ForegroundColor White
Write-Host "   • .\build-multitenant.ps1 - Multi-tenant build" -ForegroundColor White

Write-Host "`n📊 Monitoring:" -ForegroundColor Cyan
Write-Host "   • GitHub Actions: https://github.com/Antonio-Parada/parada-site/actions" -ForegroundColor White
Write-Host "   • Check logs: gh run list --limit 5" -ForegroundColor White

Write-Host "`n✨ Ready to test the complete platform!" -ForegroundColor Green
