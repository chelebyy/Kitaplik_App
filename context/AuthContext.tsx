import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { logError } from "../utils/errorUtils";

// Simple local user interface
export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "local_user_profile";

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await SecureStore.getItemAsync(USER_STORAGE_KEY);
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      logError("AuthContext.loadUser", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Giriş fonksiyonu - useCallback ile memoize edildi
  const signIn = useCallback(async (name: string) => {
    const newUser: User = {
      uid: "local-user-" + Date.now(),
      displayName: name,
      email: null, // No email for local user
      photoURL:
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(name) +
        "&background=random",
    };

    try {
      await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      logError("AuthContext.signIn", error);
    }
  }, []);

  // Çıkış fonksiyonu - useCallback ile memoize edildi
  const signOut = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      setUser(null);
    } catch (error) {
      logError("AuthContext.signOut", error);
    }
  }, []);

  // Context value - useMemo ile memoize edildi (S6481 düzeltmesi)
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
