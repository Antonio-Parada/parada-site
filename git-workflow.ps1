# Enhanced Git Workflow for Production Readiness
# Manages concurrent goals and maintains production standards

param(
    [string]$Action = "status",
    [string]$Message = "",
    [string]$Branch = "",
    [switch]$Force,
    [switch]$ProductionCheck
)

# Configuration
$MainBranch = "main"
$ProductionTracker = ".\project-tracker.ps1"

function Write-Status {
    param($Message, $Type = "INFO")
    $color = switch ($Type) {
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        default { "White" }
    }
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Test-PreCommitChecks {
    Write-Status "Running pre-commit checks..." "INFO"
    
    # Run production readiness check
    $readiness = & $ProductionTracker -Action check 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Production readiness check failed" "ERROR"
        return $false
    }
    
    # Check for sensitive information
    $sensitivePatterns = @(
        "password\s*=\s*['""].*['""]",
        "api_key\s*=\s*['""].*['""]",
        "secret\s*=\s*['""].*['""]",
        "token\s*=\s*['""].*['""]"
    )
    
    $files = git diff --cached --name-only
    foreach ($file in $files) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw
            foreach ($pattern in $sensitivePatterns) {
                if ($content -match $pattern) {
                    Write-Status "Potential sensitive information detected in $file" "ERROR"
                    Write-Status "Pattern: $pattern" "WARNING"
                    return $false
                }
            }
        }
    }
    
    Write-Status "Pre-commit checks passed ✅" "SUCCESS"
    return $true
}

function Invoke-SmartCommit {
    param($CommitMessage)
    
    # Check if there are changes to commit
    $status = git status --porcelain
    if (-not $status) {
        Write-Status "No changes to commit" "WARNING"
        return
    }
    
    # Run pre-commit checks
    if (-not $Force -and -not (Test-PreCommitChecks)) {
        Write-Status "Pre-commit checks failed. Use -Force to override." "ERROR"
        return
    }
    
    # Stage all changes if nothing is staged
    $staged = git diff --cached --name-only
    if (-not $staged) {
        Write-Status "Staging all changes..." "INFO"
        git add -A
    }
    
    # Generate commit message if not provided
    if (-not $CommitMessage) {
        $files = git diff --cached --name-only
        $fileTypes = $files | ForEach-Object { [System.IO.Path]::GetExtension($_) } | Sort-Object -Unique
        
        $CommitMessage = if ($files.Count -eq 1) {
            "Update $($files[0])"
        } elseif ($fileTypes -contains ".md") {
            "📝 Update documentation and content"
        } elseif ($fileTypes -contains ".ps1") {
            "🔧 Update automation scripts"
        } elseif ($fileTypes -contains ".toml" -or $fileTypes -contains ".yaml" -or $fileTypes -contains ".json") {
            "⚙️ Update configuration"
        } else {
            "🚀 Update project files"
        }
    }
    
    # Commit
    git commit -m $CommitMessage
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Committed: $CommitMessage" "SUCCESS"
        
        # Log the commit
        & $ProductionTracker -Action add-goal -Goal "Deployed commit: $CommitMessage" -Priority "low"
    } else {
        Write-Status "Commit failed" "ERROR"
    }
}

function Invoke-SmartPush {
    param($Remote = "origin", $Branch = $null)
    
    if (-not $Branch) {
        $Branch = git branch --show-current
    }
    
    # Check if we're on main branch and run production checks
    if ($Branch -eq $MainBranch) {
        Write-Status "Pushing to main branch - running production checks..." "WARNING"
        $readiness = & $ProductionTracker -Action check
        if ($LASTEXITCODE -ne 0 -and -not $Force) {
            Write-Status "Production checks failed. Use -Force to override." "ERROR"
            return
        }
    }
    
    # Check for unpushed commits
    $unpushed = git log "$Remote/$Branch..HEAD" --oneline 2>$null
    if (-not $unpushed) {
        Write-Status "No commits to push" "WARNING"
        return
    }
    
    Write-Status "Pushing $($unpushed.Count) commits to $Remote/$Branch..." "INFO"
    git push $Remote $Branch
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Push successful ✅" "SUCCESS"
        
        # Trigger deployment if on main branch
        if ($Branch -eq $MainBranch) {
            Write-Status "Triggering deployment..." "INFO"
            # GitHub Actions will handle the deployment
        }
    } else {
        Write-Status "Push failed" "ERROR"
    }
}

function New-FeatureBranch {
    param($BranchName, $Goal)
    
    if (-not $BranchName) {
        Write-Status "Branch name is required" "ERROR"
        return
    }
    
    # Ensure we're on main and up to date
    git checkout $MainBranch
    git pull origin $MainBranch
    
    # Create and checkout new branch
    git checkout -b $BranchName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Created and switched to branch: $BranchName" "SUCCESS"
        
        # Add goal for this feature
        if ($Goal) {
            & $ProductionTracker -Action add-goal -Goal "Complete feature: $Goal (Branch: $BranchName)" -Priority "medium"
        }
    } else {
        Write-Status "Failed to create branch" "ERROR"
    }
}

function Merge-FeatureBranch {
    param($BranchName)
    
    if (-not $BranchName) {
        $BranchName = git branch --show-current
    }
    
    if ($BranchName -eq $MainBranch) {
        Write-Status "Already on main branch" "WARNING"
        return
    }
    
    # Run final checks
    Write-Status "Running final production checks before merge..." "INFO"
    $readiness = & $ProductionTracker -Action check
    if ($LASTEXITCODE -ne 0 -and -not $Force) {
        Write-Status "Production checks failed. Fix issues before merging." "ERROR"
        return
    }
    
    # Switch to main and merge
    git checkout $MainBranch
    git pull origin $MainBranch
    git merge $BranchName --no-ff
    
    if ($LASTEXITCODE -eq 0) {
        Write-Status "Merged $BranchName into $MainBranch" "SUCCESS"
        
        # Delete feature branch
        git branch -d $BranchName
        Write-Status "Deleted feature branch: $BranchName" "INFO"
        
        # Complete related goals
        $goals = & $ProductionTracker -Action goals
        # This would require more complex goal matching logic
        
    } else {
        Write-Status "Merge failed - resolve conflicts manually" "ERROR"
    }
}

function Show-GitDashboard {
    Clear-Host
    Write-Host "🔀 GIT WORKFLOW DASHBOARD" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    
    # Current status
    $branch = git branch --show-current
    $status = git status --porcelain
    $remote = git remote get-url origin 2>$null
    
    Write-Host "📍 CURRENT STATUS" -ForegroundColor Yellow
    Write-Host "Branch: $branch"
    Write-Host "Remote: $remote"
    Write-Host "Changes: " -NoNewline
    if ($status) {
        Write-Host "$($status.Count) files modified" -ForegroundColor Yellow
    } else {
        Write-Host "Working tree clean ✅" -ForegroundColor Green
    }
    Write-Host ""
    
    # Recent commits
    Write-Host "📈 RECENT COMMITS" -ForegroundColor Yellow
    $commits = git log --oneline -5
    foreach ($commit in $commits) {
        Write-Host "  🔗 $commit" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Branches
    Write-Host "🌿 BRANCHES" -ForegroundColor Yellow
    $branches = git branch -a
    foreach ($branch in $branches) {
        if ($branch -match "^\*") {
            Write-Host "  $branch" -ForegroundColor Green
        } else {
            Write-Host "  $branch" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Quick actions
    Write-Host "⚡ QUICK ACTIONS" -ForegroundColor Yellow
    Write-Host "  ./git-workflow.ps1 -Action commit -Message 'Your message'"
    Write-Host "  ./git-workflow.ps1 -Action push"
    Write-Host "  ./git-workflow.ps1 -Action feature -Branch 'feature-name' -Goal 'Goal description'"
    Write-Host "  ./git-workflow.ps1 -Action merge -Branch 'feature-branch'"
    Write-Host "  ./git-workflow.ps1 -Action sync (full sync and deploy)"
    Write-Host ""
}

function Invoke-FullSync {
    Write-Status "🔄 Starting full synchronization process..." "INFO"
    
    # 1. Sync content from Obsidian
    Write-Status "Syncing content from Obsidian..." "INFO"
    & ".\sync-obsidian-fixed.ps1"
    
    # 2. Check for changes
    $status = git status --porcelain
    if ($status) {
        Write-Status "Content changes detected, committing..." "INFO"
        Invoke-SmartCommit -CommitMessage "📝 Auto-sync from Obsidian vault $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    
    # 3. Push to remote
    Invoke-SmartPush
    
    # 4. Update project tracker
    & $ProductionTracker -Action add-goal -Goal "Completed full sync at $(Get-Date -Format 'HH:mm')" -Priority "low"
    
    Write-Status "Full synchronization completed ✅" "SUCCESS"
}

# Main execution
switch ($Action.ToLower()) {
    "status" { Show-GitDashboard }
    
    "commit" {
        Invoke-SmartCommit -CommitMessage $Message
    }
    
    "push" {
        Invoke-SmartPush -Branch $Branch
    }
    
    "sync" {
        Invoke-FullSync
    }
    
    "feature" {
        New-FeatureBranch -BranchName $Branch -Goal $Message
    }
    
    "merge" {
        Merge-FeatureBranch -BranchName $Branch
    }
    
    "check" {
        $result = Test-PreCommitChecks
        if ($result) {
            Write-Status "All checks passed ✅" "SUCCESS"
        } else {
            Write-Status "Checks failed ❌" "ERROR"
        }
    }
    
    default {
        Write-Host "Usage: ./git-workflow.ps1 -Action [status|commit|push|sync|feature|merge|check]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  ./git-workflow.ps1 -Action commit -Message 'Fix navigation bug'"
        Write-Host "  ./git-workflow.ps1 -Action feature -Branch 'add-portfolio' -Goal 'Add portfolio section'"
        Write-Host "  ./git-workflow.ps1 -Action sync"
    }
}
