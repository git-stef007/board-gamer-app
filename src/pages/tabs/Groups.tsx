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
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
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
import { generateHashedGradient } from "@/utils/colorGenerator";
import { formatDate } from "@/utils/timeFormatter";
import { GroupDoc } from "@/interfaces/firestore";
import { firestoreTimestampToDate } from "@/utils/timeFormatter";

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

  // Extract fetchGroups into a separate function so it can be reused
  const fetchGroups = async () => {
    if (!user && selectedSegment === "mine") {
      setGroups([]);
      return;
    }

    try {
      let groupsList: GroupWithId[] = [];

      if (selectedSegment === "all") {
        // Fetch all groups
        groupsList = await getAllGroups();
      } else {
        // Fetch only user's groups
        if (user) {
          groupsList = await getUserGroups(user.uid);
        }
      }

      setGroups(groupsList);
    } catch (error) {
      console.error("Fehler beim Laden der Gruppen:", error);
      setToastMessage("Fehler beim Laden der Gruppen");
      setShowToast(true);
    }
  };

  // Fetch groups based on selected segment
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchGroups();
      setLoading(false);
    };

    loadInitialData();
  }, [selectedSegment, user]);

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    try {
      await fetchGroups();
    } catch (error) {
      console.error("Error refreshing groups:", error);
    } finally {
      event.detail.complete();
    }
  };

  const handleCreateGroup = () => {
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!groupName.trim()) {
      setToastMessage("Bitte gib einen Gruppennamen ein");
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
      await fetchGroups();
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
          {/* First toolbar with title and profile dropdown */}
          <IonTitle>Gruppen</IonTitle>
          <IonButtons slot="end">
            <UserProfileDropdown user={user} />
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          {/* Second toolbar with segment buttons */}
          <IonSegment
            value={selectedSegment}
            onIonChange={handleSegmentChange}
            className="toolbar-segment"
          >
            <IonSegmentButton value="all">
              <IonLabel>Alle</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="mine">
              <IonLabel>Meine</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon="chevron-down-circle-outline"
            pullingText="Zum Aktualisieren nach unten ziehen"
            refreshingSpinner="circles"
            refreshingText="Gruppen werden aktualisiert..."
          />
        </IonRefresher>

        <div className="center-horizontally">
          {/* Display the list of groups */}
          {loading ? (
            <div className="group-list">
              {[...Array(4)].map((_, index) => (
                <IonCard key={index}>
                  <div className="group-card-header">
                    <div
                      className="default-group-image"
                      style={{ background: "#333" }}
                    >
                      <IonSkeletonText
                        animated
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </div>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonSkeletonText animated style={{ width: "60%" }} />
                    </IonCardTitle>
                    <IonCardSubtitle>
                      <IonSkeletonText animated style={{ width: "40%" }} />
                    </IonCardSubtitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonSkeletonText animated style={{ width: "80%" }} />
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          ) : groups.length > 0 ? (
            <div className="group-list">
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
                      {firestoreTimestampToDate(
                        group.createdAt
                      ).toLocaleDateString("de-DE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
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
                Erstelle eine neue Gruppe oder tritt einer bestehenden Gruppe
                bei.
              </p>
              <IonButton onClick={handleCreateGroup}>
                Neue Gruppe erstellen
              </IonButton>
            </div>
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
                    onIonInput={(e) => setGroupName(e.detail.value || "")}
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
        </div>

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
      </IonContent>
    </IonPage>
  );
};

export default Groups;
