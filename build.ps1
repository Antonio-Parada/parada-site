# Build script for My Personal Portfolio
# This script syncs content from Obsidian and builds the Hugo site for production

Write-Host "Building My Personal Portfolio for production..." -ForegroundColor Green

# Step 1: Sync content from Obsidian
Write-Host "Step 1: Syncing content from Obsidian vault..." -ForegroundColor Yellow
& .\sync-obsidian.ps1

# Step 2: Build the Hugo site
Write-Host "Step 2: Building Hugo site..." -ForegroundColor Yellow
hugo --minify --gc

# Step 3: Show build results
if (Test-Path "public") {
    $files = Get-ChildItem -Path "public" -Recurse | Measure-Object
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "Generated $($files.Count) files in the 'public' directory" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To deploy to your domain:" -ForegroundColor Yellow
    Write-Host "1. Upload the contents of the 'public' directory to your web server" -ForegroundColor White
    Write-Host "2. Configure your web server to serve the files from the /parada/ path" -ForegroundColor White
    Write-Host "3. Your site will be available at https://mypp.site/parada/" -ForegroundColor White
} else {
    Write-Host "Build failed - public directory not found" -ForegroundColor Red
}
