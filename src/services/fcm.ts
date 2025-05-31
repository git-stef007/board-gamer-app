import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";
import { getCurrentUser } from "@/services/auth";

export const requestAndSaveFcmToken = async (): Promise<string | null> => {
  try {
    // Request permission for notifications
    const permissionResult = await FirebaseMessaging.requestPermissions();
    if (permissionResult.receive !== 'granted') {
      console.log('Push notification permission not granted');
      return null;
    }

    // Get the FCM token
    const tokenResult = await FirebaseMessaging.getToken({
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!tokenResult.token) return null;

    const user = await getCurrentUser();
    if (!user) return tokenResult.token;

    // Save token to Firestore using Capacitor plugin
    const userDocPath = `${COLLECTIONS.USERS}/${user.uid}`;
    const update: Partial<UserDoc> = { fcmToken: tokenResult.token };
    
    await FirebaseFirestore.setDocument({
      reference: userDocPath,
      data: update,
      merge: true
    });

    return tokenResult.token;
  } catch (err) {
    console.error("Failed to get/save FCM token:", err);
    return null;
  }
};

export const onMessageListener = (callback: (payload: any) => void) => {
  let listenerHandle: any = null;

  const setupListener = async () => {
    try {
      // Add listener for foreground messages - await the promise
      listenerHandle = await FirebaseMessaging.addListener('notificationReceived', (notification) => {
        callback(notification);
      });
    } catch (err) {
      console.warn("onMessageListener: messaging not available", err);
    }
  };

  // Start the async setup
  setupListener();

  // Return cleanup function
  return () => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};

export const saveFcmTokenToFirestore = async (token: string) => {
  const user = await getCurrentUser();
  if (!user) return;

  const userDocPath = `${COLLECTIONS.USERS}/${user.uid}`;
  const update: Partial<UserDoc> = { fcmToken: token };
  
  await FirebaseFirestore.updateDocument({
    reference: userDocPath,
    data: update
  });
};

// Additional utility functions for Capacitor Firebase Messaging

export const getDeliveredNotifications = async () => {
  try {
    const result = await FirebaseMessaging.getDeliveredNotifications();
    return result.notifications;
  } catch (err) {
    console.error("Failed to get delivered notifications:", err);
    return [];
  }
};

export const removeAllDeliveredNotifications = async () => {
  try {
    await FirebaseMessaging.removeAllDeliveredNotifications();
  } catch (err) {
    console.error("Failed to remove all delivered notifications:", err);
  }
};

// Listen for notification actions (when user taps notification)
export const onNotificationActionPerformed = (callback: (action: any) => void) => {
  let listenerHandle: any = null;

  const setupListener = async () => {
    try {
      // Add listener for notification actions - await the promise
      listenerHandle = await FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
        callback(action);
      });
    } catch (err) {
      console.warn("onNotificationActionPerformed: messaging not available", err);
    }
  };

  // Start the async setup
  setupListener();

  // Return cleanup function
  return () => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};