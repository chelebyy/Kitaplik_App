import React, { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
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
  Bell,
  BellOff,
  Gift,
  BookOpen,
  Sparkles,
  Calendar,
  Award,
  Lock,
  Star,
  Share2,
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useBooks } from "../../context/BooksContext";
import { useLanguage } from "../../context/LanguageContext";
import { BackupService } from "../../services/BackupService";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import { createFeedbackMailto } from "../../utils/email";
import { logError } from "../../utils/errorUtils";
import { useNotifications } from "../../context/NotificationContext";
import { CollapsibleSection } from "../../components/CollapsibleSection";

export default function SettingsScreen() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { books, clearAllData, restoreBooks } = useBooks();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const { settings, updateSetting } = useNotifications();
  const [isAboutVisible, setAboutVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
              onPress: () => {
                void (async () => {
                  await restoreBooks(restoredBooks);
                  Alert.alert(
                    t("settings_restore_success"),
                    t("settings_restore_success_msg"),
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
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View
        className="px-6 py-5"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-[28px] font-bold"
          style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
        >
          {t("settings")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: GÖRÜNÜM */}
        <View className="mb-6">
          <Text
            className="text-[13px] mb-3 uppercase tracking-wider ml-1"
            style={{ color: colors.sectionHeader, fontFamily: "Inter_700Bold" }}
          >
            {t("settings_appearance")}
          </Text>
          <View
            className="rounded-2xl py-2 px-4 shadow-sm"
            style={{
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.03,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center py-3 min-h-[56px]">
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                {isDarkMode ? (
                  <Moon size={22} color="#448AFF" />
                ) : (
                  <Sun size={22} color="#448AFF" />
                )}
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
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
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={() => changeLanguage(language === "tr" ? "en" : "tr")}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <Text style={{ fontSize: 20 }}>🌍</Text>
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_language")}
              </Text>
              <Text
                className="text-[15px] font-regular"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {language === "tr" ? "🇹🇷 Türkçe" : "🇬🇧 English"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: BİLDİRİMLER - Collapsible */}
        <CollapsibleSection
          title={t("settings_notifications")}
          icon={<Bell size={22} color="#448AFF" />}
          defaultOpen={false}
        >
          {/* Günlük okuma hatırlatması */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <BookOpen size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_daily_reading")}
            </Text>
            <Switch
              value={settings.dailyReadingReminder}
              onValueChange={(value) =>
                updateSetting("dailyReadingReminder", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.dailyReadingReminder ? "#448AFF" : "#f4f3f4"}
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Pasif kullanıcı uyarısı */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <BellOff size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_inactive_user")}
            </Text>
            <Switch
              value={settings.inactiveUserAlert}
              onValueChange={(value) =>
                updateSetting("inactiveUserAlert", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.inactiveUserAlert ? "#448AFF" : "#f4f3f4"}
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Okuma ilerlemesi bildirimi */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <Award size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_reading_progress")}
            </Text>
            <Switch
              value={settings.readingProgressAlert}
              onValueChange={(value) =>
                updateSetting("readingProgressAlert", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.readingProgressAlert ? "#448AFF" : "#f4f3f4"}
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Günlük kredi hatırlatması */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <Gift size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_daily_credit")}
            </Text>
            <Switch
              value={settings.dailyCreditReminder}
              onValueChange={(value) =>
                updateSetting("dailyCreditReminder", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.dailyCreditReminder ? "#448AFF" : "#f4f3f4"}
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Haftalık özet */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <Calendar size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_weekly_summary")}
            </Text>
            <Switch
              value={settings.weeklyToReadSummary}
              onValueChange={(value) =>
                updateSetting("weeklyToReadSummary", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.weeklyToReadSummary ? "#448AFF" : "#f4f3f4"}
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Kitap bitirme kutlaması */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <Sparkles size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_book_complete")}
            </Text>
            <Switch
              value={settings.bookCompletionCelebration}
              onValueChange={(value) =>
                updateSetting("bookCompletionCelebration", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={
                settings.bookCompletionCelebration ? "#448AFF" : "#f4f3f4"
              }
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Yıl sonu özeti */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: colors.iconBackground }}
            >
              <Bell size={22} color="#448AFF" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_year_end")}
            </Text>
            <Switch
              value={settings.yearEndSummary}
              onValueChange={(value) => updateSetting("yearEndSummary", value)}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={settings.yearEndSummary ? "#448AFF" : "#f4f3f4"}
            />
          </View>

          <View
            className="h-[1px] ml-14"
            style={{ backgroundColor: colors.border }}
          />

          {/* Sihirli öneri bildirimi */}
          <View className="flex-row items-center py-3 min-h-[56px]">
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-4"
              style={{ backgroundColor: "rgba(255, 215, 0, 0.15)" }}
            >
              <Sparkles size={22} color="#FFD700" />
            </View>
            <Text
              className="flex-1 text-base font-semibold"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("notification_magic_recommendation")}
            </Text>
            <Switch
              value={settings.magicRecommendationAlert}
              onValueChange={(value) =>
                updateSetting("magicRecommendationAlert", value)
              }
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={
                settings.magicRecommendationAlert ? "#448AFF" : "#f4f3f4"
              }
            />
          </View>
        </CollapsibleSection>

        {/* Section: VERİ YÖNETİMİ */}
        <View className="mb-6">
          <Text
            className="text-[13px] mb-3 uppercase tracking-wider ml-1"
            style={{ color: colors.sectionHeader, fontFamily: "Inter_700Bold" }}
          >
            {t("settings_data_management")}
          </Text>
          <View
            className="rounded-2xl py-2 px-4 shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={handleBackup}
              disabled={isLoading}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <CloudUpload size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_backup")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={handleRestore}
              disabled={isLoading}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <History size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_restore")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={handleResetData}
              disabled={isLoading}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: "rgba(255, 59, 48, 0.1)" }}
              >
                <Trash2 size={22} color="#FF3B30" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_reset")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: DESTEK & İLETİŞİM */}
        <View className="mb-6">
          <Text
            className="text-[13px] mb-3 uppercase tracking-wider ml-1"
            style={{ color: colors.sectionHeader, fontFamily: "Inter_700Bold" }}
          >
            {t("settings_support")}
          </Text>
          <View
            className="rounded-2xl py-2 px-4 shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            {/* Uygulamayı Değerlendir */}
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(t("rate_app"), "Yakında...");
              }}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <Star size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("rate_app")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            {/* Uygulamayı Paylaş */}
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(t("share_app"), "Yakında...");
              }}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <Share2 size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("share_app")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            {/* İletişim */}
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={handleFeedback}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <Mail size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_feedback")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: HAKKINDA & YASAL */}
        <View className="mb-6">
          <Text
            className="text-[13px] mb-3 uppercase tracking-wider ml-1"
            style={{ color: colors.sectionHeader, fontFamily: "Inter_700Bold" }}
          >
            {t("settings_legal")}
          </Text>
          <View
            className="rounded-2xl py-2 px-4 shadow-sm"
            style={{ backgroundColor: colors.card }}
          >
            {/* Hakkında */}
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={() => setAboutVisible(true)}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <FileText size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_about")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            {/* Kullanım Koşulları */}
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={() => {
                Alert.alert(t("terms_of_use"), "Yakında...");
              }}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <FileText size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("terms_of_use")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            {/* Gizlilik Politikası */}
            <TouchableOpacity
              className="flex-row items-center py-3 min-h-[56px]"
              activeOpacity={0.7}
              onPress={() => {
                void Linking.openURL("https://ayrac-app.netlify.app/privacy");
              }}
            >
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <Lock size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("privacy_policy")}
              </Text>
              <ChevronRight size={20} color={colors.tabIconDefault} />
            </TouchableOpacity>

            <View
              className="h-[1px] ml-14"
              style={{ backgroundColor: colors.border }}
            />

            {/* Sürüm */}
            <View className="flex-row items-center py-3 min-h-[56px]">
              <View
                className="w-10 h-10 rounded-xl justify-center items-center mr-4"
                style={{ backgroundColor: colors.iconBackground }}
              >
                <Info size={22} color="#448AFF" />
              </View>
              <Text
                className="flex-1 text-base font-semibold"
                style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
              >
                {t("settings_version")}
              </Text>
              <Text
                className="text-[15px] font-regular"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_400Regular",
                }}
              >
                1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-white mt-2.5 font-semibold">
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
        <View className="flex-1 bg-black/50 justify-end">
          <View
            className="rounded-t-3xl pb-10 px-6 min-h-[400px]"
            style={{ backgroundColor: colors.card }}
          >
            <View className="flex-row justify-between items-center py-5 mb-2.5">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
              >
                {t("settings_about_title")}
              </Text>
              <TouchableOpacity
                onPress={() => setAboutVisible(false)}
                className="p-1"
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View className="items-center">
              <View
                className="mb-4 shadow-sm"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Image
                  source={require("../../assets/images/logo.png")}
                  style={{ width: 80, height: 80 }}
                  contentFit="contain"
                  transition={200}
                />
              </View>
              <Text
                className="text-2xl font-bold mb-3"
                style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
              >
                {t("settings_app_name")}
              </Text>
              <Text
                className="text-base text-center leading-6 mb-6 font-regular"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {t("settings_about_desc")}
              </Text>
              <Text
                className="text-sm font-semibold mb-2"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {t("settings_developer")}
              </Text>
              <Text
                className="text-xs font-regular opacity-60"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {t("settings_copyright", { year: new Date().getFullYear() })}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
