import React, { useEffect } from "react";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, Switch, useHistory } from "react-router-dom";
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
import "./config/firebase";

import { FirebaseMessaging } from "@capacitor-firebase/messaging";
import { onMessageListener } from "./services/notifications";
import type { PluginListenerHandle } from "@capacitor/core";

setupIonicReact();

<<<<<<< HEAD
const App: React.FC = () => (
  <IonApp>
<IonReactRouter>
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tab1" component={Tab1} />
      <Route exact path="/tab2" component={Tab2} />
      <Route exact path="/tab3" component={Tab3} />
      <Redirect exact from="/" to="/tab1" />
    </IonRouterOutlet>
    
    <IonTabBar slot="bottom">
      <IonTabButton tab="tab1" href="/tab1">
        <IonIcon aria-hidden="true" icon={triangle} />
        <IonLabel>Tab 1</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab2" href="/tab2">
        <IonIcon aria-hidden="true" icon={ellipse} />
        <IonLabel>Tab 2</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab3" href="/tab3">
        <IonIcon aria-hidden="true" icon={square} />
        <IonLabel>Tab 3</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
</IonReactRouter>
  </IonApp>
);
=======
// Create a separate component that has access to history
const NotificationHandler: React.FC = () => {
  const history = useHistory();
  useEffect(() => {
    let notificationTapHandle: PluginListenerHandle | null = null;
    let messageListenerCleanup: (() => void) | null = null;
>>>>>>> b004d3c70847d7957afd25c7a9af151405b5e9d1

    const setupNotificationListeners = async () => {
      try {
        console.log("Setting up notification listeners...");

        // Set up the foreground message listener
        messageListenerCleanup = onMessageListener((notification) => {
          console.log("Foreground notification handled:", notification);
        });

        // Set up the tap listener for when notification is tapped
        notificationTapHandle = await FirebaseMessaging.addListener(
          "notificationActionPerformed",
          (event: any) => {
            console.log("Push Notification tapped:", JSON.stringify(event));
            
            let groupId =
              event.notification?.data?.groupId ||
              event.notification?.extra?.groupId ||
              event.data?.groupId ||
              "";
            
            console.log("Extracted groupId:", groupId);
            
            if (groupId) {
              console.log("Navigating to chat:", `/chats/${groupId}`);
              history.push(`/chats/${groupId}`);
            } else {
              console.warn("No groupId found in notification");
              history.push('/chats');
            }
          }
        );
        
        console.log("All notification listeners set up successfully");
      } catch (error) {
        console.error("Error setting up notification listeners:", error);
      }
    };

    const timeoutId = setTimeout(() => {
      setupNotificationListeners();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      
      if (notificationTapHandle) {
        notificationTapHandle.remove();
        console.log("Notification tap listener cleaned up");
      }
      
      if (messageListenerCleanup) {
        messageListenerCleanup();
        console.log("Message listener cleaned up");
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <NotificationHandler />
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