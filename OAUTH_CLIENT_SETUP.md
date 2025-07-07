# 🔧 Create Valid Google OAuth Client ID

The `invalid_client` error means your OAuth Client ID is either:
1. **Wrong/Invalid** - The ID doesn't exist or is mistyped
2. **Not Configured** - Missing required settings in Google Cloud Console
3. **Restricted** - Domain restrictions are blocking your site

## 🚀 Step-by-Step Setup

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create or Select Project
- **If you have a project**: Select it from the dropdown
- **If you need a new project**: Click "New Project"
  - Name: `Blog Platform OAuth`
  - Click "Create"

### 3. Enable Google+ API
- Go to: https://console.cloud.google.com/apis/library
- Search for "Google+ API" 
- Click "Enable"

### 4. Create OAuth Client ID
- Go to: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "OAuth client ID"
- **If prompted for OAuth consent screen**: Click "Configure consent screen"

### 5. Configure OAuth Consent Screen
- **User Type**: External
- **App Information**:
  - App name: `Blog Platform`
  - User support email: `your-email@example.com`
  - App logo: (optional)
- **Developer contact information**: `your-email@example.com`
- **Authorized domains**: Add these domains:
  ```
  antonio-parada.github.io
  mypp.site
  ```
- Click "Save and Continue"
- **Scopes**: Leave default, click "Save and Continue"
- **Test Users**: (optional), click "Save and Continue"
- Click "Back to Dashboard"

### 6. Create OAuth Client ID (continued)
- Back at: https://console.cloud.google.com/apis/credentials
- Click "Create Credentials" → "OAuth client ID"
- **Application type**: Web application
- **Name**: `Blog Platform Web Client`

### 7. Configure Web Client Settings
**Authorized JavaScript origins - ADD THESE EXACTLY:**
```
http://localhost:1313
https://antonio-parada.github.io
https://blog.mypp.site
```

**Authorized redirect URIs - ADD THESE EXACTLY:**
```
http://localhost:1313/auth/callback/
https://antonio-parada.github.io/parada-site/auth/callback/
https://blog.mypp.site/auth/callback/
```

⚠️ **CRITICAL**: Make sure you include the `/parada-site/` part for GitHub Pages!

### 8. Get Your Client ID
- Click "Create"
- **Copy the Client ID** - it will look like: `123456789-abc123def456.apps.googleusercontent.com`

### 9. Update Your Code
Replace the Client ID in your code with the new one.

## 🔍 Current Client ID Status
Your current Client ID: `717968394179-ldu9da3rq27aridcm93gnjskujd5usv9.apps.googleusercontent.com`

This might be:
- ❌ **Invalid** - Doesn't exist or was deleted
- ❌ **Misconfigured** - Wrong redirect URIs or domains
- ❌ **Project Issue** - Wrong Google Cloud project

## 🧪 Test Your New Client ID
1. Update the code with your new Client ID
2. Visit: `https://antonio-parada.github.io/parada-site`
3. Try OAuth login
4. Should work without `invalid_client` error

## 📞 Common Issues
- **Make sure you're in the right Google Cloud project**
- **Wait 5-10 minutes after creating the client**
- **Double-check the redirect URIs exactly match**
- **Ensure domains are authorized in OAuth consent screen**

Once you have a valid Client ID, I'll help you update the code!
