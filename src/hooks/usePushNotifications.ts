import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { PushNotifications } from "@capacitor/push-notifications";
import { saveFcmTokenToFirestore } from "@/services/fcm";
import { Capacitor } from "@capacitor/core";

export const usePushNotifications = () => {
  const history = useHistory();

  useEffect(() => {
    if (Capacitor.getPlatform() !== "web") {
      PushNotifications.requestPermissions().then((permission) => {
        if (permission.receive === "granted") {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener("registration", (token) => {
        saveFcmTokenToFirestore(token.value);
      });

      PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          const groupId = notification.notification.data?.groupId;
          if (groupId) {
            history.push(`/chats/${groupId}`);
          }
        }
      );
    }
  }, []);
};
