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
  chatbubbleEllipsesOutline,
} from "ionicons/icons";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useHistory } from "react-router-dom";
import "./ChatsList.css";
import { requestAndSaveFcmToken, onMessageListener } from "@/services/fcm";
import { getUserGroups } from "@/services/groups";
import { generateHashedGradient } from "@/utils/colorGenerator";
import { formatTimestamp } from "@/utils/timeFormatter";
import { GroupDoc } from "@/interfaces/firestore";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";

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

const ChatsList: React.FC = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushPermissionGranted, setPushPermissionGranted] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const history = useHistory();

  useEffect(() => {
    FirebaseMessaging.checkPermissions().then(({ receive }) => {
      setPushPermissionGranted(receive === "granted");
      setPermissionChecked(true);
    });
  }, []);

  const requestNotificationPermission = async () => {
    const { receive } = await FirebaseMessaging.requestPermissions();
    if (receive === "granted") {
      const token = await requestAndSaveFcmToken();
      if (token) {
        console.log("FCM Token:", token);
        setPushPermissionGranted(true);
      }
    }
  };

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    const fetchChats = async () => {
      setLoading(true);
      try {
        const groups = await getUserGroups(user.uid);

        const chatList: Chat[] = groups.map((group) => ({
          id: group.id,
          name: group.name || "Unbenannte Gruppe",
          lastMessageContent: group.lastMessage?.content,
          lastMessageSender: group.lastMessage?.senderName,
          lastMessageTime: group.lastMessage?.createdAt.seconds,
          unreadCount: group.unreadCounts?.[user.uid] || 0,
          members: group.memberIds,
          photoURL: group.imageURL,
        }));

        // Sort by last message time
        chatList.sort((a, b) => {
          const aTime = a.lastMessageTime?.toDate?.() || new Date(0);
          const bTime = b.lastMessageTime?.toDate?.() || new Date(0);
          return bTime.getTime() - aTime.getTime();
        });

        setChats(chatList);
      } catch (err) {
        console.error("Fehler beim Abrufen der Chats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();

    // Set up real-time updates using the message listener
    const removeListener = onMessageListener((notification) => {
      // Refresh chats when a new message is received
      fetchChats();
    });

    return removeListener;
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

        {permissionChecked && !pushPermissionGranted && (
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
                <div className="chat-icon-container" slot="start">
                  {chat.photoURL ? (
                    <img src={chat.photoURL} alt={chat.name} />
                  ) : (
                    <div
                      className="default-group-image"
                      style={{
                        background: generateHashedGradient(chat.id),
                      }}
                    >
                      <IonIcon icon={chatbubbleEllipsesOutline} />
                    </div>
                  )}
                </div>
                <IonLabel>
                  <div className="chat-title-row">
                    <h2>{chat.name}</h2>
                    <span className="chat-time">
                      {chat.lastMessageTime
                        ? formatTimestamp(chat.lastMessageTime)
                        : ""}
                    </span>
                  </div>
                  <div className="chat-last-message">
                    {chat.lastMessageSender && chat.lastMessageContent
                      ? `${chat.lastMessageSender}: ${chat.lastMessageContent}`
                      : "Noch keine Nachrichten"}
                  </div>
                </IonLabel>

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
