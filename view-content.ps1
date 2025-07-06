# Content Overview Script
# Shows what content is available in your Obsidian vault for syncing

param(
    [string]$ObsidianPath = "C:\Users\apara\OneDrive\Documents\Obsidian Vault"
)

Write-Host "=== Obsidian Content Overview ===" -ForegroundColor Green
Write-Host "Scanning: $ObsidianPath" -ForegroundColor Yellow

if (-not (Test-Path $ObsidianPath)) {
    Write-Host "Obsidian vault not found" -ForegroundColor Red
    exit 1
}

Write-Host "`nBLOG CONTENT (Hugo Structure):" -ForegroundColor Cyan
$BlogPath = Join-Path $ObsidianPath "blog\content"
if (Test-Path $BlogPath) {
    $PostsPath = Join-Path $BlogPath "posts"
    if (Test-Path $PostsPath) {
        $posts = Get-ChildItem -Path $PostsPath -Filter "*.md"
        Write-Host "  Blog Posts ($($posts.Count) found):" -ForegroundColor White
        foreach ($post in $posts) {
            Write-Host "    $($post.Name)" -ForegroundColor Green
        }
    }
    
    $AboutPath = Join-Path $BlogPath "about"
    if (Test-Path $AboutPath) {
        $aboutFiles = Get-ChildItem -Path $AboutPath -Filter "*.md"
        Write-Host "  About Pages ($($aboutFiles.Count) found):" -ForegroundColor White
        foreach ($about in $aboutFiles) {
            Write-Host "    $($about.Name)" -ForegroundColor Green
        }
    }
} else {
    Write-Host "  No Hugo blog structure found" -ForegroundColor Yellow
}

Write-Host "`nROOT CONTENT (Standalone Files):" -ForegroundColor Cyan
$rootFiles = Get-ChildItem -Path $ObsidianPath -Filter "*.md"
if ($rootFiles.Count -gt 0) {
    Write-Host "  Standalone Markdown ($($rootFiles.Count) found):" -ForegroundColor White
    foreach ($file in $rootFiles) {
        Write-Host "    $($file.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "  No standalone markdown files found" -ForegroundColor Yellow
}

Write-Host "`nSUMMARY:" -ForegroundColor Green
$blogPosts = if (Test-Path (Join-Path $BlogPath "posts")) { (Get-ChildItem -Path (Join-Path $BlogPath "posts") -Filter "*.md").Count } else { 0 }
$aboutPages = if (Test-Path (Join-Path $BlogPath "about")) { (Get-ChildItem -Path (Join-Path $BlogPath "about") -Filter "*.md").Count } else { 0 }
$rootMarkdown = (Get-ChildItem -Path $ObsidianPath -Filter "*.md").Count

Write-Host "  Blog Posts: $blogPosts" -ForegroundColor White
Write-Host "  About Pages: $aboutPages" -ForegroundColor White  
Write-Host "  Root Files: $rootMarkdown" -ForegroundColor White
Write-Host "  Total: $($blogPosts + $aboutPages + $rootMarkdown) markdown files" -ForegroundColor Cyan

if ($blogPosts -gt 0 -or $rootMarkdown -gt 0) {
    Write-Host "`nReady to sync! Run: .\sync-and-deploy.ps1" -ForegroundColor Green
} else {
    Write-Host "`nNo content found to sync. Create some markdown files first!" -ForegroundColor Yellow
}

Write-Host "`n=== Content Overview Complete ===" -ForegroundColor Green
