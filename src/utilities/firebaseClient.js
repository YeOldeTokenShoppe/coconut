"use client";
import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { useAuth } from "@clerk/nextjs";
// import admin from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json";

// we are on the client
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

const app = initializeApp(firebaseConfig);
// Connect to your Firestore database
export const db = getFirestore(app);
// Connect to Firebase auth
export const auth = getAuth(app);
// export { signInWithCustomToken };

// export default function FirebaseUI() {
//   const { getToken } = useAuth();
//   const signInWithClerk = async () => {
//     console.log("Sign in with clerk");
//     const token = await getToken({ template: "integration_firebase" });
//     const userCredentials = await signInWithCustomToken(auth, token || "");
//     // The userCredentials.user object can call the methods of
//     // the Firebase platform as an authenticated user.
//     console.log("User:", userCredentials.user);
//   };
// }
