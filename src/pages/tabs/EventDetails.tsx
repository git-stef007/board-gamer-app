import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonInput,
  IonLabel,
  IonItem,
  IonList,
  IonToast,
  IonModal,
  IonAlert,
  IonLoading,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  firestoreTimestampToDate,
  dateToFirestoreTimestamp,
} from "@/utils/timeFormatter";
import {
  getGroupEvents,
  deleteEvent,
  updateEvent,
} from "@/services/events";
import { GroupEventDoc } from "@/interfaces/firestore";
import { trash, create } from "ionicons/icons";

interface RouteParams {
  groupId: string;
  eventId: string;
}

const EventDetails: React.FC = () => {
  const { groupId, eventId } = useParams<RouteParams>();
  const history = useHistory();
  const { user } = useAuth();

  const [event, setEvent] = useState<(GroupEventDoc & { id: string }) | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Editierbare Felder
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [datetime, setDatetime] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      setLoading(true);
      try {
        const events = await getGroupEvents(groupId);
        const current = events.find((e) => e.id === eventId);
        if (current) {
          setEvent(current);
          setName(current.name);
          setLocation(current.location || "");
          setDatetime(firestoreTimestampToDate(current.datetime).toISOString().slice(0, 16));
        }
      } catch (err) {
        console.error("Fehler beim Laden des Events", err);
        setToastMessage("Fehler beim Laden");
        setShowToast(true);
      }
      setLoading(false);
    };

    loadEvent();
  }, [groupId, eventId]);

  const handleSave = async () => {
    if (!event || !name || !datetime) return;

    try {
      await updateEvent(groupId, eventId, {
        name,
        location,
        datetime: new Date(datetime),
      });

      setToastMessage("Event aktualisiert");
      setShowToast(true);
      setShowEdit(false);
      history.replace("/events");
    } catch (err) {
      console.error(err);
      setToastMessage("Aktualisierung fehlgeschlagen");
      setShowToast(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(groupId, eventId);
      setToastMessage("Event gelöscht");
      setShowToast(true);
      history.replace("/events");
    } catch (err) {
      console.error(err);
      setToastMessage("Fehler beim Löschen");
      setShowToast(true);
    }
  };

  if (loading || !event)
    return <IonLoading isOpen={true} message="Lädt..." />;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Event Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowEdit(true)}>
              <IonIcon icon={create} />
            </IonButton>
            <IonButton color="danger" onClick={() => setConfirmDelete(true)}>
              <IonIcon icon={trash} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>{event.name}</IonCardTitle>
            <IonCardSubtitle>
              {firestoreTimestampToDate(event.datetime).toLocaleString("de-DE")}
            </IonCardSubtitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Ort:</strong> {event.location || "–"}</p>
            <p><strong>Gastgeber:</strong> {event.host}</p>
            <p><strong>Teilnehmer:</strong> {event.participantIds?.length}</p>
          </IonCardContent>
        </IonCard>

        {/* Edit Modal */}
        <IonModal isOpen={showEdit} onDidDismiss={() => setShowEdit(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Event bearbeiten</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name</IonLabel>
                <IonInput
                  value={name}
                  onIonInput={(e) => setName(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Ort</IonLabel>
                <IonInput
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Datum & Zeit</IonLabel>
                <IonInput
                  type="datetime-local"
                  value={datetime}
                  onIonChange={(e) => setDatetime(e.detail.value!)}
                />
              </IonItem>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSave}>
                Speichern
              </IonButton>
              <IonButton expand="block" color="medium" onClick={() => setShowEdit(false)}>
                Abbrechen
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={3000}
          onDidDismiss={() => setShowToast(false)}
        />

        <IonAlert
          isOpen={confirmDelete}
          header="Event löschen?"
          message="Dieser Vorgang kann nicht rückgängig gemacht werden."
          buttons={[
            { text: "Abbrechen", role: "cancel" },
            {
              text: "Löschen",
              role: "destructive",
              handler: handleDelete,
            },
          ]}
          onDidDismiss={() => setConfirmDelete(false)}
        />
      </IonContent>
    </IonPage>
  );
};

export default EventDetails;
