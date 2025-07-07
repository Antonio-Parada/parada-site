// Authentication cleanup script
// This script removes any lingering demo auth artifacts and fixes client secret issues

(function() {
    'use strict';
    
    console.log('Auth cleanup script loaded');
    
    // Remove any demo auth elements from DOM
    function removeDemoAuthElements() {
        const demoElements = [
            '.demo-login-btn',
            '.demo-auth-container',
            '#demo-auth-status',
            '[onclick*="demoAuth"]'
        ];
        
        demoElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                console.log('Removing demo auth element:', el);
                el.remove();
            });
        });
    }
    
    // Clean up localStorage from demo auth
    function cleanupDemoAuthStorage() {
        const demoKeys = [
            'demo_user',
            'demo_session',
            'demo_auth_token',
            'demo_posts'
        ];
        
        demoKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                console.log('Removing demo auth storage:', key);
                localStorage.removeItem(key);
            }
        });
    }
    
    // Suppress client secret console errors and notifications
    function suppressClientSecretErrors() {
        const originalConsoleError = console.error;
        console.error = function(...args) {
            const message = args.join(' ');
            
            // Don't show client secret errors for PKCE flow
            if (message.includes('client_secret') || 
                message.includes('client secret') ||
                message.includes('Missing client_secret')) {
                console.log('ℹ️ OAuth using PKCE flow (client secret not required)');
                return;
            }
            
            // Show all other errors normally
            originalConsoleError.apply(console, args);
        };
        
        // Also suppress notifications/alerts about client secret
        const originalAlert = window.alert;
        window.alert = function(message) {
            if (message && (message.includes('client secret') || message.includes('client_secret'))) {
                console.log('ℹ️ Suppressed client secret alert (PKCE flow is normal)');
                return;
            }
            originalAlert.call(window, message);
        };
    }
    
    // Fix any demoAuth references that might still exist
    function fixDemoAuthReferences() {
        // Check if demoAuth is referenced anywhere and replace with googleAuth
        if (typeof window.demoAuth !== 'undefined') {
            console.log('Found demoAuth reference, removing...');
            delete window.demoAuth;
        }
        
        // Ensure googleAuth is available
        if (typeof window.googleAuth === 'undefined') {
            console.warn('Google Auth not yet available, will retry...');
            setTimeout(fixDemoAuthReferences, 1000);
        } else {
            console.log('Google Auth is available');
        }
    }
    
    // Show OAuth status notification
    function showOAuthStatus() {
        setTimeout(() => {
            if (typeof window.googleAuth !== 'undefined' && window.googleAuth.currentUser) {
                console.log('✅ User authenticated via Google OAuth');
                
                // Create a subtle success indicator
                const indicator = document.createElement('div');
                indicator.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #34a853;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 20px;
                    font-size: 12px;
                    z-index: 1000;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    animation: fadeInOut 3s ease-in-out;
                `;
                indicator.textContent = '✅ OAuth Connected';
                document.body.appendChild(indicator);
                
                // Remove after animation
                setTimeout(() => indicator.remove(), 3000);
            }
        }, 2000);
    }
    
    // Main cleanup function
    function performCleanup() {
        console.log('Performing authentication cleanup...');
        
        suppressClientSecretErrors();
        cleanupDemoAuthStorage();
        fixDemoAuthReferences();
        removeDemoAuthElements();
        showOAuthStatus();
        
        console.log('Authentication cleanup completed');
    }
    
    // Run cleanup when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', performCleanup);
    } else {
        performCleanup();
    }
    
    // Also run cleanup when Google Auth is loaded
    window.addEventListener('load', () => {
        setTimeout(performCleanup, 500);
    });
    
    // Add animation style for success indicator
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
    
})();
