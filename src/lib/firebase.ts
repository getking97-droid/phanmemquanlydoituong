// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTWjbPDpXT_XzHSNR73cwHIxPORDG0Y8k",
  authDomain: "phanmemquanlydoituong-ed2ab.firebaseapp.com",
  projectId: "phanmemquanlydoituong-ed2ab",
  storageBucket: "phanmemquanlydoituong-ed2ab.firebasestorage.app",
  messagingSenderId: "303999897319",
  appId: "1:303999897319:web:5dd49ef0a5521e3b625c42",
  measurementId: "G-JVTDYJ998H"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth and Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only in browser environments (Next.js SSR compatibility)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, analytics, auth, db };
