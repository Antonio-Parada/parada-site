# Sync Obsidian Vault to Hugo Site and Deploy to GitHub
# This script automates the entire workflow from Obsidian to live site

param(
    [string]$ObsidianPath = "C:\Users\apara\OneDrive\Documents\Obsidian Vault",
    [string]$CommitMessage = "Auto-sync from Obsidian vault $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
)

Write-Host "=== Personal Portfolio Auto-Sync and Deploy ===" -ForegroundColor Green
Write-Host "Starting automated sync and deployment process..." -ForegroundColor Yellow

# Step 1: Sync content from Obsidian
Write-Host "`n[1/5] Syncing content from Obsidian vault..." -ForegroundColor Cyan
& .\sync-obsidian.ps1 -ObsidianPath $ObsidianPath

# Step 2: Check for changes
Write-Host "`n[2/5] Checking for changes..." -ForegroundColor Cyan
$changes = git status --porcelain
if (-not $changes) {
    Write-Host "No changes detected. Deployment skipped." -ForegroundColor Yellow
    exit 0
}

Write-Host "Changes detected:" -ForegroundColor Green
git status --short

# Step 3: Build the site locally for validation
Write-Host "`n[3/5] Building Hugo site for validation..." -ForegroundColor Cyan
hugo --minify --gc

if ($LASTEXITCODE -ne 0) {
    Write-Host "Hugo build failed. Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 4: Commit and push changes
Write-Host "`n[4/5] Committing and pushing changes to GitHub..." -ForegroundColor Cyan
git add .
git commit -m "$CommitMessage"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push to GitHub. Please check your repository setup." -ForegroundColor Red
    exit 1
}

# Step 5: Deployment notification
Write-Host "`n[5/5] Deployment initiated!" -ForegroundColor Green
Write-Host "GitHub Actions will now build and deploy your site." -ForegroundColor Yellow
Write-Host "Your site will be available at: https://mypp.site/parada/" -ForegroundColor Cyan
Write-Host "Check deployment status at: https://github.com/Antonio-Parada/parada-site/actions" -ForegroundColor White

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
