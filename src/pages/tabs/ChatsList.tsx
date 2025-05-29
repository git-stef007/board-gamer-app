import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonButton,
  IonIcon,
  IonBadge,
  IonSpinner,
} from "@ionic/react";
import {
  notifications,
  chatbubble,
  people,
  chatbubblesOutline,
} from "ionicons/icons";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useAuth } from "@/hooks/useAuth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import { useHistory } from "react-router-dom";
import "./ChatsList.css";
import { saveFcmTokenToFirestore } from "@/services/fcm";

interface Chat {
  id: string;
  name: string;
  lastMessageContent?: string;
  lastMessageSender?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  members?: string[];
  photoURL?: string;
}

const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Gestern";
  } else if (diffDays < 7) {
    return date
      .toLocaleDateString("de-DE", { weekday: "short" })
      .replace(".", "");
  } else {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

const ChatsList: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const history = useHistory();

  useEffect(() => {
    setNotificationPermission(Notification.permission);
  }, []);

  const requestNotificationPermission = async () => {
    try {
      if (!("Notification" in window)) return;

      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === "granted") {
        const messaging = getMessaging();
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
        });

        if (token) {
          console.log("FCM Token:", token);
          saveFcmTokenToFirestore(token);
        }
      }
    } catch (err) {
      console.error("Notification request error:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const db = getFirestore();
    const q = query(
      collection(db, "groups"),
      where("memberIds", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatList: Chat[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unbenannte Gruppe",
            lastMessageContent: data.lastMessage?.content,
            lastMessageSender: data.lastMessage?.senderName,
            lastMessageTime: data.lastMessage?.timestamp,
            unreadCount: data.unreadCounts?.[user.uid] || 0,
            members: data.memberIds,
            photoURL: data.imageURL,
          };
        });

        chatList.sort((a, b) => {
          const aTime = a.lastMessageTime?.toDate?.() || new Date(0);
          const bTime = b.lastMessageTime?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        setChats(chatList);
        setLoading(false);
      },
      (err) => {
        console.error("Fehler beim Abrufen der Chats:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const goToGroups = () => history.push("/groups");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chats</IonTitle>
          <IonButtons slot="end">
            <UserProfileDropdown user={user} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Chats</IonTitle>
          </IonToolbar>
        </IonHeader>

        {notificationPermission !== "granted" && (
          <div className="notification-banner">
            <IonButton
              expand="block"
              onClick={requestNotificationPermission}
              className="notification-button"
            >
              <IonIcon slot="start" icon={notifications} />
              Benachrichtigungen aktivieren
            </IonButton>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Lädt...</p>
          </div>
        ) : chats.length > 0 ? (
          <IonList>
            {chats.map((chat) => (
              <IonItem
                key={chat.id}
                routerLink={`/chats/${chat.id}`}
                detail={true}
                className={chat.unreadCount ? "unread-chat" : ""}
              >
                <IonAvatar slot="start">
                  {chat.photoURL ? (
                    <img src={chat.photoURL} alt={chat.name} />
                  ) : (
                    <IonIcon icon={chatbubble} />
                  )}
                </IonAvatar>
                <IonLabel>
                  <h2>{chat.name}</h2>
                  <p>
                    {chat.lastMessageSender && chat.lastMessageContent
                      ? `${chat.lastMessageSender}: ${chat.lastMessageContent}`
                      : "Noch keine Nachrichten"}
                  </p>
                </IonLabel>
                {chat.lastMessageTime && (
                  <div slot="end" className="chat-time">
                    {formatTimestamp(chat.lastMessageTime)}
                  </div>
                )}
                {(chat.unreadCount ?? 0) > 0 && (
                  <IonBadge slot="end" color="primary">
                    {chat.unreadCount}
                  </IonBadge>
                )}
              </IonItem>
            ))}
          </IonList>
        ) : (
          <div className="empty-chats-container ion-padding ion-text-center">
            <IonIcon icon={chatbubblesOutline} size="large" />
            <h2>Noch keine Chats</h2>
            <p>
              Erstelle eine neue Gruppe oder tritt einer bestehenden Gruppe bei.
            </p>
            <IonButton onClick={goToGroups}>Zu den Gruppen</IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ChatsList;
