import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { logError } from "../utils/errorUtils";
import {
  scheduleDailyNotification,
  scheduleWeeklyNotification,
  cancelNotification,
  NOTIFICATION_IDS,
  parseTimeString,
} from "../services/NotificationService";

// Bildirim ayarları interface'i
export interface NotificationSettings {
  dailyReadingReminder: boolean; // #1 Günlük okuma hatırlatması
  dailyReminderTime: string; // "20:00" formatında
  inactiveUserAlert: boolean; // #2 Pasif kullanıcı uyarısı
  readingProgressAlert: boolean; // #3 Okuma ilerlemesi (%75+)
  dailyCreditReminder: boolean; // #4 Günlük kredi hatırlatması
  weeklyToReadSummary: boolean; // #5 Haftalık özet
  bookCompletionCelebration: boolean; // #6 Kitap bitirme kutlaması
  yearEndSummary: boolean; // #7 Yıl sonu özeti
  magicRecommendationAlert: boolean; // #8 Sihirli öneri hazır
}

// Varsayılan ayarlar - kullanıcı deneyimini optimize etmek için bazıları kapalı
// Günde en fazla 1 bildirim (sadece okuma hatırlatması)
const DEFAULT_SETTINGS: NotificationSettings = {
  dailyReadingReminder: true, // Ana bildirim - günde 1 kez
  dailyReminderTime: "20:00",
  inactiveUserAlert: true, // 3 gün sonra bir kez
  readingProgressAlert: true, // Event-driven, nadir
  dailyCreditReminder: false, // KAPALI - günlük spam önleme
  weeklyToReadSummary: false, // KAPALI - kullanıcı isterse açsın
  bookCompletionCelebration: true, // Event-driven, nadir
  yearEndSummary: true, // Yılda 1 kez
  magicRecommendationAlert: false, // KAPALI - kullanıcı isterse açsın
};

interface NotificationContextType {
  settings: NotificationSettings;
  isLoading: boolean;
  hasPermission: boolean;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => Promise<void>;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

const NOTIFICATION_SETTINGS_KEY = "notification_settings_v1";

// Bildirim davranışını ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // İlk yüklemede ayarları ve izinleri kontrol et
  useEffect(() => {
    loadSettings();
    checkPermission();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(
        NOTIFICATION_SETTINGS_KEY,
      );
      let finalSettings = DEFAULT_SETTINGS;
      if (storedSettings) {
        const parsed = JSON.parse(
          storedSettings,
        ) as Partial<NotificationSettings>;
        // Varsayılanlarla birleştir (yeni eklenen ayarlar için)
        finalSettings = { ...DEFAULT_SETTINGS, ...parsed };
      }
      setSettings(finalSettings);

      // İzin varsa bildirimleri zamanla (ilk yükleme)
      if (Platform.OS !== "web") {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          await scheduleAllEnabledNotifications(finalSettings);
        }
      }
    } catch (error) {
      logError("NotificationContext.loadSettings", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aktif bildirimleri toplu zamanlama (ilk yükleme veya izin sonrası)
  const scheduleAllEnabledNotifications = async (
    currentSettings: NotificationSettings,
  ) => {
    if (Platform.OS === "web") return;

    const { hour, minute } = parseTimeString(currentSettings.dailyReminderTime);

    // Günlük okuma hatırlatması
    if (currentSettings.dailyReadingReminder) {
      await scheduleDailyNotification(
        NOTIFICATION_IDS.DAILY_READING_REMINDER,
        { title: "📚 Okuma Vakti!", body: "Bugün kitabına baktın mı?" },
        hour,
        minute,
      );
    }

    // Günlük kredi hatırlatması (varsayılan kapalı ama kullanıcı açarsa)
    if (currentSettings.dailyCreditReminder) {
      await scheduleDailyNotification(
        NOTIFICATION_IDS.DAILY_CREDIT_REMINDER,
        {
          title: "🎁 Günlük Kredin Hazır!",
          body: "Bugün kredini almayı unutma!",
        },
        10,
        0,
      );
    }

    // Haftalık özet (varsayılan kapalı ama kullanıcı açarsa)
    if (currentSettings.weeklyToReadSummary) {
      await scheduleWeeklyNotification(
        NOTIFICATION_IDS.WEEKLY_SUMMARY,
        {
          title: "📖 Haftalık Özet",
          body: "Bu hafta okuma listeni kontrol et!",
        },
        7, // Pazar
        18,
        0,
      );
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(
        NOTIFICATION_SETTINGS_KEY,
        JSON.stringify(newSettings),
      );
    } catch (error) {
      logError("NotificationContext.saveSettings", error);
    }
  };

  const checkPermission = async () => {
    try {
      if (Platform.OS === "web") {
        setHasPermission(false);
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();
      setHasPermission(status === "granted");
    } catch (error) {
      logError("NotificationContext.checkPermission", error);
    }
  };

  // İzin isteme fonksiyonu - kullanıcı ayarlardan toggle açtığında çağrılır
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === "web") {
        return false;
      }
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      const granted = finalStatus === "granted";
      setHasPermission(granted);

      // İzin verildiyse aktif bildirimleri zamanla
      if (granted) {
        await scheduleAllEnabledNotifications(settings);
      }

      return granted;
    } catch (error) {
      logError("NotificationContext.requestPermission", error);
      return false;
    }
  }, [settings]);

  // Bildirim zamanlamalarını senkronize et
  const syncNotificationSchedule = useCallback(
    async (
      key: keyof NotificationSettings,
      value: boolean | string,
      allSettings: NotificationSettings,
    ) => {
      if (Platform.OS === "web") return;

      const { hour, minute } = parseTimeString(allSettings.dailyReminderTime);

      switch (key) {
        case "dailyReadingReminder":
          if (value) {
            await scheduleDailyNotification(
              NOTIFICATION_IDS.DAILY_READING_REMINDER,
              { title: "📚 Okuma Vakti!", body: "Bugün kitabına baktın mı?" },
              hour,
              minute,
            );
          } else {
            await cancelNotification(NOTIFICATION_IDS.DAILY_READING_REMINDER);
          }
          break;
        case "dailyCreditReminder":
          if (value) {
            await scheduleDailyNotification(
              NOTIFICATION_IDS.DAILY_CREDIT_REMINDER,
              {
                title: "🎁 Günlük Kredin Hazır!",
                body: "Bugün kredini almayı unutma!",
              },
              10,
              0,
            );
          } else {
            await cancelNotification(NOTIFICATION_IDS.DAILY_CREDIT_REMINDER);
          }
          break;
        case "weeklyToReadSummary":
          if (value) {
            await scheduleWeeklyNotification(
              NOTIFICATION_IDS.WEEKLY_SUMMARY,
              {
                title: "📖 Haftalık Özet",
                body: "Bu hafta okuma listeni kontrol et!",
              },
              7, // Pazar
              18,
              0,
            );
          } else {
            await cancelNotification(NOTIFICATION_IDS.WEEKLY_SUMMARY);
          }
          break;
        case "inactiveUserAlert":
          // Bu bildirim, kullanıcı 3 gün girmediğinde tetiklenir
          // Şu an için sadece ON/OFF durumu kaydediliyor
          break;
        default:
          // Diğer ayarlar için özel zamanlama gerekmiyor
          break;
      }
    },
    [],
  );

  // Tek bir ayarı güncelle
  const updateSetting = useCallback(
    async <K extends keyof NotificationSettings>(
      key: K,
      value: NotificationSettings[K],
    ) => {
      // Boolean ayarlar için izin kontrolü
      if (typeof value === "boolean" && value === true && !hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          // İzin verilmediyse değişiklik yapma
          return;
        }
      }

      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        // Async olarak kaydet
        void saveSettings(newSettings);
        // Bildirim zamanlamalarını güncelle
        void syncNotificationSchedule(key, value, newSettings);
        return newSettings;
      });
    },
    [hasPermission, requestPermission, syncNotificationSchedule],
  );

  // Context value - useMemo ile memoize
  const contextValue = useMemo<NotificationContextType>(
    () => ({
      settings,
      isLoading,
      hasPermission,
      updateSetting,
      requestPermission,
    }),
    [settings, isLoading, hasPermission, updateSetting, requestPermission],
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
