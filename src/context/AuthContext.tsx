// The logged-in Firebase user, shared with every screen through useAuth()
import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { auth } from "@/lib/firebase";

interface AuthValue {
  user: User | null;
  // True until Firebase has read the saved login from the phone
  loading: boolean;
  // Re-reads the user after updateProfile(), so a new name shows everywhere
  refreshUser: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setVersion] = useState(0);

  useEffect(() => {
    // Firebase calls this at start-up and on every login or logout
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  // The User object is changed in place by updateProfile, so force a re-render
  const refreshUser = () => setVersion((v) => v + 1);

  return <AuthContext.Provider value={{ user, loading, refreshUser }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
