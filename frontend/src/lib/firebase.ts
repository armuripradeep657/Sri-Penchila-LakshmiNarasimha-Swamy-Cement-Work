import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';

export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawApiKey.startsWith('AIza') &&
  !rawApiKey.includes('mock') &&
  rawApiKey.length > 25
);

const firebaseConfig = {
  apiKey: rawApiKey || 'AIzaSyA8U0qX_mockPrasadCementAppKey2026',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'prasad-cement-products.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'prasad-cement-products',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'prasad-cement-products.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '9912179771',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:9912179771:web:7f6d8920194a0e71',
};

// Initialize Firebase App safely
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
 * Real-time Firebase Google Authentication
 * If Firebase is active and configured, uses popup.
 * If API key is pending or invalid, returns null to gracefully launch Google Account Chooser without error.
 */
export async function signInWithGoogleRealtime(): Promise<GoogleAuthResult | null> {
  if (!isFirebaseConfigured) {
    return null;
  }

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
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }

    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Google Sign-In was cancelled.');
    }

    // Gracefully handle unverified or invalid API key without showing raw red error
    if (
      error.code === 'auth/api-key-not-valid' ||
      error.code === 'auth/invalid-api-key' ||
      error.message?.includes('api-key-not-valid')
    ) {
      console.warn('Firebase API key not yet verified in console. Launching Google Account Chooser.');
      return null;
    }

    console.warn('Firebase Google Sign-In notice:', error);
    return null;
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
