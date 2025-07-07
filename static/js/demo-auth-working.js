// Working Demo Authentication System
// No OAuth required - fully functional for local development

class WorkingDemoAuth {
    constructor() {
        this.currentUser = null;
        this.isInitialized = false;
        
        console.log('🚀 Loading working demo auth system...');
        this.init();
    }
    
    init() {
        // Load existing session
        this.loadSession();
        
        // Set up UI
        this.setupAuthUI();
        
        // Mark as initialized
        this.isInitialized = true;
        
        console.log('✅ Working demo auth ready');
        console.log('💡 Commands: demoAuth.login(), demoAuth.logout(), demoAuth.status()');
    }
    
    // Session Management
    loadSession() {
        const userData = localStorage.getItem('demo_user_data');
        const sessionToken = localStorage.getItem('demo_session_token');
        const expiry = localStorage.getItem('demo_session_expiry');
        
        if (userData && sessionToken && expiry) {
            const now = Date.now();
            if (now < parseInt(expiry)) {
                this.currentUser = JSON.parse(userData);
                console.log('✅ Demo session restored for:', this.currentUser.name);
                return;
            }
        }
        
        // Clear expired session
        this.clearSession();
    }
    
    saveSession(userData) {
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        const sessionToken = 'demo_' + Math.random().toString(36).substr(2, 15);
        
        localStorage.setItem('demo_user_data', JSON.stringify(userData));
        localStorage.setItem('demo_session_token', sessionToken);
        localStorage.setItem('demo_session_expiry', expiryTime.toString());
        
        this.currentUser = userData;
    }
    
    clearSession() {
        localStorage.removeItem('demo_user_data');
        localStorage.removeItem('demo_session_token');
        localStorage.removeItem('demo_session_expiry');
        
        this.currentUser = null;
    }
    
    // Authentication Methods
    login(customUser = null) {
        const predefinedUsers = [
            {
                id: 'demo1',
                name: 'Demo User',
                email: 'demo@example.com',
                picture: 'https://ui-avatars.com/api/?name=Demo+User&background=4285f4&color=fff'
            },
            {
                id: 'demo2', 
                name: 'Jane Developer',
                email: 'jane@example.com',
                picture: 'https://ui-avatars.com/api/?name=Jane+Developer&background=34a853&color=fff'
            },
            {
                id: 'demo3',
                name: 'Tech Blogger',
                email: 'tech@example.com', 
                picture: 'https://ui-avatars.com/api/?name=Tech+Blogger&background=ea4335&color=fff'
            }
        ];
        
        let selectedUser = customUser;
        
        if (!selectedUser) {
            // Show user selection dialog
            const userChoice = this.showUserSelectionDialog(predefinedUsers);
            if (!userChoice) return; // User cancelled
            selectedUser = userChoice;
        }
        
        // Save session
        this.saveSession(selectedUser);
        
        // Update UI
        this.setupAuthUI();
        
        // Show success message
        this.showNotification(`Welcome, ${selectedUser.name}!`, 'success');
        
        // Handle redirects
        this.handlePostLoginRedirect();
        
        console.log('✅ Demo login successful:', selectedUser.name);
    }
    
    logout() {
        const userName = this.currentUser?.name || 'User';
        
        this.clearSession();
        this.setupAuthUI();
        
        this.showNotification(`Goodbye, ${userName}!`, 'info');
        
        // Redirect if on protected page
        const currentPath = window.location.pathname;
        if (currentPath.includes('/dashboard') || currentPath.includes('/create-blog')) {
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        }
        
        console.log('✅ Demo logout successful');
    }
    
    showUserSelectionDialog(users) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                ">
                    <h3 style="margin-top: 0; color: #333;">Choose Demo User</h3>
                    <p style="color: #666; margin-bottom: 1.5rem;">Select a demo user to continue with the working authentication system:</p>
                    
                    ${users.map((user, index) => `
                        <button onclick="selectUser(${index})" style="
                            display: flex;
                            align-items: center;
                            width: 100%;
                            padding: 12px 16px;
                            margin: 8px 0;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            background: #f8f9fa;
                            cursor: pointer;
                            transition: all 0.2s;
                            text-align: left;
                        " onmouseover="this.style.borderColor='#4285f4'; this.style.background='#f0f4ff';" 
                           onmouseout="this.style.borderColor='#e0e0e0'; this.style.background='#f8f9fa';">
                            <img src="${user.picture}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;">
                            <div>
                                <div style="font-weight: bold; color: #333;">${user.name}</div>
                                <div style="font-size: 0.9rem; color: #666;">${user.email}</div>
                            </div>
                        </button>
                    `).join('')}
                    
                    <button onclick="cancelSelection()" style="
                        background: #6c757d;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">Cancel</button>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(modal);
            
            // Handle selection
            window.selectUser = (index) => {
                document.body.removeChild(modal);
                delete window.selectUser;
                delete window.cancelSelection;
                resolve(users[index]);
            };
            
            window.cancelSelection = () => {
                document.body.removeChild(modal);
                delete window.selectUser;
                delete window.cancelSelection;
                resolve(null);
            };
        });
    }
    
    handlePostLoginRedirect() {
        // Check for pending blog creation
        const pendingBlog = localStorage.getItem('pending_blog_creation');
        const returnAction = localStorage.getItem('oauth_return_action');
        
        if (pendingBlog && returnAction === 'blog_creation') {
            localStorage.removeItem('oauth_return_action');
            this.completeBlogCreation(JSON.parse(pendingBlog));
            return;
        }
        
        // Default redirect to dashboard if on auth pages
        const currentPath = window.location.pathname;
        if (currentPath.includes('/create-blog') && !pendingBlog) {
            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 2000);
        }
    }
    
    async completeBlogCreation(blogData) {
        try {
            localStorage.removeItem('pending_blog_creation');
            
            // Merge with user data
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
            
            // Show success
            this.showNotification(`🎉 Blog "${blogData.blogTitle}" created successfully!`, 'success');
            
            setTimeout(() => {
                window.location.href = '/dashboard/';
            }, 2000);
            
        } catch (error) {
            console.error('Error completing blog creation:', error);
            this.showNotification('Blog created, but there was an issue setting up content.', 'error');
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
    
    // Post Management
    async createPost(title, content, tags, category) {
        const post = {
            id: 'post_' + Date.now(),
            filename: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md',
            title,
            content,
            tags: tags || '',
            category: category || 'General',
            author: this.currentUser.name,
            authorEmail: this.currentUser.email,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            published: true
        };
        
        // Get existing posts
        const existingPosts = this.getUserPosts();
        existingPosts.push(post);
        
        // Save posts
        localStorage.setItem('user_posts', JSON.stringify(existingPosts));
        
        console.log('✅ Post created:', title);
        return post;
    }
    
    getUserPosts() {
        try {
            const posts = localStorage.getItem('user_posts');
            return posts ? JSON.parse(posts) : [];
        } catch (error) {
            console.error('Error loading user posts:', error);
            return [];
        }
    }
    
    deleteUserPost(filename) {
        const posts = this.getUserPosts();
        const filteredPosts = posts.filter(post => post.filename !== filename);
        localStorage.setItem('user_posts', JSON.stringify(filteredPosts));
        console.log('✅ Post deleted:', filename);
    }
    
    // UI Management
    setupAuthUI() {
        // Remove existing UI
        const existing = document.getElementById('demo-auth-ui');
        if (existing) existing.remove();
        
        // Create new UI
        const authContainer = document.createElement('div');
        authContainer.id = 'demo-auth-ui';
        authContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
            padding: 12px;
        `;
        
        if (this.currentUser) {
            // Logged in UI
            authContainer.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${this.currentUser.picture}" style="width: 32px; height: 32px; border-radius: 50%;">
                    <div>
                        <div style="font-weight: 500; font-size: 14px; color: #333;">${this.currentUser.name}</div>
                        <div style="font-size: 12px; color: #666;">Demo User</div>
                    </div>
                    <button onclick="demoAuth.logout()" style="
                        background: #f44336;
                        color: white;
                        border: none;
                        padding: 6px 12px;
                        border-radius: 4px;
                        font-size: 12px;
                        cursor: pointer;
                    ">Logout</button>
                </div>
            `;
        } else {
            // Login UI
            authContainer.innerHTML = `
                <button onclick="demoAuth.login()" style="
                    background: #4285f4;
                    color: white;
                    border: none;
                    padding: 10px 16px;
                    border-radius: 6px;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span>🚀</span>
                    Demo Login
                </button>
            `;
        }
        
        document.body.appendChild(authContainer);
    }
    
    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            z-index: 1001;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
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
    
    // Status and Debug Methods
    status() {
        const info = {
            authenticated: !!this.currentUser,
            user: this.currentUser,
            posts: this.getUserPosts().length,
            blogInfo: JSON.parse(localStorage.getItem('user_blog_info') || 'null')
        };
        
        console.table(info);
        return info;
    }
    
    // Quick actions for testing
    quickBlog() {
        const blogData = {
            username: 'demo-blog-' + Date.now().toString().slice(-4),
            blogTitle: 'My Demo Blog',
            email: this.currentUser?.email || 'demo@example.com',
            description: 'A demo blog created for testing',
            theme: 'papermod'
        };
        
        localStorage.setItem('pending_blog_creation', JSON.stringify(blogData));
        localStorage.setItem('oauth_return_action', 'blog_creation');
        
        if (this.currentUser) {
            this.completeBlogCreation(blogData);
        } else {
            this.showNotification('Please login first to create a blog', 'error');
        }
    }
}

// Initialize demo auth
const demoAuth = new WorkingDemoAuth();

// Make it globally available (compatible with existing code)
window.googleAuth = demoAuth;
window.demoAuth = demoAuth;

// Add some helpful global functions
window.quickLogin = () => demoAuth.login();
window.quickBlog = () => demoAuth.quickBlog();

console.log('🎉 Working demo auth loaded!');
console.log('💡 Quick commands:');
console.log('   quickLogin()    // Quick demo login');
console.log('   quickBlog()     // Create demo blog');
console.log('   demoAuth.status() // Show current status');
