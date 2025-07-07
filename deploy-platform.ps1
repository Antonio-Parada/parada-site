# Multi-tenant Blog Platform Deployment
# Handles building and deploying the main platform + all user blogs

param(
    [string]$Action = "deploy",
    [switch]$IncludeUsers,
    [switch]$Force,
    [string]$Username = ""
)

# Configuration
$PlatformRoot = Get-Location
$PublicDir = "$PlatformRoot\public"
$ApiScript = "$PlatformRoot\blog-platform-api.ps1"

function Write-DeployLog {
    param($Message, $Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    Write-Host $logEntry
    $logEntry | Add-Content "$PlatformRoot\deployment.log"
}

function Build-MainPlatform {
    Write-DeployLog "Building main platform..." "INFO"
    
    # Clean public directory
    if (Test-Path $PublicDir) {
        Remove-Item -Recurse -Force $PublicDir
    }
    New-Item -ItemType Directory -Path $PublicDir -Force | Out-Null
    
    # Build main Hugo site
    hugo --destination $PublicDir
    
    if ($LASTEXITCODE -eq 0) {
        Write-DeployLog "Main platform built successfully" "SUCCESS"
        return $true
    } else {
        Write-DeployLog "Failed to build main platform" "ERROR"
        return $false
    }
}

function Build-AllUserBlogs {
    Write-DeployLog "Building user blogs..." "INFO"
    
    try {
        $users = & $ApiScript -Action list 2>$null
        
        foreach ($user in $users) {
            if ($user.Status -eq "active") {
                Write-DeployLog "Building blog for user: $($user.Username)" "INFO"
                $success = & $ApiScript -Action build -Username $user.Username
                
                if ($success) {
                    Write-DeployLog "Built blog for $($user.Username)" "SUCCESS"
                } else {
                    Write-DeployLog "Failed to build blog for $($user.Username)" "ERROR"
                }
            }
        }
    }
    catch {
        Write-DeployLog "Error building user blogs: $_" "ERROR"
        return $false
    }
    
    return $true
}

function Deploy-ToGitHub {
    Write-DeployLog "Deploying to GitHub..." "INFO"
    
    # Check if we have changes to deploy
    $status = git status --porcelain
    if (-not $status -and -not $Force) {
        Write-DeployLog "No changes to deploy" "WARNING"
        return $true
    }
    
    # Stage all changes
    git add -A
    
    # Commit changes
    $commitMessage = "🚀 Platform deployment $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    if ($IncludeUsers) {
        $commitMessage += " (including user blogs)"
    }
    
    git commit -m $commitMessage
    
    if ($LASTEXITCODE -eq 0) {
        Write-DeployLog "Changes committed: $commitMessage" "SUCCESS"
    } else {
        Write-DeployLog "No changes to commit" "WARNING"
    }
    
    # Push to GitHub
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-DeployLog "Successfully pushed to GitHub" "SUCCESS"
        return $true
    } else {
        Write-DeployLog "Failed to push to GitHub" "ERROR"
        return $false
    }
}

function Show-DeploymentStatus {
    Clear-Host
    Write-Host "🌐 BLOG PLATFORM DEPLOYMENT STATUS" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Platform info
    Write-Host "📊 PLATFORM INFO" -ForegroundColor Yellow
    $stats = & $ApiScript -Action stats 2>$null
    Write-Host "Main site: https://blog.mypp.site/"
    Write-Host "Create blog: https://blog.mypp.site/create-blog/"
    Write-Host ""
    
    # Git status
    Write-Host "📝 GIT STATUS" -ForegroundColor Yellow
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "Uncommitted changes:" -ForegroundColor Yellow
        foreach ($change in $gitStatus) {
            Write-Host "  $change" -ForegroundColor Gray
        }
    } else {
        Write-Host "Working tree clean ✅" -ForegroundColor Green
    }
    Write-Host ""
    
    # User blogs
    Write-Host "👥 USER BLOGS" -ForegroundColor Yellow
    try {
        $users = & $ApiScript -Action list 2>$null
        if ($users.Count -gt 0) {
            foreach ($user in $users) {
                $status = if ($user.Status -eq "active") { "✅" } else { "❌" }
                Write-Host "  $status $($user.Username) - $($user.BlogTitle)"
                Write-Host "     URL: $($user.BlogUrl)" -ForegroundColor Gray
            }
        } else {
            Write-Host "  No user blogs yet" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "  Error loading user list" -ForegroundColor Red
    }
    Write-Host ""
    
    # Quick actions
    Write-Host "⚡ QUICK ACTIONS" -ForegroundColor Yellow
    Write-Host "  ./deploy-platform.ps1 -Action deploy (deploy main platform)"
    Write-Host "  ./deploy-platform.ps1 -Action deploy -IncludeUsers (deploy platform + user blogs)"
    Write-Host "  ./deploy-platform.ps1 -Action build (build only, no deploy)"
    Write-Host "  ./blog-platform-api.ps1 -Action demo (create demo users)"
    Write-Host ""
}

function Test-Prerequisites {
    Write-DeployLog "Checking prerequisites..." "INFO"
    
    # Check if Hugo is installed
    try {
        $hugoVersion = hugo version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-DeployLog "Hugo is installed: $($hugoVersion.Split(' ')[0])" "SUCCESS"
        } else {
            Write-DeployLog "Hugo is not installed or not in PATH" "ERROR"
            return $false
        }
    }
    catch {
        Write-DeployLog "Error checking Hugo: $_" "ERROR"
        return $false
    }
    
    # Check if Git is configured
    try {
        $gitUser = git config user.name 2>$null
        $gitEmail = git config user.email 2>$null
        
        if ($gitUser -and $gitEmail) {
            Write-DeployLog "Git is configured for: $gitUser <$gitEmail>" "SUCCESS"
        } else {
            Write-DeployLog "Git user not configured" "WARNING"
        }
    }
    catch {
        Write-DeployLog "Error checking Git configuration: $_" "ERROR"
    }
    
    # Check if we're in a Git repository
    try {
        $gitRoot = git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-DeployLog "Git repository detected" "SUCCESS"
        } else {
            Write-DeployLog "Not in a Git repository" "ERROR"
            return $false
        }
    }
    catch {
        Write-DeployLog "Error checking Git repository: $_" "ERROR"
        return $false
    }
    
    return $true
}

# Main execution
Write-Host "🌐 Blog Platform Deployment Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

switch ($Action.ToLower()) {
    "deploy" {
        if (-not (Test-Prerequisites)) {
            Write-Host "❌ Prerequisites check failed" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🚀 Starting deployment process..." -ForegroundColor Green
        
        # Build main platform
        $mainSuccess = Build-MainPlatform
        if (-not $mainSuccess) {
            Write-Host "❌ Main platform build failed" -ForegroundColor Red
            exit 1
        }
        
        # Build user blogs if requested
        if ($IncludeUsers) {
            $userSuccess = Build-AllUserBlogs
            if (-not $userSuccess) {
                Write-Host "⚠️ Some user blogs failed to build" -ForegroundColor Yellow
            }
        }
        
        # Deploy to GitHub
        $deploySuccess = Deploy-ToGitHub
        if ($deploySuccess) {
            Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
            Write-Host "   Platform URL: https://blog.mypp.site/" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Deployment failed" -ForegroundColor Red
            exit 1
        }
    }
    
    "build" {
        Write-Host "🔨 Building platform..." -ForegroundColor Green
        
        $mainSuccess = Build-MainPlatform
        if ($mainSuccess) {
            Write-Host "✅ Platform built successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Build failed" -ForegroundColor Red
            exit 1
        }
        
        if ($IncludeUsers) {
            Build-AllUserBlogs
        }
    }
    
    "status" {
        Show-DeploymentStatus
    }
    
    "user" {
        if (-not $Username) {
            Write-Host "Usage: -Action user -Username <username>" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "🔨 Building blog for user: $Username" -ForegroundColor Green
        $success = & $ApiScript -Action build -Username $Username
        
        if ($success) {
            Write-Host "✅ User blog built successfully!" -ForegroundColor Green
            Write-Host "   Blog URL: https://blog.mypp.site/$Username/" -ForegroundColor Cyan
        } else {
            Write-Host "❌ User blog build failed" -ForegroundColor Red
            exit 1
        }
    }
    
    "setup" {
        Write-Host "🛠️ Setting up blog platform..." -ForegroundColor Green
        
        # Initialize API system
        & $ApiScript -Action demo
        
        # Build and deploy
        & $PSCommandPath -Action deploy -IncludeUsers
        
        Write-Host "✅ Platform setup complete!" -ForegroundColor Green
    }
    
    default {
        Write-Host "Usage: ./deploy-platform.ps1 -Action <action> [options]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Actions:" -ForegroundColor Yellow
        Write-Host "  deploy     Build and deploy platform to GitHub"
        Write-Host "  build      Build platform locally only"
        Write-Host "  status     Show deployment status"
        Write-Host "  user       Build specific user's blog"
        Write-Host "  setup      Initial platform setup with demo data"
        Write-Host ""
        Write-Host "Options:" -ForegroundColor Yellow
        Write-Host "  -IncludeUsers   Include user blogs in deployment"
        Write-Host "  -Force          Force deployment even if no changes"
        Write-Host "  -Username       Specify username for user actions"
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  ./deploy-platform.ps1 -Action deploy"
        Write-Host "  ./deploy-platform.ps1 -Action deploy -IncludeUsers"
        Write-Host "  ./deploy-platform.ps1 -Action user -Username alice"
    }
}
