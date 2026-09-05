import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { UserProfile } from '../types';

// Read config from Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization error, using local fallback:', err);
  }
}

export { auth, db };

// Fallback user storage for preview / offline demo
const LOCAL_STORAGE_USER_KEY = 'pfm_active_user';

export const getStoredLocalUser = (): UserProfile => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return {
    uid: 'demo_user_alex',
    email: 'alex.hackathon@gmail.com',
    displayName: 'Alex Morgan',
    photoURL: null,
    isAnonymous: false,
  };
};

export const setStoredLocalUser = (user: UserProfile) => {
  localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
};

export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  if (auth) {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    return {
      uid: res.user.uid,
      email: res.user.email,
      displayName: res.user.displayName || email.split('@')[0],
      photoURL: res.user.photoURL,
    };
  }
  // Local fallback
  const user: UserProfile = {
    uid: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email,
    displayName: email.split('@')[0],
  };
  setStoredLocalUser(user);
  return user;
}

export async function registerWithEmail(email: string, pass: string): Promise<UserProfile> {
  if (auth) {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    return {
      uid: res.user.uid,
      email: res.user.email,
      displayName: res.user.displayName || email.split('@')[0],
      photoURL: res.user.photoURL,
    };
  }
  // Local fallback
  const user: UserProfile = {
    uid: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
    email,
    displayName: email.split('@')[0],
  };
  setStoredLocalUser(user);
  return user;
}

export async function loginWithGoogle(): Promise<UserProfile> {
  if (auth) {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    return {
      uid: res.user.uid,
      email: res.user.email,
      displayName: res.user.displayName,
      photoURL: res.user.photoURL,
    };
  }
  // Local fallback
  const user: UserProfile = {
    uid: 'google_user_demo_101',
    email: 'alex.morgan.google@gmail.com',
    displayName: 'Alex Morgan (Google)',
    photoURL: null,
  };
  setStoredLocalUser(user);
  return user;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
  // Reset local demo user
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
}

export function subscribeToAuth(callback: (user: UserProfile | null) => void): () => void {
  if (auth) {
    return onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          photoURL: firebaseUser.photoURL,
        };
        callback(profile);
      } else {
        callback(null);
      }
    });
  }

  // Fallback: trigger with locally stored user
  const local = getStoredLocalUser();
  callback(local);
  return () => {};
}

export async function getAuthIdToken(): Promise<string | null> {
  if (auth?.currentUser) {
    try {
      return await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn('Failed to retrieve Firebase ID token:', e);
    }
  }
  // If in development/preview without live Firebase config, provide dev test token
  const localUser = getStoredLocalUser();
  return `dev-mock-token-${localUser?.uid || 'demo_user_alex'}`;
}
