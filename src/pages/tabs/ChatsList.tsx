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
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
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
import {
  requestAndSaveFcmToken,
  onMessageListener,
} from "@/services/notifications";
import { getUserGroups } from "@/services/groups";
import { generateHashedGradient } from "@/utils/colorGenerator";
import { formatTimestamp } from "@/utils/timeFormatter";
import { GroupDoc } from "@/interfaces/firestore";
import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";

interface Chat {
  id: string;
  name: string;
  lastMessageContent?: string;
  lastMessageSender?: string;
  lastMessageTime?: any;
  unreadCount?: number;
  members?: string[];
  photoURL?: string;
  groupCreatedAt?: any;
}

interface GroupWithId extends GroupDoc {
  id: string;
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

  // Convert groups to chats format
  const convertGroupsToChats = (groups: GroupWithId[]): Chat[] => {
    const chatList: Chat[] = groups.map((group) => ({
      id: group.id,
      name: group.name || "Unbenannte Gruppe",
      lastMessageContent: group.lastMessage?.content,
      lastMessageSender: group.lastMessage?.senderName,
      lastMessageTime: group.lastMessage?.createdAt,
      unreadCount: group.unreadCounts?.[user?.uid || ''] || 0,
      members: group.memberIds,
      photoURL: group.imageURL,
      groupCreatedAt: group.createdAt,
    }));

    // Sort by last message time
    chatList.sort((a, b) => {
      const getTimestamp = (chat: Chat) => {
        const ts = chat.lastMessageTime ?? chat.groupCreatedAt;
        return ts?.seconds ? ts.seconds * 1e9 + (ts.nanoseconds ?? 0) : 0;
      };

      return getTimestamp(b) - getTimestamp(a); // Descending: latest first
    });

    return chatList;
  };

  // Extract fetchChats into a separate function so it can be reused
  const fetchChats = async () => {
    if (!user) {
      setChats([]);
      return;
    }

    try {
      const groups = await getUserGroups(user.uid);
      const chatList = convertGroupsToChats(groups);
      setChats(chatList);
    } catch (err) {
      console.error("Fehler beim Abrufen der Chats:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }

    let unsubscribe: any = null;

    const setupRealTimeListener = async () => {
      setLoading(true);
      
      try {
        // Initial load
        await fetchChats();
        setLoading(false);

        // Set up real-time listener
        unsubscribe = await FirebaseFirestore.addCollectionSnapshotListener(
          {
            reference: COLLECTIONS.GROUPS,
            compositeFilter: {
              type: "and",
              queryConstraints: [
                {
                  type: "where",
                  fieldPath: "memberIds",
                  opStr: "array-contains",
                  value: user.uid,
                },
              ],
            },
          },
          (snapshot, error) => {
            if (error) {
              console.error("Error listening to groups:", error);
              return;
            }

            if (snapshot && snapshot.snapshots) {
              console.log('Real-time update received, updating chats...');
              
              // Convert snapshot to groups format
              const groups: GroupWithId[] = snapshot.snapshots.map((doc) => ({
                id: doc.id,
                ...doc.data,
              })) as GroupWithId[];

              // Convert to chats and update state
              const chatList = convertGroupsToChats(groups);
              setChats(chatList);
            }
          }
        );
      } catch (error) {
        console.error("Error setting up real-time listener:", error);
        setLoading(false);
      }
    };

    setupRealTimeListener();

    return () => {
      if (unsubscribe && typeof unsubscribe.remove === 'function') {
        console.log('Cleaning up Firestore listener...');
        unsubscribe.remove();
      }
    };
  }, [user]);

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await fetchChats();
    } catch (error) {
      console.error("Error refreshing chats:", error);
    } finally {
      event.detail.complete();
    }
  };

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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon="chevron-down-circle-outline"
            pullingText="Zum Aktualisieren nach unten ziehen"
            refreshingSpinner="circles"
            refreshingText="Chats werden aktualisiert..."
          />
        </IonRefresher>

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
          <IonList>
            {[...Array(5)].map((_, index) => (
              <IonItem key={index}>
                <IonAvatar slot="start">
                  <IonSkeletonText
                    animated={true}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                    }}
                  />
                </IonAvatar>
                <IonLabel>
                  <h2>
                    <IonSkeletonText animated={true} style={{ width: "80%" }} />
                  </h2>
                  <p>
                    <IonSkeletonText animated={true} style={{ width: "60%" }} />
                  </p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
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
                        ? formatTimestamp(chat.lastMessageTime.seconds)
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