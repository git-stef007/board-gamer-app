import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.boardgamer.app',
  appName: 'board-gamer-app',
  webDir: 'dist',
  plugins: {
    FirebaseApp: {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ["email", "password"],
    },
    FirebaseFirestore: {
    },
    FirebaseMessaging: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  }
};

export default config;
