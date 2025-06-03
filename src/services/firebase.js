// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "tasktally-bc045.firebaseapp.com",
  projectId: "tasktally-bc045",
  storageBucket: "tasktally-bc045.firebasestorage.app",
  messagingSenderId: "317313580587",
  appId: "1:317313580587:web:b3b8f221d3156b3ab4346e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);