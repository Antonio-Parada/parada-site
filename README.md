# My Personal Portfolio

A personal portfolio website built with Hugo, automatically synced from Obsidian, and deployed to GitHub Pages with custom domain.

## 🚀 Quick Start

### Option 1: Auto-Sync and Deploy
```powershell
# Sync content from Obsidian and deploy to GitHub
.\sync-and-deploy.ps1
```

### Option 2: Manual Steps
```powershell
# 1. Sync content from Obsidian
.\sync-obsidian.ps1

# 2. Preview locally
hugo server

# 3. Build for production
.\build.ps1
```

## 📁 Project Structure

```
C:\Users\apara\OneDrive\Documents\parada-site/
├── .github/workflows/     # GitHub Actions for deployment
├── content/              # Hugo content (synced from Obsidian)
├── themes/PaperMod/      # Hugo theme
├── public/               # Generated static site
├── hugo.toml            # Hugo configuration
├── sync-obsidian.ps1    # Obsidian sync script
└── sync-and-deploy.ps1  # Full automation script
```

## 🔧 Setup Instructions

### 1. GitHub Repository Setup

1. Create a new repository on GitHub called `parada-site`
2. Update the remote URL in the deploy script:
   ```powershell
   git remote set-url origin https://github.com/Antonio-Parada/parada-site.git
   ```

### 2. GitHub Pages Configuration

1. Go to your repository settings
2. Navigate to Pages section
3. Set source to "Deploy from a branch"
4. Select the `gh-pages` branch
5. Set folder to `/ (root)`

### 3. Domain Configuration (Namecheap)

1. **In Namecheap DNS settings**, add these records:
   ```
   Type: CNAME
   Host: parada
   Value: Antonio-Parada.github.io
   TTL: Automatic
   ```

2. **In GitHub repository settings**:
   - Go to Pages section
   - Set custom domain to: `mypp.site`
   - Enable "Enforce HTTPS"

### 4. Obsidian Vault Structure

Organize your Obsidian vault like this:
```
Obsidian Vault/
├── blog/
│   └── content/
│       ├── posts/        # Your blog posts
│       │   ├── my-first-post.md
│       │   └── another-post.md
│       └── about/        # About page
│           └── index.md
└── other-content.md      # Additional pages
```

## 🔄 Workflow

### Daily Usage
1. Write content in Obsidian
2. Run `./sync-and-deploy.ps1` when ready to publish
3. Changes automatically deploy to https://mypp.site/parada/

### What Happens Automatically
1. **Sync**: Content copied from Obsidian to Hugo
2. **Validate**: Hugo build runs locally to check for errors
3. **Deploy**: Changes pushed to GitHub
4. **Build**: GitHub Actions builds and deploys the site
5. **Live**: Site updates at your custom domain

## 📝 Content Management

### Blog Posts
Create `.md` files in `Obsidian Vault/blog/content/posts/` with frontmatter:
```yaml
---
title: "My New Post"
date: 2025-01-06
draft: false
tags: ["tag1", "tag2"]
---

Your content here...
```

### Pages
Create `.md` files for static pages like About, Projects, etc.

## 🎨 Customization

### Theme Settings
Modify `hugo.toml` to customize:
- Site title and description
- Navigation menu
- Social links
- Color scheme

### Advanced Customization
- Custom CSS: `assets/css/extended/`
- Custom layouts: `layouts/`
- Custom shortcodes: `layouts/shortcodes/`

## 🔧 Troubleshooting

### Common Issues

1. **Build fails**: Check Hugo syntax in your markdown files
2. **Site not updating**: Verify GitHub Actions completed successfully
3. **Domain not working**: Check DNS propagation (can take 24-48 hours)
4. **Content not syncing**: Verify Obsidian vault path in sync script

### Useful Commands
```powershell
# Check site locally
hugo server -D

# Build without deploying
hugo --minify

# Check git status
git status

# Force push (use carefully)
git push --force-with-lease
```

## 🌐 URLs

- **Production Site**: https://mypp.site/parada/
- **GitHub Repository**: https://github.com/Antonio-Parada/parada-site
- **GitHub Actions**: https://github.com/Antonio-Parada/parada-site/actions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with ❤️ using Hugo, PaperMod, and automated with PowerShell*
