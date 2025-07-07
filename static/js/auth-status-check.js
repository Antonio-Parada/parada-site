// Authentication Status Checker
// This script provides comprehensive diagnostics for authentication issues

(function() {
    'use strict';
    
    console.log('🔍 Loading authentication status checker...');
    
    // Add a visual status indicator to the page
    function createStatusIndicator() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'auth-status-indicator';
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            z-index: 999;
            font-size: 12px;
            font-family: monospace;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        
        document.body.appendChild(statusDiv);
        return statusDiv;
    }
    
    // Check authentication status and display results
    function checkAuthStatus() {
        const statusDiv = createStatusIndicator();
        
        const checks = {
            'Google Auth System': typeof window.googleAuth !== 'undefined',
            'Demo Auth System': typeof window.demoAuth !== 'undefined',
            'Auth Fix Script': typeof window.fixAuth !== 'undefined',
            'Google Token': !!localStorage.getItem('google_auth_token'),
            'Google User Data': !!localStorage.getItem('google_user_data'),
            'Token Expiry': localStorage.getItem('google_auth_expiry'),
            'Demo User Data': !!localStorage.getItem('demo_user_data'),
            'Current User (Google)': window.googleAuth?.currentUser?.name || 'None',
            'Current Path': window.location.pathname,
            'Client Secrets Error': false // Will be set if errors detected
        };
        
        // Check token expiry
        const expiry = localStorage.getItem('google_auth_expiry');
        if (expiry) {
            const now = new Date().getTime();
            const isExpired = now >= parseInt(expiry);
            checks['Token Valid'] = !isExpired;
            if (isExpired) {
                checks['Token Status'] = 'EXPIRED';
            } else {
                const minutesLeft = Math.floor((parseInt(expiry) - now) / (1000 * 60));
                checks['Token Status'] = `${minutesLeft}min left`;
            }
        }
        
        // Generate status report
        let statusHTML = '<div style="font-weight: bold; margin-bottom: 10px; color: #0366d6;">🔍 Auth Status</div>';
        
        for (const [check, result] of Object.entries(checks)) {
            const status = result === true ? '✅' : result === false ? '❌' : '📊';
            const value = typeof result === 'boolean' ? (result ? 'Yes' : 'No') : result;
            statusHTML += `<div>${status} ${check}: <span style="color: #666;">${value}</span></div>`;
        }
        
        // Add action buttons
        statusHTML += `
            <div style="margin-top: 15px; text-align: center;">
                <button onclick="window.authStatusChecker.refresh()" style="background: #0366d6; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin: 2px; font-size: 11px;">🔄 Refresh</button>
                <button onclick="window.authStatusChecker.clearAll()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin: 2px; font-size: 11px;">🗑️ Clear All</button>
                <button onclick="window.authStatusChecker.hide()" style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 3px; margin: 2px; font-size: 11px;">❌ Hide</button>
            </div>
        `;
        
        statusDiv.innerHTML = statusHTML;
        
        // Log detailed status to console
        console.log('🔍 Authentication Status Report:', checks);
        
        return checks;
    }
    
    // Clear all authentication data
    function clearAllAuthData() {
        if (confirm('Clear all authentication data? This will log you out and remove all stored tokens.')) {
            // Clear Google OAuth data
            localStorage.removeItem('google_auth_token');
            localStorage.removeItem('google_user_data');
            localStorage.removeItem('google_auth_expiry');
            localStorage.removeItem('google_oauth_state');
            localStorage.removeItem('google_code_verifier');
            
            // Clear demo data
            localStorage.removeItem('demo_user_data');
            localStorage.removeItem('demo_session');
            localStorage.removeItem('demo_auth_token');
            localStorage.removeItem('demo_posts');
            
            // Clear other auth-related data
            localStorage.removeItem('user_posts');
            localStorage.removeItem('user_blog_info');
            
            console.log('✅ All authentication data cleared');
            
            // Refresh the page
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
    
    // Global auth status checker object
    window.authStatusChecker = {
        check: checkAuthStatus,
        refresh: () => {
            document.getElementById('auth-status-indicator')?.remove();
            checkAuthStatus();
        },
        clearAll: clearAllAuthData,
        hide: () => {
            document.getElementById('auth-status-indicator')?.remove();
        },
        show: checkAuthStatus
    };
    
    // Auto-run status check if there are authentication issues
    function autoCheckIfNeeded() {
        const currentPath = window.location.pathname;
        
        // Auto-check on dashboard or create-blog pages
        if (currentPath.includes('/dashboard') || currentPath.includes('/create-blog')) {
            const hasToken = localStorage.getItem('google_auth_token');
            const hasExpiry = localStorage.getItem('google_auth_expiry');
            
            if (!hasToken || !hasExpiry) {
                console.log('🔍 Authentication issues detected, showing status checker');
                setTimeout(checkAuthStatus, 2000);
            } else {
                // Check if token is expired
                const now = new Date().getTime();
                const expiry = parseInt(hasExpiry);
                if (now >= expiry) {
                    console.log('🔍 Expired token detected, showing status checker');
                    setTimeout(checkAuthStatus, 2000);
                }
            }
        }
    }
    
    // Keyboard shortcut to show status checker (Ctrl+Shift+A)
    document.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.shiftKey && event.key === 'A') {
            event.preventDefault();
            checkAuthStatus();
        }
    });
    
    // Run auto-check when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoCheckIfNeeded);
    } else {
        autoCheckIfNeeded();
    }
    
    console.log('✅ Authentication status checker loaded (Press Ctrl+Shift+A to show status)');
    
})();
