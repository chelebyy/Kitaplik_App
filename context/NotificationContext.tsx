import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { logError } from "../utils/errorUtils";
import { StorageService } from "../services/storage";
import {
  scheduleDailyNotification,
  scheduleWeeklyNotification,
  scheduleInactiveUserNotification,
  scheduleMagicRecommendationNotification,
  scheduleYearEndNotification,
  cancelNotification,
  NOTIFICATION_IDS,
} from "../services/NotificationService";
import {
  DAILY_CREDIT_REMINDER_HOUR,
  DAILY_CREDIT_REMINDER_MINUTE,
  DEFAULT_INACTIVE_USER_DAYS,
  DEFAULT_MAGIC_RECOMMENDATION_DAYS,
  WEEKLY_SUMMARY_WEEKDAY,
  WEEKLY_SUMMARY_HOUR,
  WEEKLY_SUMMARY_MINUTE,
  NOTIFICATION_SETTINGS_KEY,
  INITIAL_PERMISSION_ASKED_KEY,
} from "../constants/Notifications";

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

// Notification scheduler handler type
type NotificationScheduler = (value: boolean) => Promise<void>;

// Daily reading reminder handlers
const enableDailyReadingReminder = async () => {
  await scheduleDailyNotification(
    NOTIFICATION_IDS.DAILY_READING_REMINDER,
    { title: "📚 Okuma Vakti!", body: "Bugün kitabına baktın mı?" },
    20, // hour - from dailyReminderTime setting
    0, // minute
  );
};

const disableDailyReadingReminder = async () => {
  await cancelNotification(NOTIFICATION_IDS.DAILY_READING_REMINDER);
};

const handleDailyReadingReminder: NotificationScheduler = async (value) => {
  if (value) {
    await enableDailyReadingReminder();
  } else {
    await disableDailyReadingReminder();
  }
};

// Daily credit reminder handlers
const enableDailyCreditReminder = async () => {
  await scheduleDailyNotification(
    NOTIFICATION_IDS.DAILY_CREDIT_REMINDER,
    {
      title: "🎁 Günlük Kredin Hazır!",
      body: "Bugün kredini almayı unutma!",
    },
    DAILY_CREDIT_REMINDER_HOUR,
    DAILY_CREDIT_REMINDER_MINUTE,
  );
};

const disableDailyCreditReminder = async () => {
  await cancelNotification(NOTIFICATION_IDS.DAILY_CREDIT_REMINDER);
};

const handleDailyCreditReminder: NotificationScheduler = async (value) => {
  if (value) {
    await enableDailyCreditReminder();
  } else {
    await disableDailyCreditReminder();
  }
};

// Weekly summary handlers
const enableWeeklyToReadSummary = async () => {
  await scheduleWeeklyNotification(
    NOTIFICATION_IDS.WEEKLY_SUMMARY,
    {
      title: "📖 Haftalık Özet",
      body: "Bu hafta okuma listeni kontrol et!",
    },
    WEEKLY_SUMMARY_WEEKDAY,
    WEEKLY_SUMMARY_HOUR,
    WEEKLY_SUMMARY_MINUTE,
  );
};

const disableWeeklyToReadSummary = async () => {
  await cancelNotification(NOTIFICATION_IDS.WEEKLY_SUMMARY);
};

const handleWeeklyToReadSummary: NotificationScheduler = async (value) => {
  if (value) {
    await enableWeeklyToReadSummary();
  } else {
    await disableWeeklyToReadSummary();
  }
};

// Inactive user alert handlers
const enableInactiveUserAlert = async () => {
  await scheduleInactiveUserNotification(
    {
      title: "📚 Seni Özledik!",
      body: "Bir süredir kitaplarına bakmadın. Okumaya devam et!",
    },
    DEFAULT_INACTIVE_USER_DAYS,
  );
};

const disableInactiveUserAlert = async () => {
  await cancelNotification(NOTIFICATION_IDS.INACTIVE_USER);
};

const handleInactiveUserAlert: NotificationScheduler = async (value) => {
  if (value) {
    await enableInactiveUserAlert();
  } else {
    await disableInactiveUserAlert();
  }
};

// Year end summary handlers
const enableYearEndSummary = async () => {
  await scheduleYearEndNotification({
    title: "📊 Yıl Sonu Özeti",
    body: "Bu yıl kaç kitap okudun? Özeti görüntüle!",
  });
};

const disableYearEndSummary = async () => {
  await cancelNotification("year-end-summary");
};

const handleYearEndSummary: NotificationScheduler = async (value) => {
  if (value) {
    await enableYearEndSummary();
  } else {
    await disableYearEndSummary();
  }
};

// Magic recommendation alert handlers
const enableMagicRecommendationAlert = async () => {
  let notificationContent = {
    title: "✨ Yeni Kitap Keşfet!",
    body: "Kütüphanene yeni bir kitap eklemeye ne dersin?",
    data: { type: "magic-recommendation" },
  };

  try {
    const books = await StorageService.getItem<any[]>("books_data");
    if (books) {
      const toReadCount = books.filter((b) => b.status === "Okunacak").length;

      if (toReadCount > 0) {
        notificationContent = {
          title: "📚 Okunmayı Bekleyen Kitapların Var!",
          body: `Kütüphanende ${toReadCount} kitap seni bekliyor. Hadi okumaya başla!`,
          data: { type: "magic-recommendation" },
        };
      }
    }
  } catch {
    // Use default message on error
  }

  await scheduleMagicRecommendationNotification(
    notificationContent,
    DEFAULT_MAGIC_RECOMMENDATION_DAYS,
    DEFAULT_MAGIC_RECOMMENDATION_DAYS,
  );
};

const disableMagicRecommendationAlert = async () => {
  await cancelNotification(NOTIFICATION_IDS.MAGIC_RECOMMENDATION);
};

const handleMagicRecommendationAlert: NotificationScheduler = async (value) => {
  if (value) {
    await enableMagicRecommendationAlert();
  } else {
    await disableMagicRecommendationAlert();
  }
};

// Strategy map for notification handlers
const NOTIFICATION_HANDLERS: Record<
  keyof NotificationSettings,
  NotificationScheduler | undefined
> = {
  dailyReadingReminder: handleDailyReadingReminder,
  dailyReminderTime: undefined, // Handled separately, re-schedules daily reminder
  inactiveUserAlert: handleInactiveUserAlert,
  readingProgressAlert: undefined, // Instant notification, no scheduling
  dailyCreditReminder: handleDailyCreditReminder,
  weeklyToReadSummary: handleWeeklyToReadSummary,
  bookCompletionCelebration: undefined, // Instant notification
  yearEndSummary: handleYearEndSummary,
  magicRecommendationAlert: handleMagicRecommendationAlert,
};

export function NotificationProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  // İlk yüklemede ayarları ve izinleri kontrol et
  useEffect(() => {
    loadSettingsAndCheckPermission();
  }, []);

  const loadSettingsAndCheckPermission = async () => {
    try {
      // Ayarları yükle
      const storedSettings = await StorageService.getItem<
        Partial<NotificationSettings>
      >(NOTIFICATION_SETTINGS_KEY);
      let finalSettings = DEFAULT_SETTINGS;
      if (storedSettings) {
        finalSettings = { ...DEFAULT_SETTINGS, ...storedSettings };
      }
      setSettings(finalSettings);

      // Web'de kontrol yapma
      if (Platform.OS === "web") {
        setIsLoading(false);
        return;
      }

      // İlk açılış kontrolü ve native permission iste
      const wasAsked = await StorageService.getItem<boolean>(
        INITIAL_PERMISSION_ASKED_KEY,
      );
      const { status } = await Notifications.getPermissionsAsync();
      const permissionGranted = status === "granted";

      setHasPermission(permissionGranted);

      // İlk açılış ve henüz sorulmadıysa
      if (!wasAsked && !permissionGranted) {
        // Bayrağı hemen set et
        await StorageService.setItem(INITIAL_PERMISSION_ASKED_KEY, true);

        // Biraz gecikmeli native permission iste (splash sonrası)
        setTimeout(async () => {
          const { status: newStatus } =
            await Notifications.requestPermissionsAsync();
          const granted = newStatus === "granted";
          setHasPermission(granted);

          // İzin verildiyse önerilen bildirimleri aç
          if (granted) {
            const recommendedSettings: Partial<NotificationSettings> = {
              bookCompletionCelebration: true,
              dailyReadingReminder: true,
              inactiveUserAlert: true,
            };
            const newSettings = { ...finalSettings, ...recommendedSettings };
            setSettings(newSettings);
            await saveSettings(newSettings);
            await scheduleAllEnabledNotifications(newSettings);
          }
        }, 1000);
      } else if (permissionGranted) {
        // İzin zaten varsa bildirimleri zamanla
        await scheduleAllEnabledNotifications(finalSettings);
      }
    } catch (error) {
      logError("NotificationContext.loadSettingsAndCheckPermission", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Aktif bildirimleri toplu zamanlama (ilk yükleme veya izin sonrası)
  const scheduleAllEnabledNotifications = async (
    currentSettings: NotificationSettings,
  ) => {
    if (Platform.OS === "web") return;

    // Use handler map for each enabled notification
    for (const [key, handler] of Object.entries(NOTIFICATION_HANDLERS)) {
      if (
        handler &&
        currentSettings[key as keyof NotificationSettings] === true
      ) {
        await handler(true);
      }
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await StorageService.setItem(NOTIFICATION_SETTINGS_KEY, newSettings);
    } catch (error) {
      logError("NotificationContext.saveSettings", error);
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

  // Bildirim zamanlamalarını senkronize et (simplified using strategy map)
  const syncNotificationSchedule = useCallback(
    async (key: keyof NotificationSettings, value: boolean | string) => {
      if (Platform.OS === "web") return;

      const handler = NOTIFICATION_HANDLERS[key];
      if (handler && typeof value === "boolean") {
        await handler(value);
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
        void syncNotificationSchedule(key, value);
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
