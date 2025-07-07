// Navigation Fix Script
// This script fixes routing issues and provides better navigation

(function() {
    'use strict';
    
    console.log('🧭 Loading navigation fix...');
    
    // Fix for blog creation form button
    function fixCreateBlogButton() {
        // Find all "Create My Blog" buttons
        const createButtons = document.querySelectorAll('a[href*="create-blog"], a[href*="/create-blog/"]');
        
        createButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Check if user is authenticated first
                const token = localStorage.getItem('google_auth_token');
                const expiry = localStorage.getItem('google_auth_expiry');
                
                if (token && expiry && new Date().getTime() < parseInt(expiry)) {
                    // User is authenticated, go to create blog page
                    window.location.href = '/create-blog/';
                } else {
                    // User not authenticated, trigger login first
                    if (typeof googleAuth !== 'undefined') {
                        console.log('User not authenticated, redirecting to login...');
                        googleAuth.login();
                    } else {
                        // Fallback - go to create blog page which will prompt for login
                        window.location.href = '/create-blog/';
                    }
                }
            });
        });
    }
    
    // Fix dashboard access
    function fixDashboardAccess() {
        const dashboardLinks = document.querySelectorAll('a[href*="dashboard"], a[href*="/dashboard/"]');
        
        dashboardLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Check if user is authenticated
                const token = localStorage.getItem('google_auth_token');
                const expiry = localStorage.getItem('google_auth_expiry');
                
                if (token && expiry && new Date().getTime() < parseInt(expiry)) {
                    // User is authenticated, go to dashboard
                    window.location.href = '/dashboard/';
                } else {
                    // User not authenticated, trigger login
                    if (typeof googleAuth !== 'undefined') {
                        console.log('User not authenticated, redirecting to login...');
                        googleAuth.login();
                    } else {
                        // Fallback - go to dashboard which will prompt for login
                        window.location.href = '/dashboard/';
                    }
                }
            });
        });
    }
    
    // Prevent redirect loops
    function preventRedirectLoops() {
        let redirectCount = parseInt(sessionStorage.getItem('redirectCount') || '0');
        // Reset redirect count if more than 5 minutes have passed
        const lastRedirect = parseInt(sessionStorage.getItem('lastRedirect') || '0');
        const now = new Date().getTime();
        if (now - lastRedirect > 5 * 60 * 1000) {
            redirectCount = 0;
        }
        
        if (redirectCount > 3) {
            console.warn('Too many redirects detected, clearing auth and staying on current page');
            
            // Clear potentially corrupted auth state
            localStorage.removeItem('google_auth_token');
            localStorage.removeItem('google_user_data');
            localStorage.removeItem('google_auth_expiry');
            
            // Show helpful message
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 20px;
                border-radius: 8px;
                z-index: 2000;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            `;
            message.innerHTML = `
                <h3>🔄 Navigation Issue Detected</h3>
                <p>We've cleared your authentication to fix a redirect loop.</p>
                <button onclick="this.parentElement.remove(); window.location.href='/'" 
                        style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                    🏠 Return to Home
                </button>
            `;
            document.body.appendChild(message);
            
            // Reset count
            sessionStorage.removeItem('redirectCount');
            sessionStorage.removeItem('lastRedirect');
            return;
        }
        
        // Track redirects
        const currentPath = window.location.pathname;
        const lastPath = sessionStorage.getItem('lastPath');
        
        if (currentPath !== lastPath) {
            redirectCount++;
            sessionStorage.setItem('redirectCount', redirectCount.toString());
            sessionStorage.setItem('lastRedirect', now.toString());
            sessionStorage.setItem('lastPath', currentPath);
        }
    }
    
    // Fix authentication callback handling
    function fixAuthCallback() {
        const currentPath = window.location.pathname;
        
        if (currentPath.includes('/auth/callback')) {
            console.log('Auth callback detected, ensuring proper handling...');
            
            // Don't run other navigation fixes on callback page
            return true;
        }
        
        return false;
    }
    
    // Add helpful navigation aids
    function addNavigationAids() {
        // Add a floating help button for debugging
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('github.io')) {
            const helpButton = document.createElement('button');
            helpButton.innerHTML = '🔧';
            helpButton.title = 'Debug Tools (Ctrl+Shift+A for auth status)';
            helpButton.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #6c757d;
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                z-index: 998;
                font-size: 16px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            `;
            
            helpButton.addEventListener('click', function() {
                if (typeof window.authStatusChecker !== 'undefined') {
                    window.authStatusChecker.show();
                } else {
                    alert('Auth status checker not loaded. Press Ctrl+Shift+A or check console for auth status.');
                }
            });
            
            document.body.appendChild(helpButton);
        }
    }
    
    // Initialize all navigation fixes
    function initializeNavigationFixes() {
        // Skip fixes on auth callback page
        if (fixAuthCallback()) {
            return;
        }
        
        preventRedirectLoops();
        fixCreateBlogButton();
        fixDashboardAccess();
        addNavigationAids();
        
        console.log('✅ Navigation fixes applied');
    }
    
    // Run fixes when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeNavigationFixes);
    } else {
        initializeNavigationFixes();
    }
    
    // Also run when page becomes visible (handles some edge cases)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            setTimeout(initializeNavigationFixes, 100);
        }
    });
    
    console.log('✅ Navigation fix loaded');
    
})();
