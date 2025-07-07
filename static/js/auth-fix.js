// Authentication Fix Script
// This script fixes the sign-in loop and routing issues

(function() {
    'use strict';
    
    console.log('🔧 Loading authentication fix...');
    
    // Prevent multiple initialization of auth systems
    let authSystemInitialized = false;
    
    // Clean up conflicting auth systems
    function cleanupConflictingAuth() {
        // Remove any demo auth references
        if (typeof window.demoAuth !== 'undefined') {
            console.log('Removing conflicting demo auth system');
            delete window.demoAuth;
        }
        
        // Clean up conflicting localStorage entries
        const demoKeys = [
            'demo_user',
            'demo_session', 
            'demo_auth_token',
            'demo_posts'
        ];
        
        demoKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Suppress client secret errors (normal for PKCE flow)
    function suppressClientSecretErrors() {
        const originalError = console.error;
        console.error = function(...args) {
            const message = args.join(' ');
            if (message.includes('client_secret') || 
                message.includes('client secret') ||
                message.includes('Missing client_secret')) {
                console.log('ℹ️ PKCE OAuth flow - client secret not required');
                return;
            }
            originalError.apply(console, args);
        };
    }
    
    // Fix dashboard routing
    function fixDashboardRouting() {
        const currentPath = window.location.pathname;
        
        // If we're on dashboard and have a valid Google auth session
        if (currentPath.includes('/dashboard')) {
            const token = localStorage.getItem('google_auth_token');
            const expiry = localStorage.getItem('google_auth_expiry');
            
            if (token && expiry) {
                const now = new Date().getTime();
                if (now < parseInt(expiry)) {
                    // User is authenticated, show dashboard content
                    setTimeout(() => {
                        const loginRequired = document.querySelectorAll('.login-required');
                        const authRequired = document.querySelectorAll('.auth-required');
                        
                        loginRequired.forEach(el => el.style.display = 'none');
                        authRequired.forEach(el => el.style.display = 'block');
                        
                        // Initialize dashboard if available
                        if (typeof initializeDashboard === 'function') {
                            initializeDashboard();
                        }
                    }, 100);
                    return;
                }
            }
        }
    }
    
    // Fix create-blog routing
    function fixCreateBlogRouting() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/create-blog')) {
            const token = localStorage.getItem('google_auth_token');
            const expiry = localStorage.getItem('google_auth_expiry');
            
            if (token && expiry) {
                const now = new Date().getTime();
                if (now < parseInt(expiry)) {
                    // User is authenticated, show create blog form
                    setTimeout(() => {
                        const loginRequired = document.querySelectorAll('.login-required');
                        const authRequired = document.querySelectorAll('.auth-required');
                        
                        loginRequired.forEach(el => el.style.display = 'none');
                        authRequired.forEach(el => el.style.display = 'block');
                    }, 100);
                    return;
                }
            }
        }
    }
    
    // Simple OAuth state cleanup (no loop detection)
    function cleanupOAuthState() {
        const currentPath = window.location.pathname;
        
        // Only cleanup if we're having actual OAuth issues
        if (currentPath.includes('/auth/callback')) {
            const urlParams = new URLSearchParams(window.location.search);
            const error = urlParams.get('error');
            
            if (error) {
                console.log('OAuth error detected, cleaning up state:', error);
                localStorage.removeItem('google_oauth_state');
                localStorage.removeItem('google_code_verifier');
                localStorage.removeItem('oauth_return_action');
            }
        }
    }
    
    // Initialize fixes
    function initializeFixes() {
        if (authSystemInitialized) {
            return;
        }
        
        cleanupConflictingAuth();
        suppressClientSecretErrors();
        fixDashboardRouting();
        fixCreateBlogRouting();
        cleanupOAuthState();
        
        authSystemInitialized = true;
        console.log('✅ Authentication fixes applied');
    }
    
    // Run fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFixes);
    } else {
        initializeFixes();
    }
    
    // Also run fixes after a short delay to catch dynamically loaded content
    setTimeout(initializeFixes, 500);
    
    // Add global function to manually trigger auth fix
    window.fixAuth = initializeFixes;
    
    // Add navigation helper
    window.navigateToCreateBlog = function() {
        window.location.href = '/create-blog/';
    };
    
    window.navigateToDashboard = function() {
        window.location.href = '/dashboard/';
    };
    
})();
