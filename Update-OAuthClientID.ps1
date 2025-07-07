# PowerShell script to update OAuth Client ID
# Usage: .\Update-OAuthClientID.ps1 "your-new-client-id.apps.googleusercontent.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewClientID
)

Write-Host "🔧 Updating OAuth Client ID..." -ForegroundColor Cyan

# Validate Client ID format
if (-not $NewClientID.EndsWith(".apps.googleusercontent.com")) {
    Write-Host "❌ Invalid Client ID format. Should end with .apps.googleusercontent.com" -ForegroundColor Red
    exit 1
}

# File to update
$AuthFile = "static/js/google-auth.js"

if (-not (Test-Path $AuthFile)) {
    Write-Host "❌ File not found: $AuthFile" -ForegroundColor Red
    exit 1
}

try {
    # Read the file
    $content = Get-Content $AuthFile -Raw
    
    # Show current Client ID
    if ($content -match "this\.clientId = '([^']+)'") {
        $currentClientID = $matches[1]
        Write-Host "📋 Current Client ID: $currentClientID" -ForegroundColor Yellow
    }
    
    # Update the Client ID
    $newContent = $content -replace "this\.clientId = '[^']+';", "this.clientId = '$NewClientID';"
    
    # Write back to file
    Set-Content -Path $AuthFile -Value $newContent -NoNewline
    
    Write-Host "✅ Updated Client ID successfully!" -ForegroundColor Green
    Write-Host "📋 New Client ID: $NewClientID" -ForegroundColor Green
    
    # Show next steps
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Commit and push changes: git add -A && git commit -m 'Update OAuth Client ID' && git push" -ForegroundColor White
    Write-Host "2. Wait 2-3 minutes for GitHub Pages deployment" -ForegroundColor White
    Write-Host "3. Test OAuth login at: https://antonio-parada.github.io/parada-site" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error updating file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Ready to test your new OAuth Client ID!" -ForegroundColor Green
