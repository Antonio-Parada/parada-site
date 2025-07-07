# Blog Sync Issues and Fixes

## Issues Discovered (2025-07-06)

### 1. PowerShell Script Parsing Error
**Problem**: The original `sync-obsidian.ps1` script had a syntax error that prevented execution.
**Error**: `The string is missing the terminator`
**Impact**: Automated sync was completely broken

### 2. Stale Content Accumulation
**Problem**: The sync script only added/updated files but never deleted removed content.
**Impact**: Old posts (poo poo, accu-website, etc.) remained visible on the blog even after being deleted from Obsidian vault.
**Root Cause**: Script used additive sync instead of clean sync

### 3. Draft Status Publishing Issue
**Problem**: Posts with `draft: true` were synced but not published on the live site.
**Impact**: New content appeared to not be deploying when it was actually just hidden due to draft status.

## Solutions Implemented

### 1. Fixed PowerShell Script
- Created `sync-obsidian-fixed.ps1` with proper syntax
- Added error handling and better feedback
- Improved file path handling

### 2. Clean Sync Strategy
- **Before**: Only copied new/changed files
- **After**: Clears destination directory first, then copies fresh content
- Ensures removed content is properly deleted from Hugo site

### 3. Manual Sync Fallback
- Documented simple manual sync commands as backup
- Created one-liner command for quick syncing

## Recommended Workflow

### Primary Method (Automated)
```powershell
.\sync-and-deploy.ps1
```

### Backup Method (Manual)
```powershell
# Quick one-liner
Copy-Item -Path "C:\Users\apara\OneDrive\Documents\Obsidian Vault\blog\content\posts\*.md" -Destination "content\posts\" -Force; git add .; git commit -m "Update blog $(Get-Date -Format 'yyyy-MM-dd HH:mm')"; git push

# Step by step
Copy-Item -Path "C:\Users\apara\OneDrive\Documents\Obsidian Vault\blog\content\posts\*.md" -Destination "content\posts\" -Force
git add .
git commit -m "Update blog content"
git push
```

### Test New Fixed Script
```powershell
.\sync-obsidian-fixed.ps1
```

## Prevention Measures

1. **Always check draft status** in frontmatter before expecting content to appear live
2. **Use git status** to verify changes are detected before committing
3. **Test sync scripts** in development before relying on them for production
4. **Regular cleanup** of content directory to prevent stale content accumulation

## Site URLs
- **Live Blog**: https://blog.mypp.site
- **GitHub Actions**: https://github.com/Antonio-Parada/parada-site/actions
- **Repository**: https://github.com/Antonio-Parada/parada-site

## Files Modified/Created
- `sync-obsidian-fixed.ps1` (new, improved version)
- `sync-and-deploy.ps1` (updated URL reference)
- `content/_index.md` (recreated)
- Content directory (cleaned and resynced)

## Next Steps
1. Test the fixed sync script with new content
2. Consider replacing the old script with the fixed version
3. Add validation to check for draft status in sync process
