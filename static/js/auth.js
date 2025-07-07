// Blog Platform Authentication System
// Handles GitHub OAuth login, user sessions, and UI management

class BlogAuth {
    constructor() {
        this.apiBase = 'https://api.github.com';
        this.clientId = 'Ov23liSlKLRQE5xqP0e7'; // GitHub OAuth App Client ID
        this.redirectUri = 'https://blog.mypp.site/auth/callback';
        this.scope = 'read:user user:email repo';
        
        this.currentUser = null;
        this.authToken = null;
        
        this.init();
    }

    init() {
        // Check for existing session
        this.loadSession();
        
        // Handle OAuth callback
        if (window.location.pathname === '/auth/callback') {
            this.handleOAuthCallback();
        }
        
        // Setup UI
        this.setupAuthUI();
        
        // Handle URL parameters for login state
        this.handleAuthState();
    }

    // Session Management
    loadSession() {
        const token = localStorage.getItem('blog_auth_token');
        const user = localStorage.getItem('blog_user_data');
        
        if (token && user) {
            this.authToken = token;
            this.currentUser = JSON.parse(user);
            this.validateSession();
        }
    }

    saveSession(token, userData) {
        localStorage.setItem('blog_auth_token', token);
        localStorage.setItem('blog_user_data', JSON.stringify(userData));
        this.authToken = token;
        this.currentUser = userData;
    }

    clearSession() {
        localStorage.removeItem('blog_auth_token');
        localStorage.removeItem('blog_user_data');
        this.authToken = null;
        this.currentUser = null;
    }

    async validateSession() {
        if (!this.authToken) return false;
        
        try {
            const response = await fetch(`${this.apiBase}/user`, {
                headers: {
                    'Authorization': `token ${this.authToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.currentUser = userData;
                localStorage.setItem('blog_user_data', JSON.stringify(userData));
                return true;
            } else {
                this.clearSession();
                return false;
            }
        } catch (error) {
            console.error('Session validation failed:', error);
            this.clearSession();
            return false;
        }
    }

    // OAuth Flow
    login() {
        const state = this.generateState();
        localStorage.setItem('oauth_state', state);
        
        const authUrl = `https://github.com/login/oauth/authorize?` +
            `client_id=${this.clientId}&` +
            `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
            `scope=${encodeURIComponent(this.scope)}&` +
            `state=${state}`;
        
        window.location.href = authUrl;
    }

    logout() {
        this.clearSession();
        this.updateAuthUI();
        
        // Redirect to homepage
        if (window.location.pathname.startsWith('/dashboard') || 
            window.location.pathname.startsWith('/auth/')) {
            window.location.href = '/';
        }
    }

    async handleOAuthCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = localStorage.getItem('oauth_state');
        
        // Validate state to prevent CSRF attacks
        if (!state || state !== storedState) {
            console.error('Invalid OAuth state');
            this.showError('Authentication failed: Invalid state');
            return;
        }
        
        if (code) {
            try {
                await this.exchangeCodeForToken(code);
                
                // Redirect to dashboard on successful login
                window.location.href = '/dashboard/';
            } catch (error) {
                console.error('OAuth callback error:', error);
                this.showError('Authentication failed: ' + error.message);
            }
        }
        
        // Clean up state
        localStorage.removeItem('oauth_state');
    }

    async exchangeCodeForToken(code) {
        // For demo purposes, create a mock user session
        // In production, this would exchange the code for a real token
        
        try {
            // Simulate a successful OAuth exchange
            const mockUserData = {
                id: 12345,
                login: 'demo-user',
                name: 'Demo User',
                email: 'demo@example.com',
                avatar_url: 'https://avatars.githubusercontent.com/u/12345?v=4',
                bio: 'Demo user for blog platform testing'
            };
            
            // Create a mock access token (in production, this would be real)
            const mockToken = 'demo_token_' + Date.now();
            
            // Save session
            this.saveSession(mockToken, mockUserData);
            await this.registerUser(mockUserData);
            
        } catch (error) {
            throw new Error('Authentication failed: ' + error.message);
        }
    }

    async pollForAuthResult(code) {
        // Poll the repository for auth result file
        const maxAttempts = 30;
        const pollInterval = 2000; // 2 seconds
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const response = await fetch(
                    `https://api.github.com/repos/Antonio-Parada/parada-site/contents/data/auth/${code}.json`,
                    {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
                
                if (response.ok) {
                    const fileData = await response.json();
                    const authResult = JSON.parse(atob(fileData.content));
                    
                    if (authResult.access_token) {
                        // Get user data with the token
                        const userResponse = await fetch(`${this.apiBase}/user`, {
                            headers: {
                                'Authorization': `token ${authResult.access_token}`,
                                'Accept': 'application/vnd.github.v3+json'
                            }
                        });
                        
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            this.saveSession(authResult.access_token, userData);
                            await this.registerUser(userData);
                            return;
                        }
                    }
                    
                    if (authResult.error) {
                        throw new Error(authResult.error);
                    }
                }
                
                // Wait before next poll
                await new Promise(resolve => setTimeout(resolve, pollInterval));
                
            } catch (error) {
                if (attempt === maxAttempts - 1) {
                    throw new Error('Authentication timeout');
                }
            }
        }
        
        throw new Error('Authentication timeout');
    }

    async registerUser(userData) {
        // Register user in our GitHub-based database
        const userRecord = {
            id: userData.id,
            login: userData.login,
            name: userData.name || userData.login,
            email: userData.email,
            avatar_url: userData.avatar_url,
            role: 'blogger', // Default role
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            blog_tenant: userData.login.toLowerCase() // Default tenant name
        };
        
        try {
            // Create user file in data/users/{username}.json
            const content = btoa(JSON.stringify(userRecord, null, 2));
            
            await fetch(
                `https://api.github.com/repos/Antonio-Parada/parada-site/contents/data/users/${userData.login}.json`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${this.authToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Register new user: ${userData.login}`,
                        content: content
                    })
                }
            );
            
        } catch (error) {
            console.warn('User registration failed:', error);
            // Continue anyway - user can still use the platform
        }
    }

    // UI Management
    setupAuthUI() {
        this.createAuthElements();
        this.updateAuthUI();
    }

    createAuthElements() {
        // Create login/logout buttons if they don't exist
        if (!document.getElementById('auth-container')) {
            const authContainer = document.createElement('div');
            authContainer.id = 'auth-container';
            authContainer.className = 'auth-container';
            
            // Add to navigation or header
            const header = document.querySelector('header') || 
                          document.querySelector('nav') || 
                          document.querySelector('.header') ||
                          document.body;
            
            header.appendChild(authContainer);
        }
        
        // Create dashboard link
        if (!document.getElementById('dashboard-link')) {
            const dashboardLink = document.createElement('div');
            dashboardLink.id = 'dashboard-link';
            dashboardLink.style.display = 'none';
            
            const nav = document.querySelector('nav ul') || 
                       document.querySelector('.menu') ||
                       document.querySelector('header');
            
            if (nav) {
                nav.appendChild(dashboardLink);
            }
        }
    }

    updateAuthUI() {
        const authContainer = document.getElementById('auth-container');
        const dashboardLink = document.getElementById('dashboard-link');
        
        if (!authContainer) return;
        
        if (this.currentUser) {
            // User is logged in
            authContainer.innerHTML = `
                <div class="user-menu">
                    <img src="${this.currentUser.avatar_url}" alt="${this.currentUser.name}" class="user-avatar">
                    <span class="user-name">${this.currentUser.name || this.currentUser.login}</span>
                    <button onclick="blogAuth.logout()" class="logout-btn">Logout</button>
                </div>
            `;
            
            if (dashboardLink) {
                dashboardLink.innerHTML = `
                    <a href="/dashboard/" class="dashboard-link">
                        📊 Dashboard
                    </a>
                `;
                dashboardLink.style.display = 'block';
            }
            
            // Show dashboard elements if on dashboard page
            this.showDashboardElements();
            
        } else {
            // User is not logged in
            authContainer.innerHTML = `
                <button onclick="blogAuth.login()" class="login-btn">
                    🔑 Sign in with GitHub
                </button>
            `;
            
            if (dashboardLink) {
                dashboardLink.style.display = 'none';
            }
            
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

    // Utility Functions
    generateState() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    async getAppToken() {
        // This would need to be a GitHub App token for production
        // For now, return a placeholder that would be set by environment
        return 'github_app_token_here';
    }

    showError(message) {
        // Create error notification
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
        `;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    handleAuthState() {
        // Handle login requirements
        if (window.location.pathname.startsWith('/dashboard/') && !this.currentUser) {
            // Redirect to login
            const loginMessage = document.createElement('div');
            loginMessage.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2>🔒 Login Required</h2>
                    <p>Please sign in to access the dashboard.</p>
                    <button onclick="blogAuth.login()" class="login-btn" style="
                        background: #0366d6;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        cursor: pointer;
                        margin-top: 20px;
                    ">🔑 Sign in with GitHub</button>
                </div>
            `;
            
            const main = document.querySelector('main') || document.body;
            main.innerHTML = '';
            main.appendChild(loginMessage);
        }
    }

    // API Methods for content management
    async createPost(title, content, tags = '', category = 'General') {
        if (!this.authToken) {
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
author: "${this.currentUser.name || this.currentUser.login}"
---

${content}`;

        const path = `sites/${this.currentUser.login}/content/posts/${filename}`;
        const encodedContent = btoa(frontmatter);
        
        const response = await fetch(
            `https://api.github.com/repos/Antonio-Parada/parada-site/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.authToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Add new blog post: ${title}`,
                    content: encodedContent
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create post');
        }
        
        return await response.json();
    }
}

// Initialize authentication system
const blogAuth = new BlogAuth();

// Add CSS styles
const authStyles = document.createElement('style');
authStyles.textContent = `
    .auth-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .user-menu {
        display: flex;
        align-items: center;
        gap: 10px;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
    
    .user-name {
        font-weight: bold;
    }
    
    .login-btn, .logout-btn {
        background: #0366d6;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .logout-btn {
        background: #dc3545;
    }
    
    .login-btn:hover, .logout-btn:hover {
        opacity: 0.9;
    }
    
    .dashboard-link a {
        color: #0366d6;
        text-decoration: none;
        font-weight: bold;
        padding: 8px 16px;
        display: inline-block;
    }
    
    .auth-error {
        animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;

document.head.appendChild(authStyles);
