"use client";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, OAuthProvider } from "firebase/auth"; // Correct import for OAuthProvider
import { getStorage } from "firebase/storage"; // Correct import for storage

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Ensure storage is initialized

// Register custom OIDC provider for Discord
const discordProvider = new OAuthProvider("oidc.discord");

export { auth, db, storage, discordProvider };

// Initialize FirebaseUI (only when on the client side)
export function initializeFirebaseUI() {
  if (typeof window !== "undefined") {
    // Import firebaseui dynamically
    const firebaseui = require("firebaseui");

    // Check if an AuthUI instance already exists, else create one
    if (!firebaseui.auth.AuthUI.getInstance()) {
      return new firebaseui.auth.AuthUI(auth);
    } else {
      return firebaseui.auth.AuthUI.getInstance();
    }
  }
  return null; // Return null if not on the client side
}
