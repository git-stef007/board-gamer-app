import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { GroupDoc } from "@/interfaces/firestore";
import { dateToFirestoreTimestamp } from "@/utils/timeFormatter";

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

  try {
    const group: GroupDoc = {
      name: groupName,
      memberIds,
      createdBy,
      createdAt: dateToFirestoreTimestamp(new Date()),
    };

    const docRef = await FirebaseFirestore.addDocument({
      reference: COLLECTIONS.GROUPS,
      data: group
    });

    // Extract document ID from the reference path
    const pathParts = docRef.reference.path.split('/');
    return pathParts[pathParts.length - 1];
    
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
};

export const getGroupById = async (groupId: string): Promise<GroupDoc & { id: string } | null> => {
  try {
    const groupDocPath = `${COLLECTIONS.GROUPS}/${groupId}`;
    const groupDoc = await FirebaseFirestore.getDocument({
      reference: groupDocPath
    });
    
    if (groupDoc.snapshot?.data) {
      return {
        id: groupId,
        ...groupDoc.snapshot.data
      } as GroupDoc & { id: string };
    }
    return null;
  } catch (error) {
    console.error('Error getting group:', error);
    return null;
  }
};

export const getAllGroups = async (): Promise<(GroupDoc & { id: string })[]> => {
  try {
    const result = await FirebaseFirestore.getCollection({
      reference: COLLECTIONS.GROUPS,
      queryConstraints: [
        {
          type: 'orderBy',
          fieldPath: 'createdAt',
          directionStr: 'desc',
        },
      ],
    });
    
    const groups: (GroupDoc & { id: string })[] = result.snapshots.map((doc: any) => ({
      id: doc.id,
      ...doc.data
    } as GroupDoc & { id: string }));
    
    return groups;
  } catch (error) {
    console.error('Error fetching groups:', error);
    return [];
  }
};

export const getUserGroups = async (userId: string): Promise<(GroupDoc & { id: string })[]> => {
  try {
    // Since Capacitor Firebase doesn't support 'where' in queryConstraints,
    // we'll get all groups and filter them client-side
    const result = await FirebaseFirestore.getCollection({
      reference: COLLECTIONS.GROUPS,
      queryConstraints: [
        {
          type: 'orderBy',
          fieldPath: 'createdAt',
          directionStr: 'desc',
        },
      ],
    });
    
    // Filter groups where the user is a member
    const groups: (GroupDoc & { id: string })[] = result.snapshots
      .map((doc: any) => ({
        id: doc.id,
        ...doc.data
      } as GroupDoc & { id: string }))
      .filter((group) => group.memberIds && group.memberIds.includes(userId));
    
    return groups;
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return [];
  }
};