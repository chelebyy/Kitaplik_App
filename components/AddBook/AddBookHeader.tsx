import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

/**
 * AddBookHeader - Header component for add book screen
 *
 * Features:
 * - Back button navigation
 * - Centered title
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * <AddBookHeader />
 * ```
 */
export function AddBookHeader() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View
      className="flex-row items-center justify-between px-6 py-4"
      style={{ backgroundColor: colors.background }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="p-1 -ml-1"
        accessibilityRole="button"
        accessibilityLabel={t("back")}
      >
        <ArrowLeft size={24} color={colors.text} />
      </TouchableOpacity>
      <Text
        className="text-xl font-bold"
        style={{ fontFamily: "Inter_700Bold", color: colors.text }}
      >
        {t("add_book_title")}
      </Text>
      <View className="w-6" />
    </View>
  );
}
