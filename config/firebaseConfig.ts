import { initializeApp, FirebaseApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase config keys
// You can get these from the Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase should be initialized (only if config is set)
const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY";

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
    try {
        // Initialize Firebase only if properly configured
        app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        dbInstance = getFirestore(app);
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
    }
}

// Export mock objects if Firebase is not configured
export const auth = authInstance as any;
export const db = dbInstance as any;
export const isFirebaseEnabled = isFirebaseConfigured && app !== null;
