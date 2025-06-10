import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLoading,
} from "@ionic/react";
import { useState } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { register } from "@/services/auth";
import "./Signup.css";

const Signup: React.FC = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(displayName, email, password);

      history.push("/login", {
        from,
        message: {
          text: "Registrierung erfolgreich! Bitte logge dich ein.",
          color: "success",
        },
        email,
      });
    } catch (err: any) {
      alert("Fehler: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="signup-container">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle className="ion-text-center">Registrieren</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonInput
                  value={displayName}
                  label="Benutzername"
                  labelPlacement="floating"
                  onIonInput={(e) => setDisplayName(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonInput
                  type="email"
                  value={email}
                  label="Email"
                  labelPlacement="floating"
                  onIonInput={(e) => setEmail(e.detail.value!)}
                />
              </IonItem>

              <IonItem>
                <IonInput
                  type="password"
                  value={password}
                  label="Passwort"
                  labelPlacement="floating"
                  onIonInput={(e) => setPassword(e.detail.value!)}
                />
              </IonItem>

              <IonButton
                expand="block"
                className="ion-margin-top"
                onClick={handleRegister}
              >
                Registrieren
              </IonButton>

              <IonText className="ion-text-center login-footer">
                <p>
                  Bereits registriert? <Link to="/login">Zum Login</Link>
                </p>
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
      <IonLoading
        isOpen={loading}
        message="Registrierung läuft..."
        spinner="crescent"
      />
    </IonPage>
  );
};

export default Signup;
