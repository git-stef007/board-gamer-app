import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";
import { getCurrentUser } from "@/services/auth";
import { LocalNotifications } from "@capacitor/local-notifications";
import { Capacitor } from "@capacitor/core";

export const requestAndSaveFcmToken = async (): Promise<string | null> => {
  try {
    const permissionResult = await FirebaseMessaging.requestPermissions();
    if (permissionResult.receive !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }

    const tokenResult = await FirebaseMessaging.getToken({
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });

    if (!tokenResult.token) return null;

    const user = await getCurrentUser();
    if (!user) return tokenResult.token;

    const userDocPath = `${COLLECTIONS.USERS}/${user.uid}`;
    const update: Partial<UserDoc> = { fcmToken: tokenResult.token };

    await FirebaseFirestore.setDocument({
      reference: userDocPath,
      data: update,
      merge: true,
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
      listenerHandle = await FirebaseMessaging.addListener(
        "notificationReceived",
        async (notification: any) => {
          
          // groupId extraction - matching the navigation logic
          let groupId = 
              notification?.notification?.data?.groupId ||
              notification?.data?.groupId ||
              notification?.groupId ||
              "";

          console.log("- Extracted groupId:", groupId);

          // Fix duplicate issue: iOS already shows notification when there's a notification payload
          if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
            // If FCM has both notification and data, iOS shows it automatically
            if (notification.notification && notification.notification.title) {
              console.log("iOS: FCM notification already shown by system, skipping local notification");
              callback(notification);
              return;
            }
          }

          // Only create local notification if no system notification
          if (Capacitor.isNativePlatform()) {
            const permission = await LocalNotifications.checkPermissions();
            
            if (permission.display !== "granted") {
              const request = await LocalNotifications.requestPermissions();
              if (request.display !== "granted") {
                console.warn("Local notification permission not granted");
                return;
              }
            }

            const notificationId = Date.now();
                        
            await LocalNotifications.schedule({
              notifications: [
                {
                  id: notificationId,
                  title: notification.notification?.title ?? notification.data?.title ?? "Neue Nachricht",
                  body: notification.notification?.body ?? notification.data?.body ?? "",
                  extra: { groupId },
                },
              ],
            });
            
          }

          callback(notification);
        }
      );
      
      console.log("FCM listener setup complete");
    } catch (err) {
      console.warn("onMessageListener: messaging not available", err);
    }
  };

  setupListener();

  return () => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};

export const onNotificationActionPerformed = (
  callback: (action: any) => void
) => {
  let listenerHandle: any = null;

  const setupListener = async () => {
    try {
      listenerHandle = await FirebaseMessaging.addListener(
        "notificationActionPerformed",
        (action) => {
          callback(action);
        }
      );
    } catch (err) {
      console.warn("onNotificationActionPerformed: messaging not available", err);
    }
  };

  setupListener();

  return () => {
    if (listenerHandle) {
      listenerHandle.remove();
    }
  };
};