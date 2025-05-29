import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";
import { GroupDoc, GroupMessageDoc } from "@/interfaces/firestore";

export const subscribeToMessages = (
  groupId: string,
  callback: (messages: (GroupMessageDoc & { id: string })[]) => void
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
      ...doc.data()
    } as GroupMessageDoc & { id: string }));
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

  // Message for the subcollection
  const messageData: GroupMessageDoc = {
    senderId,
    senderName,
    content,
    createdAt: serverTimestamp() as unknown as Date,
  };

  // Add message to messages subcollection
  await addDoc(messagesRef, messageData);

  // Update last message in group document (for chats list view)
  const lastMessageUpdate: Pick<GroupDoc, 'lastMessage' | 'updatedAt'> = {
    lastMessage: {
      senderId,
      senderName,
      content,
      createdAt: serverTimestamp() as unknown as Date,
    },
    updatedAt: serverTimestamp() as unknown as Date
  };

  // Update the group document
  await updateDoc(doc(db, COLLECTIONS.GROUPS, groupId), lastMessageUpdate);
};