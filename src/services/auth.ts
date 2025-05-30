import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";
import { EmailAuthProvider, signInWithCredential } from "firebase/auth";
import { getFirebaseAuth } from "@/config/firebase";

export const register = async (
  displayName: string,
  email: string,
  password: string
) => {
  const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
    email,
    password,
  });

  const user = result.user;
  if (!user?.uid) throw new Error("Registration failed");

  // Create Firestore doc
  const userData: UserDoc = {
    uid: user.uid,
    email: user.email ?? email,
    displayName,
    createdAt: new Date(),
  };

  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);

  return user;
};

export const login = async (
  email: string,
  password: string
) => {
  const result = await FirebaseAuthentication.signInWithEmailAndPassword({
    email,
    password,
  });

  if (!result.user) throw new Error("Login failed");

  // Bridge to Firebase Web SDK for Firestore access
  const credential = EmailAuthProvider.credential(email, password);
  const auth = await getFirebaseAuth();
  await signInWithCredential(auth, credential);

  return result.user;
};

export const logout = async () => {
  await FirebaseAuthentication.signOut();
};

export const getCurrentUser = async () => {
  const result = await FirebaseAuthentication.getCurrentUser();
  return result.user; // or null
};