# 🚨 URGENT: OAuth Configuration Required

Your OAuth is being blocked because Google Cloud Console needs to be configured. Here's exactly what to do:

## 🔗 Your Site URLs
- **GitHub Pages:** `https://antonio-parada.github.io/parada-site`
- **Custom Domain:** `https://blog.mypp.site` (if configured)

## ⚡ Quick Setup Steps

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/apis/credentials

### 2. Find Your OAuth Client
Look for: `717968394179-ldu9da3rq27aridcm93gnjskujd5usv9.apps.googleusercontent.com`

### 3. Edit OAuth Client Settings

**Authorized JavaScript Origins - ADD THESE:**
```
http://localhost:1313
https://antonio-parada.github.io
https://blog.mypp.site
```

**Authorized Redirect URIs - ADD THESE:**
```
http://localhost:1313/auth/callback/
https://antonio-parada.github.io/parada-site/auth/callback/
https://blog.mypp.site/auth/callback/
```

⚠️ **CRITICAL:** Make sure the redirect URIs include `/parada-site/` for GitHub Pages!

### 4. OAuth Consent Screen
If not configured:
- **App name:** "Blog Platform Auth"
- **User support email:** Your email
- **Developer contact:** Your email
- **Authorized domains:** 
  - `antonio-parada.github.io`
  - `mypp.site`

### 5. Save Changes
Click "Save" in Google Cloud Console

## 🧪 Test After Setup

1. **Local Testing:** `hugo server` then visit `http://localhost:1313`
2. **Production Testing:** Visit `https://antonio-parada.github.io/parada-site`
3. **Click "Sign in with Google"**
4. **Should work without errors**

## 🔍 Common Issues

**"redirect_uri_mismatch" error:**
- Double-check the redirect URIs exactly match
- Include the `/parada-site/` part for GitHub Pages
- Make sure there's a trailing slash on `/auth/callback/`

**"invalid_client" error:**
- Verify Client ID is correct in code
- Check domain authorization

**Still getting blocked:**
- Wait 5-10 minutes after making changes
- Try in incognito mode
- Clear browser cache

## 📞 Quick Debug

If it's still not working, check:
1. Are you testing on the right URL? (`https://antonio-parada.github.io/parada-site`)
2. Did you add the `/parada-site/` part to the redirect URI?
3. Did you save changes in Google Cloud Console?
4. Are you using the exact Client ID: `717968394179-ldu9da3rq27aridcm93gnjskujd5usv9.apps.googleusercontent.com`?

Once configured, the OAuth will work perfectly! 🎉
