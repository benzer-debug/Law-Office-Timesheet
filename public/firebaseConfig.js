/**
 * Firebase Configuration Module
 * Load configuration from environment or window.FIREBASE_CONFIG
 */

// Load configuration from environment or use defaults
const firebaseConfig = {
  apiKey: window.FIREBASE_CONFIG?.apiKey || import.meta?.env?.VITE_FIREBASE_API_KEY || "AIzaSyAmBi8tP4r4zpr3_6y-4Ncek0yk1oLokOs",
  authDomain: window.FIREBASE_CONFIG?.authDomain || import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN || "law-office-apps.firebaseapp.com",
  projectId: window.FIREBASE_CONFIG?.projectId || import.meta?.env?.VITE_FIREBASE_PROJECT_ID || "law-office-apps",
  storageBucket: window.FIREBASE_CONFIG?.storageBucket || import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET || "law-office-apps.firebasestorage.app",
  messagingSenderId: window.FIREBASE_CONFIG?.messagingSenderId || import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "2997240910",
  appId: window.FIREBASE_CONFIG?.appId || import.meta?.env?.VITE_FIREBASE_APP_ID || "1:2997240910:web:d32c1c04f947fe34436f1f",
  measurementId: window.FIREBASE_CONFIG?.measurementId || import.meta?.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-R3P17HDL3G"
};

export default firebaseConfig;
