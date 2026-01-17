import React from "react";
import { View, Text, Switch } from "react-native";
import {
  Bell,
  BookOpen,
  BellOff,
  Award,
  Gift,
  Calendar,
  Sparkles,
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import { useTranslation } from "react-i18next";
import { CollapsibleSection } from "../../components/CollapsibleSection";

export function NotificationSection() {
  const { colors } = useTheme();
  const { settings, updateSetting } = useNotifications();
  const { t } = useTranslation();

  return (
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
          onValueChange={(value) => updateSetting("inactiveUserAlert", value)}
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
          onValueChange={(value) => updateSetting("dailyCreditReminder", value)}
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
          onValueChange={(value) => updateSetting("weeklyToReadSummary", value)}
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
          thumbColor={settings.magicRecommendationAlert ? "#448AFF" : "#f4f3f4"}
        />
      </View>
    </CollapsibleSection>
  );
}
