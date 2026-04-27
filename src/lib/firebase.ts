import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics, isSupported } from "firebase/analytics";

const env = (import.meta as any).env || {};

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCX0BYVq3qQtFxrGxl0F2JyfmiLsen1-9w",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "unreal-scraper.firebaseapp.com",
  databaseURL: env.VITE_FIREBASE_DATABASE_URL || "https://unreal-scraper-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "unreal-scraper",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "unreal-scraper.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "942473199743",
  appId: env.VITE_FIREBASE_APP_ID || "1:942473199743:web:5cb68872cb7ea8f66b7f4a",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-H2N52W586W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const db = getDatabase(app);

// Initialize Analytics (optional, checks if supported in environment)
export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
