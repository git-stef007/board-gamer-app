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
  IonFooter,
} from "@ionic/react";
import { sendMessage, subscribeToMessages } from "@/services/chat";
import { getGroupById } from "@/services/groups";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import {
  generateHashedColor,
  generateHashedGradient,
} from "@/utils/colorGenerator";
import "./ChatView.css";

const ChatView = () => {
  const { groupId } = useParams<{ groupId: string }>();
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
    await sendMessage(
      groupId,
      user.uid,
      user.displayName || "Anonym",
      newMessage
    );
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
        <IonContent className="chat-view-content">
          <div className="chat-messages">
            {messages.map((msg) => {
              const isOwn = user?.uid === msg.senderId;
              return (
                <div
                  key={msg.id}
                  className={`message-bubble ${isOwn ? "own" : "other"}`}
                >
                  {!isOwn && (
                    <div
                      className="message-avatar"
                      style={{
                        background: generateHashedGradient(msg.senderId),
                      }}
                    />
                  )}

                  <div className="message-meta">
                    {!isOwn && (
                      <div
                        className="sender-name"
                        style={{ color: generateHashedColor(msg.senderId) }}
                      >
                        {msg.senderName}
                      </div>
                    )}
                    <div className="message-content">{msg.content}</div>
                    <div className="message-time">
                      {msg.createdAt?.toDate
                        ? new Date(msg.createdAt.toDate()).toLocaleTimeString(
                            "de-DE",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </IonContent>
      </IonContent>
      <IonFooter className="chat-input-footer">
        <div className="chat-input-bar">
          <IonInput
            placeholder="Nachricht schreiben..."
            value={newMessage}
            onIonInput={(e) => setNewMessage(e.detail.value!)}
            onKeyDown={handleKeyDown}
            className="chat-input"
          />
          <IonButton
            onClick={handleSend}
            shape="round"
            color="primary"
            className="send-button"
          >
            Senden
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default ChatView;
