import { Platform } from "react-native";
import { StorageService } from "./storage/StorageService";
import {
  getCrashlytics,
  setUserId,
  setCrashlyticsCollectionEnabled,
  setAttribute,
  log,
  recordError,
} from "@react-native-firebase/crashlytics";

const USER_ID_KEY = "@crashlytics_user_id";

type OperationType = "add" | "edit" | "delete" | "view";

/**
 * Checks if Crashlytics is available (native platforms only)
 */
function isAvailable(): boolean {
  return Platform.OS !== "web";
}

/**
 * Generates a simple UUID v4
 */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replaceAll(/[xy]/g, (c) => {
    const r = Math.trunc(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Firebase Crashlytics service for error tracking and analytics.
 * Handles initialization, user identification, and error reporting.
 * Only active on native platforms (iOS/Android).
 *
 * Uses Firebase Modular API (v22+)
 */
const CrashlyticsService = {
  /**
   * Initializes Crashlytics with anonymous user identification.
   * Generates or retrieves a persistent UUID from MMKV.
   */
  async initialize(): Promise<void> {
    if (!isAvailable()) return;

    try {
      let userId = await StorageService.getItem<string>(USER_ID_KEY);

      if (!userId) {
        userId = generateUUID();
        await StorageService.setItem(USER_ID_KEY, userId);
      }

      const crashlytics = getCrashlytics();
      await setUserId(crashlytics, userId);
      await setCrashlyticsCollectionEnabled(crashlytics, true);
    } catch (error) {
      console.error(
        "[CrashlyticsService.initialize]",
        error instanceof Error ? error.message : String(error),
      );
    }
  },

  /**
   * Sets the book count custom attribute.
   * @param count - Total number of books in user's library
   */
  async setBookCount(count: number): Promise<void> {
    if (!isAvailable()) return;

    try {
      const crashlytics = getCrashlytics();
      await setAttribute(crashlytics, "book_count", String(count));
    } catch (error) {
      console.error(
        "[CrashlyticsService.setBookCount]",
        error instanceof Error ? error.message : String(error),
      );
    }
  },

  /**
   * Sets the last operation custom attribute.
   * @param type - Type of operation performed
   */
  async setLastOperation(type: OperationType): Promise<void> {
    if (!isAvailable()) return;

    try {
      const crashlytics = getCrashlytics();
      await setAttribute(crashlytics, "last_operation", type);
    } catch (error) {
      console.error(
        "[CrashlyticsService.setLastOperation]",
        error instanceof Error ? error.message : String(error),
      );
    }
  },

  /**
   * Records a non-fatal error to Crashlytics.
   * @param error - The error to record
   * @param context - Optional context describing where the error occurred
   */
  async recordError(error: Error, context?: string): Promise<void> {
    if (!isAvailable()) return;

    try {
      const crashlytics = getCrashlytics();
      if (context) {
        log(crashlytics, `Context: ${context}`);
      }
      recordError(crashlytics, error);
    } catch (recordingError) {
      console.error(
        "[CrashlyticsService.recordError]",
        recordingError instanceof Error
          ? recordingError.message
          : String(recordingError),
      );
    }
  },

  /**
   * Adds a breadcrumb log message to Crashlytics.
   * @param message - Log message for debugging crash reports
   */
  async log(message: string): Promise<void> {
    if (!isAvailable()) return;

    try {
      const crashlytics = getCrashlytics();
      log(crashlytics, message);
    } catch (error) {
      console.error(
        "[CrashlyticsService.log]",
        error instanceof Error ? error.message : String(error),
      );
    }
  },
};

export default CrashlyticsService;
