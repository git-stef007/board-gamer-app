import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { createContext, useEffect, useState, ReactNode } from "react";

export const AuthContext = createContext<{
  user: any;
  loading: boolean;
}>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: init");

    FirebaseAuthentication.addListener("authStateChange", (event) => {
      console.log("authStateChange", event.user);
      setUser(event.user ?? null);
      setLoading(false);
    });

    FirebaseAuthentication.getCurrentUser().then((res) => {
      console.log("getCurrentUser", res.user);
      setUser(res.user ?? null);
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
