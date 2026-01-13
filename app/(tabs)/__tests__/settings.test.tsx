import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../settings";
import * as Linking from "expo-linking";

// Mocks
jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    colors: {
      background: "#ffffff",
      text: "#000000",
      sectionHeader: "#666666",
      card: "#f0f0f0",
      iconBackground: "#e0e0e0",
      border: "#cccccc",
      tabIconDefault: "#888888",
      textSecondary: "#555555",
    },
    isDarkMode: false,
    toggleTheme: jest.fn(),
  }),
}));

jest.mock("@/context/BooksContext", () => ({
  useBooks: () => ({
    books: [],
    clearAllData: jest.fn(),
    restoreBooks: jest.fn(),
  }),
}));

jest.mock("@/context/LanguageContext", () => ({
  useLanguage: () => ({
    language: "tr",
    changeLanguage: jest.fn(),
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: { [key: string]: string } = {
        settings: "Ayarlar",
        settings_appearance: "GÖRÜNÜM",
        settings_data_management: "VERİ YÖNETİMİ",
        settings_other: "DİĞER",
        settings_feedback: "Geliştiriciye Ulaş", // The key we expect
        settings_about: "Hakkında",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock createFeedbackMailto
jest.mock("@/utils/email", () => ({
  createFeedbackMailto: jest.fn(() => "mailto:mocked-url"),
}));

jest.mock("@/context/NotificationContext", () => ({
  useNotifications: () => ({
    settings: {
      dailyReadingReminder: false,
      inactiveUserAlert: false,
      readingProgressAlert: false,
      dailyCreditReminder: false,
      weeklyToReadSummary: false,
      bookCompletionCelebration: false,
      yearEndSummary: false,
      magicRecommendationAlert: false,
    },
    updateSetting: jest.fn(),
  }),
}));

jest.mock("@/services/BackupService", () => ({
  BackupService: {
    saveToDevice: jest.fn(),
    shareBackup: jest.fn(),
    restoreBackup: jest.fn(),
  },
}));

jest.mock("expo-linking", () => ({
  openURL: jest.fn(),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
}));

describe("SettingsScreen", () => {
  it("renders correctly", async () => {
    const { getByText } = render(<SettingsScreen />);

    // Asenkron işlemlerin bitmesini bekle
    await waitFor(() => {
      expect(getByText("Ayarlar")).toBeTruthy();
    });
  });

  it("renders Feedback option in Other section", async () => {
    const { getByText } = render(<SettingsScreen />);

    await waitFor(() => {
      expect(getByText("Geliştiriciye Ulaş")).toBeTruthy();
    });
  });

  it("calls Linking.openURL with correct mailto link when Feedback is pressed", async () => {
    const { getByText } = render(<SettingsScreen />);

    let feedbackButton;
    await waitFor(() => {
      feedbackButton = getByText("Geliştiriciye Ulaş");
    });

    if (feedbackButton) {
      fireEvent.press(feedbackButton);

      await waitFor(() => {
        expect(Linking.openURL).toHaveBeenCalledWith("mailto:mocked-url");
      });
    }
  });
});
