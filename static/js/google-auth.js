// Google OAuth Authentication for GitHub Pages
// This system uses Google OAuth 2.0 with PKCE flow (no backend required)

class GoogleAuth {
    constructor() {
        this.clientId = '717968394179-ldu9da3rq27aridcm93gnjskujd5usv9.apps.googleusercontent.com'; // Google OAuth Client ID
        // Construct redirect URI properly for GitHub Pages
        this.redirectUri = this.constructRedirectUri();
        console.log('OAuth redirect URI configured:', this.redirectUri);
        this.scope = 'openid email profile';
        
        this.currentUser = null;
        this.authToken = null;
        
        this.init();
    }

    init() {
        // Check for existing session
        this.loadSession();
        
        // Handle OAuth callback (check both possible paths)
        const currentPath = window.location.pathname;
        if (currentPath === '/auth/callback/' || currentPath === '/parada-site/auth/callback/') {
            this.handleOAuthCallback();
        }
        
        // Setup UI
        this.setupAuthUI();
        
        // Handle URL parameters for login state
        this.handleAuthState();
    }

    // Session Management
    loadSession() {
        const token = localStorage.getItem('google_auth_token');
        const user = localStorage.getItem('google_user_data');
        const expiry = localStorage.getItem('google_auth_expiry');
        
        if (token && user && expiry) {
            const now = new Date().getTime();
            if (now < parseInt(expiry)) {
                this.authToken = token;
                this.currentUser = JSON.parse(user);
            } else {
                this.clearSession(); // Token expired
            }
        }
    }

    saveSession(tokenData, userData) {
        const expiryTime = new Date().getTime() + (tokenData.expires_in * 1000);
        
        localStorage.setItem('google_auth_token', tokenData.access_token);
        localStorage.setItem('google_user_data', JSON.stringify(userData));
        localStorage.setItem('google_auth_expiry', expiryTime.toString());
        
        this.authToken = tokenData.access_token;
        this.currentUser = userData;
    }

    clearSession() {
        localStorage.removeItem('google_auth_token');
        localStorage.removeItem('google_user_data');
        localStorage.removeItem('google_auth_expiry');
        localStorage.removeItem('google_oauth_state');
        localStorage.removeItem('google_code_verifier');
        
        this.authToken = null;
        this.currentUser = null;
    }

    // OAuth Flow with PKCE
    async login() {
        try {
            // Generate PKCE parameters
            const codeVerifier = this.generateCodeVerifier();
            const codeChallenge = await this.generateCodeChallenge(codeVerifier);
            const state = this.generateState();
            
            // Store for verification
            localStorage.setItem('google_code_verifier', codeVerifier);
            localStorage.setItem('google_oauth_state', state);
            
            // Build OAuth URL
            const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
            authUrl.searchParams.set('client_id', this.clientId);
            authUrl.searchParams.set('redirect_uri', this.redirectUri);
            authUrl.searchParams.set('response_type', 'code');
            authUrl.searchParams.set('scope', this.scope);
            authUrl.searchParams.set('state', state);
            authUrl.searchParams.set('code_challenge', codeChallenge);
            authUrl.searchParams.set('code_challenge_method', 'S256');
            
            // Redirect to Google OAuth
            window.location.href = authUrl.toString();
            
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Login failed: ' + error.message);
        }
    }

    logout() {
        this.clearSession();
        this.updateAuthUI();
        
        // Redirect to homepage if on protected page
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard') || currentPath.includes('/auth/')) {
            const basePath = currentPath.includes('/parada-site/') ? '/parada-site/' : '/';
            window.location.href = basePath;
        }
        
        this.showSuccess('Logged out successfully');
    }

    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        
        // Handle OAuth errors
        if (error) {
            this.showError('OAuth error: ' + error);
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            return;
        }
        
        // Validate state
        const storedState = localStorage.getItem('google_oauth_state');
        if (!state || state !== storedState) {
            this.showError('Invalid OAuth state - possible security issue');
            setTimeout(() => {
                window.location.href = '/';
            }, 3000);
            return;
        }
        
        if (code) {
            try {
                // Show loading
                document.body.innerHTML = `
                    <div style="text-align: center; padding: 100px;">
                        <h2>🔄 Completing Authentication...</h2>
                        <div style="margin: 20px 0;">
                            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4285f4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                        </div>
                        <p style="color: #666;">Please wait while we complete the authentication process.</p>
                    </div>
                    <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    </style>
                `;
                
                await this.exchangeCodeForToken(code);
                
                // Check if user came from blog creation
                const returnAction = localStorage.getItem('oauth_return_action');
                if (returnAction === 'blog_creation') {
                    localStorage.removeItem('oauth_return_action');
                    this.handleBlogCreationReturn();
                } else {
                    // Redirect to dashboard on successful login
                    const basePath = window.location.pathname.includes('/parada-site/') ? '/parada-site' : '';
                    window.location.href = basePath + '/dashboard/';
                }
                
            } catch (error) {
                console.error('OAuth callback error:', error);
                this.showError('Authentication failed: ' + error.message);
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            }
        }
        
        // Clean up OAuth state
        localStorage.removeItem('google_oauth_state');
        localStorage.removeItem('google_code_verifier');
    }

    async exchangeCodeForToken(code) {
        const codeVerifier = localStorage.getItem('google_code_verifier');
        if (!codeVerifier) {
            throw new Error('Missing code verifier');
        }
        
        // Exchange authorization code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: this.clientId,
                code: code,
                code_verifier: codeVerifier,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri
            })
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            throw new Error(errorData.error_description || 'Token exchange failed');
        }
        
        const tokenData = await tokenResponse.json();
        
        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`
            }
        });
        
        if (!userResponse.ok) {
            throw new Error('Failed to get user information');
        }
        
        const userData = await userResponse.json();
        
        // Save session
        this.saveSession(tokenData, userData);
        
        // Register user in our system
        await this.registerUser(userData);
    }

    async registerUser(userData) {
        // Store user info locally (in a real app, you'd sync this to your backend)
        const userRecord = {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            verified_email: userData.verified_email,
            role: 'blogger',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            blog_tenant: userData.email.split('@')[0].replace(/[^a-z0-9]/g, '')
        };
        
        localStorage.setItem('user_profile', JSON.stringify(userRecord));
        
        console.log('User registered:', userRecord);
    }

    // PKCE Helper Functions
    generateCodeVerifier() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }

    async generateCodeChallenge(codeVerifier) {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        return this.base64URLEncode(new Uint8Array(digest));
    }

    base64URLEncode(array) {
        return btoa(String.fromCharCode(...array))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    generateState() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return this.base64URLEncode(array);
    }

    // UI Management
    setupAuthUI() {
        this.createAuthElements();
        this.updateAuthUI();
    }

    createAuthElements() {
        // Create login/logout buttons if they don't exist
        if (!document.getElementById('google-auth-container')) {
            const authContainer = document.createElement('div');
            authContainer.id = 'google-auth-container';
            authContainer.className = 'google-auth-container';
            
            // Add to navigation or header
            const header = document.querySelector('header') || 
                          document.querySelector('nav') || 
                          document.querySelector('.header') ||
                          document.body;
            
            header.appendChild(authContainer);
        }
    }

    updateAuthUI() {
        const authContainer = document.getElementById('google-auth-container');
        if (!authContainer) return;
        
        if (this.currentUser) {
            // User is logged in
            authContainer.innerHTML = `
                <div class="google-user-menu">
                    <img src="${this.currentUser.picture}" alt="${this.currentUser.name}" class="google-user-avatar">
                    <span class="google-user-name">${this.currentUser.name}</span>
                    <a href="${window.location.pathname.includes('/parada-site/') ? '/parada-site' : ''}/dashboard/" class="google-dashboard-btn">📊 Dashboard</a>
                    <button onclick="googleAuth.logout()" class="google-logout-btn">Logout</button>
                </div>
            `;
            
            // Show dashboard elements
            this.showDashboardElements();
            
        } else {
            // User is not logged in
            authContainer.innerHTML = `
                <div class="google-login-container">
                    <button onclick="googleAuth.login()" class="google-login-btn">
                        <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 8px;">
                            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-2.7.75 4.8 4.8 0 0 1-4.52-3.36H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                            <path fill="#FBBC05" d="M4.46 10.41a4.8 4.8 0 0 1-.25-1.41c0-.49.09-.97.25-1.41V5.52H1.83a8 8 0 0 0-.86 3.48c0 1.24.32 2.47.86 3.48l2.63-2.07z"/>
                            <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.5.45 3.44 1.35l2.54-2.54A8 8 0 0 0 8.98 0 8 8 0 0 0 1.83 5.52L4.46 7.6A4.77 4.77 0 0 1 8.98 3.58z"/>
                        </svg>
                        Sign in with Google
                    </button>
                </div>
            `;
            
            // Hide dashboard elements
            this.hideDashboardElements();
        }
    }

    showDashboardElements() {
        const dashboardElements = document.querySelectorAll('.auth-required');
        dashboardElements.forEach(el => el.style.display = 'block');
        
        const loginRequired = document.querySelectorAll('.login-required');
        loginRequired.forEach(el => el.style.display = 'none');
    }

    hideDashboardElements() {
        const dashboardElements = document.querySelectorAll('.auth-required');
        dashboardElements.forEach(el => el.style.display = 'none');
        
        const loginRequired = document.querySelectorAll('.login-required');
        loginRequired.forEach(el => el.style.display = 'block');
    }

    handleAuthState() {
        // Handle login requirements for protected pages
        const currentPath = window.location.pathname;
        if ((currentPath.includes('/dashboard') || currentPath.endsWith('/dashboard/')) && !this.currentUser) {
            const main = document.querySelector('main') || document.querySelector('.main');
            if (main) {
                main.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>🔒 Login Required</h2>
                        <p>Please sign in with Google to access the dashboard.</p>
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
                    </div>
                `;
            }
        }
    }

    // Content management methods
    async createPost(title, content, tags = '', category = 'General') {
        if (!this.currentUser) {
            throw new Error('Authentication required');
        }
        
        // Generate filename
        const filename = title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-') + '.md';
        
        // Create frontmatter
        const date = new Date().toISOString();
        const tagList = tags ? tags.split(',').map(t => `"${t.trim()}"`).join(', ') : '';
        
        const frontmatter = `---
title: "${title}"
date: ${date}
draft: false
tags: [${tagList}]
categories: ["${category}"]
author: "${this.currentUser.name}"
author_email: "${this.currentUser.email}"
---

${content}`;

        // Store in localStorage (in production, you'd sync to GitHub or your backend)
        const posts = JSON.parse(localStorage.getItem('user_posts') || '[]');
        const newPost = {
            filename: filename,
            title: title,
            content: frontmatter,
            created: date,
            author: this.currentUser.name,
            author_email: this.currentUser.email
        };
        
        posts.push(newPost);
        localStorage.setItem('user_posts', JSON.stringify(posts));
        
        this.showSuccess(`Post "${title}" created successfully!`);
        
        return { success: true, filename: filename };
    }

    getUserPosts() {
        return JSON.parse(localStorage.getItem('user_posts') || '[]');
    }

    deleteUserPost(filename) {
        const posts = this.getUserPosts();
        const filteredPosts = posts.filter(post => post.filename !== filename);
        localStorage.setItem('user_posts', JSON.stringify(filteredPosts));
        this.showSuccess('Post deleted successfully!');
    }

    // Handle blog creation after OAuth
    handleBlogCreationReturn() {
        const pendingBlogData = localStorage.getItem('pending_blog_creation');
        if (pendingBlogData) {
            try {
                const blogData = JSON.parse(pendingBlogData);
                localStorage.removeItem('pending_blog_creation');
                
                // Complete blog creation with authenticated user
                this.completeBlogCreation(blogData);
            } catch (error) {
                console.error('Error processing blog creation:', error);
                window.location.href = '/dashboard/';
            }
        } else {
            // No pending blog data, go to dashboard
            window.location.href = '/dashboard/';
        }
    }
    
    async completeBlogCreation(blogData) {
        try {
            // Merge blog data with user info
            const completeBlogInfo = {
                ...blogData,
                userId: this.currentUser.id,
                userEmail: this.currentUser.email,
                userName: this.currentUser.name,
                userAvatar: this.currentUser.picture,
                status: 'created',
                createdAt: new Date().toISOString()
            };
            
            // Store blog info
            localStorage.setItem('user_blog_info', JSON.stringify(completeBlogInfo));
            
            // Create welcome post
            await this.createWelcomePost(blogData.blogTitle, blogData.username);
            
            // Show success and redirect to dashboard
            this.showSuccess(`🎉 Blog "${blogData.blogTitle}" created successfully!`);
            
            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 2000);
            
        } catch (error) {
            console.error('Error completing blog creation:', error);
            this.showError('Blog creation completed, but there was an issue setting up initial content.');
            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 3000);
        }
    }
    
    async createWelcomePost(blogTitle, username) {
        const welcomeContent = `# Welcome to ${blogTitle}!

Congratulations on creating your new blog! This is your first post.

## Getting Started

Your blog is now live and ready for content. Here are some things you can do:

- **Write new posts** using the dashboard
- **Customize your content** with Markdown formatting
- **Share your thoughts** with the world
- **Build your audience** with regular updates

## About Your Blog

- **Blog URL**: \`blog.mypp.site/${username}\`
- **Created**: ${new Date().toLocaleDateString()}
- **Author**: ${this.currentUser.name}

Start writing and sharing your amazing content!

---

*This post was automatically created when you set up your blog. Feel free to edit or delete it.*`;
        
        return await this.createPost(
            `Welcome to ${blogTitle}!`,
            welcomeContent,
            'welcome, getting-started, first-post',
            'General'
        );
    }

    // URL Construction
    constructRedirectUri() {
        const hostname = window.location.hostname;
        const origin = window.location.origin;
        
        // Detect environment and construct proper redirect URI
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            // Local development
            return origin + '/auth/callback/';
        } else if (hostname === 'blog.mypp.site' || hostname.includes('mypp.site')) {
            // Custom domain (primary)
            return origin + '/auth/callback/';
        } else if (hostname === 'antonio-parada.github.io') {
            // GitHub Pages fallback
            return origin + '/parada-site/auth/callback/';
        } else {
            // Fallback - assume subdirectory deployment
            const basePath = window.location.pathname.includes('/parada-site/') ? '/parada-site' : '';
            return origin + basePath + '/auth/callback/';
        }
    }

    // Utility methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#34a853' : type === 'error' ? '#ea4335' : '#4285f4'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1500;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            notification.remove();
        }, 4000);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize Google authentication
const googleAuth = new GoogleAuth();

// Add Google auth styles
const googleAuthStyles = document.createElement('style');
googleAuthStyles.textContent = `
    .google-auth-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .google-user-menu {
        display: flex;
        align-items: center;
        gap: 10px;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 1px solid #dadce0;
    }
    
    .google-login-container {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 1px solid #dadce0;
    }
    
    .google-user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
    
    .google-user-name {
        font-weight: 500;
        color: #202124;
    }
    
    .google-login-btn {
        background: #4285f4;
        color: white;
        border: 1px solid #4285f4;
        padding: 10px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: inline-flex;
        align-items: center;
        transition: background-color 0.2s;
    }
    
    .google-login-btn:hover {
        background: #3367d6;
        border-color: #3367d6;
    }
    
    .google-logout-btn {
        background: #ea4335;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    }
    
    .google-logout-btn:hover {
        background: #d33b2c;
    }
    
    .google-dashboard-btn {
        background: #34a853;
        color: white;
        text-decoration: none;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
    }
    
    .google-dashboard-btn:hover {
        background: #2d9142;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;

document.head.appendChild(googleAuthStyles);
