"use client";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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

export { db, auth };

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
