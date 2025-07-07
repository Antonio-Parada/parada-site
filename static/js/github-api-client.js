// GitHub API Client for Backend Operations
// Handles all backend operations via GitHub Issues API and repository files

class GitHubAPIClient {
    constructor() {
        this.repoOwner = 'antonio-parada';
        this.repoName = 'parada-site';
        this.baseUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}`;
        this.githubToken = null;
        
        console.log('🔗 GitHub API Client initialized');
        this.init();
    }
    
    init() {
        // Check if we have a GitHub token from OAuth
        this.loadGitHubToken();
    }
    
    loadGitHubToken() {
        // In a real implementation, you'd get this from OAuth
        // For now, we'll use anonymous API calls (limited rate)
        this.githubToken = localStorage.getItem('github_api_token');
    }
    
    // Create API request via GitHub Issues
    async createAPIRequest(action, payload) {
        console.log(`📤 Creating API request: ${action}`, payload);
        
        try {
            const issueData = {
                title: `[API] ${action}`,
                body: JSON.stringify(payload, null, 2),
                labels: ['api-request', action]
            };
            
            const response = await fetch(`${this.baseUrl}/issues`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
                },
                body: JSON.stringify(issueData)
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
            }
            
            const issue = await response.json();
            console.log('✅ API request created:', issue.number);
            
            // Poll for completion
            return await this.pollForCompletion(issue.number);
            
        } catch (error) {
            console.error('❌ API request failed:', error);
            throw error;
        }
    }
    
    // Poll for API request completion
    async pollForCompletion(issueNumber, maxAttempts = 30, interval = 2000) {
        console.log(`⏳ Polling for completion of issue #${issueNumber}`);
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await fetch(`${this.baseUrl}/issues/${issueNumber}`, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
                    }
                });
                
                if (response.ok) {
                    const issue = await response.json();
                    
                    if (issue.state === 'closed') {
                        console.log('✅ API request completed successfully');
                        return {
                            success: true,
                            issue: issue,
                            message: 'Request processed successfully'
                        };
                    }
                }
                
                // Wait before next attempt
                if (attempt < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                }
                
            } catch (error) {
                console.warn(`Polling attempt ${attempt} failed:`, error.message);
            }
        }
        
        throw new Error('API request timeout - please check GitHub Actions');
    }
    
    // Blog Operations
    async createBlog(blogData) {
        console.log('🚀 Creating blog via GitHub API:', blogData.username);
        
        const payload = {
            username: blogData.username,
            blogTitle: blogData.blogTitle,
            email: blogData.email,
            description: blogData.description || '',
            theme: blogData.theme || 'papermod',
            userId: blogData.userId || null,
            timestamp: new Date().toISOString()
        };
        
        return await this.createAPIRequest('create-blog', payload);
    }
    
    async createPost(username, postData) {
        console.log('📝 Creating post via GitHub API:', postData.title);
        
        const payload = {
            username: username,
            title: postData.title,
            content: postData.content,
            tags: postData.tags || '',
            category: postData.category || 'General',
            timestamp: new Date().toISOString()
        };
        
        return await this.createAPIRequest('create-post', payload);
    }
    
    // User Data Operations
    async getUserData(username) {
        try {
            console.log(`👤 Fetching user data for: ${username}`);
            
            const response = await fetch(`https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/data/users/${username}.json`);
            
            if (response.ok) {
                const userData = await response.json();
                console.log('✅ User data retrieved:', userData);
                return userData;
            } else if (response.status === 404) {
                console.log('❌ User not found');
                return null;
            } else {
                throw new Error(`Failed to fetch user data: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            return null;
        }
    }
    
    async getBlogData(username) {
        try {
            console.log(`📚 Fetching blog data for: ${username}`);
            
            const response = await fetch(`https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/data/blogs/${username}.json`);
            
            if (response.ok) {
                const blogData = await response.json();
                console.log('✅ Blog data retrieved:', blogData);
                return blogData;
            } else if (response.status === 404) {
                console.log('❌ Blog not found');
                return null;
            } else {
                throw new Error(`Failed to fetch blog data: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching blog data:', error);
            return null;
        }
    }
    
    // List all users/blogs
    async listUsers() {
        try {
            console.log('📋 Fetching users list');
            
            const response = await fetch(`${this.baseUrl}/contents/data/users`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
                }
            });
            
            if (response.ok) {
                const files = await response.json();
                const userFiles = files.filter(file => file.name.endsWith('.json'));
                return userFiles.map(file => file.name.replace('.json', ''));
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error listing users:', error);
            return [];
        }
    }
    
    async listBlogs() {
        try {
            console.log('📋 Fetching blogs list');
            
            const response = await fetch(`${this.baseUrl}/contents/data/blogs`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
                }
            });
            
            if (response.ok) {
                const files = await response.json();
                const blogFiles = files.filter(file => file.name.endsWith('.json'));
                
                // Fetch detailed data for each blog
                const blogs = await Promise.all(
                    blogFiles.map(async (file) => {
                        const username = file.name.replace('.json', '');
                        return await this.getBlogData(username);
                    })
                );
                
                return blogs.filter(blog => blog !== null);
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error listing blogs:', error);
            return [];
        }
    }
    
    // Status and Health Checks
    async getAPIStatus() {
        try {
            const response = await fetch(`${this.baseUrl}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...(this.githubToken && { 'Authorization': `token ${this.githubToken}` })
                }
            });
            
            return {
                available: response.ok,
                rateLimit: response.headers.get('X-RateLimit-Remaining'),
                status: response.status
            };
        } catch (error) {
            return {
                available: false,
                error: error.message
            };
        }
    }
    
    // Test the backend with a sample request
    async testBackend() {
        console.log('🧪 Testing GitHub backend...');
        
        try {
            const status = await this.getAPIStatus();
            console.log('📊 API Status:', status);
            
            if (!status.available) {
                throw new Error('GitHub API not available');
            }
            
            // Test with a simple blog creation
            const testData = {
                username: 'test-user-' + Date.now(),
                blogTitle: 'Test Blog',
                email: 'test@example.com',
                description: 'This is a test blog creation',
                theme: 'papermod'
            };
            
            console.log('🧪 Creating test blog...');
            const result = await this.createBlog(testData);
            
            console.log('✅ Backend test successful:', result);
            return result;
            
        } catch (error) {
            console.error('❌ Backend test failed:', error);
            throw error;
        }
    }
}

// Initialize GitHub API client
const githubAPI = new GitHubAPIClient();

// Make it globally available
window.githubAPI = githubAPI;

// Add convenient global functions
window.testBackend = () => githubAPI.testBackend();
window.listBlogs = () => githubAPI.listBlogs();
window.listUsers = () => githubAPI.listUsers();

console.log('✅ GitHub API Client loaded');
console.log('💡 Test commands:');
console.log('   testBackend()  // Test the backend');
console.log('   listBlogs()    // List all blogs');
console.log('   listUsers()    // List all users');
