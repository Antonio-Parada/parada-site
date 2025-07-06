# Hugo Blog Setup

Your beautiful Hugo blog is ready! 🎉

## Quick Start

1. **Start the blog server**: Double-click `start-blog.bat` or run:
   ```
   hugo server --bind 0.0.0.0 --baseURL http://localhost:1313
   ```

2. **Open your blog**: Visit [http://localhost:1313](http://localhost:1313) in your browser

## Adding New Posts

### Method 1: Automatic Sync (Recommended)
1. Add new `.md` files to your main directory
2. Run `sync-blog.ps1` to automatically convert them to blog posts
3. The blog will auto-refresh if the server is running

### Method 2: Manual Creation
1. Create new files in `blog/content/posts/` with this format:
   ```markdown
   ---
   title: "Your Post Title"
   date: 2025-07-06T21:28:00Z
   draft: false
   tags: ["tag1", "tag2"]
   categories: ["Category"]
   ---
   
   Your content here...
   ```

## Features

✅ **Auto-generated** from your markdown files  
✅ **Beautiful PaperMod theme** with dark/light mode  
✅ **SEO optimized** with meta tags and social sharing  
✅ **Responsive design** works on all devices  
✅ **Fast search** and navigation  
✅ **Code highlighting** with copy buttons  
✅ **Reading time** and word count  
✅ **Table of contents** for long posts  

## Customization

- Edit `blog/hugo.toml` to change site settings
- Modify `blog/content/about/index.md` to update your about page
- Add your GitHub username in the config for social links

## File Structure

```
blog/
├── hugo.toml          # Site configuration
├── content/
│   ├── posts/         # Your blog posts
│   └── about/         # About page
└── themes/PaperMod/   # Theme files
```

## Publishing Online

To publish your blog:
1. Run `hugo` to build static files
2. Upload the `public/` folder to any web host
3. Or use services like Netlify, Vercel, or GitHub Pages

## Support

- Hugo Documentation: https://gohugo.io/documentation/
- PaperMod Theme: https://github.com/adityatelange/hugo-PaperMod

Enjoy your new blog! 🚀
