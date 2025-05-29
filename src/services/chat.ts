import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";

export const subscribeToMessages = (
  groupId: string,
  callback: (messages: any[]) => void
) => {
  const messagesRef = collection(
    db,
    COLLECTIONS.GROUPS,
    groupId,
    COLLECTIONS.MESSAGES
  );
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(messages);
  });
};

export const sendMessage = async (
  groupId: string,
  senderId: string,
  senderName: string,
  content: string
) => {
  const messagesRef = collection(
    db,
    COLLECTIONS.GROUPS,
    groupId,
    COLLECTIONS.MESSAGES
  );

  // Add message to messages array
  await addDoc(messagesRef, {
    senderId,
    senderName,
    content,
    createdAt: serverTimestamp(),
  });

  // Update last message in group document (for chats list view)
  await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), {
    lastMessage: {
      senderId,
      senderName,
      content,
      createdAt: serverTimestamp(),
    },
  });
};
