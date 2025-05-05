import React from 'react';
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
  IonActionSheet
} from '@ionic/react';

import './Events.css';

const Events: React.FC = () => {
  const [showActionSheet, setShowActionSheet] = React.useState(false);

  const actionSheetButtons = [
    {
      text: 'Absagen',
      role: 'destructive',
      handler: () => {
        console.log('Absage geschickt');
      }
    },
    {
      text: 'Nachricht senden',
      handler: () => {
        console.log('Nachricht gesendet');
      }
    },
    {
      text: 'Abbrechen',
      role: 'cancel'
    }
  ];

  // Beispiel-Daten für nächsten Termin
  const nextEvent = {
    date: 'Freitag, 26. April 2025',
    time: '19:00 Uhr',
    host: 'Lisa Müller',
    location: 'Musterstraße 12, 12345 Beispielstadt'
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Spieltermine</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">

        <IonCard>
          <IonCardHeader>
            <IonCardSubtitle>Nächster Termin</IonCardSubtitle>
            <IonCardTitle>{nextEvent.date} – {nextEvent.time}</IonCardTitle>
          </IonCardHeader>
          <div className="ion-padding">
            <p><strong>Gastgeber:</strong> {nextEvent.host}</p>
            <p><strong>Adresse:</strong> {nextEvent.location}</p>
            <IonButton expand="block" onClick={() => setShowActionSheet(true)}>
              Ich komme zu spät
            </IonButton>
          </div>
        </IonCard>

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

export default Events;
