import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { auth, db } from "@/config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";

let messaging: Messaging | null = null;

const ensureMessaging = () => {
  if (!messaging && typeof window !== "undefined") {
    try {
      messaging = getMessaging();
    } catch (err) {
      console.warn("getMessaging failed:", err);
    }
  }
  return messaging;
};

export const requestNotificationPermission = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is logged in");

    const messagingInstance = ensureMessaging();
    if (!messagingInstance) throw new Error("Messaging not available");

    const token = await getToken(messagingInstance, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      const update: Partial<UserDoc> = { fcmToken: token };
      await setDoc(
        doc(db, COLLECTIONS.USERS, currentUser.uid),
        update,
        { merge: true }
      );
    }
  } catch (err) {
    console.error("Failed to get FCM token:", err);
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  const messagingInstance = ensureMessaging();
  if (!messagingInstance) {
    console.warn("onMessageListener: messaging not available");
    return () => {};
  }

  return onMessage(messagingInstance, callback);
};

export const saveFcmTokenToFirestore = async (token: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const update: Partial<UserDoc> = { fcmToken: token };
  await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), update);
};