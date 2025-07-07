// Authentication Debug Tool
// Provides detailed debugging information for authentication issues

(function() {
    'use strict';
    
    console.log('🐛 Loading authentication debug tool...');
    
    // Debug state tracking
    let debugState = {
        networkRequests: [],
        authEvents: [],
        redirectHistory: [],
        errors: [],
        startTime: Date.now()
    };
    
    // Intercept fetch requests to track network issues
    function interceptNetworkRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const startTime = Date.now();
            const [url, options] = args;
            
            const requestInfo = {
                url: url.toString(),
                method: options?.method || 'GET',
                timestamp: startTime,
                headers: options?.headers || {}
            };
            
            console.log('🌐 Network request:', requestInfo);
            
            try {
                const response = await originalFetch.apply(this, args);
                const endTime = Date.now();
                
                const responseInfo = {
                    ...requestInfo,
                    status: response.status,
                    statusText: response.statusText,
                    duration: endTime - startTime,
                    success: response.ok
                };
                
                debugState.networkRequests.push(responseInfo);
                
                if (!response.ok) {
                    console.error('❌ Network request failed:', responseInfo);
                    debugState.errors.push({
                        type: 'network',
                        message: `${response.status} ${response.statusText}`,
                        details: responseInfo,
                        timestamp: Date.now()
                    });
                } else {
                    console.log('✅ Network request successful:', responseInfo);
                }
                
                return response;
            } catch (error) {
                const endTime = Date.now();
                
                const errorInfo = {
                    ...requestInfo,
                    error: error.message,
                    duration: endTime - startTime,
                    success: false
                };
                
                debugState.networkRequests.push(errorInfo);
                debugState.errors.push({
                    type: 'network_error',
                    message: error.message,
                    details: errorInfo,
                    timestamp: Date.now()
                });
                
                console.error('💥 Network request error:', errorInfo);
                throw error;
            }
        };
    }
    
    // Track authentication events
    function trackAuthEvents() {
        // Monitor localStorage changes
        const originalSetItem = Storage.prototype.setItem;
        const originalRemoveItem = Storage.prototype.removeItem;
        
        Storage.prototype.setItem = function(key, value) {
            if (key.includes('auth') || key.includes('oauth') || key.includes('google')) {
                const event = {
                    type: 'localStorage_set',
                    key,
                    value: value.substring(0, 100) + (value.length > 100 ? '...' : ''),
                    timestamp: Date.now()
                };
                debugState.authEvents.push(event);
                console.log('💾 Auth localStorage set:', event);
            }
            return originalSetItem.call(this, key, value);
        };
        
        Storage.prototype.removeItem = function(key) {
            if (key.includes('auth') || key.includes('oauth') || key.includes('google')) {
                const event = {
                    type: 'localStorage_remove',
                    key,
                    timestamp: Date.now()
                };
                debugState.authEvents.push(event);
                console.log('🗑️ Auth localStorage remove:', event);
            }
            return originalRemoveItem.call(this, key);
        };
        
        // Track page redirects
        const originalAssign = window.location.assign;
        const originalReplace = window.location.replace;
        
        if (originalAssign) {
            window.location.assign = function(url) {
                const event = {
                    type: 'redirect_assign',
                    url,
                    from: window.location.href,
                    timestamp: Date.now()
                };
                debugState.redirectHistory.push(event);
                console.log('🔄 Page redirect (assign):', event);
                return originalAssign.call(this, url);
            };
        }
        
        if (originalReplace) {
            window.location.replace = function(url) {
                const event = {
                    type: 'redirect_replace',
                    url,
                    from: window.location.href,
                    timestamp: Date.now()
                };
                debugState.redirectHistory.push(event);
                console.log('🔄 Page redirect (replace):', event);
                return originalReplace.call(this, url);
            };
        }
        
        // Track href changes
        const originalHrefSetter = Object.getOwnPropertyDescriptor(window.location, 'href').set;
        Object.defineProperty(window.location, 'href', {
            set: function(url) {
                const event = {
                    type: 'redirect_href',
                    url,
                    from: window.location.href,
                    timestamp: Date.now()
                };
                debugState.redirectHistory.push(event);
                console.log('🔄 Page redirect (href):', event);
                return originalHrefSetter.call(this, url);
            },
            get: function() {
                return window.location.href;
            }
        });
    }
    
    // Detect authentication loops
    function detectAuthLoops() {
        const recentRedirects = debugState.redirectHistory.filter(
            event => Date.now() - event.timestamp < 30000
        );
        
        const pathCounts = {};
        recentRedirects.forEach(redirect => {
            const path = new URL(redirect.url, window.location.origin).pathname;
            pathCounts[path] = (pathCounts[path] || 0) + 1;
        });
        
        const loops = Object.entries(pathCounts).filter(([path, count]) => count >= 3);
        
        if (loops.length > 0) {
            console.warn('🔄 Authentication loops detected:', loops);
            debugState.errors.push({
                type: 'auth_loop',
                message: 'Authentication redirect loops detected',
                details: { loops, redirectHistory: recentRedirects },
                timestamp: Date.now()
            });
            return true;
        }
        
        return false;
    }
    
    // Generate comprehensive debug report
    function generateDebugReport() {
        const authStatus = {
            googleToken: !!localStorage.getItem('google_auth_token'),
            googleUser: !!localStorage.getItem('google_user_data'),
            googleExpiry: localStorage.getItem('google_auth_expiry'),
            googleState: localStorage.getItem('google_oauth_state'),
            codeVerifier: !!localStorage.getItem('google_code_verifier'),
            returnAction: localStorage.getItem('oauth_return_action')
        };
        
        if (authStatus.googleExpiry) {
            const now = Date.now();
            const expiry = parseInt(authStatus.googleExpiry);
            authStatus.tokenValid = now < expiry;
            authStatus.tokenExpiresIn = Math.max(0, expiry - now);
        }
        
        const browserInfo = {
            userAgent: navigator.userAgent,
            cookies: document.cookie !== '',
            localStorage: typeof Storage !== 'undefined',
            thirdPartyCookies: 'unknown', // Would need actual test
            javascriptEnabled: true,
            currentPath: window.location.pathname,
            currentUrl: window.location.href,
            referrer: document.referrer
        };
        
        const report = {
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - debugState.startTime,
            authStatus,
            browserInfo,
            networkRequests: debugState.networkRequests,
            authEvents: debugState.authEvents,
            redirectHistory: debugState.redirectHistory,
            errors: debugState.errors,
            loops: detectAuthLoops()
        };
        
        return report;
    }
    
    // Display debug information in UI
    function showDebugUI() {
        const report = generateDebugReport();
        
        // Remove existing debug UI
        const existingDebug = document.getElementById('auth-debug-ui');
        if (existingDebug) {
            existingDebug.remove();
        }
        
        const debugUI = document.createElement('div');
        debugUI.id = 'auth-debug-ui';
        debugUI.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: #1e1e1e;
            color: #fff;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 600px;
            max-height: 80vh;
            overflow: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        `;
        
        debugUI.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3 style="margin: 0; color: #4fc3f7;">🐛 Auth Debug Report</h3>
                <button onclick="this.parentElement.parentElement.remove()" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">×</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #81c784; margin: 0 0 8px 0;">🔐 Auth Status</h4>
                <div style="background: #2d2d2d; padding: 10px; border-radius: 4px;">
                    ${Object.entries(report.authStatus).map(([key, value]) => 
                        `<div>${key}: <span style="color: ${value === true ? '#4caf50' : value === false ? '#f44336' : '#ffeb3b'}">${JSON.stringify(value)}</span></div>`
                    ).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #81c784; margin: 0 0 8px 0;">🌐 Network Requests (${report.networkRequests.length})</h4>
                <div style="background: #2d2d2d; padding: 10px; border-radius: 4px; max-height: 150px; overflow-y: auto;">
                    ${report.networkRequests.slice(-5).map(req => 
                        `<div style="color: ${req.success ? '#4caf50' : '#f44336'}; margin-bottom: 5px;">
                            ${req.method} ${req.url} - ${req.status || 'ERROR'} (${req.duration}ms)
                        </div>`
                    ).join('') || '<div style="color: #666;">No network requests</div>'}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #81c784; margin: 0 0 8px 0;">🔄 Redirects (${report.redirectHistory.length})</h4>
                <div style="background: #2d2d2d; padding: 10px; border-radius: 4px; max-height: 120px; overflow-y: auto;">
                    ${report.redirectHistory.slice(-5).map(redirect => 
                        `<div style="margin-bottom: 5px;">
                            ${redirect.type}: ${redirect.url}
                        </div>`
                    ).join('') || '<div style="color: #666;">No redirects</div>'}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #f44336; margin: 0 0 8px 0;">❌ Errors (${report.errors.length})</h4>
                <div style="background: #2d2d2d; padding: 10px; border-radius: 4px; max-height: 120px; overflow-y: auto;">
                    ${report.errors.slice(-5).map(error => 
                        `<div style="color: #f44336; margin-bottom: 5px;">
                            ${error.type}: ${error.message}
                        </div>`
                    ).join('') || '<div style="color: #4caf50;">No errors detected</div>'}
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button onclick="window.authDebugger.clearAuth()" style="background: #ff9800; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">🗑️ Clear Auth</button>
                <button onclick="window.authDebugger.refresh()" style="background: #2196f3; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">🔄 Refresh</button>
                <button onclick="window.authDebugger.exportReport()" style="background: #4caf50; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 11px;">📄 Export</button>
            </div>
        `;
        
        document.body.appendChild(debugUI);
    }
    
    // Global debug interface
    window.authDebugger = {
        show: showDebugUI,
        report: generateDebugReport,
        clearAuth: () => {
            localStorage.clear();
            console.log('🗑️ All localStorage cleared');
            location.reload();
        },
        refresh: () => {
            document.getElementById('auth-debug-ui')?.remove();
            showDebugUI();
        },
        exportReport: () => {
            const report = generateDebugReport();
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `auth-debug-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        },
        state: debugState
    };
    
    // Initialize debugging
    function initializeDebugger() {
        interceptNetworkRequests();
        trackAuthEvents();
        
        console.log('✅ Authentication debugger loaded');
        console.log('💡 Use window.authDebugger.show() to open debug UI');
    }
    
    // Auto-detect authentication issues
    function autoDetectIssues() {
        setTimeout(() => {
            const report = generateDebugReport();
            
            // Check for common issues
            const issues = [];
            
            if (report.errors.length > 0) {
                issues.push('Errors detected');
            }
            
            if (report.loops) {
                issues.push('Authentication loops detected');
            }
            
            if (report.networkRequests.some(req => !req.success)) {
                issues.push('Failed network requests');
            }
            
            if (issues.length > 0) {
                console.warn('⚠️ Authentication issues detected:', issues);
                // Auto-show debug UI if on dashboard or create-blog pages
                const path = window.location.pathname;
                if (path.includes('/dashboard') || path.includes('/create-blog')) {
                    setTimeout(showDebugUI, 2000);
                }
            }
        }, 3000);
    }
    
    // Keyboard shortcut: Ctrl+Shift+D
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.shiftKey && event.key === 'D') {
            event.preventDefault();
            showDebugUI();
        }
    });
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDebugger);
    } else {
        initializeDebugger();
    }
    
    // Auto-detect issues after initialization
    setTimeout(autoDetectIssues, 1000);
    
})();
