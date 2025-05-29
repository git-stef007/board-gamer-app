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
  IonContent,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import {
  calendarOutline,
  peopleOutline,
  chatbubblesOutline,
} from "ionicons/icons";

import Events from "./pages/tabs/Events";
import Groups from "./pages/tabs/Groups";
import ChatsList from "./pages/tabs/ChatsList";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { usePushNotifications } from "./hooks/usePushNotifications";
import ChatView from "./pages/chat/ChatView";

import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";

import "./theme/variables.css";
import "./App.css";

setupIonicReact();

const App: React.FC = () => {
  usePushNotifications();

  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Switch>
              {/* Public Routes */}
              <Route path="/login" exact>
                <Login />
              </Route>
              <Route path="/signup" exact>
                <Signup />
              </Route>

              {/* Protected Routes */}
              <ProtectedRoute>
                <IonTabs>
                  <IonRouterOutlet>
                    <Route path="/events" exact>
                      <Events />
                    </Route>
                    <Route path="/groups" exact>
                      <Groups />
                    </Route>
                    <Route path="/chats" exact>
                      <ChatsList />
                    </Route>
                    <Route path="/chats/:groupId" exact>
                      <ChatView />
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
};

export default App;
