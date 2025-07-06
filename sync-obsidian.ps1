# Sync Obsidian Vault to Hugo Site
# This script copies markdown files from your Obsidian vault to the Hugo content directory

param(
    [string]$ObsidianPath = "C:\Users\apara\OneDrive\Documents\Obsidian Vault",
    [string]$HugoContentPath = "C:\Users\apara\OneDrive\Documents\parada-site\content"
)

Write-Host "Syncing Obsidian vault to Hugo site..." -ForegroundColor Green

# Ensure the Hugo content directory exists
if (-not (Test-Path $HugoContentPath)) {
    New-Item -ItemType Directory -Path $HugoContentPath -Force
}

# Copy the blog content structure
$BlogPath = Join-Path $ObsidianPath "blog\content"
if (Test-Path $BlogPath) {
    Write-Host "Copying blog content from: $BlogPath" -ForegroundColor Yellow
    
    # Copy posts
    $PostsSource = Join-Path $BlogPath "posts"
    $PostsDestination = Join-Path $HugoContentPath "posts"
    
    if (Test-Path $PostsSource) {
        if (-not (Test-Path $PostsDestination)) {
            New-Item -ItemType Directory -Path $PostsDestination -Force
        }
        
        Get-ChildItem -Path $PostsSource -Filter "*.md" | ForEach-Object {
            $destinationFile = Join-Path $PostsDestination $_.Name
            Copy-Item -Path $_.FullName -Destination $destinationFile -Force
            Write-Host "Copied: $($_.Name)" -ForegroundColor Cyan
        }
    }
    
    # Copy about page
    $AboutSource = Join-Path $BlogPath "about"
    $AboutDestination = Join-Path $HugoContentPath "about"
    
    if (Test-Path $AboutSource) {
        if (-not (Test-Path $AboutDestination)) {
            New-Item -ItemType Directory -Path $AboutDestination -Force
        }
        
        Get-ChildItem -Path $AboutSource -Filter "*.md" | ForEach-Object {
            $destinationFile = Join-Path $AboutDestination $_.Name
            Copy-Item -Path $_.FullName -Destination $destinationFile -Force
            Write-Host "Copied: about/$($_.Name)" -ForegroundColor Cyan
        }
    }
}

# Copy any other markdown files in the root of the vault
Get-ChildItem -Path $ObsidianPath -Filter "*.md" | ForEach-Object {
    $destinationFile = Join-Path $HugoContentPath $_.Name
    Copy-Item -Path $_.FullName -Destination $destinationFile -Force
    Write-Host "Copied root file: $($_.Name)" -ForegroundColor Cyan
}

Write-Host "Sync completed!" -ForegroundColor Green
Write-Host "Run 'hugo server' to preview your site locally" -ForegroundColor Yellow
