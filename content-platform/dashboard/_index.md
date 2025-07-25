---
title: "Dashboard"
description: "Blog management dashboard for authenticated users"
layout: "dashboard"
type: "dashboard"
---

<div class="login-required" style="text-align: center; padding: 50px;">
    <h2>🔒 Login Required</h2>
    <p>Please sign in to access your dashboard.</p>
    <button onclick="googleAuth.login()" class="login-btn" style="
        background: #4285f4;
        color: white;
        border: none;
        padding: 10px 20px;
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
        🔑 Sign in with Google
    </button>
</div>

<div class="auth-required dashboard-content" style="display: none;">
    
# 📊 Blog Dashboard

Welcome to your personal blogging dashboard! From here you can manage your content, create new posts, and monitor your blog's performance.

## 🚀 Quick Actions

<div class="dashboard-actions" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;">
    
<div class="action-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
    <h3>✍️ Create New Post</h3>
    <p>Write and publish a new blog post</p>
    <button onclick="showCreatePostForm()" class="btn-primary">Create Post</button>
</div>

<div class="action-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
    <h3>📝 Manage Posts</h3>
    <p>Edit, publish, or delete existing posts</p>
    <button onclick="showPostsManager()" class="btn-primary">Manage Posts</button>
</div>

<div class="action-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
    <h3>📊 Analytics</h3>
    <p>View your blog's performance and statistics</p>
    <button onclick="showAnalytics()" class="btn-primary">View Analytics</button>
</div>

<div class="action-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; text-align: center;">
    <h3>⚙️ Settings</h3>
    <p>Customize your blog settings and preferences</p>
    <button onclick="showSettings()" class="btn-primary">Settings</button>
</div>

</div>

## 📋 Recent Activity

<div id="recent-activity" class="recent-activity">
    <p>Loading recent activity...</p>
</div>

## 📈 Quick Stats

<div class="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
    
<div class="stat-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
    <h3 style="margin: 0; color: #0366d6;">-</h3>
    <p style="margin: 5px 0; color: #586069;">Total Posts</p>
</div>

<div class="stat-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
    <h3 style="margin: 0; color: #28a745;">-</h3>
    <p style="margin: 5px 0; color: #586069;">Published Posts</p>
</div>

<div class="stat-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
    <h3 style="margin: 0; color: #ffc107;">-</h3>
    <p style="margin: 5px 0; color: #586069;">Draft Posts</p>
</div>

<div class="stat-card" style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
    <h3 style="margin: 0; color: #6f42c1;">-</h3>
    <p style="margin: 5px 0; color: #586069;">Total Views</p>
</div>

</div>

</div>

<!-- Modal for creating new posts -->
<div id="create-post-modal" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close" onclick="hideCreatePostForm()">&times;</span>
        <h2>✍️ Create New Blog Post</h2>
        
        <form id="create-post-form" onsubmit="return handleCreatePost(event);">
            <div class="form-group">
                <label for="post-title">Title *</label>
                <input type="text" id="post-title" name="title" required placeholder="Enter your post title">
            </div>
            
            <div class="form-group">
                <label for="post-content">Content *</label>
                <textarea id="post-content" name="content" required rows="15" placeholder="Write your post content in Markdown format...

## Introduction

Your content goes here...

## Main Points

- Point 1
- Point 2

## Conclusion

Wrap up your thoughts."></textarea>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="post-tags">Tags</label>
                    <input type="text" id="post-tags" name="tags" placeholder="technology, programming, personal">
                    <small>Separate tags with commas</small>
                </div>
                
                <div class="form-group">
                    <label for="post-category">Category</label>
                    <select id="post-category" name="category">
                        <option value="General">General</option>
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="Personal">Personal</option>
                        <option value="Projects">Projects</option>
                        <option value="Research">Research</option>
                    </select>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" onclick="hideCreatePostForm()" class="btn-secondary">Cancel</button>
                <button type="submit" class="btn-primary">Create Post</button>
            </div>
        </form>
    </div>
</div>

<!-- Posts Manager Modal -->
<div id="posts-manager-modal" class="modal" style="display: none;">
    <div class="modal-content" style="max-width: 800px;">
        <span class="close" onclick="hidePostsManager()">&times;</span>
        <h2>📝 Manage Your Posts</h2>
        
        <div id="posts-list" class="posts-list">
            <p>Loading your posts...</p>
        </div>
    </div>
</div>

<!-- Load authentication systems in correct order -->
<script src="/js/auth-fix.js"></script>
<script src="/js/google-auth.js"></script>
<script src="/js/dashboard.js"></script>
<script src="/js/auth-cleanup.js"></script>

<style>
.btn-primary {
    background: #0366d6;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}

.btn-secondary {
    background: #6c757d;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
}

.btn-primary:hover, .btn-secondary:hover {
    opacity: 0.9;
}

.modal {
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    border-radius: 8px;
    width: 80%;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover {
    color: black;
}

.form-group {
    margin-bottom: 20px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input, .form-group textarea, .form-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;
}

.form-group small {
    color: #6c757d;
    font-size: 12px;
}

.form-actions {
    text-align: right;
    margin-top: 20px;
}

.form-actions button {
    margin-left: 10px;
}

.posts-list {
    max-height: 400px;
    overflow-y: auto;
}

.post-item {
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 10px;
}

.post-item h4 {
    margin: 0 0 10px 0;
    color: #0366d6;
}

.post-item .post-meta {
    color: #6c757d;
    font-size: 12px;
    margin-bottom: 10px;
}

.post-item .post-actions {
    text-align: right;
}

.post-item .post-actions button {
    margin-left: 5px;
    padding: 5px 10px;
    font-size: 12px;
}
</style>
