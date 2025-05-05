import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
  IonLoading,
} from "@ionic/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { auth } from "@/config/firebase";
import "./Login.css";

const Login: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const state = location.state as any;

  const message = state?.message;
  const prefillEmail = state?.email;
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(!!message);
  const [showLoading, setShowLoading] = useState(false);

  const from = state?.from?.pathname || "/";

  const handleLogin = async () => {
    const loadingTimeout = setTimeout(() => setShowLoading(true), 300);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      clearTimeout(loadingTimeout);
      setShowLoading(false);
      history.replace(from);
    } catch (err: any) {
      clearTimeout(loadingTimeout);
      setShowLoading(false);
      alert("Login fehlgeschlagen: " + err.message);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="login-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">Login</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonInput
                  type="email"
                  value={email}
                  label="Email"
                  labelPlacement="floating"
                  onIonChange={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonInput
                  type="password"
                  value={password}
                  label="Passwort"
                  labelPlacement="floating"
                  autofocus={!!prefillEmail}
                  onIonChange={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleLogin}
              >
                Einloggen
              </IonButton>

              <IonText className="ion-text-center signup-footer">
                <p>
                  Noch kein Konto? <Link to="/signup">Registrieren</Link>
                </p>
              </IonText>

              <IonToast
                isOpen={showToast}
                position="top"
                message={message?.text}
                duration={2500}
                color={message?.color}
                onDidDismiss={() => setShowToast(false)}
              />

              <IonLoading
                isOpen={showLoading}
                message="Anmeldung läuft..."
                spinner="crescent"
              />
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
