// OAuth Debug Script
// This script will help identify the specific OAuth error

console.log('OAuth Debug Script Loaded');

// Log current environment
console.log('Current Environment:', {
    hostname: window.location.hostname,
    pathname: window.location.pathname,
    origin: window.location.origin,
    url: window.location.href
});

// Check if Google Auth is available
if (typeof googleAuth !== 'undefined') {
    console.log('Google Auth available:', googleAuth);
    console.log('Current User:', googleAuth.currentUser);
    console.log('Client ID:', googleAuth.clientId);
    console.log('Redirect URI:', googleAuth.redirectUri);
} else {
    console.log('Google Auth not available');
}

// Override the login function to capture errors
window.debugOAuthLogin = function() {
    console.log('Debug OAuth Login Called');
    
    if (typeof googleAuth !== 'undefined') {
        // Capture the original login function
        const originalLogin = googleAuth.login.bind(googleAuth);
        
        // Override with debug version
        googleAuth.login = async function() {
            console.log('Login attempt started');
            console.log('Redirect URI being used:', this.redirectUri);
            
            try {
                await originalLogin();
                console.log('Login initiated successfully');
            } catch (error) {
                console.error('Login error captured:', error);
                console.error('Error stack:', error.stack);
                
                // Display error to user
                const errorDiv = document.createElement('div');
                errorDiv.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #f8d7da;
                    color: #721c24;
                    padding: 20px;
                    border: 1px solid #f5c6cb;
                    border-radius: 5px;
                    z-index: 2000;
                    max-width: 500px;
                `;
                errorDiv.innerHTML = `
                    <h3>OAuth Error Detected</h3>
                    <p><strong>Error:</strong> ${error.message}</p>
                    <p><strong>Redirect URI:</strong> ${this.redirectUri}</p>
                    <p><strong>Client ID:</strong> ${this.clientId}</p>
                    <button onclick="this.parentElement.remove()">Close</button>
                `;
                document.body.appendChild(errorDiv);
            }
        };
        
        // Call the debug version
        googleAuth.login();
    } else {
        alert('Google Auth not available. Check console for details.');
    }
};

// Add a debug button to the page
document.addEventListener('DOMContentLoaded', function() {
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Debug OAuth Login';
    debugButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        background: #ff6b6b;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 1000;
        font-size: 12px;
    `;
    debugButton.onclick = window.debugOAuthLogin;
    document.body.appendChild(debugButton);
});

// Monitor for OAuth errors in console
window.addEventListener('error', function(e) {
    if (e.message.includes('oauth') || e.message.includes('auth')) {
        console.error('OAuth-related error detected:', e);
    }
});

// Log when page is fully loaded
window.addEventListener('load', function() {
    console.log('Page fully loaded, checking OAuth state...');
    
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    
    if (code || error || state) {
        console.log('OAuth callback detected:', { code: !!code, error, state });
    }
});
