// Environment configuration
// This file sets up environment-specific variables
window.ENV = window.ENV || {};

// Check if we're in production (Render deployment)
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1' && 
                    window.location.hostname !== '0.0.0.0';

// Fetch Firebase configuration from backend
async function loadFirebaseConfig() {
    try {
        const response = await fetch('/config/firebase');
        const data = await response.json();
        window.ENV.FIREBASE_CONFIG = data.firebase;
        console.log('Firebase config loaded from backend');
    } catch (error) {
        console.warn('Failed to load Firebase config from backend, using fallback:', error);
        // Fallback configuration
        window.ENV.FIREBASE_CONFIG = {
            apiKey: "development-api-key",
            authDomain: "your-project.firebaseapp.com",
            projectId: "your-project-id",
            storageBucket: "your-project.appspot.com",
            messagingSenderId: "123456789", 
            appId: "1:123456789:web:abcdef",
            measurementId: "G-XXXXXXX",
            databaseURL: "https://your-project-default-rtdb.firebaseio.com"
        };
    }
}

// Load configuration immediately
loadFirebaseConfig();

console.log('Environment:', isProduction ? 'Production' : 'Development');