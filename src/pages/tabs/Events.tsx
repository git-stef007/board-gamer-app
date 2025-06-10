/* import React, { useState, useEffect } from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonButton,
  IonActionSheet,
  IonButtons,
  IonCardContent,
} from "@ionic/react";
import "./Events.css";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { useAuth } from "@/hooks/useAuth";

const Events: React.FC = () => {
  const { user } = useAuth();
  const [showActionSheet, setShowActionSheet] = React.useState(false);

  const actionSheetButtons = [
    {
      text: "Absagen",
      role: "destructive",
      handler: () => {
        console.log("Absage geschickt");
      },
    },
    {
      text: "Nachricht senden",
      handler: () => {
        console.log("Nachricht gesendet");
      },
    },
    {
      text: "Abbrechen",
      role: "cancel",
    },
  ];

  // Beispiel-Daten für nächsten Termin
  const nextEvent = {
    date: "Freitag, 26. April 2025",
    time: "19:00 Uhr",
    host: "Lisa Müller",
    location: "Musterstraße 12, 12345 Beispielstadt",
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
        <div
          className="center-horizontally"
        >
          <IonCard>
            <IonCardHeader>
              <IonCardSubtitle>Nächster Termin</IonCardSubtitle>
              <IonCardTitle>
                {nextEvent.date} – {nextEvent.time}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>
                <strong>Gastgeber:</strong> {nextEvent.host}
              </p>
              <p>
                <strong>Adresse:</strong> {nextEvent.location}
              </p>
              <IonButton
                expand="block"
                onClick={() => setShowActionSheet(true)}
              >
                Ich komme zu spät
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Aktion wählen"
          buttons={actionSheetButtons}
        />
      </IonContent>
    </IonPage>
  );
};

export default Events; */

// tabs/Events.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonButtons,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonButton, IonModal, IonInput, IonLabel, IonItem,
  IonList, IonToast, IonIcon, IonRefresher, IonRefresherContent, RefresherEventDetail
} from "@ionic/react";
import { calendar, add } from "ionicons/icons";

import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { getAllEvents, createEvent } from "@/services/events";
import { getUserGroups } from "@/services/groups";
import { firestoreTimestampToDate } from "@/utils/timeFormatter";

interface EventWithId {
  id: string;
  groupId: string;
  date: string;
  hostId: string;
  location: string;
  createdAt: any;
}

const Events: React.FC = () => {
  const { user } = useAuth();

  const [events, setEvents] = useState<EventWithId[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [groupId, setGroupId] = useState("");
  const [userGroups, setUserGroups] = useState<{ id: string; name: string }[]>([]);

  const fetchEvents = async () => {
    try {
      const events = await getAllEvents();
      setEvents(events);
    } catch (err) {
      console.error(err);
      setToastMessage("Fehler beim Laden der Termine");
      setShowToast(true);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await fetchEvents();
    if (user) {
      const groups = await getUserGroups(user.uid);
      setUserGroups(groups.map((g) => ({ id: g.id, name: g.name })));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await fetchEvents();
    event.detail.complete();
  };

  const handleSubmit = async () => {
    if (!user || !date || !location || !groupId) {
      setToastMessage("Bitte alle Felder ausfüllen.");
      setShowToast(true);
      return;
    }

    try {
      await createEvent({
        groupId,
        date,
        location,
        hostId: user.uid,
        createdAt: new Date().toISOString(),
      });
      setToastMessage("Termin erstellt!");
      setShowModal(false);
      await fetchEvents();
    } catch (err) {
      console.error(err);
      setToastMessage("Fehler beim Erstellen");
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
            <IonCard key={event.id}>
              <IonCardHeader>
                <IonCardSubtitle>
                  {new Date(event.date).toLocaleString("de-DE")}
                </IonCardSubtitle>
                <IonCardTitle>📍 {event.location}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                Gastgeber: {event.hostId}
                {/* Optional: mehr Infos anzeigen */}
              </IonCardContent>
            </IonCard>
          ))
        ) : (
          <p className="ion-text-center">Noch keine Termine vorhanden.</p>
        )}

        <IonButton expand="block" onClick={() => setShowModal(true)}>
          <IonIcon icon={add} slot="start" /> Neuen Termin erstellen
        </IonButton>

        {/* Modal zum Erstellen */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Neuen Termin erstellen</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Abbrechen</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
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
                <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                  <option value="">Bitte wählen</option>
                  {userGroups.map((group) => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </IonItem>
            </IonList>
            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSubmit}>Termin erstellen</IonButton>
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
