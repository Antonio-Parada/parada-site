// Demo Authentication System
// Simplified authentication for testing without OAuth setup

class DemoAuth {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check for existing session
        this.loadSession();
        
        // Setup UI
        this.setupAuthUI();
        
        // Handle auth state
        this.handleAuthState();
    }

    loadSession() {
        const user = localStorage.getItem('demo_user_data');
        if (user) {
            this.currentUser = JSON.parse(user);
        }
    }

    saveSession(userData) {
        localStorage.setItem('demo_user_data', JSON.stringify(userData));
        this.currentUser = userData;
    }

    clearSession() {
        localStorage.removeItem('demo_user_data');
        this.currentUser = null;
    }

    // Login method (redirects to demo login)
    login() {
        this.demoLogin();
    }

    // Simple demo login
    demoLogin() {
        const userName = prompt('Enter your name for demo:') || 'Demo User';
        const userLogin = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const userData = {
            id: Date.now(),
            login: userLogin,
            name: userName,
            email: `${userLogin}@demo.com`,
            avatar_url: `https://avatars.dicebear.com/api/initials/${encodeURIComponent(userName)}.svg`,
            bio: 'Demo user for blog platform testing'
        };
        
        this.saveSession(userData);
        this.updateAuthUI();
        
        // Show success message
        this.showSuccess(`Welcome, ${userName}! You can now access the dashboard.`);
        
        // If on dashboard page, reload
        if (window.location.pathname.startsWith('/dashboard/')) {
            window.location.reload();
        }
    }

    logout() {
        this.clearSession();
        this.updateAuthUI();
        
        // Redirect if on protected page
        if (window.location.pathname.startsWith('/dashboard/')) {
            window.location.href = '/';
        }
        
        this.showSuccess('Logged out successfully');
    }

    setupAuthUI() {
        this.createAuthElements();
        this.updateAuthUI();
    }

    createAuthElements() {
        if (!document.getElementById('demo-auth-container')) {
            const authContainer = document.createElement('div');
            authContainer.id = 'demo-auth-container';
            authContainer.className = 'demo-auth-container';
            
            const header = document.querySelector('header') || 
                          document.querySelector('nav') || 
                          document.querySelector('.header') ||
                          document.body;
            
            header.appendChild(authContainer);
        }
    }

    updateAuthUI() {
        const authContainer = document.getElementById('demo-auth-container');
        if (!authContainer) return;
        
        if (this.currentUser) {
            // User is logged in
            authContainer.innerHTML = `
                <div class="demo-user-menu">
                    <img src="${this.currentUser.avatar_url}" alt="${this.currentUser.name}" class="demo-user-avatar">
                    <span class="demo-user-name">${this.currentUser.name}</span>
                    <a href="/dashboard/" class="demo-dashboard-btn">📊 Dashboard</a>
                    <button onclick="demoAuth.logout()" class="demo-logout-btn">Logout</button>
                </div>
            `;
            
            // Show dashboard elements
            this.showDashboardElements();
        } else {
            // User is not logged in
            authContainer.innerHTML = `
                <div class="demo-login-container">
                    <button onclick="demoAuth.demoLogin()" class="demo-login-btn">
                        🚀 Demo Login
                    </button>
                    <small style="display: block; margin-top: 5px; color: #666;">
                        Quick login for testing
                    </small>
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
        // Handle login requirements
        if (window.location.pathname.startsWith('/dashboard/') && !this.currentUser) {
            const main = document.querySelector('main') || document.querySelector('.main');
            if (main) {
                main.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>🔒 Demo Login Required</h2>
                        <p>Please use the demo login to access the dashboard.</p>
                        <button onclick="demoAuth.demoLogin()" class="demo-login-btn" style="
                            background: #0366d6;
                            color: white;
                            border: none;
                            padding: 15px 30px;
                            border-radius: 5px;
                            font-size: 16px;
                            cursor: pointer;
                            margin-top: 20px;
                        ">🚀 Demo Login</button>
                        <br><small style="color: #666; margin-top: 10px; display: block;">
                            This is a demo system - just enter any name to test the platform
                        </small>
                    </div>
                `;
            }
        }
    }

    // API Methods for demo content management
    async createPost(title, content, tags = '', category = 'General') {
        if (!this.currentUser) {
            throw new Error('Demo login required');
        }
        
        // For demo, we'll simulate post creation
        const filename = title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-') + '.md';
        
        const date = new Date().toISOString();
        const tagList = tags ? tags.split(',').map(t => `"${t.trim()}"`).join(', ') : '';
        
        const frontmatter = `---
title: "${title}"
date: ${date}
draft: false
tags: [${tagList}]
categories: ["${category}"]
author: "${this.currentUser.name}"
---

${content}`;

        // Store demo post in localStorage
        const demoPosts = JSON.parse(localStorage.getItem('demo_posts') || '[]');
        const newPost = {
            filename: filename,
            title: title,
            content: frontmatter,
            created: date,
            author: this.currentUser.name
        };
        
        demoPosts.push(newPost);
        localStorage.setItem('demo_posts', JSON.stringify(demoPosts));
        
        this.showSuccess(`Demo post "${title}" created successfully!`);
        
        return { success: true, filename: filename };
    }

    getDemoPosts() {
        return JSON.parse(localStorage.getItem('demo_posts') || '[]');
    }

    deleteDemoPost(filename) {
        const posts = this.getDemoPosts();
        const filteredPosts = posts.filter(post => post.filename !== filename);
        localStorage.setItem('demo_posts', JSON.stringify(filteredPosts));
        this.showSuccess('Demo post deleted successfully!');
    }

    showSuccess(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
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
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
        
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
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
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
        
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize demo auth
const demoAuth = new DemoAuth();

// Override any existing blogAuth to prevent GitHub OAuth
window.blogAuth = {
    login: () => demoAuth.demoLogin(),
    logout: () => demoAuth.logout(),
    currentUser: demoAuth.currentUser,
    createPost: (title, content, tags, category) => demoAuth.createPost(title, content, tags, category)
};

// Add demo auth styles
const demoAuthStyles = document.createElement('style');
demoAuthStyles.textContent = `
    .demo-auth-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .demo-user-menu {
        display: flex;
        align-items: center;
        gap: 10px;
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 2px solid #0366d6;
    }
    
    .demo-login-container {
        background: white;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        border: 2px solid #28a745;
        text-align: center;
    }
    
    .demo-user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }
    
    .demo-user-name {
        font-weight: bold;
        color: #0366d6;
    }
    
    .demo-login-btn, .demo-logout-btn, .demo-dashboard-btn {
        background: #0366d6;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        text-decoration: none;
        display: inline-block;
    }
    
    .demo-login-btn {
        background: #28a745;
        font-size: 14px;
        padding: 10px 16px;
    }
    
    .demo-logout-btn {
        background: #dc3545;
    }
    
    .demo-dashboard-btn {
        background: #6f42c1;
    }
    
    .demo-login-btn:hover, .demo-logout-btn:hover, .demo-dashboard-btn:hover {
        opacity: 0.9;
    }
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
`;

document.head.appendChild(demoAuthStyles);

// Universal override to prevent any GitHub OAuth calls
setInterval(() => {
    // Update blogAuth reference
    if (window.blogAuth) {
        window.blogAuth.currentUser = demoAuth.currentUser;
        window.blogAuth.login = () => demoAuth.demoLogin();
        window.blogAuth.logout = () => demoAuth.logout();
        window.blogAuth.createPost = (title, content, tags, category) => demoAuth.createPost(title, content, tags, category);
    }
    
    // Replace any GitHub login buttons
    const githubButtons = document.querySelectorAll('button, a');
    githubButtons.forEach(button => {
        const text = button.textContent || button.innerText;
        if (text && (text.includes('Sign in with GitHub') || text.includes('GitHub') || text.includes('🔑'))) {
            // Replace the onclick handler
            button.onclick = (e) => {
                e.preventDefault();
                demoAuth.demoLogin();
                return false;
            };
            
            // Update button text to indicate demo
            if (!text.includes('Demo')) {
                button.innerHTML = '🚀 Demo Login';
                button.title = 'Demo authentication - no GitHub setup required';
            }
        }
    });
}, 1000);

// Override window navigation to prevent GitHub OAuth
const originalAssign = window.location.assign;
const originalReplace = window.location.replace;
const originalHref = window.location.href;

Object.defineProperty(window.location, 'href', {
    set: function(url) {
        if (url && url.includes('github.com/login/oauth/authorize')) {
            console.log('Blocked GitHub OAuth redirect, using demo login instead');
            demoAuth.showSuccess('Using demo authentication instead of GitHub OAuth');
            demoAuth.demoLogin();
            return;
        }
        originalHref = url;
        window.location.assign(url);
    },
    get: function() {
        return originalHref;
    }
});

window.location.assign = function(url) {
    if (url && url.includes('github.com/login/oauth/authorize')) {
        console.log('Blocked GitHub OAuth redirect, using demo login instead');
        demoAuth.showSuccess('Using demo authentication instead of GitHub OAuth');
        demoAuth.demoLogin();
        return;
    }
    originalAssign.call(this, url);
};

window.location.replace = function(url) {
    if (url && url.includes('github.com/login/oauth/authorize')) {
        console.log('Blocked GitHub OAuth redirect, using demo login instead');
        demoAuth.showSuccess('Using demo authentication instead of GitHub OAuth');
        demoAuth.demoLogin();
        return;
    }
    originalReplace.call(this, url);
};
