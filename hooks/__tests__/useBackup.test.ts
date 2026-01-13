/**
 * @fileoverview useBackup hook testleri
 * TDD RED fazı
 */

import { renderHook, act } from "@testing-library/react-native";

// Hook
import { useBackup } from "../useBackup";

// Mock services
const mockShareBackup = jest.fn();
const mockSaveToDevice = jest.fn();
const mockRestoreBackup = jest.fn();

jest.mock("../../services/BackupService", () => ({
  BackupService: {
    shareBackup: (...args: unknown[]) => mockShareBackup(...args),
    saveToDevice: (...args: unknown[]) => mockSaveToDevice(...args),
    restoreBackup: () => mockRestoreBackup(),
  },
}));

// BooksContext mock
const mockBooks = [
  { id: "1", title: "Book 1", status: "Okunacak" },
  { id: "2", title: "Book 2", status: "Okunuyor" },
];
const mockRestoreBooks = jest.fn();

jest.mock("../../context/BooksContext", () => ({
  useBooks: () => ({
    books: mockBooks,
    restoreBooks: mockRestoreBooks,
  }),
}));

describe("useBackup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockShareBackup.mockResolvedValue(undefined);
    mockSaveToDevice.mockResolvedValue(undefined);
    mockRestoreBackup.mockResolvedValue(null);
  });

  describe("initial state", () => {
    it("should return correct initial state", () => {
      const { result } = renderHook(() => useBackup());

      expect(result.current.isExporting).toBe(false);
      expect(result.current.isImporting).toBe(false);
    });
  });

  describe("exportBackup (share)", () => {
    it("should call shareBackup with books", async () => {
      const { result } = renderHook(() => useBackup());

      await act(async () => {
        await result.current.shareBackup();
      });

      expect(mockShareBackup).toHaveBeenCalledWith(mockBooks);
    });

    it("should set isExporting during operation", async () => {
      const { result } = renderHook(() => useBackup());

      expect(result.current.isExporting).toBe(false);

      await act(async () => {
        await result.current.shareBackup();
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  describe("saveToDevice", () => {
    it("should call saveToDevice service", async () => {
      const { result } = renderHook(() => useBackup());

      await act(async () => {
        await result.current.saveToDevice();
      });

      expect(mockSaveToDevice).toHaveBeenCalledWith(mockBooks);
    });
  });

  describe("importBackup", () => {
    it("should call restoreBackup and update books", async () => {
      const restoredBooks = [{ id: "3", title: "Restored Book" }];
      mockRestoreBackup.mockResolvedValue(restoredBooks);

      const { result } = renderHook(() => useBackup());

      await act(async () => {
        await result.current.importBackup();
      });

      expect(mockRestoreBackup).toHaveBeenCalled();
      expect(mockRestoreBooks).toHaveBeenCalledWith(restoredBooks);
    });

    it("should not update books when restore returns null", async () => {
      mockRestoreBackup.mockResolvedValue(null);

      const { result } = renderHook(() => useBackup());

      await act(async () => {
        await result.current.importBackup();
      });

      expect(mockRestoreBooks).not.toHaveBeenCalled();
    });

    it("should set isImporting during operation", async () => {
      const { result } = renderHook(() => useBackup());

      expect(result.current.isImporting).toBe(false);

      await act(async () => {
        await result.current.importBackup();
      });

      expect(result.current.isImporting).toBe(false);
    });
  });
});
