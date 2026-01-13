import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { Alert, Platform } from "react-native";
import { Book } from "../context/BooksContext";
import { logError } from "../utils/errorUtils";

export const BackupService = {
  /**
   * Creates a JSON backup and shares it (Drive, WhatsApp, etc.)
   */
  shareBackup: async (books: Book[]) => {
    try {
      const backupData = {
        version: 1,
        timestamp: Date.now(),
        books: books,
      };

      const fileUri = FileSystem.documentDirectory + "kitaplik_yedek.json";
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
      );

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Yedeği Paylaş / Drive'a Kaydet",
          UTI: "public.json",
        });
      } else {
        Alert.alert("Hata", "Paylaşım özelliği bu cihazda kullanılamıyor.");
      }
    } catch (error) {
      logError("BackupService.shareBackup", error);
      Alert.alert("Hata", "Yedek paylaşılırken bir sorun oluştu.");
    }
  },

  /**
   * Saves the backup directly to a selected folder on the device (Android SAF).
   */
  saveToDevice: async (books: Book[]) => {
    if (Platform.OS !== "android") {
      Alert.alert(
        "Bilgi",
        'Bu özellik sadece Android cihazlarda kullanılabilir. Lütfen "Paylaş" seçeneğini kullanın.',
      );
      return;
    }

    try {
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        return; // Kullanıcı iptal etti
      }

      const backupData = {
        version: 1,
        timestamp: Date.now(),
        books: books,
      };

      const directoryUri = permissions.directoryUri;
      const fileName = `kitaplik_yedek_${new Date().toISOString().split("T")[0]}.json`;

      // Dosya oluştur
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        directoryUri,
        fileName,
        "application/json",
      );

      // İçeriği yaz
      await FileSystem.writeAsStringAsync(
        fileUri,
        JSON.stringify(backupData, null, 2),
        { encoding: FileSystem.EncodingType.UTF8 },
      );

      Alert.alert(
        "Başarılı",
        `Yedek dosyası başarıyla kaydedildi:\n${fileName}`,
      );
    } catch (error) {
      logError("BackupService.saveToDevice", error);
      Alert.alert("Hata", "Dosya kaydedilirken bir sorun oluştu.");
    }
  },

  /**
   * Opens document picker to select a JSON backup file and parses it.
   */
  restoreBackup: async (): Promise<Book[] | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/json", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return null;
      }

      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const parsedData = JSON.parse(fileContent);

      // Basit bir doğrulama
      if (!parsedData.books || !Array.isArray(parsedData.books)) {
        Alert.alert(
          "Geçersiz Dosya",
          "Seçilen dosya geçerli bir yedek dosyası değil.",
        );
        return null;
      }

      return parsedData.books;
    } catch (error) {
      logError("BackupService.restoreBackup", error);
      Alert.alert("Hata", "Yedek geri yüklenirken bir sorun oluştu.");
      return null;
    }
  },

  // Alias for backward compatibility if needed, though we'll update usage
  createBackup: async (books: Book[]) => {
    // Default behavior
    await BackupService.shareBackup(books);
  },
};
