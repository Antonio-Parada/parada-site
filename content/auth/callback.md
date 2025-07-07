---
title: "Authentication Callback"
layout: "single"
type: "page"
---

<div id="auth-callback-content">
    <div style="text-align: center; padding: 100px;">
        <h2>🔄 Processing Authentication...</h2>
        <div style="margin: 20px 0;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4285f4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        </div>
        <p style="color: #666;">Please wait while we complete the authentication process.</p>
    </div>
</div>

<script>
// This page will be handled by the Google Auth JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // The google-auth.js will handle this page automatically
    console.log('OAuth callback page loaded');
});
</script>

<style>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
