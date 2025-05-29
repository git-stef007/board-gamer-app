import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";

export const register = async (
  displayName: string,
  email: string,
  password: string
): Promise<User> => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const user = result.user;

  await updateProfile(user, { displayName });

  // Create user document in Firestore
  const userData: UserDoc = {
    uid: user.uid,
    email: user.email || email,
    displayName,
    createdAt: new Date(),
  };

  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userData);

  return user;
};

export const login = async (
  email: string,
  password: string
): Promise<User> => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};