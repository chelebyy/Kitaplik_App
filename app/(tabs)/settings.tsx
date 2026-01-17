import React, { useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useBooks } from "../../context/BooksContext";
import { useSettingsActions } from "../../hooks/useSettingsActions";
import { createFeedbackMailto } from "../../utils/email";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";
import {
  AboutModal,
  AppearanceSection,
  NotificationSection,
  DataManagementSection,
  SupportSection,
  LegalSection,
} from "../../components/Settings";

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { books } = useBooks();
  const { t } = useTranslation();
  const { isLoading, handleBackup, handleRestore, handleResetData } =
    useSettingsActions({
      books,
      clearAllData: useBooks().clearAllData,
      restoreBooks: useBooks().restoreBooks,
    });
  const [isAboutVisible, setAboutVisible] = useState<boolean>(false);

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
      Alert.alert(t("profile_error_title"), t("email_app_not_found"));
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
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
        <AppearanceSection />

        {/* Section: BİLDİRİMLER - Collapsible */}
        <NotificationSection />

        {/* Section: VERİ YÖNETİMİ */}
        <DataManagementSection
          isLoading={isLoading}
          onBackup={handleBackup}
          onRestore={handleRestore}
          onResetData={handleResetData}
        />

        {/* Section: DESTEK & İLETİŞİM */}
        <SupportSection onFeedback={handleFeedback} />

        {/* Section: HAKKINDA & YASAL */}
        <LegalSection onAboutOpen={() => setAboutVisible(true)} />
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading && (
        <Modal transparent={true} visible={isLoading}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-white mt-2.5 font-semibold">
              {t("settings_loading")}
            </Text>
          </View>
        </Modal>
      )}

      {/* Hakkında Modalı */}
      <AboutModal
        visible={isAboutVisible}
        onClose={() => setAboutVisible(false)}
      />
    </SafeAreaView>
  );
}
