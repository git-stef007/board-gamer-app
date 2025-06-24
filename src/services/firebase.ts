import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDlMHfcofEpg_PTCs8xa2iTYDD9R0QaRyg",
  authDomain: "board-gamer-app-a1c0d.firebaseapp.com",
  projectId: "board-gamer-app-a1c0d",
  storageBucket: "board-gamer-app-a1c0d.appspot.com",
  messagingSenderId: "318490639255",
  appId: "1:318490639255:android:fb3da01b29a4742b1ae2d2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Emulator Connect
connectFirestoreEmulator(db, "10.0.2.2", 8080);
connectAuthEmulator(auth, "http://10.0.2.2:9099");
