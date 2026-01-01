import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logError } from "../utils/errorUtils";

interface CreditsContextType {
  credits: number;
  addCredits: (amount: number) => Promise<void>;
  spendCredits: (amount: number) => Promise<boolean>;
  isLoading: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const CREDITS_STORAGE_KEY = "user_credits_v2"; // Changed key for migration

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load credits on mount
  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = async () => {
    try {
      let storedCredits: string | null = null;
      if (Platform.OS !== "web") {
        storedCredits = await SecureStore.getItemAsync(CREDITS_STORAGE_KEY);
      } else {
        storedCredits = await AsyncStorage.getItem(CREDITS_STORAGE_KEY);
      }

      if (storedCredits !== null) {
        setCredits(parseInt(storedCredits, 10));
      }
    } catch (error) {
      logError("CreditsContext.loadCredits", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCredits = async (newCredits: number) => {
    try {
      if (Platform.OS !== "web") {
        await SecureStore.setItemAsync(
          CREDITS_STORAGE_KEY,
          newCredits.toString()
        );
      } else {
        await AsyncStorage.setItem(CREDITS_STORAGE_KEY, newCredits.toString());
      }
    } catch (error) {
      logError("CreditsContext.saveCredits", error);
    }
  };

  // Kredi ekleme fonksiyonu - useCallback ile memoize edildi
  const addCredits = useCallback(async (amount: number) => {
    setCredits((prev) => {
      const newValue = prev + amount;
      saveCredits(newValue);
      return newValue;
    });
  }, []);

  // Kredi harcama fonksiyonu - useCallback ile memoize edildi
  const spendCredits = useCallback(
    async (amount: number): Promise<boolean> => {
      if (credits >= amount) {
        setCredits((prev) => {
          const newValue = prev - amount;
          saveCredits(newValue);
          return newValue;
        });
        return true;
      }
      return false;
    },
    [credits]
  );

  // Context value - useMemo ile memoize edildi (S6481 düzeltmesi)
  const contextValue = useMemo<CreditsContextType>(
    () => ({
      credits,
      addCredits,
      spendCredits,
      isLoading,
    }),
    [credits, addCredits, spendCredits, isLoading]
  );

  return (
    <CreditsContext.Provider value={contextValue}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error("useCredits must be used within a CreditsProvider");
  }
  return context;
}
