import { useState, useCallback } from "react";
import { useBooks } from "../context/BooksContext";
import { BackupService } from "../services/BackupService";

/**
 * useBackup hook return type
 */
export interface UseBackupReturn {
  /** Export işlemi devam ediyor */
  isExporting: boolean;
  /** Import işlemi devam ediyor */
  isImporting: boolean;
  /** Yedeği paylaş (Drive, WhatsApp vb.) */
  shareBackup: () => Promise<void>;
  /** Yedeği cihaza kaydet (Android) */
  saveToDevice: () => Promise<void>;
  /** Yedekten geri yükle */
  importBackup: () => Promise<void>;
}

/**
 * useBackup - Yedekleme ve geri yükleme hook'u
 *
 * Kitap verilerinin yedeklenmesi ve geri yüklenmesi işlemlerini yönetir.
 *
 * @returns UseBackupReturn
 *
 * @example
 * ```tsx
 * const { shareBackup, importBackup, isExporting } = useBackup();
 *
 * <Button onPress={shareBackup} disabled={isExporting}>
 *   Yedeği Paylaş
 * </Button>
 * ```
 */
export function useBackup(): UseBackupReturn {
  const { books, restoreBooks } = useBooks();

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  /**
   * Yedeği paylaş
   */
  const shareBackup = useCallback(async () => {
    setIsExporting(true);
    try {
      await BackupService.shareBackup(books);
    } finally {
      setIsExporting(false);
    }
  }, [books]);

  /**
   * Yedeği cihaza kaydet
   */
  const saveToDevice = useCallback(async () => {
    setIsExporting(true);
    try {
      await BackupService.saveToDevice(books);
    } finally {
      setIsExporting(false);
    }
  }, [books]);

  /**
   * Yedekten geri yükle
   */
  const importBackup = useCallback(async () => {
    setIsImporting(true);
    try {
      const restoredBooks = await BackupService.restoreBackup();
      if (restoredBooks) {
        await restoreBooks(restoredBooks);
      }
    } finally {
      setIsImporting(false);
    }
  }, [restoreBooks]);

  return {
    isExporting,
    isImporting,
    shareBackup,
    saveToDevice,
    importBackup,
  };
}
