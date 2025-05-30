import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { db } from "@/config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";
import { getCurrentUser } from "@/services/auth";

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

export const requestAndSaveFcmToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messagingInstance = ensureMessaging();
    if (!messagingInstance) throw new Error("Messaging not available");

    const token = await getToken(messagingInstance, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!token) return null;

    const user = await getCurrentUser();
    if (!user) return token;

    const update: Partial<UserDoc> = { fcmToken: token };
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), update, { merge: true });

    return token;
  } catch (err) {
    console.error("Failed to get/save FCM token:", err);
    return null;
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
  const user = await getCurrentUser();
  if (!user) return;

  const update: Partial<UserDoc> = { fcmToken: token };
  await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), update);
};
