# USAP Webapp

This repository contains the source code for the USAP web application. Follow the steps below to set up and configure the project.

## Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=<your-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-messaging-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
```

Replace `<your-...>` placeholders with the respective values from your Firebase project settings.

## Setting Up Firestore Indexes

Firestore requires indexes for certain queries. Follow the steps below to configure them.

### Method 1: Firebase CLI (Recommended)

1. **Install Firebase CLI**:  
   If you haven't already, install the Firebase CLI globally:  
   ```bash
   npm install -g firebase-tools
   ```

2. **Log in to Firebase**:  
   Log in to your Firebase account:  
   ```bash
   firebase login
   ```

3. **Initialize Firebase in Your Project**:  
   Run the initialization command and follow the prompts:  
   ```bash
   firebase init
   ```
   - Select **"Firestore"** when prompted to configure features.
   - Choose your Firebase project from the list.

4. **Deploy Firestore Indexes**:  
   Once initialized, deploy the required indexes:  
   ```bash
   firebase deploy --only firestore:indexes
   ```

---

### Method 2: Manual Setup via Firebase Console

If you'd prefer to configure indexes manually:

1. Go to the [Firebase Console](https://console.firebase.google.com).  
2. Select your project.  
3. Navigate to **Firestore Database** > **Indexes** tab.  
4. Click on **"Add Index"** and create the following indexes:

   **Index 1**:  
   - **Collection ID**: `users`  
   - **Fields**:  
     - `is_searching` (Ascending)  
     - `current_session` (Ascending)  
     - `uuid` (Ascending)  
   - **Query Scope**: Collection  

   **Index 2**:  
   - **Collection ID**: `messages`  
   - **Fields**:  
     - `session_id` (Ascending)  
     - `timestamp` (Ascending)  
   - **Query Scope**: Collection  

5. Click **"Create Index"** to save the configuration.


## Additional Notes

- Ensure your Firebase project is properly linked to the application in the `.env.local` file.  
- For more details about setting up Firestore indexes, refer to the [Firebase Firestore Index Documentation](https://firebase.google.com/docs/firestore/query-data/indexing).  

---