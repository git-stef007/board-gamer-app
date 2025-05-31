import { FirestoreTimestamp } from "@/interfaces/firestore";

/**
 * Formats a Firestore Timestamp, Date object, or valid date string into a human-readable date format.
 * The format is "DD. MMMM YYYY" (e.g., "01. Januar 2023").
 * This function handles various input types:
 * - Firestore Timestamp objects with a `toDate` method.
 * - JavaScript Date objects.
 * - Numeric timestamps (milliseconds or seconds since epoch).
 * - Valid date strings (e.g., ISO format).
 * @param input - The input can be a Firestore Timestamp, Date object, numeric timestamp, or a valid date string.
 * @returns {Date} - A JavaScript Date object representing the input.
 */
export const normalizeToDate = (input: any): Date => {
  if (!input) return new Date(NaN);

  // Firestore Timestamp or similar with toDate()
  if (typeof input.toDate === "function") {
    return input.toDate();
  }

  // Date object
  if (input instanceof Date) {
    return input;
  }

  // Numeric timestamp (handles both milliseconds and seconds)
  if (typeof input === "number") {
    return new Date(input < 1e12 ? input * 1000 : input);
  }

  // ISO string or other parseable formats
  return new Date(input);
}

/**
 * Normalizes various timestamp formats into a consistent numeric timestamp (milliseconds since epoch).
 * This function handles:
 * - Firestore Timestamp objects with a `toDate` method.
 * - JavaScript Date objects.
 * - Numeric timestamps (milliseconds or seconds since epoch).
 * - Valid date strings (e.g., ISO format).
 * @param input - The input can be a Firestore Timestamp, Date object, numeric timestamp, or a valid date string.
 * @returns {number} - A numeric timestamp in milliseconds since epoch.
 */
export const normalizeToTimestamp = (input: any): number => {
  if (!input) return 0;

  // Firestore Timestamp or similar with toDate()
  if (typeof input.toDate === "function") {
    return input.toDate().getTime();
  }

  // Date object
  if (input instanceof Date) {
    return input.getTime();
  }

  // Numeric timestamp (handles both milliseconds and seconds)
  if (typeof input === "number") {
    return input < 1e12 ? input * 1000 : input;
  }

  // ISO string or other parseable formats
  const date = new Date(input);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

/**
 * Formats a Firestore Timestamp, Date object, or valid date string into a human-readable date format.
 * The format is "DD. MMMM YYYY" (e.g., "01. Januar 2023").
 * @param timestamp - The timestamp to format, can be a Firestore Timestamp, Date object, or a valid date string.
 * @returns {string} - The formatted date string.
 */
export const formatDate = (timestamp: any) => {
  if (!timestamp) return "";

  const date = normalizeToDate(timestamp);
  return date.toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formats a Firestore Timestamp, Date object, or valid date string into a human-readable format.
 * The format varies based on how recent the date is:
 * - If today, returns the time in "HH:mm" format.
 * - If yesterday, returns "Gestern".
 * - If within the last 7 days, returns the weekday in long format (e.g., "Montag", "Dienstag").
 * - If older than 7 days, returns the date in "DD.MM" format. 
 * @param timestamp - The timestamp to format, can be a Firestore Timestamp, Date object, or a valid date string.
 * @returns {string} - The formatted date string.
 */
export const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return "";

  const date = normalizeToDate(timestamp);
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
      .toLocaleDateString("de-DE", { weekday: "long" })
      .replace(".", "");
  } else {
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

/**
 * Formats a Firestore Timestamp, Date object, or valid date string into a time string in "HH:mm" format.
 * This is used for displaying message times in chats.
 * @param timestamp - The timestamp to format, can be a Firestore Timestamp, Date object, or a valid date string.
 * @returns {string} - The formatted time string in "HH:mm" format.
 */
export const formatMessageTime = (timestamp: any): string => {
  if (!timestamp) return "";
  
  timestamp = normalizeToTimestamp(timestamp);
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
