# OAuth Configuration Checklist

**Your Client ID:** `717968394179-ldu9da3rq27aridcm93gnjskujd5usv9.apps.googleusercontent.com`

## ✅ Required Google Cloud Console Configuration

### 1. Authorized JavaScript Origins
Add these to your OAuth client configuration:

**For Development:**
```
http://localhost:1313
```

**For Production:**
```
https://antonio-parada.github.io
https://blog.mypp.site
```
*(Replace with your actual domains)*

### 2. Authorized Redirect URIs
Add these exact URLs:

**For Development:**
```
http://localhost:1313/auth/callback/
```

**For Production:**
```
https://antonio-parada.github.io/auth/callback/
https://blog.mypp.site/auth/callback/
```

### 3. OAuth Consent Screen
Configure the consent screen with:

- **App name:** "My Blog Authentication" (or your preferred name)
- **User support email:** Your email address
- **Developer contact information:** Your email address
- **Authorized domains:** 
  - `antonio-parada.github.io`
  - `mypp.site` (if using custom domain)

## 🚨 Important Notes

1. **HTTPS Required:** Production must use HTTPS (GitHub Pages provides this automatically)
2. **Exact URL Match:** Redirect URIs must match exactly (including trailing slash)
3. **Domain Verification:** Add domains to Google Search Console for verification
4. **Testing:** Test both localhost and production environments

## 🧪 Testing Steps

1. Test login on localhost during development
2. Deploy to GitHub Pages
3. Test login on production domain
4. Verify user data appears in dashboard
5. Test logout functionality

## 📝 Current Status

- ✅ Client ID updated in code
- ⏳ **Next:** Configure authorized domains in Google Cloud Console
- ⏳ **Then:** Test authentication flow

The system is ready to work once you complete the Google Cloud Console configuration!
