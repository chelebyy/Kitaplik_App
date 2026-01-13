import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  NOTIFICATION_IDS,
  scheduleDailyNotification,
  scheduleWeeklyNotification,
  sendInstantNotification,
  sendBookCompletionNotification,
  sendReadingProgressNotification,
  cancelNotification,
  cancelAllNotifications,
  scheduleInactiveUserNotification,
  scheduleMagicRecommendationNotification,
  scheduleYearEndNotification,
  parseTimeString,
} from "../NotificationService";

// expo-notifications mock
jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  SchedulableTriggerInputTypes: {
    DAILY: "daily",
    WEEKLY: "weekly",
    TIME_INTERVAL: "timeInterval",
    YEARLY: "yearly",
  },
}));

// Platform mock
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

// logError mock
jest.mock("../../utils/errorUtils", () => ({
  logError: jest.fn(),
}));

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("NOTIFICATION_IDS", () => {
    it("doğru ID sabitlerine sahiptir", () => {
      expect(NOTIFICATION_IDS.DAILY_READING_REMINDER).toBe(
        "daily-reading-reminder",
      );
      expect(NOTIFICATION_IDS.DAILY_CREDIT_REMINDER).toBe(
        "daily-credit-reminder",
      );
      expect(NOTIFICATION_IDS.WEEKLY_SUMMARY).toBe("weekly-summary");
      expect(NOTIFICATION_IDS.MAGIC_RECOMMENDATION).toBe(
        "magic-recommendation",
      );
      expect(NOTIFICATION_IDS.INACTIVE_USER).toBe("inactive-user");
    });
  });

  describe("scheduleDailyNotification", () => {
    it("günlük bildirim zamanlar (iOS)", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "test-daily-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleDailyNotification(
        "test-id",
        { title: "Test Başlık", body: "Test İçerik" },
        20,
        0,
      );

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Test Başlık",
          body: "Test İçerik",
          data: undefined,
          sound: true,
        },
        trigger: {
          type: "daily",
          hour: 20,
          minute: 0,
        },
        identifier: "test-id",
      });
    });

    it("web platformda null döner", async () => {
      (Platform.OS as string) = "web";

      const result = await scheduleDailyNotification(
        "test-id",
        { title: "Test", body: "Test" },
        20,
        0,
      );

      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("hata durumunda null döner ve loglar", async () => {
      (Platform.OS as string) = "ios";
      const { logError } = require("../../utils/errorUtils");
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockRejectedValueOnce(new Error("Notification error"));

      const result = await scheduleDailyNotification(
        "test-id",
        { title: "Test", body: "Test" },
        20,
        0,
      );

      expect(result).toBeNull();
      expect(logError).toHaveBeenCalledWith(
        "NotificationService.scheduleDailyNotification",
        expect.any(Error),
      );
    });

    it("önce mevcut bildirimi iptal eder", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "test-daily-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      await scheduleDailyNotification(
        "test-id",
        { title: "Test", body: "Test" },
        20,
        0,
      );

      expect(
        Notifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith("test-id");
    });
  });

  describe("scheduleWeeklyNotification", () => {
    it("haftalık bildirim zamanlar", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "test-weekly-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleWeeklyNotification(
        "test-id",
        { title: "Test Başlık", body: "Test İçerik" },
        1, // Pazartesi
        10,
        30,
      );

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Test Başlık",
          body: "Test İçerik",
          data: undefined,
          sound: true,
        },
        trigger: {
          type: "weekly",
          weekday: 1,
          hour: 10,
          minute: 30,
        },
        identifier: "test-id",
      });
    });

    it("web platformda null döner", async () => {
      (Platform.OS as string) = "web";

      const result = await scheduleWeeklyNotification(
        "test-id",
        { title: "Test", body: "Test" },
        1,
        10,
        0,
      );

      expect(result).toBeNull();
    });
  });

  describe("sendInstantNotification", () => {
    it("anlık bildirim gönderir", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "test-instant-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await sendInstantNotification({
        title: "Anlık Bildirim",
        body: "Bu bir anlık bildirim",
        data: { type: "test" },
      });

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Anlık Bildirim",
          body: "Bu bir anlık bildirim",
          data: { type: "test" },
          sound: true,
        },
        trigger: null,
      });
    });

    it("data olmadan bildirim gönderir", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "test-instant-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await sendInstantNotification({
        title: "Test",
        body: "Test",
      });

      expect(result).toBe(mockNotificationId);
    });
  });

  describe("sendBookCompletionNotification", () => {
    it("kitap bitirme bildirimi gönderir", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "completion-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await sendBookCompletionNotification("Sefiller");

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "🎉 Tebrikler!",
          body: '"Sefiller" kitabını bitirdin!',
          data: { type: "book-completion", bookTitle: "Sefiller" },
          sound: true,
        },
        trigger: null,
      });
    });
  });

  describe("sendReadingProgressNotification", () => {
    it("%25 kilometre taşı bildirimi gönderir", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "progress-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await sendReadingProgressNotification("Test Kitap", 25);

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "İyi gidiyorsun! 📖",
          body: '"Test Kitap" kitabının %25\'ini tamamladın.',
          data: {
            type: "reading-progress",
            bookTitle: "Test Kitap",
            milestone: 25,
          },
          sound: true,
        },
        trigger: null,
      });
    });

    it("%50 kilometre taşı bildirimi gönderir", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "progress-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await sendReadingProgressNotification("Test Kitap", 50);

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Yarısına geldin! 🎯",
          body: '"Test Kitap" kitabının yarısını bitirdin.',
          data: {
            type: "reading-progress",
            bookTitle: "Test Kitap",
            milestone: 50,
          },
          sound: true,
        },
        trigger: null,
      });
    });

    it("%75 kilometre taşı bildirimi gönderir", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "progress-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await sendReadingProgressNotification("Test Kitap", 75);

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Bitmek üzere! 🔥",
          body: '"Test Kitap" kitabının %75\'ini tamamladın.',
          data: {
            type: "reading-progress",
            bookTitle: "Test Kitap",
            milestone: 75,
          },
          sound: true,
        },
        trigger: null,
      });
    });

    it("desteklenmeyen kilometre taşı için null döner", async () => {
      (Platform.OS as string) = "ios";

      const result = await sendReadingProgressNotification("Test Kitap", 10);

      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe("cancelNotification", () => {
    it("bildirimi iptal eder", async () => {
      (Platform.OS as string) = "ios";

      await cancelNotification("test-id");

      expect(
        Notifications.cancelScheduledNotificationAsync,
      ).toHaveBeenCalledWith("test-id");
    });

    it("web platformda hiçbir şey yapmaz", async () => {
      (Platform.OS as string) = "web";

      await cancelNotification("test-id");

      expect(
        Notifications.cancelScheduledNotificationAsync,
      ).not.toHaveBeenCalled();
    });

    it("hata durumunda loglar", async () => {
      (Platform.OS as string) = "ios";
      const { logError } = require("../../utils/errorUtils");
      (
        Notifications.cancelScheduledNotificationAsync as jest.Mock
      ).mockRejectedValueOnce(new Error("Cancel error"));

      await cancelNotification("test-id");

      expect(logError).toHaveBeenCalledWith(
        "NotificationService.cancelNotification",
        expect.any(Error),
      );
    });
  });

  describe("cancelAllNotifications", () => {
    it("tüm bildirimleri iptal eder", async () => {
      (Platform.OS as string) = "ios";

      await cancelAllNotifications();

      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).toHaveBeenCalled();
    });

    it("web platformda hiçbir şey yapmaz", async () => {
      (Platform.OS as string) = "web";

      await cancelAllNotifications();

      expect(
        Notifications.cancelAllScheduledNotificationsAsync,
      ).not.toHaveBeenCalled();
    });
  });

  describe("scheduleInactiveUserNotification", () => {
    it("pasif kullanıcı bildirimi zamanlar (varsayılan 3 gün)", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "inactive-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleInactiveUserNotification({
        title: "Seni özledik!",
        body: "Gel kitap okumaya devam et",
      });

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Seni özledik!",
          body: "Gel kitap okumaya devam et",
          data: undefined,
          sound: true,
        },
        trigger: {
          type: "timeInterval",
          seconds: 3 * 24 * 60 * 60, // 3 gün
          repeats: false,
        },
        identifier: NOTIFICATION_IDS.INACTIVE_USER,
      });
    });

    it("özel gün sayısı ile zamanlar", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "inactive-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleInactiveUserNotification(
        {
          title: "Test",
          body: "Test",
        },
        7,
      );

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.any(Object),
        trigger: expect.objectContaining({
          seconds: 7 * 24 * 60 * 60, // 7 gün
        }),
        identifier: NOTIFICATION_IDS.INACTIVE_USER,
      });
    });
  });

  describe("scheduleMagicRecommendationNotification", () => {
    it("sihirli öneri bildirimi zamanlar (varsayılan 15 gün)", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "magic-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleMagicRecommendationNotification({
        title: "Sihirli Öneri!",
        body: "Yeni bir kitap keşfetmeye hazır mısın?",
      });

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Sihirli Öneri!",
          body: "Yeni bir kitap keşfetmeye hazır mısın?",
          data: undefined,
          sound: true,
        },
        trigger: {
          type: "timeInterval",
          seconds: 15 * 24 * 60 * 60, // 15 gün
          repeats: true,
        },
        identifier: NOTIFICATION_IDS.MAGIC_RECOMMENDATION,
      });
    });

    it("özel aralıklarla zamanlar", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "magic-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleMagicRecommendationNotification(
        {
          title: "Test",
          body: "Test",
        },
        30, // 30 gün sonra başla
        7, // 7 günde bir tekrarla
      );

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: expect.any(Object),
        trigger: expect.objectContaining({
          seconds: 7 * 24 * 60 * 60, // 7 gün aralık
          repeats: true,
        }),
        identifier: NOTIFICATION_IDS.MAGIC_RECOMMENDATION,
      });
    });
  });

  describe("scheduleYearEndNotification", () => {
    it("yıl sonu bildirimi zamanlar (1 Ocak)", async () => {
      (Platform.OS as string) = "ios";

      const mockNotificationId = "year-end-id";
      (
        Notifications.scheduleNotificationAsync as jest.Mock
      ).mockResolvedValueOnce(mockNotificationId);

      const result = await scheduleYearEndNotification({
        title: "Yıl Sonu Özeti",
        body: "Yılını değerlendir",
      });

      expect(result).toBe(mockNotificationId);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: "Yıl Sonu Özeti",
          body: "Yılını değerlendir",
          data: undefined,
          sound: true,
        },
        trigger: {
          type: "yearly",
          month: 1,
          day: 1,
          hour: 10,
          minute: 0,
        },
        identifier: "year-end-summary",
      });
    });
  });

  describe("parseTimeString", () => {
    it("zaman stringini parse eder (saat:dakika)", () => {
      const result = parseTimeString("20:30");
      expect(result).toEqual({ hour: 20, minute: 30 });
    });

    it("gece yarısı saatlerini parse eder", () => {
      const result = parseTimeString("00:00");
      // 0 falsy değer olduğu için || 20 devreye girer
      expect(result).toEqual({ hour: 20, minute: 0 });
    });

    it("geçersiz saat için varsayılan değer (20) kullanır", () => {
      const result = parseTimeString("invalid:30");
      expect(result).toEqual({ hour: 20, minute: 30 });
    });

    it("geçersiz dakika için varsayılan değer (0) kullanır", () => {
      const result = parseTimeString("10:invalid");
      expect(result).toEqual({ hour: 10, minute: 0 });
    });

    it("tamamen geçersiz string için varsayılan değerler kullanır", () => {
      const result = parseTimeString("invalid");
      expect(result).toEqual({ hour: 20, minute: 0 });
    });

    it("eksik dakika için varsayılan değer (0) kullanır", () => {
      const result = parseTimeString("15:");
      expect(result).toEqual({ hour: 15, minute: 0 });
    });
  });
});
