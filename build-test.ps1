# Multi-tenant Blog Platform Build Test
param([switch]$Clean, [switch]$Serve)

function Write-Log($Message, $Level = "INFO") {
    $color = switch ($Level) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" } 
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "[$Level] $Message" -ForegroundColor $color
}

if ($Clean -and (Test-Path "public")) {
    Remove-Item -Recurse -Force "public"
}

Write-Log "Building Multi-tenant Blog Platform" "INFO"

# Build main platform
Write-Log "Building main platform site..." "INFO"
hugo --gc --minify --destination "public" --baseURL "https://blog.mypp.site/"

if ($LASTEXITCODE -eq 0) {
    Write-Log "Main platform built successfully" "SUCCESS"
} else {
    Write-Log "Main platform build failed" "ERROR"
    exit 1
}

# Build Parada's blog
Write-Log "Building Parada's personal blog..." "INFO"
Push-Location "sites\parada"
hugo --gc --minify --destination "..\..\public\parada" --baseURL "https://blog.mypp.site/parada/"

if ($LASTEXITCODE -eq 0) {
    Write-Log "Parada's blog built successfully" "SUCCESS"
} else {
    Write-Log "Parada's blog build failed" "ERROR"
    Pop-Location
    exit 1
}
Pop-Location

# Create CNAME
"blog.mypp.site" | Out-File "public\CNAME" -Encoding ASCII -NoNewline

# Verify structure
Write-Log "Verifying build structure..." "INFO"
$paths = @("public\index.html", "public\create-blog\index.html", "public\parada\index.html")
foreach ($path in $paths) {
    if (Test-Path $path) {
        Write-Log "Found: $path" "SUCCESS"
    } else {
        Write-Log "Missing: $path" "ERROR"
    }
}

Write-Log "Build completed!" "SUCCESS"
