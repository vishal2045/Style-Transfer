# Firebase Security Configuration

## 1. Firestore Security Rules

Add these rules to your Firestore Database Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User style transfers - users can only access their own
    match /style_transfers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow reading individual transfer documents
      match /transfers/{transferId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Public gallery (if you want to share some transfers)
    match /public_gallery/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 2. Realtime Database Security Rules

If you're using Realtime Database, add these rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "style_transfers": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## 3. Storage Security Rules

For Firebase Storage (if you're storing images):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can only upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Style transfer results
    match /style_transfers/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Firebase Console Security Settings

### Domain Restrictions:
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Authorized domains"
3. Add your Render domain: `your-app-name.onrender.com`
4. Remove `localhost` for production (keep for development)

### API Key Restrictions:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Find your Firebase API key
3. Click "Edit"
4. Under "Application restrictions" → "HTTP referrers"
5. Add:
   - `https://your-app-name.onrender.com/*`
   - `https://your-domain.com/*` (if you have a custom domain)

## 5. Authentication Settings

### Email/Password Configuration:
1. Firebase Console → Authentication → Settings → User actions
2. Enable "Email enumeration protection"
3. Set appropriate password requirements

### Session Management:
```javascript
// In your script.js, add session timeout
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Check if session is still valid
    const lastSignIn = new Date(user.metadata.lastSignInTime);
    const now = new Date();
    
    if (now - lastSignIn > SESSION_TIMEOUT) {
      signOut(auth);
      window.location.href = 'index.html';
    }
  }
});
```

## 6. Additional Security Measures

### Rate Limiting:
- Firebase automatically provides some rate limiting
- Consider implementing additional rate limiting in your FastAPI backend

### Input Validation:
- Validate all user inputs before sending to Firebase
- Sanitize file uploads in your backend

### HTTPS Only:
- Ensure your Render deployment uses HTTPS
- Firebase requires HTTPS for authentication in production