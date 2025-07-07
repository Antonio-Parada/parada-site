# Multi-tenant Blog Platform Build Script
# Tests the local build process before GitHub deployment

param(
    [switch]$Clean,
    [switch]$Serve
)

$ErrorActionPreference = "Stop"

function Write-BuildLog {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

# Clean previous builds
if ($Clean -or (Test-Path "public")) {
    Write-BuildLog "Cleaning previous builds..." "INFO"
    if (Test-Path "public") {
        Remove-Item -Recurse -Force "public"
    }
}

Write-BuildLog "🚀 Building Multi-tenant Blog Platform" "INFO"
Write-BuildLog "=======================================" "INFO"

# Step 1: Build main platform site
Write-BuildLog "Building main platform site..." "INFO"
try {
    hugo --gc --minify --destination "public" --baseURL "https://blog.mypp.site/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-BuildLog "✅ Main platform built successfully" "SUCCESS"
    } else {
        throw "Hugo build failed for main platform"
    }
} catch {
    Write-BuildLog "❌ Failed to build main platform: $_" "ERROR"
    exit 1
}

# Step 2: Build Parada's personal blog
Write-BuildLog "Building Parada's personal blog..." "INFO"
try {
    Push-Location "sites\parada"
    
    hugo --gc --minify --destination "..\..\public\parada" --baseURL "https://blog.mypp.site/parada/"
    
    if ($LASTEXITCODE -eq 0) {
        Write-BuildLog "✅ Parada's blog built successfully" "SUCCESS"
    } else {
        throw "Hugo build failed for Parada's blog"
    }
} catch {
    Write-BuildLog "❌ Failed to build Parada's blog: $_" "ERROR"
    exit 1
} finally {
    Pop-Location
}

# Step 3: Create CNAME file for custom domain
Write-BuildLog "Setting up custom domain..." "INFO"
"blog.mypp.site" | Out-File "public\CNAME" -Encoding ASCII -NoNewline

# Step 4: Verify build structure
Write-BuildLog "Verifying build structure..." "INFO"

$expectedPaths = @(
    "public\index.html",
    "public\create-blog\index.html", 
    "public\parada\index.html",
    "public\parada\posts\index.html",
    "public\CNAME"
)

$allGood = $true
foreach ($path in $expectedPaths) {
    if (Test-Path $path) {
        Write-BuildLog "✅ Found: $path" "SUCCESS"
    } else {
        Write-BuildLog "❌ Missing: $path" "ERROR"
        $allGood = $false
    }
}

# Step 5: Show structure
Write-BuildLog "Build structure:" "INFO"
Get-ChildItem -Recurse "public" -Name | Sort-Object | ForEach-Object {
    Write-Host "  📁 $_" -ForegroundColor Gray
}

# Step 6: Test URLs (if serving)
if ($Serve) {
    Write-BuildLog "🌐 Starting local server..." "INFO"
    Write-BuildLog "Platform URLs:" "INFO"
    Write-Host "  🏠 Platform Home: http://localhost:1313/" -ForegroundColor Cyan
    Write-Host "  👤 Parada's Blog: http://localhost:1313/parada/" -ForegroundColor Cyan
    Write-Host "  ✨ Create Blog: http://localhost:1313/create-blog/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    
    # Start Hugo server with the built files
    hugo server --source "." --port 1313 --bind "0.0.0.0" --navigateToChanged
}

if ($allGood) {
    Write-BuildLog "🎉 Multi-tenant build completed successfully!" "SUCCESS"
    Write-BuildLog "Ready for deployment to GitHub Pages" "INFO"
} else {
    Write-BuildLog "Build completed with warnings" "WARNING"
    exit 1
}
