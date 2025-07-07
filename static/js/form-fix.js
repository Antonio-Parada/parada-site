// Quick Fix for Create Blog Form
// This script provides a simple fallback if the main form breaks

(function() {
    'use strict';
    
    console.log('🔧 Loading form fix...');
    
    // Wait for DOM to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormFix);
    } else {
        initFormFix();
    }
    
    function initFormFix() {
        // Check if form exists and is working
        const form = document.getElementById('createBlogForm');
        if (!form) {
            console.log('No create blog form found');
            return;
        }
        
        // Add backup form handler
        setTimeout(() => {
            if (!form.onsubmit && !form.addEventListener) {
                console.log('Adding backup form handler');
                addBackupFormHandler(form);
            }
        }, 1000);
    }
    
    function addBackupFormHandler(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Backup form handler triggered');
            
            // Get form data
            const formData = new FormData(form);
            const data = {
                username: formData.get('username'),
                blogTitle: formData.get('blogTitle'), 
                email: formData.get('email'),
                description: formData.get('description'),
                theme: formData.get('theme')
            };
            
            // Basic validation
            if (!data.username || !data.blogTitle || !data.email) {
                alert('Please fill in all required fields');
                return;
            }
            
            // Validate username
            if (!/^[a-z0-9-]{3,20}$/.test(data.username)) {
                alert('Username must be 3-20 characters: lowercase letters, numbers, and hyphens only');
                return;
            }
            
            // Show loading
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.innerHTML = '⏳ Processing...';
                submitBtn.disabled = true;
            }
            
            // Store data locally
            localStorage.setItem('pending_blog_creation', JSON.stringify({
                ...data,
                createdAt: new Date().toISOString()
            }));
            
            // Get user info from Google OAuth if available
            let userInfo = null;
            if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
                userInfo = googleAuth.currentUser;
            }
            
            // Prepare payload with user info
            const payload = {
                ...data,
                userInfo: userInfo
            };
            
            // Use the new GitHub backend if available
            if (typeof githubBackend !== 'undefined') {
                githubBackend.submitBlogRequest(data).then(result => {
                    if (result.success) {
                        githubBackend.handleSuccess(result, data);
                    } else {
                        githubBackend.handleFailureWithFallback(result.error, data);
                    }
                }).finally(() => {
                    // Reset button
                    if (submitBtn) {
                        submitBtn.innerHTML = '🚀 Create My Blog';
                        submitBtn.disabled = false;
                    }
                });
            } else {
                // Fallback to old method
                fetch('/.netlify/functions/create-blog', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Backend not available');
                    }
                }).then(result => {
                    showSuccess(data);
                }).catch(error => {
                    console.log('Backend unavailable, using OAuth flow:', error.message);
                    if (typeof googleAuth !== 'undefined' && googleAuth.login) {
                        localStorage.setItem('oauth_return_action', 'blog_creation');
                        googleAuth.login();
                    } else {
                        showSuccess(data);
                    }
                }).finally(() => {
                    if (submitBtn) {
                        submitBtn.innerHTML = '🚀 Create My Blog';
                        submitBtn.disabled = false;
                    }
                });
            }
        });
    }
    
    function showSuccess(data) {
        const form = document.getElementById('createBlogForm');
        const successMsg = document.getElementById('successMessage');
        
        if (form && successMsg) {
            form.style.display = 'none';
            successMsg.style.display = 'block';
            
            const blogUrl = document.getElementById('blogUrl');
            if (blogUrl) {
                blogUrl.textContent = `blog.mypp.site/${data.username}`;
            }
            
            successMsg.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                <h3 style="color: #28a745; margin-bottom: 1rem;">Blog Request Submitted!</h3>
                <p style="margin-bottom: 1rem;">Your blog creation request has been saved.</p>
                <p>Proposed URL: <strong>blog.mypp.site/${data.username}</strong></p>
                <div style="margin-top: 1rem;">
                    <button onclick="location.reload()" style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-right: 10px;">Create Another</button>
                    <a href="/dashboard/" style="display: inline-block; background: #28a745; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">Dashboard</a>
                </div>
            `;
        } else {
            alert(`Blog creation request submitted for: ${data.username}`);
        }
    }
    
    // Global function for manual fixes
    window.fixForm = function() {
        const form = document.getElementById('createBlogForm');
        if (form) {
            addBackupFormHandler(form);
            console.log('Form fix applied manually');
        } else {
            console.log('No form found to fix');
        }
    };
    
    console.log('✅ Form fix loaded. Use window.fixForm() if needed');
    
})();
