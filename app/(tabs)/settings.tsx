import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Trash2,
  Info,
  FileText,
  ChevronRight,
  Moon,
  Sun,
  X,
  CloudUpload,
  History,
  Mail,
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useBooks } from "../../context/BooksContext";
import { useLanguage } from "../../context/LanguageContext";
import { BackupService } from "../../services/BackupService";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { createFeedbackMailto } from "../../utils/email";
import { logError } from "../../utils/errorUtils";

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { books, clearAllData, restoreBooks } = useBooks();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const [isAboutVisible, setAboutVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFeedback = async () => {
    const subject = t("feedback_subject");
    const body = `${t("feedback_body_intro")}
${t("feedback_type_bug")}
${t("feedback_type_suggestion")}
${t("feedback_type_request")}
${t("feedback_type_other")}

${t("feedback_body_message")}
`;
    const url = createFeedbackMailto("chelebyapp@gmail.com", subject, body);

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(t("profile_error_title"), "E-posta uygulaması bulunamadı.");
    }
  };

  const handleResetData = () => {
    Alert.alert(
      t("settings_reset_confirm_title"),
      t("settings_reset_confirm_msg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("settings_reset_confirm_button"),
          style: "destructive",
          // S6544: void wrapper ile async fonksiyon çağrısı
          onPress: () => {
            void clearAllData();
          },
        },
      ],
    );
  };

  const handleBackup = async () => {
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
          // S6544: void wrapper ile async fonksiyon çağrısı
          onPress: () => {
            void (async () => {
              setIsLoading(true);
              try {
                await BackupService.saveToDevice(books);
              } finally {
                setIsLoading(false);
              }
            })();
          },
        },
        {
          text: t("settings_backup_share"),
          // S6544: void wrapper ile async fonksiyon çağrısı
          onPress: () => {
            void (async () => {
              setIsLoading(true);
              try {
                await BackupService.shareBackup(books);
              } finally {
                setIsLoading(false);
              }
            })();
          },
        },
      ],
    );
  };

  const performRestore = async () => {
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
              // S6544: void wrapper ile async fonksiyon çağrısı
              onPress: () => {
                void (async () => {
                  await restoreBooks(restoredBooks);
                  Alert.alert(
                    t("settings_restore_success"),
                    t("settings_restore_success_msg")
                  );
                })();
              },
            },
          ],
        );
      }
    } catch (error) {
      logError("SettingsScreen.performRestore", error);
      Alert.alert(t("settings_restore_error"), t("settings_restore_error_msg"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      t("settings_restore_source_title"),
      t("settings_restore_source_msg"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("settings_restore_select_device"),
          // S6544: void wrapper ile async fonksiyon çağrısı
          onPress: () => {
            void performRestore();
          },
        },
        {
          text: t("settings_restore_select_drive"),
          // S6544: void wrapper ile async fonksiyon çağrısı
          onPress: () => {
            void performRestore();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("settings")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: GÖRÜNÜM */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>
            {t("settings_appearance")}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                {isDarkMode ? (
                  <Moon size={22} color="#448AFF" />
                ) : (
                  <Sun size={22} color="#448AFF" />
                )}
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("dark_mode")}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isDarkMode ? "#448AFF" : "#f4f3f4"}
              />
            </View>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => changeLanguage(language === "tr" ? "en" : "tr")}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <Text style={{ fontSize: 20 }}>🌍</Text>
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_language")}
              </Text>
              <Text
                style={[styles.versionText, { color: colors.textSecondary }]}
              >
                {language === "tr" ? "🇹🇷 Türkçe" : "🇬🇧 English"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: VERİ YÖNETİMİ */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>
            {t("settings_data_management")}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={handleBackup}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <CloudUpload size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_backup")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <History size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_restore")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={handleResetData}
              disabled={isLoading}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(255, 59, 48, 0.1)" },
                ]}
              >
                <Trash2 size={22} color="#FF3B30" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_reset")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: DİĞER */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionHeader, { color: colors.sectionHeader }]}>
            {t("settings_other")}
          </Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={handleFeedback}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <Mail size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_feedback")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <View style={styles.row}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <Info size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_version")}
              </Text>
              <Text
                style={[styles.versionText, { color: colors.textSecondary }]}
              >
                1.0.0
              </Text>
            </View>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setAboutVisible(true)}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.iconBackground },
                ]}
              >
                <FileText size={22} color="#448AFF" />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text }]}>
                {t("settings_about")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              style={[styles.separator, { backgroundColor: colors.border }]}
            />


          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: "#FFF", marginTop: 10, fontWeight: "600" }}>
            {t("settings_loading")}
          </Text>
        </View>
      )}

      {/* Hakkında Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAboutVisible}
        onRequestClose={() => setAboutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t("settings_about_title")}
              </Text>
              <TouchableOpacity
                onPress={() => setAboutVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.aboutContent}>
              <View style={styles.logoContainer}>
                <Image
                  source={{
                    uri: "https://img.icons8.com/fluency/96/books.png",
                  }}
                  style={{ width: 80, height: 80 }}
                />
              </View>
              <Text style={[styles.appName, { color: colors.text }]}>
                {t("settings_app_name")}
              </Text>
              <Text
                style={[styles.appDescription, { color: colors.textSecondary }]}
              >
                {t("settings_about_desc")}
              </Text>
              <Text style={[styles.developer, { color: colors.textSecondary }]}>
                {t("settings_developer")}
              </Text>
              <Text style={[styles.copyright, { color: colors.textSecondary }]}>
                {t("settings_copyright")}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    minHeight: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  rowLabel: {
    flex: 1,
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
  },
  versionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  separator: {
    height: 1,
    marginLeft: 56,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingHorizontal: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  closeButton: {
    padding: 4,
  },
  aboutContent: {
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    marginBottom: 12,
  },
  appDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  developer: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  copyright: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    opacity: 0.6,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
});
