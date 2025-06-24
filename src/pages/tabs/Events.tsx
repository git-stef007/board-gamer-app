// src/pages/tabs/Events.tsx

import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonContent, IonRefresher, IonRefresherContent, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonModal, IonInput, IonLabel, IonItem, IonList,
  IonToast, IonSelect, IonSelectOption, IonIcon, useIonViewWillEnter
} from "@ionic/react";
import { add } from "ionicons/icons";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { getAllGroups } from "@/services/groups";
import { createEvent, getAllEvents } from "@/services/events";
import { getUserById } from "@/services/users"; 
import { firestoreTimestampToDate, dateToFirestoreTimestamp } from "@/utils/timeFormatter";
import { GroupDoc, GroupEventDoc } from "@/interfaces/firestore";

import "./Events.css";

interface EventWithId extends GroupEventDoc {
  id: string;
  groupId: string;
  groupName?: string;
  hostName?: string;
}



const Events: React.FC = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState<EventWithId[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [groupId, setGroupId] = useState("");
  const [allGroups, setAllGroups] = useState<{ id: string; name: string }[]>([]);

  useIonViewWillEnter(() => {
    fetchEvents();
    fetchGroups(); 
  });

  // Events laden
const fetchEvents = async () => {
  setLoading(true); 
  try {
    const fetchedEvents = await getAllEvents();
    const allGroups = await getAllGroups();

    const groupNameMap = allGroups.reduce((acc, group) => {
      acc[group.id] = group.name;
      return acc;
    }, {} as Record<string, string>);

    const enrichedEvents = await Promise.all(
      fetchedEvents.map(async (event) => {
        const groupName = groupNameMap[event.groupId] || "Unbekannte Gruppe";
        let hostName = event.host;
        try {
          const user = await getUserById(event.host);
          if (user?.displayName) {
            hostName = user.displayName;
          }
        } catch (err) {
          console.warn("Fehler beim Laden des Host-Users:", err);
        }

        return {
          ...event,
          groupName,
          hostName,
        };
      })
    );

    setEvents(enrichedEvents);
  } catch (err) {
    console.error(err);
    setToastMessage("Fehler beim Laden der Termine");
    setShowToast(true);
  } finally {
    setLoading(false); 
  }
};


  // Gruppen laden
  const fetchGroups = async () => {
    try {
      const groups = await getAllGroups();
      setAllGroups(groups.map((group) => ({ id: group.id, name: group.name })));
    } catch (err) {
      console.error(err);
      setToastMessage("Fehler beim Laden der Gruppen");
      setShowToast(true);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await fetchEvents();
    await fetchGroups();
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const handleRefresh = async (event: CustomEvent) => {
    await fetchEvents();
    event.detail.complete();
  };

const handleSubmit = async () => {
  if (!user || !name || !date || !location || !groupId) {
    setToastMessage("Bitte alle Felder ausfüllen.");
    setShowToast(true);
    return;
  }

  const parsedDate = new Date(date);

  const newEvent: Omit<GroupEventDoc, "host"> = {
    name,
    datetime: dateToFirestoreTimestamp(parsedDate),
    location,
    createdAt: dateToFirestoreTimestamp(new Date()),
    gameSuggestions: [],
    participantIds: [user.uid]
  };

  try {
    await createEvent(groupId, newEvent); // Event wird erstellt
    await fetchEvents();                  // Events neu laden
    setToastMessage("Termin erfolgreich erstellt!");
    setShowModal(false);
  } catch (error) {
    console.error(error);
    setToastMessage("Fehler beim Erstellen des Termins");
  } finally {
    setShowToast(true);
  }
};


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Spieltermine</IonTitle>
          <IonButtons slot="end">
            <UserProfileDropdown user={user} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

      {!loading && events.length > 0 ? (
        events.map((event) => (
          <IonCard
            key={event.id}
            routerLink={`/groups/${event.groupId}/events/${event.id}`}
            button
          >
            <IonCardHeader>
              <IonCardSubtitle>
                {firestoreTimestampToDate(event.createdAt).toLocaleString("de-DE")}
              </IonCardSubtitle>
              <IonCardTitle>{event.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>Gruppe:</strong> {event.groupName || "Unbekannte Gruppe"}</p>
              <p><strong>Datum:</strong> {firestoreTimestampToDate(event.datetime).toLocaleString("de-DE")}</p>
              <p><strong>Ort:</strong> {event.location}</p>
              <p><strong>Gastgeber:</strong> {event.hostName || event.host}</p>  {/* Fallback auf UID */}
            </IonCardContent>
          </IonCard>
        ))
      ) : (
        <p className="ion-text-center">Noch keine Termine vorhanden.</p>
      )}


        {user && (
          <IonButton expand="block" onClick={() => setShowModal(true)}>
            <IonIcon icon={add} slot="start" />
            Neuen Termin erstellen
          </IonButton>
        )}

        {/* Modal für neuen Termin */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Neuer Spieltermin</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Abbrechen</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Name des Events</IonLabel>
                <IonInput value={name} onIonChange={(e) => setName(e.detail.value!)} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Datum & Uhrzeit</IonLabel>
                <IonInput type="datetime-local" value={date} onIonChange={(e) => setDate(e.detail.value!)} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Ort</IonLabel>
                <IonInput value={location} onIonChange={(e) => setLocation(e.detail.value!)} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Gruppe</IonLabel>
                <IonSelect value={groupId} onIonChange={(e) => setGroupId(e.detail.value)}>
                  <IonSelectOption value="">Bitte wählen</IonSelectOption>
                  {allGroups.map((group) => (
                    <IonSelectOption key={group.id} value={group.id}>
                      {group.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSubmit}>
                Termin erstellen
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

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

export default Events;
