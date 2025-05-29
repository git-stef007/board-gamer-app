import { addDoc, collection, Timestamp, getDoc, doc, updateDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/constants/firebase";
import { GroupDoc } from "@/interfaces/firestore";

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
): Promise<string> => {
  if (!groupName || memberIds.length <= 0 || !createdBy) {
    throw new Error("Missing required group fields");
  }

  const group: GroupDoc = {
    name: groupName,
    memberIds,
    createdBy,
    createdAt: Timestamp.now() as unknown as Date,
  };

  const docRef = await addDoc(collection(db, COLLECTIONS.GROUPS), group);
  return docRef.id;
};

export const getGroupById = async (groupId: string): Promise<GroupDoc & { id: string } | null> => {
  try {
    const groupDoc = await getDoc(doc(db, COLLECTIONS.GROUPS, groupId));
    if (groupDoc.exists()) {
      return {
        id: groupDoc.id,
        ...groupDoc.data()
      } as GroupDoc & { id: string };
    }
    return null;
  } catch (error) {
    console.error('Error getting group:', error);
    return null;
  }
};

export const getUserGroups = async (userId: string): Promise<(GroupDoc & { id: string })[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.GROUPS),
      where("memberIds", "array-contains", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    const groups: (GroupDoc & { id: string })[] = [];
    
    querySnapshot.forEach((doc) => {
      groups.push({
        id: doc.id,
        ...doc.data()
      } as GroupDoc & { id: string });
    });
    
    return groups;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};