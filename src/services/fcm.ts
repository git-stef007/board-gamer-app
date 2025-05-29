import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { auth, db } from "@/config/firebase";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";

const messaging = getMessaging();

export const requestNotificationPermission = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is logged in");

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (token) {
      await setDoc(
        doc(db, "users", currentUser.uid),
        { fcmToken: token },
        { merge: true }
      );
    }
  } catch (err) {
    console.error("Failed to get FCM token:", err);
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  onMessage(messaging, callback);
};

export const saveFcmTokenToFirestore = async (token: string) => {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    fcmToken: token,
  });
};