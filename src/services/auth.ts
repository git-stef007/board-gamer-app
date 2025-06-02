import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { FirebaseFirestore } from '@capacitor-firebase/firestore';
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";
import { dateToFirestoreTimestamp } from "@/utils/timeFormatter";

export const register = async (
  displayName: string,
  email: string,
  password: string
) => {
  try {
    // Create user with Capacitor Firebase Authentication
    const result = await FirebaseAuthentication.createUserWithEmailAndPassword({
      email,
      password,
    });

    const user = result.user;
    if (!user?.uid) throw new Error("Registration failed");

    // Update user profile with display name
    await FirebaseAuthentication.updateProfile({
      displayName,
    });

    // Create user document in Firestore using Capacitor plugin
    const userData: UserDoc = {
      uid: user.uid,
      email: user.email ?? email,
      displayName,
      createdAt: dateToFirestoreTimestamp(new Date()),
    };

    // Use Capacitor Firestore plugin to create user document
    await FirebaseFirestore.setDocument({
      reference: `${COLLECTIONS.USERS}/${user.uid}`,
      data: userData,
    });

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const login = async (
  email: string,
  password: string
) => {
  try {
    // Use Capacitor Firebase Authentication
    const result = await FirebaseAuthentication.signInWithEmailAndPassword({
      email,
      password,
    });

    if (!result.user) throw new Error("Login failed");

    console.log("Login successful:", result.user);
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await FirebaseAuthentication.signOut();
    console.log("Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const result = await FirebaseAuthentication.getCurrentUser();
    return result.user;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await FirebaseAuthentication.sendPasswordResetEmail({ email });
    console.log("Password reset email sent");
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};

export const updateUserProfile = async (displayName: string, photoURL?: string) => {
  try {
    await FirebaseAuthentication.updateProfile({
      displayName,
      photoUrl: photoURL,
    });
    console.log("Profile updated successfully");
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
};

export const deleteUser = async () => {
  try {
    await FirebaseAuthentication.deleteUser();
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    throw error;
  }
};

// Helper function to listen to auth state changes
export const onAuthStateChanged = (callback: (user: any) => void) => {
  return FirebaseAuthentication.addListener('authStateChange', (result) => {
    callback(result.user);
  });
};