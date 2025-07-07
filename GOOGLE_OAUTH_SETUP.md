# Google OAuth Setup for GitHub Pages Blog

This document explains how to set up Google OAuth authentication for your static blog hosted on GitHub Pages.

## Overview

This implementation uses Google OAuth 2.0 with PKCE (Proof Key for Code Exchange) flow, which is suitable for client-side applications without a backend server. This is perfect for GitHub Pages since it only serves static content.

## Prerequisites

1. A Google Cloud Platform account
2. A GitHub Pages site
3. A custom domain (recommended for production)

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API or Google Identity services
4. Go to "Credentials" in the sidebar
5. Click "Create Credentials" > "OAuth client ID"
6. Choose "Web application"
7. Configure the OAuth consent screen if prompted

### Configure Authorized URLs

**Authorized JavaScript origins:**
```
https://yourdomain.com
https://your-username.github.io
```

**Authorized redirect URIs:**
```
https://yourdomain.com/auth/callback/
https://your-username.github.io/auth/callback/
```

## Step 2: Configure Your Site

1. Update the Client ID in `static/js/google-auth.js`:
   ```javascript
   this.clientId = 'YOUR_GOOGLE_CLIENT_ID_HERE';
   ```

2. Ensure your site has the `/auth/callback/` page (already included)

3. Deploy your site and test

## Step 3: OAuth Consent Screen

For production use, you'll need to configure the OAuth consent screen:

1. Go to "OAuth consent screen" in Google Cloud Console
2. Choose "External" (unless you have Google Workspace)
3. Fill in the required information:
   - App name: "Your Blog Authentication"
   - User support email: your email
   - Developer contact information: your email
4. Add your domain to authorized domains
5. Submit for verification if needed

## Security Features

### PKCE Flow
- Uses cryptographically secure random code verifier
- No client secret required (perfect for static sites)
- Protection against authorization code interception

### State Parameter
- CSRF protection with random state tokens
- Validates OAuth responses to prevent attacks

### Session Management
- Secure token storage in localStorage
- Automatic token expiration handling
- Session validation on page loads

## User Experience

### Login Flow
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Grants permissions
4. Redirected back to `/auth/callback/`
5. Token exchange happens automatically
6. User is redirected to dashboard

### Logout
- Clears all authentication data
- Redirects to homepage
- No server-side session to invalidate

## Local Development

For local development:

1. Add `http://localhost:1313` to authorized origins
2. Add `http://localhost:1313/auth/callback/` to redirect URIs
3. Hugo's development server will work normally

## Production Considerations

### HTTPS Required
- Google OAuth requires HTTPS in production
- GitHub Pages provides HTTPS automatically
- Custom domains need HTTPS enabled

### Domain Verification
- Add your domain to Google Search Console
- Verify ownership for OAuth consent screen

### Rate Limits
- Google has rate limits for OAuth requests
- Monitor usage in Google Cloud Console

## Troubleshooting

### Common Issues

**"redirect_uri_mismatch" error:**
- Check that redirect URIs match exactly in Google Console
- Ensure HTTPS is used for production domains

**"invalid_client" error:**
- Verify Client ID is correct
- Check that domain is authorized

**Session not persisting:**
- Check browser localStorage
- Verify token expiration times
- Check for JavaScript errors

### Debug Mode
Enable console logging to debug authentication flow:
```javascript
console.log('Auth status:', googleAuth.currentUser);
```

## Content Management

### Post Storage
- Posts are stored in browser localStorage
- In production, you'd want to sync to GitHub API or another backend
- Current implementation is for demonstration

### Data Persistence
- User data survives browser refreshes
- Tokens are automatically renewed
- Data is isolated per domain

## Extending the System

### GitHub Integration
To save posts to GitHub:
1. Add GitHub API calls to create files
2. Use GitHub Personal Access Tokens
3. Implement file synchronization

### Real Backend
For a full solution:
1. Set up serverless functions (Netlify/Vercel)
2. Use Firebase or similar for data storage
3. Implement proper user management

## Security Best Practices

1. **Client ID Protection**: While Client ID is public, don't expose it unnecessarily
2. **Domain Restrictions**: Limit authorized domains in Google Console
3. **Token Storage**: Consider more secure storage options for sensitive data
4. **HTTPS Only**: Never use OAuth over HTTP in production
5. **Regular Audits**: Monitor OAuth usage and revoke suspicious tokens

## Support

For issues with this implementation:
1. Check browser console for errors
2. Verify Google Cloud Console configuration
3. Test with different browsers
4. Check network requests in developer tools

The implementation provides a solid foundation for authentication on static sites while maintaining security best practices.
