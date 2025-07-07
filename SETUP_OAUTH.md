# 🔐 GitHub OAuth Setup Instructions

To enable user authentication on your blogging platform, you need to create a GitHub OAuth App and configure the necessary secrets.

## 🏗️ Create GitHub OAuth App

### Step 1: Create OAuth Application

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/applications/new
   - Or: GitHub Profile → Settings → Developer settings → OAuth Apps → New OAuth App

2. **Fill out the OAuth App form:**
   - **Application name**: `Blog Platform Auth`
   - **Homepage URL**: `https://blog.mypp.site`
   - **Application description**: `Authentication for multi-tenant blog platform`
   - **Authorization callback URL**: `https://blog.mypp.site/auth/callback`

3. **Click "Register application"**

### Step 2: Get OAuth Credentials

After creating the app, you'll see:
- **Client ID**: `Ov23liSlKLRQE5xqP0e7` (already configured)
- **Client Secret**: `[GENERATE A NEW SECRET]`

Click **"Generate a new client secret"** and copy it.

## 🔧 Configure Repository Secrets

### Step 3: Add Secrets to Repository

1. **Go to your repository settings**
   - Visit: https://github.com/Antonio-Parada/parada-site/settings/secrets/actions

2. **Add these repository secrets:**

   **GITHUB_CLIENT_ID**
   ```
   Ov23liSlKLRQE5xqP0e7
   ```

   **GITHUB_CLIENT_SECRET**
   ```
   [PASTE YOUR GENERATED SECRET HERE]
   ```

### Step 4: Test OAuth Flow

1. **Visit your site**: https://blog.mypp.site
2. **Click "Sign in with GitHub"**
3. **Authorize the application**
4. **You should be redirected back with authentication**

## 🚀 How the Authentication Works

### OAuth Flow
1. **User clicks "Sign in with GitHub"**
2. **Redirected to GitHub OAuth authorization**
3. **User authorizes the application**
4. **GitHub redirects back with authorization code**
5. **GitHub Action exchanges code for access token**
6. **Token stored securely in repository**
7. **User authenticated and can access dashboard**

### Database Structure
```
data/
├── users/           # User profiles and settings
│   ├── antonio-parada.json
│   └── other-user.json
├── auth/            # Temporary auth tokens (auto-cleaned)
│   └── [oauth-codes].json
└── sessions/        # Session management (if needed)
```

### User Data Format
```json
{
  "id": 12345,
  "login": "antonio-parada",
  "name": "Antonio Parada",
  "email": "user@example.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/12345",
  "role": "blogger",
  "created_at": "2025-07-07T00:00:00Z",
  "last_login": "2025-07-07T00:00:00Z",
  "blog_tenant": "antonio-parada"
}
```

## 🔒 Security Features

### Built-in Security
- **CSRF Protection**: State parameter validation
- **Token Security**: Tokens stored in GitHub repository (private)
- **Auto-cleanup**: Temporary auth files cleaned automatically
- **GitHub Permissions**: Uses GitHub's permission system

### Rate Limiting
- **Login attempts**: 5 attempts per 15 minutes
- **API calls**: Respects GitHub API rate limits
- **Session duration**: 24 hours (configurable)

## 🛠️ Troubleshooting

### Common Issues

**❌ "Network error" during sign-in**
- Check if GitHub OAuth app is properly configured
- Verify repository secrets are set correctly
- Ensure callback URL matches exactly

**❌ "Authentication timeout"**
- GitHub Actions workflow may be taking too long
- Check workflow logs: https://github.com/Antonio-Parada/parada-site/actions
- Try signing in again after a moment

**❌ "Invalid state" error**
- Clear browser cache and try again
- This is a security feature to prevent CSRF attacks

### Debug Steps

1. **Check OAuth app settings**
   - Verify callback URL is `https://blog.mypp.site/auth/callback`
   - Ensure app is not suspended

2. **Check repository secrets**
   - Ensure `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
   - Verify secrets are not expired

3. **Check GitHub Actions**
   - Look for failed workflow runs
   - Check if `oauth-handler.yml` workflow exists and is enabled

4. **Check browser console**
   - Look for JavaScript errors
   - Check network requests for failures

## 🔄 OAuth App Management

### Updating OAuth Settings
If you need to change the OAuth app settings:

1. Go to your OAuth app: https://github.com/settings/applications/[APP_ID]
2. Update the required fields
3. Update the Client ID in `static/js/auth.js` if changed
4. Update repository secrets if Client Secret changed

### Revoking Access
To revoke access for a user:
1. User can revoke in their GitHub settings: https://github.com/settings/applications
2. Or admin can remove user file from `data/users/[username].json`

## 📋 Required Permissions

The OAuth app requests these GitHub permissions:
- **read:user**: Read user profile information
- **user:email**: Access user email address
- **repo**: Read/write access to repository content (for content management)

## 🎯 Next Steps

After OAuth is configured:
1. ✅ Test user authentication
2. ✅ Test dashboard access
3. ✅ Test post creation
4. ✅ Add more users as needed
5. ✅ Customize user roles and permissions

---

**Need help?** [Open an issue](https://github.com/Antonio-Parada/parada-site/issues) with the "authentication" label.
