import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

interface Message {
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

interface Group {
  name: string;
  memberIds: string[];
}

interface User {
  fcmToken?: string;
}

export const sendMessageNotification = onDocumentCreated(
  "groups/{groupId}/messages/{messageId}",
  async (event) => {
    const { groupId } = event.params;
    const message = event.data?.data() as Message;
    if (!message?.senderId) return;

    const groupSnap = await db.doc(`groups/${groupId}`).get();
    const group = groupSnap.data() as Group;
    if (!group?.memberIds) return;

    const tokens: string[] = [];

    await Promise.all(
      group.memberIds.map(async (memberId) => {
        if (memberId === message.senderId) return;

        const userSnap = await db.doc(`users/${memberId}`).get();
        const user = userSnap.data() as User;
        if (user?.fcmToken) tokens.push(user.fcmToken);
      })
    );

    if (tokens.length === 0) return;

    const messagePayload: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: `${message.senderName} (in ${group.name})`,
        body: message.text || "Neue Nachricht",
      },
      data: {
        groupId, // include groupId for navigation on client
      },
    };

    const response = await admin.messaging().sendMulticast(messagePayload);
    logger.info(`Sent notification to ${response.successCount} devices`);
  }
);
