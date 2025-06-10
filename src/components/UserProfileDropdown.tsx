import React, { useState } from 'react';
import { 
  IonIcon, 
  IonButton, 
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonText
} from '@ionic/react';
import { personCircle, personOutline, logOut } from 'ionicons/icons';
import { getAuth, signOut } from 'firebase/auth';
import './UserProfileDropdown.css';

interface UserProfileDropdownProps {
  user: any | null;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ user }) => {
  const [popoverState, setPopoverState] = useState<{ showPopover: boolean, event: Event | undefined }>({
    showPopover: false,
    event: undefined
  });

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      setPopoverState({ showPopover: false, event: undefined });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <IonIcon
        icon={personOutline}
        slot="end"
        className="user-profile-icon"
        aria-label="User Profil"
        onClick={(e: any) => {
          e.persist();
          setPopoverState({ showPopover: true, event: e });
        }}
      />
      <IonPopover
        isOpen={popoverState.showPopover}
        event={popoverState.event}
        onDidDismiss={() => setPopoverState({ showPopover: false, event: undefined })}
        className="user-profile-popover"
      >
        <IonList lines="none">
          <IonItem className="user-info-item">
            {user.photoURL ? (
              <IonAvatar slot="start">
                <img src={user.photoURL} alt="User avatar" />
              </IonAvatar>
            ) : (
              <IonIcon icon={personCircle} slot="start" size="large" />
            )}
            <IonLabel>
              <h2>{user.displayName || 'User'}</h2>
              <IonText color="medium">{user.email}</IonText>
            </IonLabel>
          </IonItem>
          <IonItem button onClick={handleLogout} detail={false}>
            <IonIcon icon={logOut} slot="start" color="danger" />
            <IonLabel color="danger">Logout</IonLabel>
          </IonItem>
        </IonList>
      </IonPopover>
    </>
  );
};

export default UserProfileDropdown;