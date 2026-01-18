import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { BackupService } from "../services/BackupService";
import { logError } from "../utils/errorUtils";
import { Book } from "../context/BooksContext";

interface UseSettingsActionsProps {
  books: Book[];
  clearAllData: () => void | Promise<void>;
  restoreBooks: (books: Book[]) => void | Promise<void>;
}

interface UseSettingsActionsReturn {
  isLoading: boolean;
  handleBackup: () => void;
  handleRestore: () => void;
  handleResetData: () => void;
}

export function useSettingsActions({
  books,
  clearAllData,
  restoreBooks,
}: UseSettingsActionsProps): UseSettingsActionsReturn {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleBackup = useCallback(() => {
    if (books.length === 0) {
      Alert.alert(t("settings_backup_warning"), t("settings_backup_no_books"));
      return;
    }

    Alert.alert(
      t("settings_backup_method_title"),
      t("settings_backup_method_msg"),
      [
        {
          text: t("cancel"),
          style: "cancel",
        },
        {
          text: t("settings_backup_save_device"),
          onPress: async () => {
            setIsLoading(true);
            try {
              await BackupService.saveToDevice(books);
            } finally {
              setIsLoading(false);
            }
          },
        },
        {
          text: t("settings_backup_share"),
          onPress: async () => {
            setIsLoading(true);
            try {
              await BackupService.shareBackup(books);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  }, [books, t]);

  const performRestore = useCallback(async () => {
    setIsLoading(true);
    try {
      const restoredBooks = await BackupService.restoreBackup();
      if (restoredBooks) {
        Alert.alert(
          t("settings_restore_confirm_title"),
          t("settings_restore_confirm_msg", { count: restoredBooks.length }),
          [
            { text: t("cancel"), style: "cancel" },
            {
              text: t("settings_restore_confirm_button"),
              onPress: () => {
                restoreBooks(restoredBooks);
                Alert.alert(
                  t("settings_restore_success"),
                  t("settings_restore_success_msg"),
                );
              },
            },
          ],
        );
      }
    } catch (error) {
      logError("useSettingsActions.performRestore", error);
      Alert.alert(t("settings_restore_error"), t("settings_restore_error_msg"));
    } finally {
      setIsLoading(false);
    }
  }, [t, restoreBooks]);

  const handleRestore = useCallback(() => {
    Alert.alert(
      t("settings_restore_source_title"),
      t("settings_restore_source_msg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("settings_restore_select_device"),
          onPress: () => {
            void performRestore();
          },
        },
        {
          text: t("settings_restore_select_drive"),
          onPress: () => {
            void performRestore();
          },
        },
      ],
    );
  }, [t, performRestore]);

  const handleResetData = useCallback(() => {
    Alert.alert(
      t("settings_reset_confirm_title"),
      t("settings_reset_confirm_msg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("settings_reset_confirm_button"),
          style: "destructive",
          onPress: () => {
            void clearAllData();
          },
        },
      ],
    );
  }, [t, clearAllData]);

  return useMemo(
    () => ({
      isLoading,
      handleBackup,
      handleRestore,
      handleResetData,
    }),
    [isLoading, handleBackup, handleRestore, handleResetData],
  );
}
