import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonBackButton,
} from "@ionic/react";
import { sendMessage, subscribeToMessages } from "@/services/chat";
import { getGroupById } from "@/services/groups";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/UserProfileDropdown";

const ChatView = () => {
  const { chatId: groupId } = useParams<{ chatId: string }>(); // still from route /chats/:chatId
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupName, setGroupName] = useState("Gruppe");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(groupId, setMessages);

    const fetchGroupDetails = async () => {
      try {
        const group = await getGroupById(groupId);
        if (group) setGroupName(group.name || "Gruppe");
      } catch (error) {
        console.error("Fehler beim Laden der Gruppe:", error);
      }
    };

    fetchGroupDetails();
    return unsubscribe;
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return;
    await sendMessage(groupId, user.uid, user.displayName || "Anonym", newMessage);
    setNewMessage("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/chats" />
          </IonButtons>
          <IonTitle>{groupName}</IonTitle>
          <IonButtons slot="end">
            <UserProfileDropdown user={user} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          {messages.map((msg) => (
            <IonItem
              key={msg.id}
              lines="none"
              className={user?.uid === msg.senderId ? "my-message" : "other-message"}
            >
              <IonLabel>
                {user?.uid !== msg.senderId && (
                  <div className="sender-name">{msg.senderName}</div>
                )}
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {msg.createdAt?.toDate
                    ? new Date(msg.createdAt.toDate()).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </IonLabel>
            </IonItem>
          ))}
          <div ref={bottomRef} />
        </IonList>
      </IonContent>
      <div className="message-input-container">
        <IonInput
          placeholder="Nachricht schreiben..."
          value={newMessage}
          onIonInput={(e) => setNewMessage(e.detail.value!)}
          onKeyDown={handleKeyDown}
          className="message-input"
        />
        <IonButton onClick={handleSend}>Senden</IonButton>
      </div>
    </IonPage>
  );
};

export default ChatView;
