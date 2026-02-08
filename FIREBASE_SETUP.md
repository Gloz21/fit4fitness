# Firebase Cloud Storage Setup Guide

Your fitness app has been successfully migrated to use Firebase for cloud-based storage! Follow these steps to complete the setup.

## What Changed

✅ **Authentication**: Now uses Firebase Auth with email/password (previously local storage with usernames)
✅ **User Data**: Stored in Firestore cloud database (syncs across devices)
✅ **Workouts**: Stored in Firestore (accessible from any device)
✅ **Nutrition Data**: Stored in Firestore (meals, water, sleep tracked in cloud)
✅ **Custom Exercises**: Stored in Firestore (syncs across devices)

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Follow the setup wizard:
   - Enter a project name (e.g., "Fit4Fitness")
   - Choose whether to enable Google Analytics (optional)
   - Click **"Create project"**

### 2. Enable Firebase Authentication

1. In your Firebase project, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Toggle **"Enable"** and click **"Save"**

### 3. Create a Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll set up rules next)
4. Select a Cloud Firestore location (choose one closest to your users)
5. Click **"Enable"**

### 4. Set Up Firestore Security Rules

1. In Firestore Database, go to the **"Rules"** tab
2. Replace the default rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write only their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /workouts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /nutrition/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /exercises/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

### 5. Get Your Firebase Configuration

1. In your Firebase project, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **web icon** (`</>`) to add a web app
5. Register your app with a nickname (e.g., "Fit4Fitness Web")
6. Copy the `firebaseConfig` object

### 6. Update Your Firebase Config File

Open `app/lib/firebaseConfig.ts` and replace the placeholder values with your actual Firebase credentials:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // Replace with your actual API key
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 7. Test Your App

1. Run your app: `npm start`
2. Create a new account with an email and password
3. Complete the onboarding process
4. Add some data (workouts, meals, etc.)
5. Sign out and sign in again - your data should persist!
6. Try signing in from a different device/browser - your data will be there!

## Benefits of Firebase

✅ **Cross-Device Sync**: Access your data from any device
✅ **Cloud Backup**: Your data is automatically backed up
✅ **Real-time Updates**: Changes sync in real-time across devices
✅ **Secure Authentication**: Industry-standard security with Firebase Auth
✅ **Scalable**: Firebase handles millions of users automatically
✅ **Free Tier**: Generous free quota for getting started

## Firebase Free Tier Limits

- **Authentication**: Unlimited users
- **Firestore**: 
  - 1 GB storage
  - 50,000 reads/day
  - 20,000 writes/day
  - 20,000 deletes/day

This should be more than enough for personal use or small-scale deployment!

## Troubleshooting

### "Firebase: Error (auth/api-key-not-valid)"
- Make sure you've updated `firebaseConfig.ts` with your actual Firebase credentials

### "Missing or insufficient permissions"
- Check that your Firestore security rules are set up correctly
- Make sure you're signed in before trying to access data

### Data not syncing
- Check your internet connection
- Open browser console to see any Firebase errors
- Verify Firestore rules allow read/write for authenticated users

## Next Steps

- Enable Google Sign-In or other auth providers
- Add offline support with Firestore persistence
- Set up Cloud Functions for backend logic
- Add Firebase Analytics to track app usage
- Use Firebase Hosting to deploy your app

Enjoy your cloud-powered fitness app! 🎉
