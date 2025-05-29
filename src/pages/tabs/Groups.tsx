import React, { useState, useEffect } from "react";
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonToast,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonCardSubtitle,
  IonAvatar,
  IonImg,
  IonSpinner,
  IonChip,
  IonBadge,
  IonText,
  IonRouterLink,
  IonItemDivider,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  add,
  people,
  calendar,
  locationOutline,
  personOutline,
} from "ionicons/icons";
import "./Groups.css";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useAuth } from "@/hooks/useAuth";
import { createGroup, getAllGroups, getUserGroups } from "@/services/groups";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { generateHashedGradient } from "@/utils/colorGenerator";
import { formatDate } from "@/utils/timeFormatter";
import { GroupDoc } from "@/interfaces/firestore";

interface GroupWithId extends GroupDoc {
  id: string;
}

const Groups: React.FC = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [groups, setGroups] = useState<GroupWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<"all" | "mine">("all");

  // Fetch groups based on selected segment
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user && selectedSegment === "mine") {
        setGroups([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const db = getFirestore();
        let groupsList: GroupWithId[] = [];

        if (selectedSegment === "all") {
          // Fetch all groups
          groupsList = await getAllGroups();
        } else {
          // Fetch only user's groups
          if (user) {
            // Using the service function
            groupsList = await getUserGroups(user.uid);
          }
        }

        setGroups(groupsList);
      } catch (error) {
        console.error("Fehler beim Laden der Gruppen:", error);
        setToastMessage("Fehler beim Laden der Gruppen");
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [selectedSegment, user]);

  const handleCreateGroup = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!groupName.trim()) {
      setToastMessage("Please enter a group name");
      setShowToast(true);
      return;
    }

    try {
      // Create the group with the user as the creator and only member
      await createGroup(groupName, [user.uid], user.uid);

      // Reset the form and close the modal
      setGroupName("");
      setShowModal(false);

      // Show success message
      setToastMessage("Gruppe erfolgreich erstellt!");
      setShowToast(true);

      // Refresh the groups list
      const db = getFirestore();
      const q = query(
        collection(db, "groups"),
        where("memberIds", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const groupsList: GroupWithId[] = [];

      querySnapshot.forEach((doc) => {
        groupsList.push({
          id: doc.id,
          ...doc.data(),
        } as GroupWithId);
      });

      setGroups(groupsList);
    } catch (error) {
      console.error("Error creating group:", error);
      setToastMessage(
        "Fehler beim Erstellen der Gruppe. Bitte versuche es später erneut."
      );
      setShowToast(true);
    }
  };

  const handleSegmentChange = (e: CustomEvent) => {
    setSelectedSegment(e.detail.value);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gruppen</IonTitle>
          <IonButtons slot="end">
            <UserProfileDropdown user={user} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gruppen</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Segment control for filtering groups */}
        <IonSegment
          value={selectedSegment}
          onIonChange={handleSegmentChange}
          className="groups-segment"
        >
          <IonSegmentButton value="all">
            <IonLabel>Alle</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="mine">
            <IonLabel>Meine</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Display the list of groups */}
        {loading ? (
          <div className="ion-padding ion-text-center">
            <IonSpinner name="crescent" />
            <p>Gruppen werden geladen...</p>
          </div>
        ) : groups.length > 0 ? (
          <div className="ion-padding">
            {groups.map((group) => (
              <IonCard key={group.id} routerLink={`/groups/${group.id}`}>
                <div className="group-card-header">
                  {group.imageURL ? (
                    <img
                      src={group.imageURL}
                      alt={group.name}
                      className="group-image"
                    />
                  ) : (
                    /* Default group image with hashed gradient based on group name, createdBy and createdAt */
                    <div
                      className="default-group-image"
                      style={{
                        background: generateHashedGradient(group.id),
                      }}
                    >
                      <IonIcon icon={people} />
                    </div>
                  )}
                </div>
                {user && group.memberIds.includes(user.uid) && (
                  <IonBadge className="group-badge">Du nimmst teil</IonBadge>
                )}
                <IonCardHeader>
                  <IonCardTitle>{group.name}</IonCardTitle>
                  <IonCardSubtitle>
                    <IonIcon icon={personOutline} /> Mitglieder:{" "}
                    {group.memberIds.length}
                  </IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="group-created-at">
                    <IonIcon icon={calendar} /> Erstellt am{" "}
                    {formatDate(group.createdAt)}
                  </p>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        ) : (
          <div className="empty-groups-container ion-padding ion-text-center">
            <IonIcon icon={people} size="large" />
            <h2>Noch keine Gruppen</h2>
            <p>
              Erstelle eine neue Gruppe oder tritt einer bestehenden Gruppe bei.
            </p>
            <IonButton onClick={handleCreateGroup}>
              Neue Gruppe erstellen
            </IonButton>
          </div>
        )}

        {/* FAB Button for creating new groups */}
        {user && (
          <IonFab
            vertical="bottom"
            horizontal="end"
            slot="fixed"
            className="fab-padding"
          >
            <IonFabButton onClick={handleCreateGroup}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        )}

        {/* Create Group Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Neue Gruppe erstellen</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  Abbrechen
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Gruppenname*</IonLabel>
                <IonInput
                  value={groupName}
                  onIonChange={(e) => setGroupName(e.detail.value || "")}
                  placeholder="Gib einen Gruppennamen ein"
                  required
                />
              </IonItem>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSubmit}>
                Gruppe erstellen
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default Groups;
