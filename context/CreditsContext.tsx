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
  claimDailyCredit: () => Promise<boolean>;
  hasDailyCreditAvailable: boolean;
  isLoading: boolean;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

const CREDITS_STORAGE_KEY = "user_credits_v2";
const LAST_DAILY_CLAIM_KEY = "last_daily_claim_date";

// Bugünün tarihini YYYY-MM-DD formatında al
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export function CreditsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [credits, setCredits] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastDailyClaimDate, setLastDailyClaimDate] = useState<string | null>(
    null,
  );

  // Günlük kredi alınabilir mi?
  const hasDailyCreditAvailable = useMemo(() => {
    if (!lastDailyClaimDate) return true;
    return lastDailyClaimDate !== getTodayString();
  }, [lastDailyClaimDate]);

  // Load credits and last claim date on mount
  useEffect(() => {
    loadCredits();
    loadLastClaimDate();
  }, []);

  const loadCredits = async () => {
    try {
      let storedCredits: string | null = null;
      if (Platform.OS === "web") {
        storedCredits = await AsyncStorage.getItem(CREDITS_STORAGE_KEY);
      } else {
        storedCredits = await SecureStore.getItemAsync(CREDITS_STORAGE_KEY);
      }

      if (storedCredits !== null) {
        setCredits(Number.parseInt(storedCredits, 10));
      }
    } catch (error) {
      logError("CreditsContext.loadCredits", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLastClaimDate = async () => {
    try {
      let storedDate: string | null = null;
      if (Platform.OS === "web") {
        storedDate = await AsyncStorage.getItem(LAST_DAILY_CLAIM_KEY);
      } else {
        storedDate = await SecureStore.getItemAsync(LAST_DAILY_CLAIM_KEY);
      }
      setLastDailyClaimDate(storedDate);
    } catch (error) {
      logError("CreditsContext.loadLastClaimDate", error);
    }
  };

  const saveCredits = async (newCredits: number) => {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(CREDITS_STORAGE_KEY, newCredits.toString());
      } else {
        await SecureStore.setItemAsync(
          CREDITS_STORAGE_KEY,
          newCredits.toString(),
        );
      }
    } catch (error) {
      logError("CreditsContext.saveCredits", error);
    }
  };

  const saveLastClaimDate = async (date: string) => {
    try {
      if (Platform.OS === "web") {
        await AsyncStorage.setItem(LAST_DAILY_CLAIM_KEY, date);
      } else {
        await SecureStore.setItemAsync(LAST_DAILY_CLAIM_KEY, date);
      }
      setLastDailyClaimDate(date);
    } catch (error) {
      logError("CreditsContext.saveLastClaimDate", error);
    }
  };

  // Kredi ekleme fonksiyonu
  const addCredits = useCallback(async (amount: number) => {
    setCredits((prev) => {
      const newValue = prev + amount;
      void saveCredits(newValue);
      return newValue;
    });
  }, []);

  // Kredi harcama fonksiyonu
  const spendCredits = useCallback(
    async (amount: number): Promise<boolean> => {
      if (credits >= amount) {
        setCredits((prev) => {
          const newValue = prev - amount;
          void saveCredits(newValue);
          return newValue;
        });
        return true;
      }
      return false;
    },
    [credits],
  );

  // Günlük kredi alma fonksiyonu
  const claimDailyCredit = useCallback(async (): Promise<boolean> => {
    const today = getTodayString();

    // Bugün zaten alınmış mı kontrol et
    if (lastDailyClaimDate === today) {
      return false; // Zaten alınmış
    }

    // Kredi ekle ve tarihi kaydet
    setCredits((prev) => {
      const newValue = prev + 1;
      void saveCredits(newValue);
      return newValue;
    });

    await saveLastClaimDate(today);
    return true; // Başarılı
  }, [lastDailyClaimDate]);

  // Context value
  const contextValue = useMemo<CreditsContextType>(
    () => ({
      credits,
      addCredits,
      spendCredits,
      claimDailyCredit,
      hasDailyCreditAvailable,
      isLoading,
    }),
    [
      credits,
      addCredits,
      spendCredits,
      claimDailyCredit,
      hasDailyCreditAvailable,
      isLoading,
    ],
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
