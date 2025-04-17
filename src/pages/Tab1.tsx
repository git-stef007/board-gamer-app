import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonActionSheet
} from '@ionic/react';

import ExploreContainer from '../components/ExploreContainer';
import './Tab1.css';

const Tab1: React.FC = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const actionSheetButtons = [
    {
      text: 'Delete',
      role: 'destructive',
      handler: () => {
        console.log('Delete clicked');
      }
    },
    {
      text: 'Share',
      handler: () => {
        console.log('Share clicked');
      }
    },
    {
      text: 'Cancel',
      role: 'cancel'
    }
  ];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Tab 1</IonTitle>
          </IonToolbar>
        </IonHeader>

        <ExploreContainer name="Tab 1 page" />

        <IonButton expand="full" onClick={() => setShowActionSheet(true)}>
          Open Action Sheet
        </IonButton>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Actions"
          buttons={actionSheetButtons}
        />
      </IonContent>
    </IonPage>
  );
};

export default Tab1;
