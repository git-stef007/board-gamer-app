import { FirestoreTimestamp } from "@/interfaces/firestore";

export const formatDate = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Gestern";
  } else if (diffDays < 7) {
    return date
      .toLocaleDateString("de-DE", { weekday: "short" })
      .replace(".", "");
  } else {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

// Helper function to format timestamp
export const formatMessageTime = (timestamp: any): string => {
  if (!timestamp) return "";

  let date: Date;

  // Handle Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  }
  // Handle regular Date object
  else if (timestamp instanceof Date) {
    date = timestamp;
  }
  // Handle other cases (like serialized date strings)
  else {
    try {
      date = new Date(timestamp);
    } catch (error) {
      console.error("Invalid timestamp format:", timestamp);
      return "";
    }
  }

  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Converts a JS Date to a Firestore-compatible object.
 */
export const dateToFirestoreTimestamp = (date: Date = new Date()) => {
  const ms = date.getTime();
  return {
    seconds: Math.floor(ms / 1000),
    nanoseconds: (ms % 1000) * 1_000_000,
  } as FirestoreTimestamp;
};

/**
 * Converts a Firestore timestamp object to a JS Date.
 * Supports both raw { seconds, nanoseconds } and Firestore Timestamps.
 */
export const firestoreTimestampToDate = (ts: any): Date => {
  if (!ts) return new Date(0);
  if (typeof ts.toDate === "function") return ts.toDate(); // Firestore Timestamp
  if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000); // Native-safe
  return new Date(ts); // Fallback for ISO strings or numbers
};
