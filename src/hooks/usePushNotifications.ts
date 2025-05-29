import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { PushNotifications } from "@capacitor/push-notifications";
import { saveFcmTokenToFirestore } from "@/services/fcm";
import { Capacitor } from "@capacitor/core";

export const usePushNotifications = () => {
  const history = useHistory();

  useEffect(() => {
    // Skip on web or private mode
    if (Capacitor.getPlatform() === "web") return;

    const initPush = async () => {
      try {
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive !== "granted") return;

        await PushNotifications.register();

        PushNotifications.addListener("registration", (token) => {
          if (token.value) saveFcmTokenToFirestore(token.value);
        });

        PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
          const groupId = notification.notification.data?.groupId;
          if (groupId) history.push(`/chats/${groupId}`);
        });

      } catch (err) {
        console.warn("Push notifications initialization failed:", err);
      }
    };

    initPush();
  }, []);
};
