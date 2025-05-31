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
import { sendMessage, subscribeToMessages, removeMessageListener } from "@/services/chat";
import { getGroupById } from "@/services/groups";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import {
  generateHashedColor,
  generateHashedGradient,
} from "@/utils/colorGenerator";
import "./ChatView.css";
import { GroupMessageDoc } from "@/interfaces/firestore";
import { formatMessageTime } from "@/utils/timeFormatter";

interface MessageWithId extends GroupMessageDoc {
  id: string;
}

// Helper to format dates for the date separator
const formatDateForSeparator = (timestamp: any): string => {
  if (!timestamp) return "";

  // Handle different timestamp formats
  let date: Date;
  if (timestamp && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    try {
      date = new Date(timestamp);
    } catch (error) {
      console.error("Invalid timestamp format:", timestamp);
      return "";
    }
  }

  // Check if the date is today
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Heute";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Gestern";
  } else {
    // Format as DD.MM.YYYY for German locale
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
};

// Helper to get just the date part as a string for comparison
const getDateString = (timestamp: any): string => {
  if (!timestamp) return "";

  let date: Date;
  if (timestamp && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    date = timestamp;
  } else {
    try {
      date = new Date(timestamp);
    } catch (error) {
      return "";
    }
  }

  return date.toDateString();
};

const ChatView = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithId[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [groupName, setGroupName] = useState("Gruppe");
  const contentRef = useRef<HTMLIonContentElement | null>(null);

  useEffect(() => {
    let callbackId: string | null = null;

    const setupSubscription = async () => {
      try {
        callbackId = await subscribeToMessages(groupId, setMessages);
      } catch (error) {
        console.error("Error setting up message subscription:", error);
      }
    };

    const fetchGroupDetails = async () => {
      try {
        const group = await getGroupById(groupId);
        if (group) setGroupName(group.name || "Gruppe");
      } catch (error) {
        console.error("Fehler beim Laden der Gruppe:", error);
      }
    };

    setupSubscription();
    fetchGroupDetails();

    // Cleanup function
    return () => {
      if (callbackId) {
        removeMessageListener(callbackId);
      }
    };
  }, [groupId]);

  useEffect(() => {
    // Use a small timeout to ensure the DOM has updated
    setTimeout(() => {
      contentRef.current?.scrollToBottom(300);
    }, 100);
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

  // Group messages by date for date separators
  const renderMessages = () => {
    let currentDate = "";

    return messages.map((msg, index) => {
      const isOwn = user?.uid === msg.senderId;
      const messageDate = getDateString(msg.createdAt);
      const showDateSeparator = messageDate !== currentDate;

      if (showDateSeparator) {
        currentDate = messageDate;
      }

      return (
        <div key={msg.id}>
          {showDateSeparator && (
            <div className="date-separator">
              <div className="date-pill">
                {formatDateForSeparator(msg.createdAt)}
              </div>
            </div>
          )}

          <div className={`message-row ${isOwn ? "own" : "other"}`}>
            {!isOwn && (
              <div
                className="message-avatar"
                style={{
                  background: generateHashedGradient(msg.senderId),
                }}
              />
            )}
            <div className="message-bubble">
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
                {formatMessageTime(msg.createdAt)}
              </div>
            </div>
          </div>
        </div>
      );
    });
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
      <IonContent ref={contentRef} className="chat-view-content">
        <div className="chat-messages">{renderMessages()}</div>
      </IonContent>
      <IonFooter className="chat-input-footer">
        <div className="chat-input-bar">
          <textarea
            placeholder="Nachricht schreiben..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="chat-textarea"
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