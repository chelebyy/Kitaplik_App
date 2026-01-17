import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { NotificationProvider, useNotifications } from "../NotificationContext";

// Mock StorageService
jest.mock("../../services/storage/StorageService", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  setNotificationHandler: jest.fn(),
}));

// Mock Platform
jest.mock("react-native", () => ({
  Platform: { OS: "android" },
}));

// Mock errorUtils
jest.mock("../../utils/errorUtils", () => ({
  logError: jest.fn(),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe("NotificationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe("default settings", () => {
    it("should have optimized default notifications", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Açık olması gereken bildirimler (günde max 1 bildirim prensibine uygun)
      expect(result.current.settings.dailyReadingReminder).toBe(true);
      expect(result.current.settings.inactiveUserAlert).toBe(true);
      expect(result.current.settings.readingProgressAlert).toBe(true);
      expect(result.current.settings.bookCompletionCelebration).toBe(true);
      expect(result.current.settings.yearEndSummary).toBe(true);

      // Kapalı olması gereken bildirimler (spam önleme)
      expect(result.current.settings.dailyCreditReminder).toBe(false);
      expect(result.current.settings.weeklyToReadSummary).toBe(false);
      expect(result.current.settings.magicRecommendationAlert).toBe(false);
    });

    it("should have default reminder time as 20:00", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.settings.dailyReminderTime).toBe("20:00");
    });
  });

  describe("updateSetting", () => {
    it("should update a single setting", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.updateSetting("dailyReadingReminder", false);
      });

      // Assert
      expect(result.current.settings.dailyReadingReminder).toBe(false);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should persist settings to AsyncStorage", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateSetting("weeklyToReadSummary", false);
      });

      // AsyncStorage.setItem'ın doğru key ile çağrıldığını kontrol et
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "notification_settings_v1",
        expect.any(String),
      );
    });
  });

  describe("permission handling", () => {
    it("should check permission status on mount", async () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock granted status ile hasPermission true olmalı
      expect(result.current.hasPermission).toBe(true);
    });
  });
});
