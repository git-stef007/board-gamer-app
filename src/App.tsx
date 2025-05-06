import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonPage,
  IonContent
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, Switch } from 'react-router-dom';
import { calendarOutline, peopleOutline, chatbubblesOutline } from 'ionicons/icons';

import Events from './pages/tabs/Events';
import Groups from './pages/tabs/Groups';
import Chats from './pages/tabs/Chats';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

import './theme/variables.css';
import './App.css';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Switch>
            {/* Public Routes */}
            <Route path="/login" exact>
              <IonPage><IonContent className="ion-padding"><Login /></IonContent></IonPage>
            </Route>
            <Route path="/signup" exact>
              <IonPage><IonContent className="ion-padding"><Signup /></IonContent></IonPage>
            </Route>

            {/* Protected Tabs */}
            <ProtectedRoute>
              <IonTabs>
                <IonRouterOutlet>
                  <Route path="/events" exact>
                    <IonPage><IonContent><Events /></IonContent></IonPage>
                  </Route>
                  <Route path="/groups" exact>
                    <IonPage><IonContent><Groups /></IonContent></IonPage>
                  </Route>
                  <Route path="/chats" exact>
                    <IonPage><IonContent><Chats /></IonContent></IonPage>
                  </Route>
                  <Route exact path="/">
                    <Redirect to="/events" />
                  </Route>
                </IonRouterOutlet>

                <IonTabBar slot="bottom">
                  <IonTabButton tab="events" href="/events">
                    <IonIcon icon={calendarOutline} />
                    <IonLabel>Termine</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="groups" href="/groups">
                    <IonIcon icon={peopleOutline} />
                    <IonLabel>Gruppen</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="chats" href="/chats">
                    <IonIcon icon={chatbubblesOutline} />
                    <IonLabel>Chats</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </ProtectedRoute>
          </Switch>
        </IonRouterOutlet>
      </IonReactRouter>
    </AuthProvider>
  </IonApp>
);

export default App;
