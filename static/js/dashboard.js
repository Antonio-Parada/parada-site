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

function checkAuthStatus() {
    // Check for Google authentication
    if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
        return 'authenticated';
    }
    
    // Check for stored Google auth session
    const googleUser = localStorage.getItem('google_user_data');
    const googleToken = localStorage.getItem('google_auth_token');
    const googleExpiry = localStorage.getItem('google_auth_expiry');
    
    if (googleUser && googleToken && googleExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(googleExpiry)) {
            console.log('Valid Google session found');
            return 'authenticated';
        }
    }
    
    return false;
}

function getCurrentUser() {
    if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
        return googleAuth.currentUser;
    }
    
    // Check localStorage for Google user data
    const googleUser = localStorage.getItem('google_user_data');
    if (googleUser) {
        return JSON.parse(googleUser);
    }
    
    return null;
}

function showDashboard() {
    // Show authenticated content, hide login prompt
    const authRequired = document.querySelectorAll('.auth-required');
    const loginRequired = document.querySelectorAll('.login-required');
    
    authRequired.forEach(el => el.style.display = 'block');
    loginRequired.forEach(el => el.style.display = 'none');
    
    // Update user info if available
    const user = getCurrentUser();
    if (user) {
        console.log('Dashboard loaded for user:', user.name);
        
        // Update dashboard title with user info
        const dashboardTitle = document.querySelector('h1');
        const dashboardSubtitle = document.querySelector('.subtitle');
        
        if (dashboardTitle) {
            dashboardTitle.textContent = `📊 ${user.name}'s Blog Dashboard`;
        }
        if (dashboardSubtitle) {
            dashboardSubtitle.textContent = `Welcome to your content management system, ${user.name}`;
        }
        
        // Show blog info if available
        showBlogInfo();
    }
}

function showLoginPrompt() {
    // Hide authenticated content, show login prompt
    const authRequired = document.querySelectorAll('.auth-required');
    const loginRequired = document.querySelectorAll('.login-required');
    
    authRequired.forEach(el => el.style.display = 'none');
    loginRequired.forEach(el => el.style.display = 'block');
}

function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    // Load all dashboard components
    loadStats();
    loadRecentActivity();
    showBlogInfo();
}

// Post creation form handlers
function showCreatePostForm() {
    document.getElementById('create-post-modal').style.display = 'block';
}

function hideCreatePostForm() {
    document.getElementById('create-post-modal').style.display = 'none';
    document.getElementById('create-post-form').reset();
}

async function handleCreatePost(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        tags: formData.get('tags'),
        category: formData.get('category')
    };
    
    console.log('Creating post:', postData);
    
    try {
        // Use Google Auth to create the post
        if (typeof googleAuth !== 'undefined' && googleAuth.currentUser) {
            await googleAuth.createPost(postData.title, postData.content, postData.tags, postData.category);
        } else {
            throw new Error('Authentication required');
        }
        
        // Hide the form and refresh
        hideCreatePostForm();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post: ' + error.message);
    }
}

// Posts management
function showPostsManager() {
    document.getElementById('posts-manager-modal').style.display = 'block';
    loadUserPosts();
}

function hidePostsManager() {
    document.getElementById('posts-manager-modal').style.display = 'none';
}

function loadUserPosts() {
    const postsContainer = document.getElementById('posts-list');
    if (!postsContainer) return;
    
    try {
        // Load posts using Google Auth
        let posts = [];
        if (typeof googleAuth !== 'undefined') {
            posts = googleAuth.getUserPosts();
        }
        
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p style="text-align: center; color: #666;">No posts yet. Create your first post!</p>';
            return;
        }
        
        // Display posts
        postsContainer.innerHTML = posts.map(post => `
            <div class="post-item">
                <h4>${post.title}</h4>
                <div class="post-meta">
                    Created: ${new Date(post.created).toLocaleDateString()} by ${post.author}
                </div>
                <div class="post-actions">
                    <button onclick="editPost('${post.filename}')" class="btn-primary">Edit</button>
                    <button onclick="deletePost('${post.filename}')" class="btn-secondary">Delete</button>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = '<p style="color: red;">Error loading posts</p>';
    }
}

function deletePost(filename) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        // Use Google Auth to delete the post
        if (typeof googleAuth !== 'undefined') {
            googleAuth.deleteUserPost(filename);
        }
        
        // Refresh the posts list
        loadUserPosts();
        loadDashboardData(); // Refresh stats
        
        console.log('Post deleted:', filename);
        
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post: ' + error.message);
    }
}

function editPost(filename) {
    // For now, just show an alert - in a real implementation, you'd open an editor
    alert('Edit functionality coming soon! For now, you can delete and recreate posts.');
}

function loadStats() {
    try {
        // Load from Google Auth
        let posts = [];
        if (typeof googleAuth !== 'undefined') {
            posts = googleAuth.getUserPosts();
        }
        
        const totalPosts = posts.length;
        const publishedPosts = posts.filter(post => !post.content.includes('draft: true')).length;
        const draftPosts = totalPosts - publishedPosts;
        
        // Update stats display
        const statCards = document.querySelectorAll('.stat-card h3');
        if (statCards.length >= 4) {
            statCards[0].textContent = totalPosts;
            statCards[1].textContent = publishedPosts;
            statCards[2].textContent = draftPosts;
            statCards[3].textContent = '- '; // Views not implemented yet
        }
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function loadRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;
    
    try {
        // Load recent posts from Google Auth
        let posts = [];
        if (typeof googleAuth !== 'undefined') {
            posts = googleAuth.getUserPosts();
        }
        
        if (posts.length === 0) {
            activityContainer.innerHTML = '<p style="color: #666;">No recent activity. Create your first post!</p>';
            return;
        }
        
        // Sort by creation date and take last 5
        const recentPosts = posts
            .sort((a, b) => new Date(b.created) - new Date(a.created))
            .slice(0, 5);
        
        activityContainer.innerHTML = `
            <ul style="list-style: none; padding: 0;">
                ${recentPosts.map(post => `
                    <li style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${post.title}</strong><br>
                            <small style="color: #666;">Created ${new Date(post.created).toLocaleDateString()}</small>
                        </div>
                        <span style="background: #28a745; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px;">Published</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        activityContainer.innerHTML = '<p style="color: red;">Error loading activity</p>';
    }
}

// Analytics placeholder
function showAnalytics() {
    alert('Analytics feature coming soon! This will show detailed statistics about your blog performance.');
}

// Settings placeholder
function showSettings() {
    alert('Settings feature coming soon! This will allow you to customize your blog configuration.');
}

// Show blog information
function showBlogInfo() {
    const blogInfo = localStorage.getItem('user_blog_info');
    if (blogInfo) {
        try {
            const blog = JSON.parse(blogInfo);
            
            // Add blog info section to dashboard
            const dashboardContent = document.querySelector('.dashboard-content');
            if (dashboardContent) {
                let blogInfoSection = document.getElementById('blog-info-section');
                
                if (!blogInfoSection) {
                    blogInfoSection = document.createElement('div');
                    blogInfoSection.id = 'blog-info-section';
                    blogInfoSection.innerHTML = `
                        <div style="background: #e8f5e8; border: 1px solid #28a745; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
                            <h3 style="color: #28a745; margin-top: 0;">🌐 Your Blog</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                                <div>
                                    <strong>Blog Title:</strong><br>
                                    <span>${blog.blogTitle}</span>
                                </div>
                                <div>
                                    <strong>Username:</strong><br>
                                    <span>${blog.username}</span>
                                </div>
                                <div>
                                    <strong>URL:</strong><br>
                                    <a href="https://blog.mypp.site/${blog.username}" target="_blank" style="color: #0066cc;">blog.mypp.site/${blog.username}</a>
                                </div>
                                <div>
                                    <strong>Created:</strong><br>
                                    <span>${new Date(blog.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            ${blog.description ? `<div style="margin-top: 1rem;"><strong>Description:</strong><br><span style="color: #666;">${blog.description}</span></div>` : ''}
                        </div>
                    `;
                    
                    // Insert after the welcome section
                    const welcomeSection = dashboardContent.querySelector('h1');
                    if (welcomeSection && welcomeSection.nextElementSibling) {
                        welcomeSection.nextElementSibling.insertAdjacentElement('afterend', blogInfoSection);
                    }
                }
            }
        } catch (error) {
            console.error('Error displaying blog info:', error);
        }
    }
}

// Modal management
document.addEventListener('click', function(event) {
    // Close modals when clicking outside
    if (event.target.classList.contains('modal')) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Escape key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});
