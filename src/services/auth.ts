import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";

export const register = async (
  displayName: string,
  email: string,
  password: string
): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await updateProfile(user, { displayName });

  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    createdAt: new Date().toISOString(),
  });

  return user;
};

export const login = async (
  email: string,
  password: string
): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};
