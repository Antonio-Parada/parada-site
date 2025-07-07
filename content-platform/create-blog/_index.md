---
title: "Create Your Blog"
description: "Create a new blog post using our demo platform"
layout: "single"
---

<div class="login-required" style="text-align: center; padding: 50px;">
    <h2>🚀 Demo Blog Creation</h2>
    <p>Please use the demo login to create blog posts.</p>
    <button onclick="demoAuth.demoLogin()" class="demo-login-btn" style="
        background: #28a745;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
    ">🚀 Demo Login</button>
    <br><small style="color: #666; margin-top: 10px; display: block;">
        Quick login for testing the platform
    </small>
</div>

<div class="auth-required create-blog-content" style="display: none;">
    
# ✍️ Create Your Blog Post

Welcome to the blog creation page! Here you can write and publish new blog posts using our demo platform.

<div class="create-blog-form" style="max-width: 800px; margin: 0 auto; padding: 20px;">
    
<form id="blog-creation-form" onsubmit="return handleBlogCreation(event);" style="background: #f8f9fa; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
<div class="form-group" style="margin-bottom: 20px;">
    <label for="blog-title" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        📝 Blog Post Title *
    </label>
    <input 
        type="text" 
        id="blog-title" 
        name="title" 
        required 
        placeholder="Enter an engaging title for your blog post"
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;"
    >
</div>

<div class="form-group" style="margin-bottom: 20px;">
    <label for="blog-content" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        📄 Content *
    </label>
    <textarea 
        id="blog-content" 
        name="content" 
        required 
        rows="15" 
        placeholder="Write your blog post content here...

## Introduction

Start with an engaging introduction...

## Main Content

Share your thoughts, ideas, or stories...

## Conclusion

Wrap up with a memorable conclusion..."
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; font-family: monospace; resize: vertical; box-sizing: border-box;"
    ></textarea>
    <small style="color: #666; font-size: 12px;">
        💡 Tip: You can use Markdown formatting (## for headings, **bold**, *italic*, etc.)
    </small>
</div>

<div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
    <div class="form-group">
        <label for="blog-tags" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
            🏷️ Tags
        </label>
        <input 
            type="text" 
            id="blog-tags" 
            name="tags" 
            placeholder="technology, programming, personal"
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;"
        >
        <small style="color: #666; font-size: 12px;">Separate tags with commas</small>
    </div>
    
    <div class="form-group">
        <label for="blog-category" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
            📂 Category
        </label>
        <select 
            id="blog-category" 
            name="category"
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;"
        >
            <option value="General">General</option>
            <option value="Technology">Technology</option>
            <option value="Business">Business</option>
            <option value="Personal">Personal</option>
            <option value="Projects">Projects</option>
            <option value="Research">Research</option>
        </select>
    </div>
</div>

<div class="form-actions" style="text-align: center; margin-top: 30px;">
    <button 
        type="submit" 
        style="background: #0366d6; color: white; border: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; cursor: pointer; margin-right: 10px;"
    >
        🚀 Create Demo Post
    </button>
    <button 
        type="button" 
        onclick="clearForm()"
        style="background: #6c757d; color: white; border: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; cursor: pointer;"
    >
        🗑️ Clear Form
    </button>
</div>

</form>

</div>

<div class="demo-info" style="background: #e9ecef; padding: 20px; border-radius: 10px; margin-top: 30px; text-align: center;">
    <h3>📋 Demo Mode Information</h3>
    <p style="margin: 10px 0;">
        This is a demo version of the blogging platform. Your posts will be:
    </p>
    <ul style="text-align: left; display: inline-block; margin: 10px 0;">
        <li>✅ Stored locally in your browser</li>
        <li>✅ Visible in your demo dashboard</li>
        <li>✅ Formatted with proper metadata</li>
        <li>ℹ️ Not published to the live site (demo only)</li>
    </ul>
    <p style="margin: 10px 0;">
        <strong>💡 Pro Tip:</strong> After creating posts, visit the 
        <a href="/dashboard/" style="color: #0366d6;">📊 Dashboard</a> to manage them!
    </p>
</div>

</div>

<script>
function handleBlogCreation(event) {
    event.preventDefault();
    
    // Check if user is logged in
    if (!demoAuth.currentUser) {
        demoAuth.showError('Please login first to create a blog post');
        return false;
    }
    
    const formData = new FormData(event.target);
    const title = formData.get('title');
    const content = formData.get('content');
    const tags = formData.get('tags');
    const category = formData.get('category');
    
    // Validation
    if (!title.trim()) {
        demoAuth.showError('Please enter a title for your blog post');
        return false;
    }
    
    if (!content.trim()) {
        demoAuth.showError('Please write some content for your blog post');
        return false;
    }
    
    // Create the post
    demoAuth.createPost(title, content, tags, category)
        .then(() => {
            // Clear the form
            event.target.reset();
            
            // Show success message with navigation options
            const successMessage = `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h4>🎉 Demo Post Created Successfully!</h4>
                    <p><strong>"${title}"</strong> has been created and stored locally.</p>
                    <div style="margin-top: 15px;">
                        <a href="/dashboard/" class="btn-primary" style="display: inline-block; background: #0366d6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px;">
                            📊 View Dashboard
                        </a>
                        <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px;">
                            ✅ Continue Writing
                        </button>
                    </div>
                </div>
            `;
            
            // Insert success message after the form
            const form = document.getElementById('blog-creation-form');
            form.insertAdjacentHTML('afterend', successMessage);
            
            // Scroll to success message
            form.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            demoAuth.showError('Failed to create post: ' + error.message);
        });
    
    return false;
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form content?')) {
        document.getElementById('blog-creation-form').reset();
        document.getElementById('blog-title').focus();
        
        // Remove any success messages
        const successMessages = document.querySelectorAll('[style*="background: #d4edda"]');
        successMessages.forEach(msg => msg.remove());
    }
}
</script>

<style>
.btn-primary:hover, .btn-secondary:hover {
    opacity: 0.9;
}

.form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: #0366d6;
    box-shadow: 0 0 0 2px rgba(3, 102, 214, 0.2);
}

.demo-login-btn:hover {
    opacity: 0.9;
}

@media (max-width: 768px) {
    .form-row {
        grid-template-columns: 1fr !important;
    }
    
    .create-blog-form {
        padding: 15px !important;
    }
    
    .form-actions button {
        display: block;
        width: 100%;
        margin: 10px 0 !important;
    }
}
</style>
