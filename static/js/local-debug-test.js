// Local Debug Test Script
// This script simulates authentication issues for testing the debug tools locally

(function() {
    'use strict';
    
    console.log('🧪 Loading local debug test script...');
    
    // Wait for other scripts to load
    setTimeout(() => {
        runDebugTests();
    }, 2000);
    
    function runDebugTests() {
        console.log('🧪 Starting debug tool tests...');
        
        // Test 1: Simulate some network requests
        simulateNetworkRequests();
        
        // Test 2: Simulate authentication events
        simulateAuthEvents();
        
        // Test 3: Simulate redirect history
        simulateRedirectHistory();
        
        // Test 4: Simulate some errors
        simulateErrors();
        
        // Show completion message
        setTimeout(() => {
            console.log('✅ Debug test simulation complete!');
            console.log('💡 Try these commands:');
            console.log('   window.authStatusChecker.show()  // Quick status');
            console.log('   window.authDebugger.show()       // Full debug UI');
            console.log('   Or press Ctrl+Shift+A or Ctrl+Shift+D');
            
            // Auto-show debug tools if no real auth issues
            if (window.location.pathname === '/') {
                setTimeout(() => {
                    if (window.authStatusChecker) {
                        window.authStatusChecker.show();
                    }
                }, 3000);
            }
        }, 5000);
    }
    
    function simulateNetworkRequests() {
        // Simulate successful request
        if (window.authDebugger) {
            window.authDebugger.state.networkRequests.push({
                url: '/.netlify/functions/create-blog',
                method: 'POST',
                timestamp: Date.now() - 10000,
                status: 404,
                statusText: 'Not Found',
                duration: 1500,
                success: false
            });
            
            window.authDebugger.state.networkRequests.push({
                url: '/api/user-info',
                method: 'GET',
                timestamp: Date.now() - 5000,
                status: 200,
                statusText: 'OK',
                duration: 250,
                success: true
            });
            
            window.authDebugger.state.errors.push({
                type: 'network',
                message: '404 Not Found',
                details: { url: '/.netlify/functions/create-blog', method: 'POST' },
                timestamp: Date.now() - 10000
            });
        }
    }
    
    function simulateAuthEvents() {
        // Simulate localStorage events
        if (window.authDebugger) {
            window.authDebugger.state.authEvents.push({
                type: 'localStorage_set',
                key: 'google_auth_token',
                value: 'ya29.a0ARrdaM9...',
                timestamp: Date.now() - 8000
            });
            
            window.authDebugger.state.authEvents.push({
                type: 'localStorage_set',
                key: 'google_user_data',
                value: '{"id":"123","name":"Test User","email":"test@example.com"}',
                timestamp: Date.now() - 7500
            });
            
            window.authDebugger.state.authEvents.push({
                type: 'localStorage_remove',
                key: 'google_oauth_state',
                timestamp: Date.now() - 3000
            });
        }
    }
    
    function simulateRedirectHistory() {
        if (window.authDebugger) {
            window.authDebugger.state.redirectHistory.push({
                type: 'redirect_href',
                url: 'https://accounts.google.com/o/oauth2/v2/auth?...',
                from: window.location.href,
                timestamp: Date.now() - 15000
            });
            
            window.authDebugger.state.redirectHistory.push({
                type: 'redirect_href',
                url: window.location.origin + '/auth/callback/?code=...',
                from: 'https://accounts.google.com/...',
                timestamp: Date.now() - 12000
            });
            
            window.authDebugger.state.redirectHistory.push({
                type: 'redirect_href',
                url: window.location.origin + '/dashboard/',
                from: window.location.origin + '/auth/callback/',
                timestamp: Date.now() - 10000
            });
        }
    }
    
    function simulateErrors() {
        if (window.authDebugger) {
            window.authDebugger.state.errors.push({
                type: 'auth_validation',
                message: 'Token expired, automatic refresh attempted',
                timestamp: Date.now() - 6000
            });
        }
    }
    
    // Add some fake localStorage data for testing
    localStorage.setItem('google_auth_token', 'test_token_for_demo');
    localStorage.setItem('google_user_data', JSON.stringify({
        id: '123456789',
        name: 'Demo User',
        email: 'demo@example.com',
        picture: 'https://via.placeholder.com/32'
    }));
    localStorage.setItem('google_auth_expiry', (Date.now() + 3600000).toString()); // 1 hour from now
    
    // Global test commands
    window.debugTest = {
        clear: () => {
            localStorage.clear();
            console.log('🗑️ Test data cleared');
        },
        
        simulateLoop: () => {
            if (window.authDebugger) {
                // Simulate rapid redirects to same page
                for (let i = 0; i < 5; i++) {
                    window.authDebugger.state.redirectHistory.push({
                        type: 'redirect_href',
                        url: window.location.href,
                        from: window.location.href,
                        timestamp: Date.now() - (i * 1000)
                    });
                }
                console.log('🔄 Simulated authentication loop');
                window.authDebugger.refresh();
            }
        },
        
        simulateNetworkError: () => {
            if (window.authDebugger) {
                window.authDebugger.state.networkRequests.push({
                    url: '/.netlify/functions/create-blog',
                    method: 'POST',
                    timestamp: Date.now(),
                    error: 'Network Error: Failed to fetch',
                    duration: 5000,
                    success: false
                });
                
                window.authDebugger.state.errors.push({
                    type: 'network_error',
                    message: 'Failed to fetch',
                    details: { url: '/.netlify/functions/create-blog' },
                    timestamp: Date.now()
                });
                
                console.log('💥 Simulated network error');
                window.authDebugger.refresh();
            }
        },
        
        showHelp: () => {
            console.log(`
🧪 Debug Test Commands:
  debugTest.clear()              // Clear test data
  debugTest.simulateLoop()       // Simulate auth loop
  debugTest.simulateNetworkError() // Simulate network error
  debugTest.showHelp()           // Show this help

🛠️ Debug Tools:
  authStatusChecker.show()       // Quick status (Ctrl+Shift+A)
  authDebugger.show()           // Full debug UI (Ctrl+Shift+D)
  authDebugger.exportReport()   // Download debug report
  
📝 Test Pages:
  /create-blog/   // Test form submission
  /dashboard/     // Test authentication requirements
            `);
        }
    };
    
    console.log('🧪 Debug test commands available:');
    console.log('   debugTest.showHelp()  // Show all commands');
    
})();
