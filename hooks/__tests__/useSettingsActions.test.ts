import { renderHook, act, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useSettingsActions } from "../useSettingsActions";
import { Book } from "../../context/BooksContext";

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params?.count) return `${key}_${params.count}`;
      return key;
    },
  }),
}));

jest.mock("../../services/BackupService", () => ({
  BackupService: {
    saveToDevice: jest.fn(),
    shareBackup: jest.fn(),
    restoreBackup: jest.fn(),
  },
}));

// Mock Alert
jest.spyOn(Alert, "alert");

// Import mocked service
import { BackupService } from "../../services/BackupService";

describe("useSettingsActions", () => {
  const mockBooks: Book[] = [
    {
      id: "1",
      title: "Book 1",
      author: "Author 1",
      status: "Okunacak",
      coverUrl: "https://example.com/1.jpg",
      addedAt: Date.now(),
    },
    {
      id: "2",
      title: "Book 2",
      author: "Author 2",
      status: "Okunuyor",
      coverUrl: "https://example.com/2.jpg",
      addedAt: Date.now(),
    },
  ];

  const mockClearAllData = jest.fn();
  const mockRestoreBooks = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with isLoading as false", () => {
      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("handleBackup", () => {
    it("should show warning when no books exist", () => {
      const { result } = renderHook(() =>
        useSettingsActions({
          books: [],
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleBackup();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "settings_backup_warning",
        "settings_backup_no_books",
      );
    });

    it("should show backup method selection when books exist", () => {
      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleBackup();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "settings_backup_method_title",
        "settings_backup_method_msg",
        expect.arrayContaining([
          expect.objectContaining({ text: "cancel" }),
          expect.objectContaining({ text: "settings_backup_save_device" }),
          expect.objectContaining({ text: "settings_backup_share" }),
        ]),
      );
    });

    it("should call BackupService.saveToDevice when save to device selected", async () => {
      (BackupService.saveToDevice as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleBackup();
      });

      // Get the alert options and trigger save to device
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const saveToDeviceOption = alertCall[2].find(
        (opt: { text: string }) => opt.text === "settings_backup_save_device",
      );

      await act(async () => {
        await saveToDeviceOption.onPress();
      });

      await waitFor(() => {
        expect(BackupService.saveToDevice).toHaveBeenCalledWith(mockBooks);
      });
    });

    it("should call BackupService.shareBackup when share selected", async () => {
      (BackupService.shareBackup as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleBackup();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const shareOption = alertCall[2].find(
        (opt: { text: string }) => opt.text === "settings_backup_share",
      );

      await act(async () => {
        await shareOption.onPress();
      });

      await waitFor(() => {
        expect(BackupService.shareBackup).toHaveBeenCalledWith(mockBooks);
      });
    });
  });

  describe("handleRestore", () => {
    it("should show restore source selection dialog", () => {
      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleRestore();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "settings_restore_source_title",
        "settings_restore_source_msg",
        expect.arrayContaining([
          expect.objectContaining({ text: "cancel" }),
          expect.objectContaining({ text: "settings_restore_select_device" }),
          expect.objectContaining({ text: "settings_restore_select_drive" }),
        ]),
      );
    });

    it("should show confirmation when backup file is restored", async () => {
      const restoredBooks = [{ id: "3", title: "Restored Book" }];
      (BackupService.restoreBackup as jest.Mock).mockResolvedValue(
        restoredBooks,
      );

      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleRestore();
      });

      // Trigger restore from device
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deviceOption = alertCall[2].find(
        (opt: { text: string }) =>
          opt.text === "settings_restore_select_device",
      );

      await act(async () => {
        await deviceOption.onPress();
      });

      await waitFor(() => {
        expect(BackupService.restoreBackup).toHaveBeenCalled();
      });
    });

    it("should show error alert on restore failure", async () => {
      (BackupService.restoreBackup as jest.Mock).mockRejectedValue(
        new Error("Restore failed"),
      );

      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleRestore();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const deviceOption = alertCall[2].find(
        (opt: { text: string }) =>
          opt.text === "settings_restore_select_device",
      );

      await act(async () => {
        await deviceOption.onPress();
      });

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          "settings_restore_error",
          "settings_restore_error_msg",
        );
      });
    });
  });

  describe("handleResetData", () => {
    it("should show confirmation dialog", () => {
      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleResetData();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "settings_reset_confirm_title",
        "settings_reset_confirm_msg",
        expect.arrayContaining([
          expect.objectContaining({ text: "cancel", style: "cancel" }),
          expect.objectContaining({
            text: "settings_reset_confirm_button",
            style: "destructive",
          }),
        ]),
      );
    });

    it("should call clearAllData when confirmed", () => {
      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleResetData();
      });

      // Get the confirm button and press it
      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const confirmOption = alertCall[2].find(
        (opt: { text: string }) => opt.text === "settings_reset_confirm_button",
      );

      act(() => {
        confirmOption.onPress();
      });

      expect(mockClearAllData).toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should set isLoading to true during backup", async () => {
      let resolveBackup: () => void;
      (BackupService.saveToDevice as jest.Mock).mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveBackup = resolve;
          }),
      );

      const { result } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      act(() => {
        result.current.handleBackup();
      });

      const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
      const saveOption = alertCall[2].find(
        (opt: { text: string }) => opt.text === "settings_backup_save_device",
      );

      act(() => {
        saveOption.onPress();
      });

      // isLoading should be true during operation
      expect(result.current.isLoading).toBe(true);

      // Resolve the backup
      await act(async () => {
        resolveBackup!();
      });

      // isLoading should be false after completion
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("hook stability", () => {
    it("should have stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() =>
        useSettingsActions({
          books: mockBooks,
          clearAllData: mockClearAllData,
          restoreBooks: mockRestoreBooks,
        }),
      );

      const initialHandleBackup = result.current.handleBackup;
      const initialHandleRestore = result.current.handleRestore;
      const initialHandleResetData = result.current.handleResetData;

      // Functions should be callable after rerender
      rerender({
        books: mockBooks,
        clearAllData: mockClearAllData,
        restoreBooks: mockRestoreBooks,
      });

      expect(typeof result.current.handleBackup).toBe("function");
      expect(typeof result.current.handleRestore).toBe("function");
      expect(typeof result.current.handleResetData).toBe("function");
    });
  });
});
