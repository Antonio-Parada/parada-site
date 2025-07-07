// Netlify Function for Blog Creation
// Conservative backend implementation for blog platform

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { username, email, blogTitle, description, theme } = JSON.parse(event.body);
    
    // Basic validation
    if (!username || !email || !blogTitle) {
      return {
        statusCode: 400,
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
        body: JSON.stringify({ 
          error: 'Username is reserved' 
        })
      };
    }

    // For now, just collect the data and send email notification
    // In production, this would create GitHub PR or direct file creation
    
    const blogData = {
      username,
      email,
      blogTitle,
      description: description || '',
      theme: theme || 'papermod',
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    // TODO: Store in database (for now, just log)
    console.log('New blog signup:', blogData);

    // TODO: Send email notification to admin
    // TODO: Create GitHub issue or PR for blog creation
    
    // Success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Configure properly for production
      },
      body: JSON.stringify({
        success: true,
        message: 'Blog creation request received! We\'ll review and set up your blog within 24 hours.',
        blogUrl: `https://blog.mypp.site/${username}/`,
        estimatedTime: '24 hours'
      })
    };

  } catch (error) {
    console.error('Error processing blog creation:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error. Please try again later.' 
      })
    };
  }
};

// Options handler for CORS
exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      }
    };
  }
  
  return exports.handler(event, context);
};
