import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signInWithCustomToken,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAQHj5YXHG5mYSHsFNiSlzT52eCOka_EXo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-lunch-c8ac3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-lunch-c8ac3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-lunch-c8ac3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "57097962862",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:57097962862:web:19706a061678a92b29ed7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  signInWithCustomToken,
  signInWithRedirect,
  getRedirectResult
};
