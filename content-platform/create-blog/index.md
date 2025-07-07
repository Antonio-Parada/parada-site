---
title: "Create Your Blog"
description: "Create your own blog on our platform"
layout: "single"
---

<div class="login-required" style="text-align: center; padding: 50px;">
    <h2>🚀 Create Your Blog</h2>
    <p>Please sign in with Google to create your own blog.</p>
    <button onclick="googleAuth.login()" class="google-login-btn" style="
        background: #4285f4;
        color: white;
        border: none;
        padding: 15px 30px;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
        display: inline-flex;
        align-items: center;
    ">
        <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
            <path fill="#FFFFFF" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#FFFFFF" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.36H1.83v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FFFFFF" d="M4.46 10.41a4.8 4.8 0 0 1-.25-1.41c0-.49.09-.97.25-1.41V5.52H1.83a8 8 0 0 0-.86 3.48c0 1.24.32 2.47.86 3.48l2.63-2.07z"/>
            <path fill="#FFFFFF" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 0 0 8.98 0 8 8 0 0 0 1.83 5.52L4.46 7.6A4.77 4.77 0 0 1 8.98 3.58z"/>
        </svg>
        Sign in with Google
    </button>
    <br><small style="color: #666; margin-top: 10px; display: block;">
        Secure authentication powered by Google OAuth
    </small>
</div>

<div class="auth-required create-blog-content" style="display: none;">
    
# 🚀 Create Your Blog

Welcome! Here you can create your own blog on our platform. Your blog will be available at `blog.mypp.site/[your-username]` within minutes of creation.

<div class="create-blog-form" style="max-width: 800px; margin: 0 auto; padding: 20px;">
    
<form id="blog-creation-form" onsubmit="return handleBlogCreation(event);" style="background: #f8f9fa; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    
<div class="form-group" style="margin-bottom: 20px;">
    <label for="username" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        👤 Username *
    </label>
    <input 
        type="text" 
        id="username" 
        name="username" 
        required 
        pattern="[a-z0-9-]{3,20}"
        placeholder="your-username"
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;"
    >
    <small style="color: #666; font-size: 12px;">
        3-20 characters: lowercase letters, numbers, hyphens only. Your blog will be at: blog.mypp.site/[username]
    </small>
    <div id="username-feedback" style="margin-top: 5px; font-size: 12px;"></div>
</div>

<div class="form-group" style="margin-bottom: 20px;">
    <label for="blog-title" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        📝 Blog Title *
    </label>
    <input 
        type="text" 
        id="blog-title" 
        name="blogTitle" 
        required 
        placeholder="My Awesome Blog"
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;"
    >
</div>

<div class="form-group" style="margin-bottom: 20px;">
    <label for="email" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        📧 Email Address *
    </label>
    <input 
        type="email" 
        id="email" 
        name="email" 
        required 
        placeholder="your@email.com"
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; box-sizing: border-box;"
    >
    <small style="color: #666; font-size: 12px;">
        For notifications and account management
    </small>
</div>

<div class="form-group" style="margin-bottom: 20px;">
    <label for="description" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        📄 Blog Description
    </label>
    <textarea 
        id="description" 
        name="description" 
        rows="3" 
        placeholder="A brief description of your blog (optional)"
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; resize: vertical; box-sizing: border-box;"
    ></textarea>
</div>

<div class="form-group" style="margin-bottom: 20px;">
    <label for="theme" style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        🎨 Theme
    </label>
    <select 
        id="theme" 
        name="theme"
        style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px; box-sizing: border-box;"
    >
        <option value="PaperMod">PaperMod (Modern, clean design)</option>
        <option value="Ananke">Ananke (Simple, readable)</option>
        <option value="Hugo Theme">Hugo Theme (Classic)</option>
    </select>
</div>

<div class="form-group" style="margin-bottom: 20px;">
    <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #333;">
        ✅ Terms and Conditions
    </label>
    <div style="background: white; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <label style="display: flex; align-items: center; margin-bottom: 10px; cursor: pointer;">
            <input type="checkbox" id="terms1" required style="margin-right: 10px;">
            <span>I agree to the platform's terms of service</span>
        </label>
        <label style="display: flex; align-items: center; margin-bottom: 10px; cursor: pointer;">
            <input type="checkbox" id="terms2" required style="margin-right: 10px;">
            <span>I understand this is a free service with best-effort support</span>
        </label>
        <label style="display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="terms3" required style="margin-right: 10px;">
            <span>I will use appropriate content and follow community guidelines</span>
        </label>
    </div>
</div>

<div class="form-actions" style="text-align: center; margin-top: 30px;">
    <button 
        type="submit" 
        style="background: #0366d6; color: white; border: none; padding: 15px 40px; border-radius: 5px; font-size: 16px; cursor: pointer; margin-right: 10px;"
    >
        🚀 Create My Blog
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

<div class="info-panel" style="background: #e9ecef; padding: 20px; border-radius: 10px; margin-top: 30px; text-align: center;">
    <h3>🔄 What happens next?</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px; margin-bottom: 10px;">1️⃣</div>
            <strong>Review</strong><br>
            <small>We'll review your request within 24 hours</small>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px; margin-bottom: 10px;">2️⃣</div>
            <strong>Creation</strong><br>
            <small>If approved, your blog will be automatically created</small>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px; margin-bottom: 10px;">3️⃣</div>
            <strong>Notification</strong><br>
            <small>You'll receive an email with your blog URL and instructions</small>
        </div>
        <div style="background: white; padding: 15px; border-radius: 8px;">
            <div style="font-size: 24px; margin-bottom: 10px;">4️⃣</div>
            <strong>Start Writing</strong><br>
            <small>Access your blog and start creating content</small>
        </div>
    </div>
    <p style="margin: 10px 0;">
        <strong>💡 Your blog will be available at:</strong> <code>https://blog.mypp.site/[your-username]/</code>
    </p>
</div>

</div>

<script>
// Username validation
document.getElementById('username').addEventListener('input', function(e) {
    const username = e.target.value.toLowerCase();
    const feedback = document.getElementById('username-feedback');
    
    if (username.length === 0) {
        feedback.innerHTML = '';
        return;
    }
    
    const usernameRegex = /^[a-z0-9-]{3,20}$/;
    const reserved = ['admin', 'api', 'www', 'blog', 'mail', 'ftp', 'root', 'test', 'demo', 'parada'];
    
    if (!usernameRegex.test(username)) {
        feedback.innerHTML = '<span style="color: #dc3545;">❌ Username must be 3-20 characters: lowercase letters, numbers, hyphens only</span>';
    } else if (reserved.includes(username)) {
        feedback.innerHTML = '<span style="color: #dc3545;">❌ Username is reserved</span>';
    } else {
        feedback.innerHTML = '<span style="color: #28a745;">✅ Username format is valid</span>';
    }
});

// Auto-fill email from Google Auth
document.addEventListener('DOMContentLoaded', function() {
    if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
        document.getElementById('email').value = googleAuth.currentUser.email;
    }
});

async function handleBlogCreation(event) {
    event.preventDefault();
    
    // Check if user is logged in
    if (!googleAuth || !googleAuth.currentUser) {
        googleAuth.showError('Please login first to create a blog');
        return false;
    }
    
    const formData = new FormData(event.target);
    const username = formData.get('username').toLowerCase();
    const blogTitle = formData.get('blogTitle');
    const email = formData.get('email');
    const description = formData.get('description');
    const theme = formData.get('theme');
    
    // Validation
    if (!username.trim() || !blogTitle.trim() || !email.trim()) {
        googleAuth.showError('Please fill in all required fields');
        return false;
    }
    
    const usernameRegex = /^[a-z0-9-]{3,20}$/;
    if (!usernameRegex.test(username)) {
        googleAuth.showError('Invalid username format');
        return false;
    }
    
    // Check terms
    if (!document.getElementById('terms1').checked || 
        !document.getElementById('terms2').checked || 
        !document.getElementById('terms3').checked) {
        googleAuth.showError('Please accept all terms and conditions');
        return false;
    }
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Creating Blog...';
    submitBtn.disabled = true;
    
    try {
        // Create GitHub issue for blog creation
        const issueBody = `### Username\n${username}\n\n### Email Address\n${email}\n\n### Blog Title\n${blogTitle}\n\n### Blog Description\n${description || 'No description provided'}\n\n### Theme\n${theme}\n\n### Terms and Conditions\n- [x] I agree to the platform's terms of service\n- [x] I understand this is a free service with best-effort support\n- [x] I will use appropriate content and follow community guidelines`;
        
        const issueData = {
            title: `[BLOG REQUEST] Create blog for: ${username}`,
            body: issueBody,
            labels: ['blog-creation', 'pending-review']
        };
        
        // Use GitHub API to create issue
        const response = await fetch('https://api.github.com/repos/Antonio-Parada/parada-site/issues', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Blog-Platform/1.0'
            },
            body: JSON.stringify(issueData)
        });
        
        if (response.ok) {
            const issue = await response.json();
            
            // Show success message
            const successMessage = `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h4>🎉 Blog Request Submitted Successfully!</h4>
                    <p><strong>"${blogTitle}"</strong> blog creation request has been submitted.</p>
                    <p><strong>Username:</strong> ${username}<br>
                       <strong>Future URL:</strong> https://blog.mypp.site/${username}/</p>
                    <div style="margin-top: 15px;">
                        <p><strong>What's next?</strong></p>
                        <ul style="text-align: left; margin: 10px 0;">
                            <li>✅ Your request has been submitted for review</li>
                            <li>⏳ We'll process it within 24 hours</li>
                            <li>📧 You'll receive an email notification when ready</li>
                            <li>🚀 Your blog will be live at the URL above</li>
                        </ul>
                        <a href="${issue.html_url}" target="_blank" style="display: inline-block; background: #0366d6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                            📋 Track Request Status
                        </a>
                    </div>
                </div>
            `;
            
            // Clear form and show success
            event.target.reset();
            event.target.insertAdjacentHTML('afterend', successMessage);
            event.target.nextElementSibling.scrollIntoView({ behavior: 'smooth' });
            
        } else {
            throw new Error('Failed to submit blog request');
        }
        
    } catch (error) {
        console.error('Error creating blog request:', error);
        googleAuth.showError('Failed to submit blog request. Please try again or contact support.');
    } finally {
        // Restore button
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
    
    return false;
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form content?')) {
        document.getElementById('blog-creation-form').reset();
        document.getElementById('username').focus();
        
        // Remove any success messages
        const successMessages = document.querySelectorAll('[style*="background: #d4edda"]');
        successMessages.forEach(msg => msg.remove());
        
        // Clear username feedback
        document.getElementById('username-feedback').innerHTML = '';
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

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 768px) {
    .create-blog-form {
        padding: 15px !important;
    }
    
    .form-actions button {
        display: block;
        width: 100%;
        margin: 10px 0 !important;
    }
    
    .info-panel > div {
        grid-template-columns: 1fr !important;
    }
}
</style>
