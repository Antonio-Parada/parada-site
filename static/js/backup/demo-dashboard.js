// Demo Dashboard functionality
// Works with demo authentication system

class DemoDashboard {
    constructor() {
        this.currentUser = null;
        this.posts = [];
        
        this.init();
    }

    init() {
        // Wait for demo auth to initialize
        setTimeout(() => {
            if (typeof demoAuth !== 'undefined') {
                this.currentUser = demoAuth.currentUser;
                if (this.currentUser) {
                    this.loadDashboardData();
                }
            }
        }, 100);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.hideAllModals();
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }

    loadDashboardData() {
        if (!this.currentUser) return;
        
        // Load demo posts
        this.posts = demoAuth.getDemoPosts();
        this.updateDashboardUI();
        this.updateRecentActivity();
    }

    updateDashboardUI() {
        // Update stats
        const totalPosts = this.posts.length;
        const publishedPosts = this.posts.filter(post => !post.content.includes('draft: true')).length;
        const draftPosts = totalPosts - publishedPosts;
        
        const statCards = document.querySelectorAll('.stat-card h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = totalPosts;
            statCards[1].textContent = publishedPosts;
            statCards[2].textContent = draftPosts;
            statCards[3].textContent = 'Demo';
        }
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        if (this.posts.length > 0) {
            const recentPosts = this.posts.slice(-3).reverse();
            activityContainer.innerHTML = recentPosts.map(post => `
                <div class="activity-item" style="border-left: 3px solid #0366d6; padding: 10px; margin: 10px 0; background: #f8f9fa;">
                    <strong>Created post: ${post.title}</strong><br>
                    <small style="color: #6c757d;">
                        ${new Date(post.created).toLocaleDateString()} by ${post.author}
                    </small>
                </div>
            `).join('');
        } else {
            activityContainer.innerHTML = '<p style="color: #6c757d;">No recent activity. Create your first post!</p>';
        }
    }

    // Modal Management
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Post Creation
    showCreatePostForm() {
        document.getElementById('create-post-modal').style.display = 'block';
    }

    hideCreatePostForm() {
        document.getElementById('create-post-modal').style.display = 'none';
        document.getElementById('create-post-form').reset();
    }

    async handleCreatePost(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const title = formData.get('title');
        const content = formData.get('content');
        const tags = formData.get('tags');
        const category = formData.get('category');
        
        try {
            this.showLoading('Creating demo post...');
            
            await demoAuth.createPost(title, content, tags, category);
            
            this.hideCreatePostForm();
            
            // Reload dashboard data
            this.loadDashboardData();
            
        } catch (error) {
            console.error('Failed to create demo post:', error);
            demoAuth.showError('Failed to create demo post: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // Posts Management
    showPostsManager() {
        document.getElementById('posts-manager-modal').style.display = 'block';
        this.loadPostsManager();
    }

    hidePostsManager() {
        document.getElementById('posts-manager-modal').style.display = 'none';
    }

    loadPostsManager() {
        const postsList = document.getElementById('posts-list');
        
        if (this.posts.length === 0) {
            postsList.innerHTML = '<p style="color: #6c757d;">No demo posts found. Create your first post!</p>';
            return;
        }
        
        postsList.innerHTML = this.posts.map(post => {
            const isDraft = post.content.includes('draft: true');
            
            return `
                <div class="post-item">
                    <h4>${post.title} ${isDraft ? '<span style="color: #ffc107;">[DRAFT]</span>' : ''} <span style="color: #28a745; font-size: 12px;">[DEMO]</span></h4>
                    <div class="post-meta">
                        Created: ${new Date(post.created).toLocaleDateString()} | Author: ${post.author}
                    </div>
                    <div class="post-actions">
                        <button onclick="demoDashboard.viewDemoPost('${post.filename}')" class="btn-primary">View</button>
                        <button onclick="demoDashboard.deleteDemoPost('${post.filename}')" class="btn-secondary">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    viewDemoPost(filename) {
        const post = this.posts.find(p => p.filename === filename);
        if (!post) return;
        
        // Create a modal to show the post content
        const viewModal = document.createElement('div');
        viewModal.className = 'modal';
        viewModal.style.display = 'block';
        viewModal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>📄 Demo Post Preview</h2>
                <pre style="background: #f8f9fa; padding: 20px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap;">${post.content}</pre>
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(viewModal);
    }

    deleteDemoPost(filename) {
        if (!confirm(`Are you sure you want to delete this demo post?`)) {
            return;
        }
        
        try {
            this.showLoading('Deleting demo post...');
            
            demoAuth.deleteDemoPost(filename);
            
            // Reload dashboard data
            this.loadDashboardData();
            this.loadPostsManager();
            
        } catch (error) {
            console.error('Failed to delete demo post:', error);
            demoAuth.showError('Failed to delete demo post: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // Analytics placeholder
    showAnalytics() {
        const analyticsModal = document.createElement('div');
        analyticsModal.className = 'modal';
        analyticsModal.style.display = 'block';
        analyticsModal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>📊 Demo Analytics</h2>
                <div style="padding: 20px;">
                    <h3>Demo Statistics</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <h3 style="margin: 0; color: #0366d6;">${this.posts.length}</h3>
                            <p style="margin: 5px 0; color: #586069;">Total Demo Posts</p>
                        </div>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <h3 style="margin: 0; color: #28a745;">Demo</h3>
                            <p style="margin: 5px 0; color: #586069;">Platform Status</p>
                        </div>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <h3 style="margin: 0; color: #ffc107;">Local</h3>
                            <p style="margin: 5px 0; color: #586069;">Storage Type</p>
                        </div>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                            <h3 style="margin: 0; color: #6f42c1;">∞</h3>
                            <p style="margin: 5px 0; color: #586069;">Demo Views</p>
                        </div>
                    </div>
                    <p style="color: #6c757d;">
                        <strong>Note:</strong> This is a demo analytics view. In a production environment, 
                        this would show real traffic data, user engagement metrics, and detailed insights.
                    </p>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(analyticsModal);
    }

    // Settings placeholder
    showSettings() {
        const settingsModal = document.createElement('div');
        settingsModal.className = 'modal';
        settingsModal.style.display = 'block';
        settingsModal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h2>⚙️ Demo Settings</h2>
                <div style="padding: 20px;">
                    <h3>Demo Configuration</h3>
                    <div style="margin: 20px 0;">
                        <label style="display: block; margin-bottom: 10px;">
                            <strong>User Name:</strong>
                            <input type="text" value="${this.currentUser?.name || 'Demo User'}" style="width: 100%; padding: 8px; margin-top: 5px;" readonly>
                        </label>
                        <label style="display: block; margin-bottom: 10px;">
                            <strong>User Email:</strong>
                            <input type="email" value="${this.currentUser?.email || 'demo@example.com'}" style="width: 100%; padding: 8px; margin-top: 5px;" readonly>
                        </label>
                        <label style="display: block; margin-bottom: 10px;">
                            <strong>Storage Type:</strong>
                            <input type="text" value="Browser Local Storage (Demo)" style="width: 100%; padding: 8px; margin-top: 5px;" readonly>
                        </label>
                        <label style="display: block; margin-bottom: 10px;">
                            <strong>Demo Posts:</strong>
                            <input type="text" value="${this.posts.length} posts stored locally" style="width: 100%; padding: 8px; margin-top: 5px;" readonly>
                        </label>
                    </div>
                    <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h4 style="margin-top: 0;">Demo Mode Information</h4>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                            <li>All data is stored in browser localStorage</li>
                            <li>Posts are not actually saved to GitHub</li>
                            <li>Authentication is simulated for testing</li>
                            <li>Clear browser data to reset demo</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <button onclick="demoDashboard.clearDemoData()" class="btn-secondary" style="background: #dc3545;">
                            🗑️ Clear All Demo Data
                        </button>
                    </div>
                </div>
                <div style="text-align: right; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.remove()" class="btn-secondary">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsModal);
    }

    clearDemoData() {
        if (confirm('Are you sure you want to clear all demo data? This will remove all demo posts and logout.')) {
            localStorage.removeItem('demo_posts');
            localStorage.removeItem('demo_user_data');
            demoAuth.showSuccess('Demo data cleared successfully!');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    }

    // Utility methods
    showLoading(message) {
        let loader = document.getElementById('demo-dashboard-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'demo-dashboard-loader';
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 20px 40px;
                border-radius: 5px;
                z-index: 2000;
                text-align: center;
            `;
            document.body.appendChild(loader);
        }
        loader.innerHTML = `
            <div style="margin-bottom: 10px;">⏳</div>
            <div>${message}</div>
        `;
        loader.style.display = 'block';
    }

    hideLoading() {
        const loader = document.getElementById('demo-dashboard-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
}

// Global functions for button onclick handlers
function showCreatePostForm() {
    if (window.demoDashboard) {
        window.demoDashboard.showCreatePostForm();
    }
}

function hideCreatePostForm() {
    if (window.demoDashboard) {
        window.demoDashboard.hideCreatePostForm();
    }
}

function showPostsManager() {
    if (window.demoDashboard) {
        window.demoDashboard.showPostsManager();
    }
}

function hidePostsManager() {
    if (window.demoDashboard) {
        window.demoDashboard.hidePostsManager();
    }
}

function showAnalytics() {
    if (window.demoDashboard) {
        window.demoDashboard.showAnalytics();
    }
}

function showSettings() {
    if (window.demoDashboard) {
        window.demoDashboard.showSettings();
    }
}

function handleCreatePost(event) {
    if (window.demoDashboard) {
        return window.demoDashboard.handleCreatePost(event);
    }
    return false;
}

// Initialize demo dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.demoDashboard = new DemoDashboard();
    }, 200);
});
