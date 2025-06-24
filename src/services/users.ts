import { FirebaseFirestore } from "@capacitor-firebase/firestore";
import { COLLECTIONS } from "@/constants/firebase";
import { UserDoc } from "@/interfaces/firestore";

// Hole einen einzelnen User per ID
export const getUserById = async (userId: string): Promise<UserDoc | null> => {
  try {
    const doc = await FirebaseFirestore.getDocument({
      reference: `${COLLECTIONS.USERS}/${userId}`,
    });

    if (doc.snapshot?.data) {
      return doc.snapshot.data as UserDoc;
    }

    return null;
  } catch (err) {
    console.error("Error fetching user by ID", err);
    return null;
  }
};

// Hole mehrere User anhand einer Liste von IDs
export const getUsersByIds = async (userIds: string[]): Promise<UserDoc[]> => {
  const promises = userIds.map((id) => getUserById(id));
  const users = await Promise.all(promises);
  return users.filter((u): u is UserDoc => u !== null);
};
