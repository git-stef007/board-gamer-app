// ======================
// Firestore Timestamp Format
// ======================
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// ======================
// User Document (/users/{userId})
// ======================
export interface UserDoc {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  fcmToken?: string;
  createdAt: FirestoreTimestamp;
}

// ======================
// Group Document (/groups/{groupId})
// ======================
export interface GroupDoc {
  id?: string;
  name: string;
  memberIds: string[]; // userIds of group members
  description?: string;
  createdBy: string;
  createdAt: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
  location?: string;
  imageURL?: string;
  unreadCounts?: {
    [userId: string]: number; // userId -> unread message count
  };
  lastMessage?: {
    senderId: string;
    senderName: string;
    content: string;
    createdAt: FirestoreTimestamp;
  };
}

// ======================
// Message Document (/groups/{groupId}/messages/{messageId})
// ======================
export interface GroupMessageDoc {
  senderId: string;
  senderName: string;
  content: string;
  createdAt: FirestoreTimestamp;
}

// ======================
// Event Document (/groups/{groupId}/events/{eventId})
// ======================
export interface GroupEventDoc {
  name: string;
  description?: string;
  createdAt: FirestoreTimestamp;
  datetime: FirestoreTimestamp;
  location?: string;
  host: string; // userId of host
  gameSuggestions: GameSuggestion[];
  participantIds: string[]; // userIds of participants
  ratings?: {
    [userId: string]: EventRating;
  };
}

// ======================
// Game Suggestion Schema (Embedded in EventDoc.gameSuggestions)
// ======================
export interface GameSuggestion {
  name: string;
  createdBy: string; // userId
  createdAt: FirestoreTimestamp;
  description?: string;
  voterIds: string[]; // userIds of voters
}

// ======================
// Event Rating (Embedded in EventDoc.ratings)
// ======================
export interface EventRating {
  host: number;    // 1-5
  food: number;    // 1-5
  general: number; // 1-5
}



// export interface EventDoc {
//   name: string;
//   datetime: FirestoreTimestamp;
//   location: string;
//   host: string;
//   createdAt: FirestoreTimestamp;
//   participants: string[];
// }
