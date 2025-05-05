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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useLocation, useHistory, Link } from "react-router-dom";
import { auth, db } from "@/config/firebase";

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
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = result.user;

      await updateProfile(user, { displayName });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName,
        createdAt: new Date().toISOString(),
      });

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
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              Registrieren
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonInput
                value={displayName}
                label="Benutzername"
                labelPlacement="floating"
                onIonChange={(e) => setDisplayName(e.detail.value!)}
              />
            </IonItem>

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
                onIonChange={(e) => setPassword(e.detail.value!)}
              />
            </IonItem>

            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={handleRegister}
            >
              Registrieren
            </IonButton>

            <IonText className="ion-text-center ion-margin-top">
              <p>
                Bereits registriert? <Link to="/login">Zum Login</Link>
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>
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
