import { Redirect, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import React, { ReactNode, useState, useEffect } from "react";
import { IonLoading } from "@ionic/react";

interface Props {
  children: ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (loading) {
      timeout = setTimeout(() => setShowSpinner(true), 300);
    } else {
      setShowSpinner(false);
    }

    return () => clearTimeout(timeout);
  }, [loading]);

  if (loading) {
    return showSpinner ? (
      // Firebase Auth loading indicator
      <IonLoading isOpen message="Authentifizierung..." />
    ) : null;
  }

  return user ? (
    <>{children}</>
  ) : (
    <Redirect
      to={{
        pathname: "/login",
        state: { from: location.pathname || "/" },
      }}
    />
  );
};

export default ProtectedRoute;