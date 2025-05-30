import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  Auth,
} from "firebase/auth";
import { Capacitor } from "@capacitor/core";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

let authInstance: Auth;

export const getFirebaseAuth = async (): Promise<Auth> => {
  if (authInstance) return authInstance;

  if (Capacitor.isNativePlatform()) {
    authInstance = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });
  } else {
    authInstance = getAuth(app);
  }

  return authInstance;
};
