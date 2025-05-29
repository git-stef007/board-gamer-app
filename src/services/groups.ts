import { addDoc, collection, Timestamp, getDoc, doc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";

export interface Group {
  id?: string;            
  name: string;
  memberIds: string[];      // Firebase Auth UIDs
  createdAt?: Timestamp;
  createdBy: string;        // Creator UID
}

/**
 * Creates a new game group with member rotation support.
 * @param groupName Name of the group
 * @param memberIds Array of user UIDs (Firebase Auth UIDs)
 * @param createdBy UID of the creator
 */
export const createGroup = async (
  groupName: string,
  memberIds: string[],
  createdBy: string
): Promise<void> => {
  if (!groupName || memberIds.length <= 0 || !createdBy) {
    throw new Error("Missing required group fields");
  }

  const group: Group = {
    name: groupName,
    memberIds,
    createdBy,
    createdAt: Timestamp.now(),
  };

  await addDoc(collection(db, COLLECTIONS.GROUPS), group);
};

export const getGroupById = async (groupId: string) => {
  try {
    const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
    if (groupDoc.exists()) {
      return {
        id: groupDoc.id,
        ...groupDoc.data()
      } as Group;
    }
    return null;
  } catch (error) {
    console.error('Error getting group:', error);
    return null;
  }
};
