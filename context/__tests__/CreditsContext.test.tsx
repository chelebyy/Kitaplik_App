import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react-native";
import { CreditsProvider, useCredits } from "../CreditsContext";
import * as SecureStore from "expo-secure-store";

// Mock expo-secure-store
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
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
  <CreditsProvider>{children}</CreditsProvider>
);

describe("CreditsContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Varsayılan mock değerleri
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);
  });

  describe("claimDailyCredit", () => {
    it("should add 1 credit when claiming for the first time", async () => {
      // Arrange: Daha önce hiç kredi alınmamış
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === "user_credits_v2") return Promise.resolve("5");
          if (key === "last_daily_claim_date") return Promise.resolve(null);
          return Promise.resolve(null);
        },
      );

      const { result } = renderHook(() => useCredits(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let claimed: boolean = false;
      await act(async () => {
        claimed = await result.current.claimDailyCredit();
      });

      // Assert
      expect(claimed).toBe(true);
      expect(result.current.credits).toBe(6); // 5 + 1
    });

    it("should return false when claiming twice on the same day", async () => {
      // Arrange: Bugün zaten alınmış
      const today = new Date().toISOString().split("T")[0];
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === "user_credits_v2") return Promise.resolve("10");
          if (key === "last_daily_claim_date") return Promise.resolve(today);
          return Promise.resolve(null);
        },
      );

      const { result } = renderHook(() => useCredits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let claimed: boolean = true;
      await act(async () => {
        claimed = await result.current.claimDailyCredit();
      });

      // Assert
      expect(claimed).toBe(false);
      expect(result.current.credits).toBe(10); // Değişmemeli
    });

    it("should allow claiming on a new day", async () => {
      // Arrange: Dün alınmış
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split("T")[0];
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === "user_credits_v2") return Promise.resolve("3");
          if (key === "last_daily_claim_date")
            return Promise.resolve(yesterday);
          return Promise.resolve(null);
        },
      );

      const { result } = renderHook(() => useCredits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Act
      let claimed: boolean = false;
      await act(async () => {
        claimed = await result.current.claimDailyCredit();
      });

      // Assert
      expect(claimed).toBe(true);
      expect(result.current.credits).toBe(4); // 3 + 1
    });
  });

  describe("hasDailyCreditAvailable", () => {
    it("should be true when never claimed before", async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useCredits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasDailyCreditAvailable).toBe(true);
    });

    it("should be false when claimed today", async () => {
      const today = new Date().toISOString().split("T")[0];
      (SecureStore.getItemAsync as jest.Mock).mockImplementation(
        (key: string) => {
          if (key === "last_daily_claim_date") return Promise.resolve(today);
          return Promise.resolve(null);
        },
      );

      const { result } = renderHook(() => useCredits(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasDailyCreditAvailable).toBe(false);
    });
  });
});
