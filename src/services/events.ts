import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { GroupEventDoc, GameSuggestion } from "@/interfaces/firestore";
import { dateToFirestoreTimestamp, firestoreTimestampToDate } from "@/utils/timeFormatter";
import { getGroupById } from "./groups";

/**
 * Create a new event inside a group
 * Rotation logic for host can optionally be added here.
 */
export const createEvent = async (
  groupId: string,
  event: Omit<GroupEventDoc, "host">
): Promise<string> => {
  if (!groupId || !event || !event.name || !event.datetime) {
    throw new Error("Missing required event fields");
  }

  try {
    // 🔁 Hole die Gruppe
    const group = await getGroupById(groupId);
    if (!group || !group.memberIds || group.memberIds.length === 0) {
      throw new Error("Group not found or has no members");
    }

    const memberIds = group.memberIds;

    // 🔁 Hole die zuletzt erstellten Events dieser Gruppe
    const result = await FirebaseFirestore.getCollection({
      reference: `${COLLECTIONS.GROUPS}/${groupId}/events`,
      queryConstraints: [
        { type: "orderBy", fieldPath: "createdAt", directionStr: "desc" },
        { type: "limit", limit: 1 },
      ],
    });

    let nextHost = memberIds[0]; // Standard: erstes Mitglied

    if (result.snapshots.length > 0) {
      const lastEvent = result.snapshots[0].data as GroupEventDoc;
      const lastHost = lastEvent.host;
      const index = memberIds.indexOf(lastHost);
      const nextIndex = (index + 1) % memberIds.length;
      nextHost = memberIds[nextIndex];
    }

    // 🔐 Event-Daten speichern
    const eventData: GroupEventDoc = {
      ...event,
      createdAt: dateToFirestoreTimestamp(new Date()),
      host: nextHost,
    };

    const docRef = await FirebaseFirestore.addDocument({
      reference: `${COLLECTIONS.GROUPS}/${groupId}/events`,
      data: eventData,
    });

    const pathParts = docRef.reference.path.split("/");
    return pathParts[pathParts.length - 1];
  } catch (error) {
    console.error("Error creating event with rotation:", error);
    throw new Error("Failed to create event");
  }
};

/**
 * Load all events from all groups (for Events Tab)
 */
export const getAllEvents = async (): Promise<({ id: string; groupId: string } & GroupEventDoc)[]> => {
  try {
    const groupResult = await FirebaseFirestore.getCollection({
      reference: COLLECTIONS.GROUPS,
    });

    const allEvents: ({ id: string; groupId: string } & GroupEventDoc)[] = [];

    for (const groupDoc of groupResult.snapshots) {
      const groupId = groupDoc.id;
      const eventsRef = `${COLLECTIONS.GROUPS}/${groupId}/events`;

      const eventsResult = await FirebaseFirestore.getCollection({
        reference: eventsRef,
      });

      for (const eventDoc of eventsResult.snapshots) {
        allEvents.push({
          id: eventDoc.id,
          groupId,
          ...eventDoc.data,
        } as GroupEventDoc & { id: string; groupId: string });
      }
    }

    return allEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

/**
 * Load all events for a specific group (for GroupDetails)
 */
export const getGroupEvents = async (
  groupId: string
): Promise<(GroupEventDoc & { id: string })[]> => {
  try {
    const result = await FirebaseFirestore.getCollection({
      reference: `${COLLECTIONS.GROUPS}/${groupId}/events`,
      queryConstraints: [
        { type: "orderBy", fieldPath: "datetime", directionStr: "asc" },
      ],
    });

    return result.snapshots.map((doc: any) => ({
      id: doc.id,
      ...doc.data,
    }));
  } catch (error) {
    console.error("Error fetching group events:", error);
    return [];
  }
};

/**
 * Allow updating of events
 */

export const updateEvent = async (
  groupId: string,
  eventId: string,
  updatedData: Partial<GroupEventDoc>
): Promise<void> => {
  await FirebaseFirestore.updateDocument({
    reference: `${COLLECTIONS.GROUPS}/${groupId}/events/${eventId}`,
    data: updatedData,
  });
};


/**
 * Allow deletion of events
 */
export const deleteEvent = async (groupId: string, eventId: string): Promise<void> => {
  await FirebaseFirestore.deleteDocument({
    reference: `${COLLECTIONS.GROUPS}/${groupId}/events/${eventId}`
  });
};

/**
 * Suggest a game for an event
 */
export const suggestGame = async (
  groupId: string,
  eventId: string,
  userId: string,
  gameName: string,
  description?: string
) => {
  const eventRef = `${COLLECTIONS.GROUPS}/${groupId}/events/${eventId}`;
  const result = await FirebaseFirestore.getDocument({ reference: eventRef });
  const event = result.snapshot?.data as GroupEventDoc;

  console.log("Event: " + JSON.stringify(event, null, 2));
  console.log("eventRef:", eventRef);


  if (!event || !event.datetime || !Array.isArray(event.gameSuggestions)) {
    throw new Error("Fehlerhafte Eventdaten – bitte aktualisieren und erneut versuchen.");
  }

  if (firestoreTimestampToDate(event.datetime) < new Date()) {
    throw new Error("Spielvorschläge sind nur für zukünftige Spieltermine möglich.");
  }

  const alreadyExists = event.gameSuggestions.some(
    g => g.name.toLowerCase() === gameName.toLowerCase()
  );
  if (alreadyExists) {
    throw new Error("Dieses Spiel wurde bereits vorgeschlagen.");
  }

  const newGame: GameSuggestion = {
    name: gameName,
    createdBy: userId,
    createdAt: dateToFirestoreTimestamp(new Date()),
    description,
    voterIds: []
  };

  const updatedSuggestions = [...event.gameSuggestions, newGame];

  await FirebaseFirestore.updateDocument({
    reference: eventRef,
    data: { gameSuggestions: updatedSuggestions }
  });
};

/**
 * Vote for a game suggestion in an event
 */
export const voteForGame = async (
  groupId: string,
  eventId: string,
  userId: string,
  gameName: string
) => {
  const eventRef = `${COLLECTIONS.GROUPS}/${groupId}/events/${eventId}`;
  const result = await FirebaseFirestore.getDocument({ reference: eventRef });
  const event = result.snapshot?.data as GroupEventDoc;

  if (firestoreTimestampToDate(event.datetime) < new Date()) {
    throw new Error("Spielabstimmung ist nur für zukünftige Spieltermine möglich.");
  }

  const updatedSuggestions = event.gameSuggestions.map((game) => {
    if (game.name.toLowerCase() === gameName.toLowerCase()) {
      if (game.voterIds.includes(userId)) return game;
      return { ...game, voterIds: [...game.voterIds, userId] };
    }
    return game;
  });

  await FirebaseFirestore.updateDocument({
    reference: eventRef,
    data: { gameSuggestions: updatedSuggestions }
  });
};
