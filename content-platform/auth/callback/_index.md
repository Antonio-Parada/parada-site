---
title: "Authentication Callback"
description: "Handling authentication callback"
layout: "auth-callback"
type: "auth-callback"
---

<div style="text-align: center; padding: 50px;">
    <h2>🔄 Authentication Redirect</h2>
    <p>Redirecting to demo authentication...</p>
    <div style="margin: 20px 0;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #0366d6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
    </div>
    <p style="color: #666;">
        <small>This site uses demo authentication for testing purposes.</small>
    </p>
</div>

<script>
// Redirect GitHub OAuth callback to demo login
document.addEventListener('DOMContentLoaded', () => {
    // Show a message for a moment then redirect
    setTimeout(() => {
        // Clear any OAuth state
        localStorage.removeItem('oauth_state');
        
        // Show demo login prompt
        if (typeof demoAuth !== 'undefined') {
            demoAuth.showSuccess('GitHub OAuth redirected to demo authentication');
            demoAuth.demoLogin();
        } else {
            // Fallback if demoAuth not loaded yet
            setTimeout(() => {
                const userName = prompt('Demo Login - Enter your name:') || 'Demo User';
                const userData = {
                    id: Date.now(),
                    login: userName.toLowerCase().replace(/[^a-z0-9]/g, ''),
                    name: userName,
                    email: `${userName.toLowerCase().replace(/[^a-z0-9]/g, '')}@demo.com`,
                    avatar_url: `https://avatars.dicebear.com/api/initials/${encodeURIComponent(userName)}.svg`
                };
                
                localStorage.setItem('demo_user_data', JSON.stringify(userData));
                window.location.href = '/dashboard/';
            }, 500);
        }
    }, 2000);
});
</script>

<style>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
