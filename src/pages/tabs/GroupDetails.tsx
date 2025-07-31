import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonButton, IonList, IonItem, IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonIcon, IonToast, IonLoading, IonModal, IonInput
} from "@ionic/react";
import { calendar, people, pencil } from "ionicons/icons";

import { useParams } from "react-router";
import { getGroupById, updateGroup } from "@/services/groups";
import { getGroupEvents } from "@/services/events";
import { firestoreTimestampToDate } from "@/utils/timeFormatter";
import { GroupDoc, GroupEventDoc } from "@/interfaces/firestore";

interface RouteParams {
  groupId: string;
}

interface GroupWithId extends GroupDoc {
  id: string;
}

interface EventWithId extends GroupEventDoc {
  id: string;
}

const GroupDetails: React.FC = () => {
  const { groupId } = useParams<RouteParams>();

  const [group, setGroup] = useState<GroupWithId | null>(null);
  const [events, setEvents] = useState<EventWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedGroupName, setEditedGroupName] = useState("");

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    setLoading(true);
    try {
      const groupData = await getGroupById(groupId);
      if (groupData) {
        setGroup(groupData);
        setEditedGroupName(groupData.name);
      }
      const eventData = await getGroupEvents(groupId);
      setEvents(eventData);
    } catch (err) {
      console.error(err);
      setToastMessage("Fehler beim Laden der Gruppendaten.");
      setShowToast(true);
    }
    setLoading(false);
  };

  const handleSaveChanges = async () => {
    if (!group) return;
    try {
      await updateGroup(groupId, { name: editedGroupName });
      setShowEditModal(false);
      setToastMessage("Gruppe aktualisiert");
      setShowToast(true);
      await loadGroup();
    } catch (err) {
      console.error(err);
      setToastMessage("Fehler beim Aktualisieren");
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gruppendetails</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {loading ? (
          <IonLoading isOpen={loading} message="Lade Daten..." />
        ) : group ? (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>{group.name}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p><IonIcon icon={people} /> Mitglieder: {group.memberIds.length}</p>
                <p><IonIcon icon={calendar} /> Erstellt am: {firestoreTimestampToDate(group.createdAt).toLocaleDateString("de-DE")}</p>
                <IonButton fill="outline" onClick={() => setShowEditModal(true)}>
                  <IonIcon icon={pencil} slot="start" />
                  Gruppe bearbeiten
                </IonButton>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Mitglieder</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {group.memberIds.map((memberName, index) => (
                    <IonItem key={index}>
                      <IonLabel>{memberName}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Events</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
              <IonList>
                {events.length > 0 ? (
                  events.map(event => (
                    <IonItem
                      key={event.id}
                      routerLink={`/groups/${groupId}/events/${event.id}`}
                      detail
                    >
                      <IonLabel>
                        <h2>{event.name}</h2>
                        <p>{firestoreTimestampToDate(event.datetime).toLocaleString("de-DE")}</p>
                        <p>{event.location}</p>
                      </IonLabel>
                    </IonItem>
                  ))
                ) : (
                  <p>Keine Events vorhanden</p>
                )}
              </IonList>
              </IonCardContent>
            </IonCard>

            {/* Edit Modal */}
            <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>Gruppe bearbeiten</IonTitle>
                  <IonButtons slot="end">
                    <IonButton onClick={() => setShowEditModal(false)}>Schließen</IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Gruppenname</IonLabel>
                    <IonInput
                      value={editedGroupName}
                      onIonInput={(e) => setEditedGroupName(e.detail.value || "")}
                    />
                  </IonItem>
                </IonList>
                <div className="ion-padding">
                  <IonButton expand="block" onClick={handleSaveChanges}>Speichern</IonButton>
                </div>
              </IonContent>
            </IonModal>
          </>
        ) : (
          <p>Gruppe nicht gefunden.</p>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
        />
      </IonContent>
    </IonPage>
  );
};

export default GroupDetails;
