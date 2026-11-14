// The logged-in Firebase user, shared with every screen through useAuth()
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { isDeletedAccount } from "@/lib/account";
import { auth } from "@/lib/firebase";
import { signOutOfGoogle } from "@/lib/googleSignIn";

interface AuthValue {
  user: User | null;
  // True until Firebase has read the saved login from the phone
  loading: boolean;
  // Re-reads the user after updateProfile(), so a new name shows everywhere
  refreshUser: () => void;
  // True after a deleted account tried to log in, so the logged-out screens
  // can say why (see DeletedNotice)
  deletedSignIn: boolean;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletedSignIn, setDeletedSignIn] = useState(false);
  const [, setVersion] = useState(0);

  useEffect(() => {
    // Firebase calls this at start-up (saved login) and on every login or logout
    return onAuthStateChanged(auth, async (firebaseUser) => {
      // A deleted account (is_deleted on its profile, same as the website) is
      // logged out again before any screen sees it or anything is written.
      // signOut runs this function once more with no user, which ends loading.
      if (firebaseUser && (await isDeletedAccount(firebaseUser.uid))) {
        setDeletedSignIn(true);
        await signOutOfGoogle();
        await signOut(auth);
        return;
      }

      if (firebaseUser) setDeletedSignIn(false); // a normal login clears the notice
      setUser(firebaseUser);
      setLoading(false);
    });
  }, []);

  // The User object is changed in place by updateProfile, so force a re-render
  const refreshUser = () => setVersion((v) => v + 1);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, deletedSignIn }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
