# GitHub Integration Setup Instructions

## Required: Set up GitHub Token for Netlify Function

The blog creation automation requires a GitHub Personal Access Token to create issues and interact with the repository.

### Step 1: Create GitHub Personal Access Token

1. **Go to GitHub Settings**:
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"

2. **Configure Token**:
   - **Note**: `Blog Platform Automation`
   - **Expiration**: `No expiration` (or set as needed)
   - **Scopes** (check these boxes):
     - ✅ `repo` (Full control of private repositories)
     - ✅ `read:user` (Read user profile data)
     - ✅ `user:email` (Access user email addresses)

3. **Generate and Copy Token**:
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately - you won't see it again!

### Step 2: Add Token to Netlify Environment Variables

1. **Go to Netlify Site Settings**:
   - Login to Netlify: https://app.netlify.com/
   - Go to your site dashboard
   - Click "Site settings" → "Environment variables"

2. **Add GitHub Token**:
   - Click "Add environment variable"
   - **Key**: `GITHUB_TOKEN`
   - **Value**: [Paste your GitHub token here]
   - **Scopes**: Select "All deploy contexts"
   - Click "Create variable"

### Step 3: Deploy Changes

1. **Commit and Push**:
   ```powershell
   git add .
   git commit -m "Add GitHub Issues backend automation"
   git push origin main
   ```

2. **Verify Deployment**:
   - Check Netlify deploy logs for any errors
   - Function should be available at: `/.netlify/functions/create-blog`

### Step 4: Test the Integration

1. **Visit Create Blog Page**:
   - Go to your site's `/create-blog/` page
   - Fill out the form with test data

2. **Submit Form**:
   - Should create a GitHub issue automatically
   - Check your repository's Issues tab

3. **Verify Automation**:
   - GitHub Action should trigger on issue creation
   - Should create a pull request with blog structure

## Architecture Overview

```
User Form → Netlify Function → GitHub Issues → GitHub Actions → Pull Request → Blog Created
```

### What Happens:

1. **User submits form** → Data sent to Netlify function
2. **Netlify function** → Creates GitHub issue with blog details
3. **GitHub Action triggers** → Parses issue, validates data
4. **Automation creates**:
   - Blog directory structure
   - Hugo configuration
   - Welcome post and about page
   - Tests Hugo build
5. **Pull request opened** → For manual review
6. **After PR merge** → Blog goes live automatically

## Troubleshooting

### Common Issues:

**❌ "GitHub token not configured"**
- Verify `GITHUB_TOKEN` is set in Netlify environment variables
- Redeploy site after adding environment variable

**❌ "Network error" in form**
- Check Netlify function logs in Netlify dashboard
- Verify function deployed successfully

**❌ GitHub Action doesn't trigger**
- Check that issue has `blog-request` label
- Verify GitHub Actions are enabled in repository settings

**❌ Pull request not created**
- Check GitHub Action logs in repository's Actions tab
- Verify token has `repo` scope permissions

### Debug Steps:

1. **Check Netlify Function Logs**:
   - Netlify Dashboard → Functions → View logs

2. **Check GitHub Action Logs**:
   - GitHub Repository → Actions tab → View workflow runs

3. **Test GitHub Token**:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
   ```

4. **Manual Issue Creation**:
   - Test by creating an issue manually with `blog-request` label

## Security Notes

- ✅ GitHub token is stored securely in Netlify
- ✅ Token has minimal required permissions
- ✅ All automation runs in public GitHub repository
- ✅ Manual review process via pull requests

## Next Steps After Setup

1. ✅ Test blog creation with a real request
2. ✅ Review and merge first automated PR
3. ✅ Verify blog appears at expected URL
4. ✅ Document process for users
5. ✅ Set up monitoring for failed requests

---

**Ready to go?** Once the GitHub token is configured, the blog creation system will be fully automated! 🚀
