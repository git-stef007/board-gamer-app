import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { GroupDoc, GroupMessageDoc } from "@/interfaces/firestore";
import { dateToFirestoreTimestamp } from "@/utils/timeFormatter";

export const subscribeToMessages = async (
  groupId: string,
  callback: (messages: (GroupMessageDoc & { id: string })[]) => void
) => {
  const collectionPath = `${COLLECTIONS.GROUPS}/${groupId}/${COLLECTIONS.MESSAGES}`;
  
  const callbackId = await FirebaseFirestore.addCollectionSnapshotListener(
    {
      reference: collectionPath,
      queryConstraints: [
        {
          type: 'orderBy',
          fieldPath: 'createdAt',
          directionStr: 'asc',
        },
      ],
    },
    (event, error) => {
      if (error) {
        console.error(error);
      } else {
        const messages = event?.snapshots.map((doc: any) => ({
          id: doc.id,
          ...doc.data
        } as GroupMessageDoc & { id: string }));
        callback(messages || []);
      }
    }
  );
  
  return callbackId;
};

export const sendMessage = async (
  groupId: string,
  senderId: string,
  senderName: string,
  content: string
) => {
  const messagesCollectionPath = `${COLLECTIONS.GROUPS}/${groupId}/${COLLECTIONS.MESSAGES}`;

  // Message for the subcollection
  const messageData: Omit<GroupMessageDoc, 'createdAt'> & { createdAt: any } = {
    senderId,
    senderName,
    content,
    createdAt: dateToFirestoreTimestamp(new Date()),
  };

  // Add message to messages subcollection
  await FirebaseFirestore.addDocument({
    reference: messagesCollectionPath,
    data: messageData
  });

  // Update last message in group document (for chats list view)
  const lastMessageUpdate: Pick<GroupDoc, 'lastMessage' | 'updatedAt'> = {
    lastMessage: {
      senderId,
      senderName,
      content,
      createdAt: dateToFirestoreTimestamp(new Date()),
    },
    updatedAt: dateToFirestoreTimestamp(new Date())
  };

  // Update the group document
  const groupDocPath = `${COLLECTIONS.GROUPS}/${groupId}`;
  await FirebaseFirestore.updateDocument({
    reference: groupDocPath,
    data: lastMessageUpdate
  });
};

// Utility function to remove snapshot listener
export const removeMessageListener = async (callbackId: string) => {
  return await FirebaseFirestore.removeSnapshotListener({ callbackId });
};