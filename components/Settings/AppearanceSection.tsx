import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { Moon, Sun } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTranslation } from "react-i18next";

export function AppearanceSection() {
  const { colors, isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
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
  );
}
