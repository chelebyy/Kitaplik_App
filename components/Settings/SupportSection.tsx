import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ChevronRight, Star, Share2, Mail } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface SupportSectionProps {
  readonly onFeedback: () => void;
}

export function SupportSection({ onFeedback }: SupportSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
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
            Alert.alert(t("rate_app"), t("coming_soon"));
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
            Alert.alert(t("share_app"), t("coming_soon"));
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
          onPress={onFeedback}
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
  );
}
