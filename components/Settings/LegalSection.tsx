import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { ChevronRight, FileText, Lock, Info } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import * as Linking from "expo-linking";

interface LegalSectionProps {
  readonly onAboutOpen: () => void;
}

export function LegalSection({ onAboutOpen }: LegalSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
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
          onPress={onAboutOpen}
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
            Alert.alert(t("terms_of_use"), t("coming_soon"));
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
            1.0
          </Text>
        </View>
      </View>
    </View>
  );
}
