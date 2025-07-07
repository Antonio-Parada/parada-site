// Netlify Function for Blog Creation via GitHub Issues
// Creates GitHub issues that trigger automated blog setup

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, email, blogTitle, description, theme, userInfo } = JSON.parse(event.body);
    
    // Basic validation
    if (!username || !email || !blogTitle) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Missing required fields: username, email, blogTitle' 
        })
      };
    }

    // Username validation (alphanumeric, hyphens, 3-20 chars)
    const usernameRegex = /^[a-z0-9-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Username must be 3-20 characters: lowercase letters, numbers, hyphens only' 
        })
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Invalid email address' 
        })
      };
    }

    // Reserved usernames
    const reserved = ['admin', 'api', 'www', 'blog', 'mail', 'ftp', 'root', 'test', 'demo', 'parada'];
    if (reserved.includes(username.toLowerCase())) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Username is reserved' 
        })
      };
    }

    // Create GitHub issue for blog request
    const issueResult = await createGitHubIssue({
      username,
      email,
      blogTitle,
      description: description || '',
      theme: theme || 'papermod',
      userInfo: userInfo || null
    });

    if (issueResult.success) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          message: 'Blog creation request submitted successfully!',
          blogUrl: `https://blog.mypp.site/${username}/`,
          issueNumber: issueResult.issueNumber,
          issueUrl: issueResult.issueUrl,
          estimatedTime: '2-4 hours'
        })
      };
    } else {
      throw new Error(issueResult.error || 'Failed to create GitHub issue');
    }

  } catch (error) {
    console.error('Error processing blog creation:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to process blog creation request. Please try again.'
      })
    };
  }
};

// Function to create GitHub issue
async function createGitHubIssue(blogData) {
  const { username, email, blogTitle, description, theme, userInfo } = blogData;
  
  // GitHub API configuration
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'Antonio-Parada';
  const REPO_NAME = 'parada-site';
  
  if (!GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable not set');
    return { success: false, error: 'GitHub token not configured' };
  }
  
  // Create issue title and body
  const issueTitle = `🚀 New Blog Request: ${blogTitle} (${username})`;
  
  const issueBody = `# New Blog Creation Request

## Blog Details
- **Username**: \`${username}\`
- **Blog Title**: ${blogTitle}
- **Email**: ${email}
- **Theme**: ${theme}
- **Description**: ${description || 'No description provided'}

## User Information
${userInfo ? `
- **Name**: ${userInfo.name || 'Not provided'}
- **Google ID**: ${userInfo.id || 'Not provided'}
- **Verified Email**: ${userInfo.verified_email ? 'Yes' : 'No'}
- **Profile Picture**: ${userInfo.picture || 'Not provided'}
` : '- **User Info**: Not provided (non-authenticated request)'}

## Proposed Blog Structure
\`\`\`
sites/${username}/
├── hugo.toml           # User's Hugo config
└── ../../content-${username}/
    ├── _index.md       # User's homepage
    ├── about.md        # User's about page
    └── posts/          # User's posts directory
        └── welcome.md  # Welcome post
\`\`\`

## Blog URL
- **Production URL**: https://blog.mypp.site/${username}/
- **GitHub Pages URL**: https://antonio-parada.github.io/parada-site/${username}/

## Automation Tasks
- [ ] Validate username availability
- [ ] Create blog directory structure
- [ ] Generate Hugo configuration
- [ ] Create welcome post
- [ ] Update main site navigation
- [ ] Deploy changes
- [ ] Send confirmation email

## Request Info
- **Submitted**: ${new Date().toISOString()}
- **Status**: Pending Review
- **Priority**: Normal

---
*This issue was automatically created by the blog creation form.*`;
  
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Parada-Blog-Platform/1.0'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: ['blog-request', 'automation', 'new-user'],
        assignees: ['Antonio-Parada']
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      return { 
        success: false, 
        error: `GitHub API error: ${response.status}` 
      };
    }
    
    const issue = await response.json();
    
    return {
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url
    };
    
  } catch (error) {
    console.error('Error creating GitHub issue:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

