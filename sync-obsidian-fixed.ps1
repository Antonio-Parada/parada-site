# Sync Obsidian Vault to Hugo Site (FIXED VERSION)
# This script copies markdown files from your Obsidian vault to the Hugo content directory
# FIXES: Properly deletes removed content and handles sync correctly

param(
    [string]$ObsidianPath = "C:\Users\apara\OneDrive\Documents\Obsidian Vault",
    [string]$HugoContentPath = "C:\Users\apara\OneDrive\Documents\parada-site\content"
)

Write-Host "=== Syncing Obsidian vault to Hugo site ===" -ForegroundColor Green

# Ensure the Hugo content directory exists
if (-not (Test-Path $HugoContentPath)) {
    New-Item -ItemType Directory -Path $HugoContentPath -Force
}

# Strategy: Clean sync - remove old content first, then copy fresh content
$BlogPath = Join-Path $ObsidianPath "blog\content"

if (Test-Path $BlogPath) {
    Write-Host "Found Hugo blog structure: $BlogPath" -ForegroundColor Yellow
    
    # Clean existing posts directory
    $PostsDestination = Join-Path $HugoContentPath "posts"
    if (Test-Path $PostsDestination) {
        Write-Host "Cleaning old posts..." -ForegroundColor Yellow
        Remove-Item -Path "$PostsDestination\*" -Force -Recurse
    } else {
        New-Item -ItemType Directory -Path $PostsDestination -Force
    }
    
    # Copy current posts from Obsidian
    $PostsSource = Join-Path $BlogPath "posts"
    if (Test-Path $PostsSource) {
        Get-ChildItem -Path $PostsSource -Filter "*.md" | ForEach-Object {
            $destinationFile = Join-Path $PostsDestination $_.Name
            Copy-Item -Path $_.FullName -Destination $destinationFile -Force
            Write-Host "✅ Synced: $($_.Name)" -ForegroundColor Cyan
        }
        
        $postCount = (Get-ChildItem -Path $PostsSource -Filter "*.md").Count
        Write-Host "📝 Successfully synced $postCount blog posts" -ForegroundColor Green
    }
    
    # Copy about page if it exists
    $AboutSource = Join-Path $BlogPath "about"
    $AboutDestination = Join-Path $HugoContentPath "about"
    
    if (Test-Path $AboutSource) {
        if (-not (Test-Path $AboutDestination)) {
            New-Item -ItemType Directory -Path $AboutDestination -Force
        }
        
        Get-ChildItem -Path $AboutSource -Filter "*.md" | ForEach-Object {
            $destinationFile = Join-Path $AboutDestination $_.Name
            Copy-Item -Path $_.FullName -Destination $destinationFile -Force
            Write-Host "✅ Synced: about/$($_.Name)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "⚠️  No blog directory found at $BlogPath" -ForegroundColor Yellow
    Write-Host "Please ensure your Obsidian vault has the structure: Obsidian Vault/blog/content/posts/" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  - Run 'git status' to see changes" -ForegroundColor Gray
Write-Host "  - Run 'git add . && git commit -m \"Update blog\" && git push' to deploy" -ForegroundColor Gray
Write-Host "  - Or run '.\sync-and-deploy.ps1' for automated deployment" -ForegroundColor Gray
