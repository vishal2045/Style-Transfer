// Environment configuration
// This file sets up environment-specific variables
window.ENV = window.ENV || {};

// Check if we're in production (Render deployment)
const isProduction = window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    window.location.hostname !== '0.0.0.0';

// Validate origin for security
function validateOrigin() {
    const allowedDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0',
        // Add your Render domain here
        'your-app-name.onrender.com'
    ];

    const currentHost = window.location.hostname;
    return allowedDomains.some(domain => currentHost.includes(domain));
}

// Fetch Firebase configuration from backend
async function loadFirebaseConfig() {
    try {
        // Validate origin before making request
        if (!validateOrigin()) {
            console.error('Unauthorized domain detected');
            throw new Error('Unauthorized domain');
        }

        const response = await fetch('/config/firebase', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            // Add timeout
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validate the config structure
        if (!data.firebase || !data.firebase.apiKey) {
            throw new Error('Invalid Firebase configuration received');
        }

        window.ENV.FIREBASE_CONFIG = data.firebase;
        console.log('Firebase config loaded from backend successfully');

        // Initialize Firebase after config is loaded
        if (typeof initializeFirebase === 'function') {
            initializeFirebase();
        }
    } catch (error) {
        console.warn('Failed to load Firebase config from backend:', error);

        // Only use fallback in development
        if (!isProduction) {
            console.log('Using development fallback configuration');
            window.ENV.FIREBASE_CONFIG = {
                apiKey: "development-api-key",
                authDomain: "your-project.firebaseapp.com",
                projectId: "your-project-id",
                storageBucket: "your-project.appspot.com",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef",
                measurementId: "G-XXXXXXX"
            };
        } else {
            console.error('Cannot load Firebase configuration in production');
            // Show user-friendly error
            showConfigError();
        }
    }
}

// Show user-friendly error for configuration issues
function showConfigError() {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff4444;
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
    `;
    errorDiv.textContent = 'Configuration error. Please refresh the page or contact support.';
    document.body.appendChild(errorDiv);
}

// Load configuration immediately
loadFirebaseConfig();

console.log('Environment:', isProduction ? 'Production' : 'Development');
console.log('Current hostname:', window.location.hostname);