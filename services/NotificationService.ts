import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { logError } from "../utils/errorUtils";
import {
  SECONDS_PER_DAY,
  DEFAULT_INACTIVE_USER_DAYS,
  DEFAULT_MAGIC_RECOMMENDATION_DAYS,
  YEAR_END_MONTH,
  YEAR_END_DAY,
  YEAR_END_HOUR,
  YEAR_END_MINUTE,
} from "../constants/Notifications";

// Bildirim ID'leri - zamanlanmış bildirimleri yönetmek için
export const NOTIFICATION_IDS = {
  DAILY_READING_REMINDER: "daily-reading-reminder",
  DAILY_CREDIT_REMINDER: "daily-credit-reminder",
  WEEKLY_SUMMARY: "weekly-summary",
  MAGIC_RECOMMENDATION: "magic-recommendation",
  INACTIVE_USER: "inactive-user",
} as const;

// Bildirim içerikleri
interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Günlük tekrarlayan bildirim zamanla
 */
export async function scheduleDailyNotification(
  id: string,
  content: NotificationContent,
  hour: number,
  minute: number,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    // Önce mevcut bildirimi iptal et
    await cancelNotification(id);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
      identifier: id,
    });

    return notificationId;
  } catch (error) {
    logError("NotificationService.scheduleDailyNotification", error);
    return null;
  }
}

/**
 * Haftalık tekrarlayan bildirim zamanla
 */
export async function scheduleWeeklyNotification(
  id: string,
  content: NotificationContent,
  weekday: number, // 1 = Pazartesi, 7 = Pazar
  hour: number,
  minute: number,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    await cancelNotification(id);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
      identifier: id,
    });

    return notificationId;
  } catch (error) {
    logError("NotificationService.scheduleWeeklyNotification", error);
    return null;
  }
}

/**
 * Anlık bildirim gönder (örn: kitap bitirme kutlaması)
 */
export async function sendInstantNotification(
  content: NotificationContent,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger: null, // Anlık gönder
    });

    return notificationId;
  } catch (error) {
    logError("NotificationService.sendInstantNotification", error);
    return null;
  }
}

/**
 * Kitap bitirme kutlaması bildirimi gönder
 */
export async function sendBookCompletionNotification(
  bookTitle: string,
): Promise<string | null> {
  return sendInstantNotification({
    title: "🎉 Tebrikler!",
    body: `"${bookTitle}" kitabını bitirdin!`,
    data: { type: "book-completion", bookTitle },
  });
}

/**
 * Okuma ilerlemesi bildirimi gönder (kilometre taşları)
 */
export async function sendReadingProgressNotification(
  bookTitle: string,
  milestone: number,
): Promise<string | null> {
  const messages: Record<number, { title: string; body: string }> = {
    25: {
      title: "İyi gidiyorsun! 📖",
      body: `"${bookTitle}" kitabının %25'ini tamamladın.`,
    },
    50: {
      title: "Yarısına geldin! 🎯",
      body: `"${bookTitle}" kitabının yarısını bitirdin.`,
    },
    75: {
      title: "Bitmek üzere! 🔥",
      body: `"${bookTitle}" kitabının %75'ini tamamladın.`,
    },
  };

  const message = messages[milestone];
  if (!message) return null;

  return sendInstantNotification({
    title: message.title,
    body: message.body,
    data: { type: "reading-progress", bookTitle, milestone },
  });
}

/**
 * Belirli bir bildirimi iptal et
 */
export async function cancelNotification(id: string): Promise<void> {
  try {
    if (Platform.OS === "web") return;
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    logError("NotificationService.cancelNotification", error);
  }
}

/**
 * Tüm zamanlanmış bildirimleri iptal et
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    if (Platform.OS === "web") return;
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    logError("NotificationService.cancelAllNotifications", error);
  }
}

/**
 * Pasif kullanıcı bildirimi için geciktirilmiş bildirim zamanla
 * @param content Bildirim içeriği
 * @param daysLater Kaç gün sonra bildirim gönderilecek (varsayılan: 3 gün)
 */
export async function scheduleInactiveUserNotification(
  content: NotificationContent,
  daysLater: number = DEFAULT_INACTIVE_USER_DAYS,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    await cancelNotification(NOTIFICATION_IDS.INACTIVE_USER);

    const seconds = daysLater * SECONDS_PER_DAY;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      },
      identifier: NOTIFICATION_IDS.INACTIVE_USER,
    });

    return notificationId;
  } catch (error) {
    logError("NotificationService.scheduleInactiveUserNotification", error);
    return null;
  }
}

/**
 * Sihirli öneri bildirimi için 15 günde bir tekrarlayan bildirim zamanla
 * @param content Bildirim içeriği
 * @param daysLater Kaç gün sonra başlasın (varsayılan: 15 gün)
 * @param daysInterval Kaç günde bir tekrarlasın (varsayılan: 15 gün)
 */
export async function scheduleMagicRecommendationNotification(
  content: NotificationContent,
  daysLater: number = DEFAULT_MAGIC_RECOMMENDATION_DAYS,
  daysInterval: number = DEFAULT_MAGIC_RECOMMENDATION_DAYS,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    await cancelNotification(NOTIFICATION_IDS.MAGIC_RECOMMENDATION);

    const seconds = daysInterval * SECONDS_PER_DAY;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: true,
      },
      identifier: NOTIFICATION_IDS.MAGIC_RECOMMENDATION,
    });

    return notificationId;
  } catch (error) {
    logError(
      "NotificationService.scheduleMagicRecommendationNotification",
      error,
    );
    return null;
  }
}

/**
 * Yıl sonu özeti için yıllık bildirim zamanla (1 Ocak)
 */
export async function scheduleYearEndNotification(
  content: NotificationContent,
): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.YEARLY,
        month: YEAR_END_MONTH,
        day: YEAR_END_DAY,
        hour: YEAR_END_HOUR,
        minute: YEAR_END_MINUTE,
      },
      identifier: "year-end-summary",
    });

    return notificationId;
  } catch (error) {
    logError("NotificationService.scheduleYearEndNotification", error);
    return null;
  }
}

/**
 * Zamanlama saatini parse et ("20:00" -> { hour: 20, minute: 0 })
 */
export function parseTimeString(timeString: string): {
  hour: number;
  minute: number;
} {
  const [hourStr, minuteStr] = timeString.split(":");
  return {
    hour: Number.parseInt(hourStr, 10) || 20,
    minute: Number.parseInt(minuteStr, 10) || 0,
  };
}
