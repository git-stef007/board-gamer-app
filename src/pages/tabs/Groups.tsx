import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../../components/ExploreContainer';
import './Groups.css';

const Groups: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Gruppen</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Gruppen</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ExploreContainer name="Gruppen page" />
      </IonContent>
    </IonPage>
  );
};

export default Groups;
