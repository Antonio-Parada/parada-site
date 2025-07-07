# Cloud-Based Content Management Script
# Manages blog content entirely through GitHub API without local dependencies

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("create", "update", "delete", "list", "publish", "deploy")]
    [string]$Action,
    
    [string]$Title,
    [string]$Content,
    [string]$Tags,
    [string]$Category = "General",
    [string]$Tenant = "parada",
    [string]$Filename,
    [switch]$Draft = $true,
    [string]$GitHubToken = $env:GITHUB_TOKEN,
    [string]$Repository = "Antonio-Parada/parada-site"
)

# Configuration
$ApiBase = "https://api.github.com"
$Headers = @{
    "Authorization" = "token $GitHubToken"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "BlogPlatform/1.0"
}

function Write-Status {
    param([string]$Message, [string]$Type = "Info")
    $color = switch ($Type) {
        "Success" { "Green" }
        "Error" { "Red" }
        "Warning" { "Yellow" }
        default { "White" }
    }
    Write-Host "[$Type] $Message" -ForegroundColor $color
}

function Get-GitHubContent {
    param([string]$Path)
    
    try {
        $url = "$ApiBase/repos/$Repository/contents/$Path"
        $response = Invoke-RestMethod -Uri $url -Headers $Headers -Method GET
        return $response
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 404) {
            return $null
        }
        throw
    }
}

function Set-GitHubContent {
    param(
        [string]$Path,
        [string]$Content,
        [string]$Message,
        [string]$Sha = $null
    )
    
    $url = "$ApiBase/repos/$Repository/contents/$Path"
    $encodedContent = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Content))
    
    $body = @{
        message = $Message
        content = $encodedContent
    }
    
    if ($Sha) {
        $body.sha = $Sha
    }
    
    $jsonBody = $body | ConvertTo-Json
    $response = Invoke-RestMethod -Uri $url -Headers $Headers -Method PUT -Body $jsonBody
    return $response
}

function Remove-GitHubContent {
    param([string]$Path, [string]$Message, [string]$Sha)
    
    $url = "$ApiBase/repos/$Repository/contents/$Path"
    $body = @{
        message = $Message
        sha = $Sha
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri $url -Headers $Headers -Method DELETE -Body $body
    return $response
}

function New-BlogPost {
    param(
        [string]$PostTitle,
        [string]$PostContent,
        [string]$PostTags,
        [string]$PostCategory,
        [string]$PostTenant,
        [bool]$IsDraft
    )
    
    Write-Status "Creating new blog post: $PostTitle"
    
    # Generate filename
    $filename = $PostTitle.ToLower() -replace '[^a-z0-9\s]', '' -replace '\s+', '-'
    $filename = "$filename.md"
    
    # Create frontmatter
    $date = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    $tagList = if ($PostTags) { 
        ($PostTags -split ',' | ForEach-Object { "`"$($_.Trim())`"" }) -join ', '
    } else { "" }
    
    $frontmatter = @"
---
title: "$PostTitle"
date: $date
draft: $($IsDraft.ToString().ToLower())
tags: [$tagList]
categories: ["$PostCategory"]
---

$PostContent
"@

    # Upload to GitHub
    $path = "sites/$PostTenant/content/posts/$filename"
    $commitMessage = "Add new blog post: $PostTitle"
    
    try {
        $result = Set-GitHubContent -Path $path -Content $frontmatter -Message $commitMessage
        Write-Status "✅ Post created successfully: $filename" -Type "Success"
        Write-Status "📁 Path: $path"
        Write-Status "🔗 GitHub URL: $($result.content.html_url)"
        
        if (-not $IsDraft) {
            Write-Status "🚀 Post will be live after deployment completes"
        } else {
            Write-Status "📝 Post created as draft - set draft: false to publish"
        }
        
        return @{
            filename = $filename
            path = $path
            url = $result.content.html_url
            sha = $result.content.sha
        }
    }
    catch {
        Write-Status "❌ Failed to create post: $($_.Exception.Message)" -Type "Error"
        throw
    }
}

function Update-BlogPost {
    param(
        [string]$PostFilename,
        [string]$NewContent,
        [string]$PostTenant
    )
    
    Write-Status "Updating blog post: $PostFilename"
    
    $path = "sites/$PostTenant/content/posts/$PostFilename"
    
    # Get current content
    $existing = Get-GitHubContent -Path $path
    if (-not $existing) {
        Write-Status "❌ Post not found: $PostFilename" -Type "Error"
        return
    }
    
    $commitMessage = "Update blog post: $PostFilename"
    
    try {
        $result = Set-GitHubContent -Path $path -Content $NewContent -Message $commitMessage -Sha $existing.sha
        Write-Status "✅ Post updated successfully" -Type "Success"
        return $result
    }
    catch {
        Write-Status "❌ Failed to update post: $($_.Exception.Message)" -Type "Error"
        throw
    }
}

function Remove-BlogPost {
    param([string]$PostFilename, [string]$PostTenant)
    
    Write-Status "Deleting blog post: $PostFilename"
    
    $path = "sites/$PostTenant/content/posts/$PostFilename"
    
    # Get current content for SHA
    $existing = Get-GitHubContent -Path $path
    if (-not $existing) {
        Write-Status "❌ Post not found: $PostFilename" -Type "Error"
        return
    }
    
    $commitMessage = "Delete blog post: $PostFilename"
    
    try {
        Remove-GitHubContent -Path $path -Message $commitMessage -Sha $existing.sha
        Write-Status "✅ Post deleted successfully" -Type "Success"
    }
    catch {
        Write-Status "❌ Failed to delete post: $($_.Exception.Message)" -Type "Error"
        throw
    }
}

function Get-BlogPosts {
    param([string]$PostTenant)
    
    Write-Status "Listing blog posts for tenant: $PostTenant"
    
    $path = "sites/$PostTenant/content/posts"
    
    try {
        $posts = Get-GitHubContent -Path $path
        
        if ($posts) {
            Write-Status "📚 Found $($posts.Count) posts:" -Type "Success"
            foreach ($post in $posts) {
                if ($post.name.EndsWith('.md')) {
                    Write-Host "  📄 $($post.name)" -ForegroundColor Cyan
                }
            }
        } else {
            Write-Status "📭 No posts found" -Type "Warning"
        }
        
        return $posts
    }
    catch {
        Write-Status "❌ Failed to list posts: $($_.Exception.Message)" -Type "Error"
        throw
    }
}

function Publish-BlogPost {
    param([string]$PostFilename, [string]$PostTenant)
    
    Write-Status "Publishing blog post: $PostFilename"
    
    $path = "sites/$PostTenant/content/posts/$PostFilename"
    
    # Get current content
    $existing = Get-GitHubContent -Path $path
    if (-not $existing) {
        Write-Status "❌ Post not found: $PostFilename" -Type "Error"
        return
    }
    
    # Decode and modify content
    $content = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($existing.content))
    $updatedContent = $content -replace 'draft: true', 'draft: false'
    
    if ($content -eq $updatedContent) {
        Write-Status "⚠️ Post is already published (draft: false)" -Type "Warning"
        return
    }
    
    $commitMessage = "Publish blog post: $PostFilename"
    
    try {
        Set-GitHubContent -Path $path -Content $updatedContent -Message $commitMessage -Sha $existing.sha
        Write-Status "✅ Post published successfully" -Type "Success"
        Write-Status "🚀 Will be live after deployment completes"
    }
    catch {
        Write-Status "❌ Failed to publish post: $($_.Exception.Message)" -Type "Error"
        throw
    }
}

function Start-Deployment {
    Write-Status "Triggering deployment..."
    
    $url = "$ApiBase/repos/$Repository/actions/workflows/deploy.yml/dispatches"
    $body = @{
        ref = "main"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri $url -Headers $Headers -Method POST -Body $body
        Write-Status "✅ Deployment triggered successfully" -Type "Success"
        Write-Status "🔄 Check status at: https://github.com/$Repository/actions"
    }
    catch {
        Write-Status "❌ Failed to trigger deployment: $($_.Exception.Message)" -Type "Error"
        throw
    }
}

# Validate GitHub token
if (-not $GitHubToken) {
    Write-Status "❌ GitHub token is required. Set GITHUB_TOKEN environment variable or use -GitHubToken parameter" -Type "Error"
    exit 1
}

# Execute action
try {
    switch ($Action) {
        "create" {
            if (-not $Title -or -not $Content) {
                Write-Status "❌ Title and Content are required for creating posts" -Type "Error"
                exit 1
            }
            New-BlogPost -PostTitle $Title -PostContent $Content -PostTags $Tags -PostCategory $Category -PostTenant $Tenant -IsDraft $Draft
        }
        "update" {
            if (-not $Filename -or -not $Content) {
                Write-Status "❌ Filename and Content are required for updating posts" -Type "Error"
                exit 1
            }
            Update-BlogPost -PostFilename $Filename -NewContent $Content -PostTenant $Tenant
        }
        "delete" {
            if (-not $Filename) {
                Write-Status "❌ Filename is required for deleting posts" -Type "Error"
                exit 1
            }
            Remove-BlogPost -PostFilename $Filename -PostTenant $Tenant
        }
        "list" {
            Get-BlogPosts -PostTenant $Tenant
        }
        "publish" {
            if (-not $Filename) {
                Write-Status "❌ Filename is required for publishing posts" -Type "Error"
                exit 1
            }
            Publish-BlogPost -PostFilename $Filename -PostTenant $Tenant
        }
        "deploy" {
            Start-Deployment
        }
    }
}
catch {
    Write-Status "💥 Operation failed: $($_.Exception.Message)" -Type "Error"
    exit 1
}

Write-Status "🎉 Operation completed successfully!" -Type "Success"
