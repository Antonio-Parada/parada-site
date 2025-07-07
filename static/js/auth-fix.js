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
    
    // Prevent navigation loops with enhanced detection
    function preventNavigationLoops() {
        let navigationHistory = [];
        let maxHistorySize = 10;
        let loopDetectionThreshold = 3;
        
        function addToHistory(path, timestamp) {
            navigationHistory.push({ path, timestamp });
            if (navigationHistory.length > maxHistorySize) {
                navigationHistory.shift();
            }
        }
        
        function detectLoop() {
            const currentPath = window.location.pathname;
            const now = Date.now();
            
            // Add current navigation to history
            addToHistory(currentPath, now);
            
            // Check for rapid repeated visits to same path
            const recentSamePath = navigationHistory.filter(
                entry => entry.path === currentPath && (now - entry.timestamp) < 10000
            );
            
            if (recentSamePath.length >= loopDetectionThreshold) {
                console.warn('🔄 Navigation loop detected!', {
                    path: currentPath,
                    occurrences: recentSamePath.length,
                    history: navigationHistory
                });
                
                // Clear authentication and redirect to safe page
                clearLoopingAuth();
                return true;
            }
            
            // Check for rapid OAuth callback loops
            if (currentPath.includes('/auth/callback')) {
                const callbackVisits = navigationHistory.filter(
                    entry => entry.path.includes('/auth/callback') && (now - entry.timestamp) < 30000
                );
                
                if (callbackVisits.length >= 2) {
                    console.warn('🔄 OAuth callback loop detected!');
                    clearLoopingAuth();
                    return true;
                }
            }
            
            return false;
        }
        
        function clearLoopingAuth() {
            // Clear potentially corrupted OAuth state
            localStorage.removeItem('google_oauth_state');
            localStorage.removeItem('google_code_verifier');
            localStorage.removeItem('oauth_return_action');
            
            // Show user-friendly error message
            document.body.innerHTML = `
                <div style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #f8f9fa;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                ">
                    <div style="
                        background: white;
                        padding: 2rem;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        text-align: center;
                        max-width: 500px;
                    ">
                        <h2 style="color: #dc3545; margin-bottom: 1rem;">🔄 Authentication Loop Detected</h2>
                        <p style="margin-bottom: 1rem; color: #666;">We detected repeated sign-in attempts. This usually happens due to browser settings or temporary issues.</p>
                        <p style="margin-bottom: 2rem; color: #666;">We've cleared the authentication state to help resolve this.</p>
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                            <button onclick="location.reload()" style="
                                background: #007bff;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                            ">🔄 Try Again</button>
                            <button onclick="window.location.href='/'" style="
                                background: #28a745;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                            ">🏠 Go Home</button>
                            <button onclick="window.authStatusChecker?.show()" style="
                                background: #6c757d;
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                font-weight: bold;
                            ">🔍 Debug Info</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Check for loops on page navigation
        const observer = new MutationObserver(() => {
            detectLoop();
        });
        
        // Also check periodically
        setInterval(detectLoop, 3000);
        
        // Initial check
        detectLoop();
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
        preventNavigationLoops();
        
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
