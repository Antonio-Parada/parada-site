// Blog Dashboard JavaScript
// Integrates with Google OAuth and content management

// Wait for DOM and authentication to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard loading...');
    
    // Check if Google auth system is available
    if (typeof googleAuth !== 'undefined') {
        // Wait a bit for auth system to initialize
        setTimeout(initializeDashboard, 100);
    } else {
        console.log('Google Auth system not available, waiting...');
        // Try to initialize anyway
        initializeDashboard();
    }
});

function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Check authentication status
    const isAuthenticated = checkAuthStatus();
    console.log('Auth status:', isAuthenticated);
    
    if (isAuthenticated) {
        showDashboard();
        loadDashboardData();
    } else {
        showLoginPrompt();
    }
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

    async loadDashboardData() {
        if (!this.currentUser) return;
        
        try {
            await this.loadPosts();
            await this.loadStats();
            await this.loadRecentActivity();
            this.updateDashboardUI();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showError('Failed to load dashboard data: ' + error.message);
        }
    }

    async loadPosts() {
        if (!blogAuth.authToken) return;
        
        try {
            const response = await fetch(
                `https://api.github.com/repos/Antonio-Parada/parada-site/contents/sites/${this.currentUser.login}/content/posts`,
                {
                    headers: {
                        'Authorization': `token ${blogAuth.authToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const files = await response.json();
                this.posts = files.filter(file => file.name.endsWith('.md'));
                
                // Load post content for each file
                for (let post of this.posts) {
                    try {
                        const contentResponse = await fetch(post.download_url);
                        if (contentResponse.ok) {
                            const content = await contentResponse.text();
                            post.content = content;
                            post.metadata = this.parsePostMetadata(content);
                        }
                    } catch (error) {
                        console.warn(`Failed to load content for ${post.name}:`, error);
                    }
                }
            } else if (response.status !== 404) {
                throw new Error(`Failed to load posts: ${response.status}`);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            this.posts = [];
        }
    }

    parsePostMetadata(content) {
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return {};
        
        const frontmatter = frontmatterMatch[1];
        const metadata = {};
        
        const lines = frontmatter.split('\n');
        for (let line of lines) {
            const colonIndex = line.indexOf(':');
            if (colonIndex > 0) {
                const key = line.substring(0, colonIndex).trim();
                const value = line.substring(colonIndex + 1).trim().replace(/['"]/g, '');
                metadata[key] = value;
            }
        }
        
        return metadata;
    }

    async loadStats() {
        this.stats.totalPosts = this.posts.length;
        this.stats.publishedPosts = this.posts.filter(post => 
            post.metadata && post.metadata.draft !== 'true'
        ).length;
        this.stats.draftPosts = this.stats.totalPosts - this.stats.publishedPosts;
        
        // TODO: Load view stats from GitHub repository insights or external analytics
        this.stats.totalViews = '...';
    }

    async loadRecentActivity() {
        // Load recent commits related to posts
        try {
            const response = await fetch(
                `https://api.github.com/repos/Antonio-Parada/parada-site/commits?path=sites/${this.currentUser.login}/content/posts&per_page=5`,
                {
                    headers: {
                        'Authorization': `token ${blogAuth.authToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (response.ok) {
                const commits = await response.json();
                this.recentActivity = commits.map(commit => ({
                    type: 'commit',
                    message: commit.commit.message,
                    date: commit.commit.author.date,
                    author: commit.commit.author.name
                }));
            }
        } catch (error) {
            console.error('Failed to load recent activity:', error);
            this.recentActivity = [];
        }
    }

    updateDashboardUI() {
        // Update stats
        const statCards = document.querySelectorAll('.stat-card h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = this.stats.totalPosts;
            statCards[1].textContent = this.stats.publishedPosts;
            statCards[2].textContent = this.stats.draftPosts;
            statCards[3].textContent = this.stats.totalViews;
        }
        
        // Update recent activity
        this.updateRecentActivity();
    }

    updateRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;
        
        if (this.recentActivity && this.recentActivity.length > 0) {
            activityContainer.innerHTML = this.recentActivity.map(activity => `
                <div class="activity-item" style="border-left: 3px solid #0366d6; padding: 10px; margin: 10px 0; background: #f8f9fa;">
                    <strong>${activity.message}</strong><br>
                    <small style="color: #6c757d;">
                        ${new Date(activity.date).toLocaleDateString()} by ${activity.author}
                    </small>
                </div>
            `).join('');
        } else {
            activityContainer.innerHTML = '<p style="color: #6c757d;">No recent activity</p>';
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
            this.showLoading('Creating post...');
            
            await blogAuth.createPost(title, content, tags, category);
            
            this.hideCreatePostForm();
            this.showSuccess('Post created successfully!');
            
            // Reload dashboard data
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Failed to create post:', error);
            this.showError('Failed to create post: ' + error.message);
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
            postsList.innerHTML = '<p style="color: #6c757d;">No posts found. Create your first post!</p>';
            return;
        }
        
        postsList.innerHTML = this.posts.map(post => {
            const isDraft = post.metadata && post.metadata.draft === 'true';
            const title = post.metadata?.title || post.name.replace('.md', '');
            const date = post.metadata?.date ? new Date(post.metadata.date).toLocaleDateString() : '';
            
            return `
                <div class="post-item">
                    <h4>${title} ${isDraft ? '<span style="color: #ffc107;">[DRAFT]</span>' : ''}</h4>
                    <div class="post-meta">
                        Created: ${date} | File: ${post.name}
                    </div>
                    <div class="post-actions">
                        <button onclick="dashboard.editPost('${post.name}')" class="btn-primary">Edit</button>
                        ${isDraft ? 
                            `<button onclick="dashboard.publishPost('${post.name}')" class="btn-primary">Publish</button>` :
                            `<button onclick="dashboard.unpublishPost('${post.name}')" class="btn-secondary">Unpublish</button>`
                        }
                        <button onclick="dashboard.deletePost('${post.name}')" class="btn-secondary">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async editPost(filename) {
        // For now, just show the GitHub file URL
        const githubUrl = `https://github.com/Antonio-Parada/parada-site/edit/main/sites/${this.currentUser.login}/content/posts/${filename}`;
        window.open(githubUrl, '_blank');
    }

    async publishPost(filename) {
        try {
            this.showLoading('Publishing post...');
            
            const post = this.posts.find(p => p.name === filename);
            if (!post) throw new Error('Post not found');
            
            // Update draft status
            const updatedContent = post.content.replace(/draft:\s*true/i, 'draft: false');
            
            await this.updatePostContent(filename, updatedContent, `Publish post: ${filename}`);
            
            this.showSuccess('Post published successfully!');
            await this.loadDashboardData();
            this.loadPostsManager();
            
        } catch (error) {
            console.error('Failed to publish post:', error);
            this.showError('Failed to publish post: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async unpublishPost(filename) {
        try {
            this.showLoading('Unpublishing post...');
            
            const post = this.posts.find(p => p.name === filename);
            if (!post) throw new Error('Post not found');
            
            // Update draft status
            const updatedContent = post.content.replace(/draft:\s*false/i, 'draft: true');
            
            await this.updatePostContent(filename, updatedContent, `Unpublish post: ${filename}`);
            
            this.showSuccess('Post unpublished successfully!');
            await this.loadDashboardData();
            this.loadPostsManager();
            
        } catch (error) {
            console.error('Failed to unpublish post:', error);
            this.showError('Failed to unpublish post: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async deletePost(filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            this.showLoading('Deleting post...');
            
            const post = this.posts.find(p => p.name === filename);
            if (!post) throw new Error('Post not found');
            
            const response = await fetch(
                `https://api.github.com/repos/Antonio-Parada/parada-site/contents/sites/${this.currentUser.login}/content/posts/${filename}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `token ${blogAuth.authToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: `Delete post: ${filename}`,
                        sha: post.sha
                    })
                }
            );
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete post');
            }
            
            this.showSuccess('Post deleted successfully!');
            await this.loadDashboardData();
            this.loadPostsManager();
            
        } catch (error) {
            console.error('Failed to delete post:', error);
            this.showError('Failed to delete post: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async updatePostContent(filename, content, commitMessage) {
        const post = this.posts.find(p => p.name === filename);
        if (!post) throw new Error('Post not found');
        
        const encodedContent = btoa(content);
        
        const response = await fetch(
            `https://api.github.com/repos/Antonio-Parada/parada-site/contents/sites/${this.currentUser.login}/content/posts/${filename}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${blogAuth.authToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: commitMessage,
                    content: encodedContent,
                    sha: post.sha
                })
            }
        );
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update post');
        }
        
        return await response.json();
    }

    // Analytics placeholder
    showAnalytics() {
        alert('Analytics feature coming soon! This will show detailed statistics about your blog performance.');
    }

    // Settings placeholder
    showSettings() {
        alert('Settings feature coming soon! This will allow you to customize your blog configuration.');
    }

    // Utility methods
    showLoading(message) {
        // Create or update loading indicator
        let loader = document.getElementById('dashboard-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'dashboard-loader';
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
        const loader = document.getElementById('dashboard-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

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
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#0366d6'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1500;
            max-width: 300px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Global functions for button onclick handlers
function showCreatePostForm() {
    if (window.dashboard) {
        window.dashboard.showCreatePostForm();
    }
}

function hideCreatePostForm() {
    if (window.dashboard) {
        window.dashboard.hideCreatePostForm();
    }
}

function showPostsManager() {
    if (window.dashboard) {
        window.dashboard.showPostsManager();
    }
}

function hidePostsManager() {
    if (window.dashboard) {
        window.dashboard.hidePostsManager();
    }
}

function showAnalytics() {
    if (window.dashboard) {
        window.dashboard.showAnalytics();
    }
}

function showSettings() {
    if (window.dashboard) {
        window.dashboard.showSettings();
    }
}

function handleCreatePost(event) {
    if (window.dashboard) {
        return window.dashboard.handleCreatePost(event);
    }
    return false;
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a moment for auth to initialize
    setTimeout(() => {
        window.dashboard = new BlogDashboard();
    }, 100);
});
