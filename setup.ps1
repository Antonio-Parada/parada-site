# Setup script for Personal Portfolio deployment
# This script helps you set up the GitHub repository and initial configuration

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [string]$RepositoryName = "parada-site"
)

Write-Host "=== Personal Portfolio Setup ===" -ForegroundColor Green
Write-Host "Setting up deployment for $GitHubUsername/$RepositoryName" -ForegroundColor Yellow

# Step 1: Configure Git repository
Write-Host "`n[1/5] Configuring Git repository..." -ForegroundColor Cyan

# Remove existing remote if it exists
git remote remove origin 2>$null

# Add the correct remote
$repoUrl = "https://github.com/$GitHubUsername/$RepositoryName.git"
git remote add origin $repoUrl
Write-Host "Added remote: $repoUrl" -ForegroundColor Green

# Step 2: Update README with correct GitHub username
Write-Host "`n[2/5] Updating README with your GitHub username..." -ForegroundColor Cyan
(Get-Content README.md) -replace 'YOUR_USERNAME', $GitHubUsername | Set-Content README.md
Write-Host "Updated README.md" -ForegroundColor Green

# Step 3: Update sync-and-deploy script with correct GitHub username
Write-Host "`n[3/5] Updating deployment script..." -ForegroundColor Cyan
(Get-Content sync-and-deploy.ps1) -replace 'YOUR_USERNAME', $GitHubUsername | Set-Content sync-and-deploy.ps1
Write-Host "Updated sync-and-deploy.ps1" -ForegroundColor Green

# Step 4: Initial commit and push
Write-Host "`n[4/5] Creating initial commit..." -ForegroundColor Cyan
git add .
git commit -m "Initial commit: Personal portfolio setup with automated deployment"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push to GitHub. Please check:" -ForegroundColor Red
    Write-Host "1. Repository exists: https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor White
    Write-Host "2. You have write access to the repository" -ForegroundColor White
    Write-Host "3. Your Git credentials are configured" -ForegroundColor White
    exit 1
}

# Step 5: Instructions for next steps
Write-Host "`n[5/5] Setup complete! Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "GITHUB REPOSITORY:" -ForegroundColor Yellow
Write-Host "1. Go to: https://github.com/$GitHubUsername/$RepositoryName/settings/pages" -ForegroundColor White
Write-Host "2. Set source to 'GitHub Actions'" -ForegroundColor White
Write-Host "3. Add custom domain: mypp.site" -ForegroundColor White
Write-Host "4. Enable 'Enforce HTTPS'" -ForegroundColor White
Write-Host ""
Write-Host "NAMECHEAP DNS:" -ForegroundColor Yellow
Write-Host "1. Go to your Namecheap account > Domain List > Manage" -ForegroundColor White
Write-Host "2. Add CNAME record:" -ForegroundColor White
Write-Host "   - Type: CNAME" -ForegroundColor White
Write-Host "   - Host: parada" -ForegroundColor White
Write-Host "   - Value: $GitHubUsername.github.io" -ForegroundColor White
Write-Host "   - TTL: Automatic" -ForegroundColor White
Write-Host ""
Write-Host "OBSIDIAN VAULT:" -ForegroundColor Yellow
Write-Host "1. Create content in: C:\Users\apara\OneDrive\Documents\Obsidian Vault\blog\content\posts\" -ForegroundColor White
Write-Host "2. Run: .\sync-and-deploy.ps1" -ForegroundColor White
Write-Host "3. Your site will be live at: https://mypp.site/parada/" -ForegroundColor White
Write-Host ""
Write-Host "Repository: https://github.com/$GitHubUsername/$RepositoryName" -ForegroundColor Cyan
Write-Host "Actions: https://github.com/$GitHubUsername/$RepositoryName/actions" -ForegroundColor Cyan

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
