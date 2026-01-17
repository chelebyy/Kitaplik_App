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
import { logErrorWithCrashlytics } from "../utils/errorUtils";
import { StorageService } from "../services/storage";

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
    if (isLoading) return false; // Loading sırasında false döndür
    if (!lastDailyClaimDate) return true;
    return lastDailyClaimDate !== getTodayString();
  }, [lastDailyClaimDate, isLoading]); // isLoading dependency eklendi

  // Load credits and last claim date on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Her iki async işlem de tamamen bitene kadar bekle
      await Promise.all([loadCredits(), loadLastClaimDate()]);
      // Şimdi her iki veri de güncel, güvenle isLoading=false yap
      setIsLoading(false);
    };
    void loadInitialData();
  }, []);

  const loadCredits = async () => {
    try {
      let storedCredits: string | null = null;
      if (Platform.OS === "web") {
        const webCredits =
          await StorageService.getItem<number>(CREDITS_STORAGE_KEY);
        storedCredits = webCredits === null ? null : webCredits.toString();
      } else {
        storedCredits = await SecureStore.getItemAsync(CREDITS_STORAGE_KEY);
      }

      if (storedCredits !== null) {
        setCredits(Number.parseInt(storedCredits, 10));
      }
    } catch (error) {
      await logErrorWithCrashlytics("CreditsContext.loadCredits", error);
    }
    // finally bloğu kaldırıldı - setIsLoading artık useEffect'te yapılıyor
  };

  const loadLastClaimDate = async () => {
    try {
      let storedDate: string | null = null;
      if (Platform.OS === "web") {
        storedDate = await StorageService.getItem<string>(LAST_DAILY_CLAIM_KEY);
      } else {
        storedDate = await SecureStore.getItemAsync(LAST_DAILY_CLAIM_KEY);
      }
      setLastDailyClaimDate(storedDate);
    } catch (error) {
      await logErrorWithCrashlytics("CreditsContext.loadLastClaimDate", error);
    }
  };

  const saveCredits = async (newCredits: number) => {
    try {
      if (Platform.OS === "web") {
        await StorageService.setItem(CREDITS_STORAGE_KEY, newCredits);
      } else {
        await SecureStore.setItemAsync(
          CREDITS_STORAGE_KEY,
          newCredits.toString(),
        );
      }
    } catch (error) {
      await logErrorWithCrashlytics("CreditsContext.saveCredits", error);
    }
  };

  const saveLastClaimDate = async (date: string) => {
    try {
      if (Platform.OS === "web") {
        await StorageService.setItem(LAST_DAILY_CLAIM_KEY, date);
      } else {
        await SecureStore.setItemAsync(LAST_DAILY_CLAIM_KEY, date);
      }
      setLastDailyClaimDate(date);
    } catch (error) {
      await logErrorWithCrashlytics("CreditsContext.saveLastClaimDate", error);
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
