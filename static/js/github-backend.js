// GitHub Issues Backend Integration
// Handles communication between frontend and GitHub Issues backend

(function() {
    'use strict';
    
    console.log('🔧 Loading GitHub backend integration...');
    
    // GitHub backend handler
    class GitHubBackend {
        constructor() {
            this.netlifyFunctionUrl = '/.netlify/functions/create-blog';
            this.retryAttempts = 3;
            this.retryDelay = 1000; // 1 second
        }
        
        // Submit blog creation request
        async submitBlogRequest(blogData) {
            // Add authentication info if available
            if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
                blogData.userInfo = {
                    id: googleAuth.currentUser.id,
                    email: googleAuth.currentUser.email,
                    name: googleAuth.currentUser.name,
                    picture: googleAuth.currentUser.picture,
                    verified_email: googleAuth.currentUser.verified_email
                };
            }
            
            console.log('Submitting blog request to GitHub backend:', blogData);
            
            for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
                try {
                    const response = await fetch(this.netlifyFunctionUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(blogData)
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const result = await response.json();
                    console.log('✅ Blog request submitted successfully:', result);
                    
                    return {
                        success: true,
                        data: result
                    };
                    
                } catch (error) {
                    console.warn(`Backend attempt ${attempt}/${this.retryAttempts} failed:`, error.message);
                    
                    if (attempt === this.retryAttempts) {
                        // All attempts failed
                        return {
                            success: false,
                            error: error.message,
                            fallbackNeeded: true
                        };
                    }
                    
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                }
            }
        }
        
        // Handle successful submission
        handleSuccess(result, blogData) {
            console.log('Handling successful blog submission:', result);
            
            // Store locally for user tracking
            const userBlogs = JSON.parse(localStorage.getItem('user_blogs') || '[]');
            userBlogs.push({
                username: blogData.username,
                blogTitle: blogData.blogTitle,
                issueNumber: result.data.issueNumber,
                issueUrl: result.data.issueUrl,
                blogUrl: result.data.blogUrl,
                status: 'pending',
                submittedAt: new Date().toISOString()
            });
            localStorage.setItem('user_blogs', JSON.stringify(userBlogs));
            
            // Show success message
            this.showSuccessMessage({
                ...blogData,
                issueNumber: result.data.issueNumber,
                issueUrl: result.data.issueUrl,
                blogUrl: result.data.blogUrl
            });
        }
        
        // Handle backend failure with fallback
        handleFailureWithFallback(error, blogData) {
            console.log('Backend failed, attempting fallback:', error);
            
            // Store pending request
            localStorage.setItem('pending_blog_creation', JSON.stringify({
                ...blogData,
                error: error,
                createdAt: new Date().toISOString(),
                status: 'fallback_pending'
            }));
            
            // Show fallback message
            this.showFallbackMessage(blogData, error);
            
            // If user is authenticated, they can try OAuth flow
            if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
                this.suggestOAuthRetry(blogData);
            }
        }
        
        // Show success message
        showSuccessMessage(data) {
            const container = this.getOrCreateMessageContainer();
            
            container.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #28a745, #20c997);
                    color: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(40, 167, 69, 0.3);
                    margin: 2rem 0;
                ">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
                    <h2 style="margin: 0 0 1rem 0; font-size: 2rem;">Blog Request Submitted!</h2>
                    <p style="margin: 0 0 1rem 0; font-size: 1.1rem; opacity: 0.9;">
                        Your blog creation request has been submitted to our automated system.
                    </p>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 1rem;
                        margin: 1rem 0;
                    ">
                        <p style="margin: 0 0 0.5rem 0;"><strong>Username:</strong> ${data.username}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Blog Title:</strong> ${data.blogTitle}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Blog URL:</strong> <code>${data.blogUrl}</code></p>
                        ${data.issueNumber ? `<p style="margin: 0;"><strong>Issue #:</strong> <a href="${data.issueUrl}" target="_blank" style="color: #fff; text-decoration: underline;">${data.issueNumber}</a></p>` : ''}
                    </div>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 1rem;
                        margin: 1rem 0;
                    ">
                        <h4 style="margin: 0 0 0.5rem 0;">⚡ What Happens Next:</h4>
                        <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                            <p style="margin: 0.5rem 0;">✅ GitHub issue created automatically</p>
                            <p style="margin: 0.5rem 0;">🤖 Automation creates your blog structure</p>
                            <p style="margin: 0.5rem 0;">📝 Pull request opened for review</p>
                            <p style="margin: 0.5rem 0;">🚀 Blog deployed once approved</p>
                        </div>
                    </div>
                    
                    <p style="margin: 1rem 0; font-weight: bold;">⏱️ Estimated time: 2-4 hours</p>
                    
                    <div style="margin-top: 2rem;">
                        <button onclick="location.reload()" style="
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border: 2px solid white;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-right: 10px;
                            backdrop-filter: blur(10px);
                        ">Create Another Blog</button>
                        <a href="/dashboard/" style="
                            display: inline-block;
                            background: white;
                            color: #28a745;
                            text-decoration: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-weight: bold;
                        ">Go to Dashboard</a>
                    </div>
                </div>
            `;
            
            // Hide form
            const form = document.getElementById('createBlogForm');
            if (form) form.style.display = 'none';
        }
        
        // Show fallback message when backend fails
        showFallbackMessage(data, error) {
            const container = this.getOrCreateMessageContainer();
            
            container.innerHTML = `
                <div style="
                    background: linear-gradient(135deg, #ffc107, #fd7e14);
                    color: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(255, 193, 7, 0.3);
                    margin: 2rem 0;
                ">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h2 style="margin: 0 0 1rem 0;">Backend Temporarily Unavailable</h2>
                    <p style="margin: 0 0 1rem 0; opacity: 0.9;">
                        We're experiencing temporary issues with our automation system.
                        Your request has been saved locally.
                    </p>
                    
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 1rem;
                        margin: 1rem 0;
                    ">
                        <p style="margin: 0 0 0.5rem 0;"><strong>Username:</strong> ${data.username}</p>
                        <p style="margin: 0 0 0.5rem 0;"><strong>Blog Title:</strong> ${data.blogTitle}</p>
                        <p style="margin: 0;"><strong>Status:</strong> Saved locally, waiting for backend</p>
                    </div>
                    
                    <div style="margin-top: 2rem;">
                        <button onclick="githubBackend.retrySubmission()" style="
                            background: white;
                            color: #ffc107;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-weight: bold;
                            cursor: pointer;
                            margin-right: 10px;
                        ">🔄 Retry Submission</button>
                        <button onclick="location.reload()" style="
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            border: 2px solid white;
                            padding: 12px 24px;
                            border-radius: 6px;
                            font-weight: bold;
                            cursor: pointer;
                        ">Start Over</button>
                    </div>
                </div>
            `;
        }
        
        // Suggest OAuth retry for authenticated users
        suggestOAuthRetry(data) {
            setTimeout(() => {
                if (confirm('Would you like to try completing the blog creation through Google sign-in?')) {
                    localStorage.setItem('oauth_return_action', 'blog_creation');
                    if (typeof googleAuth !== 'undefined' && googleAuth.login) {
                        googleAuth.login();
                    }
                }
            }, 3000);
        }
        
        // Retry submission
        async retrySubmission() {
            const pendingData = localStorage.getItem('pending_blog_creation');
            if (!pendingData) {
                alert('No pending blog creation found');
                return;
            }
            
            try {
                const blogData = JSON.parse(pendingData);
                delete blogData.error;
                delete blogData.status;
                
                const result = await this.submitBlogRequest(blogData);
                
                if (result.success) {
                    localStorage.removeItem('pending_blog_creation');
                    this.handleSuccess(result, blogData);
                } else {
                    throw new Error(result.error || 'Retry failed');
                }
            } catch (error) {
                console.error('Retry failed:', error);
                alert('Retry failed: ' + error.message);
            }
        }
        
        // Get or create message container
        getOrCreateMessageContainer() {
            let container = document.getElementById('backendMessage');
            if (!container) {
                container = document.createElement('div');
                container.id = 'backendMessage';
                
                // Insert after form or at start of main content
                const form = document.getElementById('createBlogForm');
                const main = document.querySelector('main') || document.body;
                
                if (form) {
                    form.parentNode.insertBefore(container, form.nextSibling);
                } else {
                    main.insertBefore(container, main.firstChild);
                }
            }
            return container;
        }
        
        // Get user blogs from localStorage
        getUserBlogs() {
            return JSON.parse(localStorage.getItem('user_blogs') || '[]');
        }
        
        // Check status of pending blogs
        async checkPendingBlogs() {
            const userBlogs = this.getUserBlogs();
            const pendingBlogs = userBlogs.filter(blog => blog.status === 'pending');
            
            if (pendingBlogs.length > 0) {
                console.log(`Found ${pendingBlogs.length} pending blog(s)`);
                // TODO: Check GitHub issue status via API
            }
        }
    }
    
    // Initialize GitHub backend
    window.githubBackend = new GitHubBackend();
    
    // Check pending blogs on load
    window.githubBackend.checkPendingBlogs();
    
    console.log('✅ GitHub backend integration loaded');
    
})();
