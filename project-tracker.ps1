# Project Tracker and Production Readiness Monitor
# Comprehensive tracking for parada-site project

param(
    [string]$Action = "status",
    [string]$Goal = "",
    [string]$Priority = "medium",
    [switch]$Detailed
)

# Configuration
$ProjectRoot = Get-Location
$LogFile = "$ProjectRoot\project-tracking.log"
$GoalsFile = "$ProjectRoot\project-goals.json"
$MetricsFile = "$ProjectRoot\production-metrics.json"

# Initialize files if they don't exist
if (!(Test-Path $GoalsFile)) {
    @{
        goals = @()
        completed = @()
        created = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    } | ConvertTo-Json -Depth 3 | Out-File $GoalsFile -Encoding UTF8
}

if (!(Test-Path $MetricsFile)) {
    @{
        lastCheck = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        buildStatus = "unknown"
        deploymentStatus = "unknown"
        contentSync = "unknown"
        gitStatus = "unknown"
        issues = @()
    } | ConvertTo-Json -Depth 3 | Out-File $MetricsFile -Encoding UTF8
}

function Write-Log {
    param($Message, $Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    Write-Host $LogEntry
    $LogEntry | Add-Content $LogFile
}

function Get-GitStatus {
    try {
        $status = git status --porcelain
        $branch = git branch --show-current
        $commits = git log --oneline -5
        
        return @{
            hasChanges = ($status.Count -gt 0)
            branch = $branch
            uncommittedFiles = $status
            recentCommits = $commits
            lastCommit = (git log -1 --format="%h - %s (%cr)" 2>$null)
        }
    }
    catch {
        return @{ error = $_.Exception.Message }
    }
}

function Test-ProductionReadiness {
    Write-Log "Checking production readiness..." "INFO"
    
    $issues = @()
    $gitStatus = Get-GitStatus
    
    # Check Git status
    if ($gitStatus.hasChanges) {
        $issues += "Uncommitted changes detected: $($gitStatus.uncommittedFiles -join ', ')"
    }
    
    # Check Hugo build
    Write-Host "Testing Hugo build..." -ForegroundColor Yellow
    $buildResult = hugo --destination temp-build --quiet 2>&1
    if ($LASTEXITCODE -ne 0) {
        $issues += "Hugo build failed: $buildResult"
    } else {
        Write-Host "✅ Hugo build successful" -ForegroundColor Green
        Remove-Item -Recurse -Force temp-build -ErrorAction SilentlyContinue
    }
    
    # Check required files
    $requiredFiles = @("hugo.toml", "content", "themes")
    foreach ($file in $requiredFiles) {
        if (!(Test-Path $file)) {
            $issues += "Missing required file/directory: $file"
        }
    }
    
    # Check GitHub Actions
    try {
        $workflowPath = ".github/workflows"
        if (Test-Path $workflowPath) {
            Write-Host "✅ GitHub Actions configured" -ForegroundColor Green
        } else {
            $issues += "GitHub Actions not configured"
        }
    }
    catch {
        $issues += "Could not verify GitHub Actions"
    }
    
    # Update metrics
    $metrics = Get-Content $MetricsFile | ConvertFrom-Json
    $metrics.lastCheck = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $metrics.buildStatus = if ($LASTEXITCODE -eq 0) { "passing" } else { "failing" }
    $metrics.gitStatus = if ($gitStatus.hasChanges) { "dirty" } else { "clean" }
    $metrics.issues = $issues
    
    $metrics | ConvertTo-Json -Depth 3 | Out-File $MetricsFile -Encoding UTF8
    
    return @{
        ready = ($issues.Count -eq 0)
        issues = $issues
        git = $gitStatus
    }
}

function Add-Goal {
    param($Description, $Priority = "medium")
    
    $goals = Get-Content $GoalsFile | ConvertFrom-Json
    $newGoal = @{
        id = [guid]::NewGuid().ToString().Substring(0,8)
        description = $Description
        priority = $Priority
        created = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        status = "active"
    }
    
    $goals.goals += $newGoal
    $goals | ConvertTo-Json -Depth 3 | Out-File $GoalsFile -Encoding UTF8
    
    Write-Log "Added goal: $Description [Priority: $Priority] [ID: $($newGoal.id)]" "INFO"
    return $newGoal.id
}

function Complete-Goal {
    param($GoalId)
    
    $goals = Get-Content $GoalsFile | ConvertFrom-Json
    $goal = $goals.goals | Where-Object { $_.id -eq $GoalId }
    
    if ($goal) {
        $goal.status = "completed"
        $goal.completed = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        $goals.completed += $goal
        $goals.goals = $goals.goals | Where-Object { $_.id -ne $GoalId }
        
        $goals | ConvertTo-Json -Depth 3 | Out-File $GoalsFile -Encoding UTF8
        Write-Log "Completed goal: $($goal.description)" "SUCCESS"
    } else {
        Write-Log "Goal with ID $GoalId not found" "ERROR"
    }
}

function Show-Dashboard {
    Clear-Host
    Write-Host "🚀 PARADA-SITE PROJECT DASHBOARD" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Production Status
    $readiness = Test-ProductionReadiness
    Write-Host "📊 PRODUCTION READINESS" -ForegroundColor Yellow
    Write-Host "Status: " -NoNewline
    if ($readiness.ready) {
        Write-Host "READY ✅" -ForegroundColor Green
    } else {
        Write-Host "ISSUES DETECTED ⚠️" -ForegroundColor Red
        foreach ($issue in $readiness.issues) {
            Write-Host "  ❌ $issue" -ForegroundColor Red
        }
    }
    Write-Host ""
    
    # Git Status
    Write-Host "📝 GIT STATUS" -ForegroundColor Yellow
    $git = $readiness.git
    Write-Host "Branch: $($git.branch)"
    Write-Host "Last commit: $($git.lastCommit)"
    if ($git.hasChanges) {
        Write-Host "Uncommitted changes:" -ForegroundColor Yellow
        foreach ($file in $git.uncommittedFiles) {
            Write-Host "  📝 $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Working tree clean ✅" -ForegroundColor Green
    }
    Write-Host ""
    
    # Active Goals
    $goals = Get-Content $GoalsFile | ConvertFrom-Json
    Write-Host "🎯 ACTIVE GOALS" -ForegroundColor Yellow
    if ($goals.goals.Count -gt 0) {
        foreach ($goal in $goals.goals) {
            $priorityColor = switch ($goal.priority) {
                "high" { "Red" }
                "medium" { "Yellow" }
                "low" { "Green" }
                default { "White" }
            }
            Write-Host "  [$($goal.id)] " -NoNewline
            Write-Host "$($goal.description)" -ForegroundColor $priorityColor
            Write-Host "    Priority: $($goal.priority) | Created: $($goal.created)"
        }
    } else {
        Write-Host "  No active goals" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Recent Activity
    Write-Host "📈 RECENT ACTIVITY" -ForegroundColor Yellow
    Write-Host "Recent commits:"
    foreach ($commit in $git.recentCommits[0..2]) {
        Write-Host "  🔗 $commit" -ForegroundColor Gray
    }
    Write-Host ""
    
    # Quick Actions
    Write-Host "⚡ QUICK ACTIONS" -ForegroundColor Yellow
    Write-Host "  ./project-tracker.ps1 -Action add-goal -Goal 'Your goal description'"
    Write-Host "  ./project-tracker.ps1 -Action complete -Goal [goal-id]"
    Write-Host "  ./project-tracker.ps1 -Action sync (sync and deploy)"
    Write-Host "  ./project-tracker.ps1 -Action check (production check)"
    Write-Host ""
}

# Main execution
switch ($Action.ToLower()) {
    "status" { Show-Dashboard }
    
    "add-goal" {
        if ($Goal) {
            $id = Add-Goal -Description $Goal -Priority $Priority
            Write-Host "Goal added with ID: $id" -ForegroundColor Green
        } else {
            Write-Host "Please provide a goal description with -Goal parameter" -ForegroundColor Red
        }
    }
    
    "complete" {
        if ($Goal) {
            Complete-Goal -GoalId $Goal
        } else {
            Write-Host "Please provide a goal ID with -Goal parameter" -ForegroundColor Red
        }
    }
    
    "check" {
        $readiness = Test-ProductionReadiness
        if ($readiness.ready) {
            Write-Host "✅ Production ready!" -ForegroundColor Green
        } else {
            Write-Host "❌ Production issues detected:" -ForegroundColor Red
            foreach ($issue in $readiness.issues) {
                Write-Host "  - $issue" -ForegroundColor Red
            }
        }
    }
    
    "sync" {
        Write-Host "🔄 Starting sync and deploy process..." -ForegroundColor Cyan
        & ".\sync-and-deploy.ps1"
        Write-Log "Sync and deploy completed" "INFO"
    }
    
    "goals" {
        $goals = Get-Content $GoalsFile | ConvertFrom-Json
        Write-Host "🎯 ACTIVE GOALS:" -ForegroundColor Yellow
        foreach ($goal in $goals.goals) {
            Write-Host "[$($goal.id)] $($goal.description) (Priority: $($goal.priority))"
        }
        Write-Host "`n✅ COMPLETED GOALS:" -ForegroundColor Green
        foreach ($goal in $goals.completed[-5..-1]) {
            if ($goal) {
                Write-Host "[$($goal.id)] $($goal.description) - Completed: $($goal.completed)"
            }
        }
    }
    
    default {
        Write-Host "Usage: ./project-tracker.ps1 -Action [status|add-goal|complete|check|sync|goals]" -ForegroundColor Yellow
    }
}
