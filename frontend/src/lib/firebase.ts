import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyA8U0qX_mockPrasadCementAppKey2026',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'prasad-cement-products.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'prasad-cement-products',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'prasad-cement-products.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '9912179771',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:9912179771:web:7f6d8920194a0e71',
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface GoogleAuthResult {
  email: string;
  name: string;
  photoURL?: string;
  phone?: string;
  uid: string;
}

/**
 * Real-time Firebase Authentication with Google Accounts
 * Opens the authentic Google account selection dialog directly.
 */
export async function signInWithGoogleRealtime(): Promise<GoogleAuthResult> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const user = credential.user;

    return {
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'Google User',
      photoURL: user.photoURL || undefined,
      phone: user.phoneNumber || undefined,
      uid: user.uid,
    };
  } catch (error: any) {
    // If popup was blocked, attempt redirect
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-In...');
    }

    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was cancelled.');
    }

    // If API key is not yet configured with an active Firebase project console
    if (error.code === 'auth/api-key-not-valid' || error.code === 'auth/invalid-api-key') {
      console.warn('Firebase API key pending configuration in .env.local');
      // Prompt user or throw clear message
      throw new Error('Firebase Authentication is ready. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY is configured in your Firebase Console.');
    }

    console.error('Firebase Google Sign-In Error:', error);
    throw new Error(error.message || 'Google Sign-In failed');
  }
}

export async function checkRedirectResult(): Promise<GoogleAuthResult | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return {
        email: result.user.email || '',
        name: result.user.displayName || 'Google User',
        photoURL: result.user.photoURL || undefined,
        phone: result.user.phoneNumber || undefined,
        uid: result.user.uid,
      };
    }
  } catch (error) {
    console.warn('Firebase redirect error:', error);
  }
  return null;
}

export { firebaseSignOut };
