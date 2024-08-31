"use client";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";

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
const app = initializeApp(firebaseConfig);

// Connect to Firestore
export const db = getFirestore(app);

// Connect to Firebase auth
export const auth = getAuth(app);

// Sign in with Clerk and Firebase
export const signIntoFirebaseWithClerk = async (getToken) => {
  try {
    const token = await getToken({ template: "integration_firebase" });
    console.log("Retrieved JWT token:", token);

    const userCredentials = await signInWithCustomToken(auth, token || "");
    console.log("User:", userCredentials.user);
  } catch (error) {
    console.error("Error signing in with Clerk and Firebase:", error);
  }
};
