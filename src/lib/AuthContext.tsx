"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebase";
import { User, onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.reload(); // Refresh user data to update emailVerified
          setUser(auth.currentUser); // Set the refreshed user
          console.log("Auth state updated - UID:", user.uid, "Email Verified:", user.emailVerified);
        } catch (error: any) {
          console.error("Error refreshing user data:", error.message);
          setUser(user); // Fallback to the unrefreshed user
        }
      } else {
        setUser(null);
        console.log("No user authenticated");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
      console.log("User signed out successfully");
    } catch (error: any) {
      console.error("signout error:", error.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}