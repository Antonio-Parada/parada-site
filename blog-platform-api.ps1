# Blog Platform API Simulation
# Handles user blog creation and management

param(
    [string]$Action = "status",
    [string]$Username = "",
    [string]$Email = "",
    [string]$BlogTitle = "",
    [string]$Description = "",
    [string]$Theme = "papermod",
    [switch]$ListUsers,
    [switch]$CreateDemo
)

# Configuration
$PlatformRoot = Get-Location
$UsersDir = "$PlatformRoot\users"
$TemplatesDir = "$PlatformRoot\blog-templates"
$DatabaseFile = "$PlatformRoot\platform-database.json"

# Initialize platform structure
function Initialize-Platform {
    if (!(Test-Path $UsersDir)) {
        New-Item -ItemType Directory -Path $UsersDir -Force | Out-Null
    }
    
    if (!(Test-Path $TemplatesDir)) {
        New-Item -ItemType Directory -Path $TemplatesDir -Force | Out-Null
    }
    
    if (!(Test-Path $DatabaseFile)) {
        @{
            users = @{}
            stats = @{
                totalUsers = 0
                totalPosts = 0
                created = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
            }
            settings = @{
                allowRegistration = $true
                requireEmailVerification = $false
                defaultTheme = "papermod"
            }
        } | ConvertTo-Json -Depth 4 | Out-File $DatabaseFile -Encoding UTF8
    }
}

function Write-ApiLog {
    param($Message, $Level = "INFO", $Username = "")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $userPart = if ($Username) { "[$Username] " } else { "" }
    $logEntry = "[$timestamp] [$Level] $userPart$Message"
    Write-Host $logEntry
    $logEntry | Add-Content "$PlatformRoot\platform-api.log"
}

function Test-UsernameAvailable {
    param($Username)
    
    # Check format
    if ($Username -notmatch "^[a-z0-9-]{3,20}$") {
        return @{ available = $false; reason = "Invalid format. Use 3-20 characters: lowercase letters, numbers, hyphens only." }
    }
    
    # Check reserved words
    $reserved = @("admin", "api", "www", "blog", "mail", "ftp", "root", "test", "demo", "user")
    if ($Username -in $reserved) {
        return @{ available = $false; reason = "Username is reserved." }
    }
    
    # Check if already exists
    $db = Get-Content $DatabaseFile | ConvertFrom-Json
    if ($db.users.PSObject.Properties.Name -contains $Username) {
        return @{ available = $false; reason = "Username already taken." }
    }
    
    return @{ available = $true; reason = "Username is available." }
}

function New-UserBlog {
    param(
        $Username,
        $Email,
        $BlogTitle,
        $Description,
        $Theme = "papermod"
    )
    
    Write-ApiLog "Creating blog for user: $Username" "INFO" $Username
    
    # Validate input
    $usernameCheck = Test-UsernameAvailable -Username $Username
    if (-not $usernameCheck.available) {
        throw $usernameCheck.reason
    }
    
    if (-not $Email -or $Email -notmatch "^[^@]+@[^@]+\.[^@]+$") {
        throw "Invalid email address."
    }
    
    # Create user directory structure
    $userPath = "$UsersDir\$Username"
    New-Item -ItemType Directory -Path $userPath -Force | Out-Null
    New-Item -ItemType Directory -Path "$userPath\content" -Force | Out-Null
    New-Item -ItemType Directory -Path "$userPath\content\posts" -Force | Out-Null
    New-Item -ItemType Directory -Path "$userPath\static" -Force | Out-Null
    
    # Create user's Hugo config
    $userConfig = @"
baseURL = 'https://blog.mypp.site/$Username/'
languageCode = 'en-us'
title = '$BlogTitle'
theme = '$Theme'
relativeURLs = false
canonifyURLs = true

[params]
  env = 'production'
  description = '$Description'
  author = '$Username'
  ShowReadingTime = true
  ShowShareButtons = true
  ShowPostNavLinks = true
  ShowBreadCrumbs = true
  ShowCodeCopyButtons = true
  ShowWordCount = true
  hidePlatformBanner = true

[menu]
  [[menu.main]]
    identifier = 'home'
    name = 'Home'
    url = '/$Username/'
    weight = 10
  [[menu.main]]
    identifier = 'posts'
    name = 'Posts'
    url = '/$Username/posts/'
    weight = 20
  [[menu.main]]
    identifier = 'about'
    name = 'About'
    url = '/$Username/about/'
    weight = 30

[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
  [markup.highlight]
    noClasses = false
    codeFences = true
    guessSyntax = true
    lineNos = true
    style = 'github'
"@
    
    $userConfig | Out-File "$userPath\hugo.toml" -Encoding UTF8
    
    # Create welcome post
    $welcomePost = @"
---
title: "Welcome to My Blog!"
date: $(Get-Date -Format "yyyy-MM-dd")
draft: false
tags: ["welcome", "first-post"]
---

# Welcome to my blog! 🎉

This is my first post on the blog platform. I'm excited to start sharing my thoughts and ideas here.

## What you can expect

- Regular updates about my interests
- Tutorials and how-to guides
- Personal reflections and experiences

Thanks for visiting, and I hope you enjoy reading my content!

---

*This blog is hosted on the [MyPP Site Blog Platform](https://blog.mypp.site). Want to create your own? [Get started here](/create-blog)!*
"@
    
    $welcomePost | Out-File "$userPath\content\posts\welcome.md" -Encoding UTF8
    
    # Create About page
    $aboutPage = @"
---
title: "About Me"
date: $(Get-Date -Format "yyyy-MM-dd")
draft: false
---

# About Me

Hello! I'm **$Username** and this is my personal blog.

## A bit about me

[Add your personal information here]

## Get in touch

Feel free to reach out if you'd like to connect!

---

*This blog is part of the [MyPP Site Blog Platform](https://blog.mypp.site).*
"@
    
    $aboutPage | Out-File "$userPath\content\about.md" -Encoding UTF8
    
    # Update database
    $db = Get-Content $DatabaseFile | ConvertFrom-Json
    $db.users | Add-Member -MemberType NoteProperty -Name $Username -Value @{
        email = $Email
        blogTitle = $BlogTitle
        description = $Description
        theme = $Theme
        created = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        status = "active"
        postCount = 1
        lastActivity = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    }
    
    $db.stats.totalUsers++
    $db.stats.totalPosts++
    
    $db | ConvertTo-Json -Depth 4 | Out-File $DatabaseFile -Encoding UTF8
    
    Write-ApiLog "Successfully created blog for $Username" "SUCCESS" $Username
    
    return @{
        success = $true
        username = $Username
        blogUrl = "https://blog.mypp.site/$Username/"
        message = "Blog created successfully! Welcome email sent to $Email"
    }
}

function Get-PlatformStats {
    $db = Get-Content $DatabaseFile | ConvertFrom-Json
    
    return @{
        totalUsers = $db.stats.totalUsers
        totalPosts = $db.stats.totalPosts
        activeUsers = ($db.users.PSObject.Properties.Value | Where-Object { $_.status -eq "active" }).Count
        recentUsers = ($db.users.PSObject.Properties | Sort-Object { [DateTime]$_.Value.created } -Descending | Select-Object -First 5).Name
    }
}

function Get-UserList {
    $db = Get-Content $DatabaseFile | ConvertFrom-Json
    
    $users = @()
    foreach ($user in $db.users.PSObject.Properties) {
        $users += [PSCustomObject]@{
            Username = $user.Name
            BlogTitle = $user.Value.blogTitle
            Email = $user.Value.email
            Created = $user.Value.created
            Posts = $user.Value.postCount
            Status = $user.Value.status
            BlogUrl = "https://blog.mypp.site/$($user.Name)/"
        }
    }
    
    return $users
}

function Build-UserSite {
    param($Username)
    
    $userPath = "$UsersDir\$Username"
    if (!(Test-Path $userPath)) {
        throw "User $Username not found"
    }
    
    Write-ApiLog "Building site for user: $Username" "INFO" $Username
    
    # Build the user's site
    Push-Location $userPath
    try {
        hugo --destination "$PlatformRoot\public\$Username" --baseURL "https://blog.mypp.site/$Username/"
        if ($LASTEXITCODE -eq 0) {
            Write-ApiLog "Successfully built site for $Username" "SUCCESS" $Username
            return $true
        } else {
            Write-ApiLog "Failed to build site for $Username" "ERROR" $Username
            return $false
        }
    }
    finally {
        Pop-Location
    }
}

function New-DemoUsers {
    Write-Host "Creating demo users..." -ForegroundColor Cyan
    
    $demoUsers = @(
        @{ username = "alice"; email = "alice@example.com"; title = "Alice's Tech Blog"; desc = "Sharing my journey in software development" },
        @{ username = "bob"; email = "bob@example.com"; title = "Bob's Photography"; desc = "Capturing moments through my lens" },
        @{ username = "charlie"; email = "charlie@example.com"; title = "Charlie's Thoughts"; desc = "Random musings about life and technology" }
    )
    
    foreach ($user in $demoUsers) {
        try {
            $result = New-UserBlog -Username $user.username -Email $user.email -BlogTitle $user.title -Description $user.desc
            Write-Host "✅ Created demo blog: $($user.username)" -ForegroundColor Green
        }
        catch {
            Write-Host "❌ Failed to create $($user.username): $_" -ForegroundColor Red
        }
    }
}

# Initialize platform
Initialize-Platform

# Main execution
switch ($Action.ToLower()) {
    "create" {
        if (-not $Username -or -not $Email -or -not $BlogTitle) {
            Write-Host "Usage: -Action create -Username <user> -Email <email> -BlogTitle <title>" -ForegroundColor Red
            exit 1
        }
        
        try {
            $result = New-UserBlog -Username $Username -Email $Email -BlogTitle $BlogTitle -Description $Description -Theme $Theme
            Write-Host "✅ Blog created successfully!" -ForegroundColor Green
            Write-Host "   Username: $($result.username)"
            Write-Host "   Blog URL: $($result.blogUrl)"
        }
        catch {
            Write-Host "❌ Error: $_" -ForegroundColor Red
            exit 1
        }
    }
    
    "check" {
        if (-not $Username) {
            Write-Host "Usage: -Action check -Username <user>" -ForegroundColor Red
            exit 1
        }
        
        $availability = Test-UsernameAvailable -Username $Username
        if ($availability.available) {
            Write-Host "✅ Username '$Username' is available" -ForegroundColor Green
        } else {
            Write-Host "❌ Username '$Username' is not available: $($availability.reason)" -ForegroundColor Red
        }
    }
    
    "stats" {
        $stats = Get-PlatformStats
        Write-Host "📊 PLATFORM STATISTICS" -ForegroundColor Cyan
        Write-Host "========================"
        Write-Host "Total Users: $($stats.totalUsers)"
        Write-Host "Total Posts: $($stats.totalPosts)"
        Write-Host "Active Users: $($stats.activeUsers)"
        Write-Host "Recent Users: $($stats.recentUsers -join ', ')"
    }
    
    "list" {
        $users = Get-UserList
        Write-Host "👥 USER LIST" -ForegroundColor Cyan
        Write-Host "============="
        $users | Format-Table Username, BlogTitle, Posts, Status, Created -AutoSize
    }
    
    "build" {
        if (-not $Username) {
            Write-Host "Usage: -Action build -Username <user>" -ForegroundColor Red
            exit 1
        }
        
        $success = Build-UserSite -Username $Username
        if ($success) {
            Write-Host "✅ Site built successfully for $Username" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to build site for $Username" -ForegroundColor Red
        }
    }
    
    "build-all" {
        $users = Get-UserList
        foreach ($user in $users) {
            Write-Host "Building site for $($user.Username)..." -ForegroundColor Yellow
            Build-UserSite -Username $user.Username
        }
    }
    
    "demo" {
        New-DemoUsers
    }
    
    default {
        Write-Host "Blog Platform API" -ForegroundColor Cyan
        Write-Host "================="
        Write-Host ""
        Write-Host "Usage: ./blog-platform-api.ps1 -Action <action> [options]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Actions:" -ForegroundColor Yellow
        Write-Host "  create    Create a new user blog"
        Write-Host "  check     Check username availability"
        Write-Host "  stats     Show platform statistics"
        Write-Host "  list      List all users"
        Write-Host "  build     Build a specific user's site"
        Write-Host "  build-all Build all user sites"
        Write-Host "  demo      Create demo users"
        Write-Host ""
        Write-Host "Examples:" -ForegroundColor Yellow
        Write-Host "  ./blog-platform-api.ps1 -Action create -Username john -Email john@example.com -BlogTitle 'John's Blog'"
        Write-Host "  ./blog-platform-api.ps1 -Action check -Username john"
        Write-Host "  ./blog-platform-api.ps1 -Action stats"
    }
}
