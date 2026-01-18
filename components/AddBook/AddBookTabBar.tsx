import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { PenTool, Search } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

export type InputMode = "manual" | "search";

interface AddBookTabBarProps {
  readonly mode: InputMode;
  readonly onModeChange: (mode: InputMode) => void;
}

/**
 * AddBookTabBar - Tab switcher between manual and search modes
 *
 * Features:
 * - Two modes: manual input and search
 * - Visual feedback for active tab
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * <AddBookTabBar
 *   mode={mode}
 *   onModeChange={setMode}
 * />
 * ```
 */
export function AddBookTabBar({ mode, onModeChange }: AddBookTabBarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getTabStyle = (tabMode: InputMode) => {
    const isActive = mode === tabMode;
    if (isActive) {
      return {
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      };
    }
    return {};
  };

  return (
    <View className="px-6 mb-4">
      <View
        className="flex-row p-1 rounded-xl h-11"
        style={{ backgroundColor: colors.chipBackground }}
      >
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-lg"
          style={getTabStyle("manual")}
          onPress={() => onModeChange("manual")}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "manual" }}
          accessibilityLabel={t("add_book_manual")}
        >
          <PenTool
            size={16}
            color={mode === "manual" ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            className="font-semibold text-sm"
            style={{
              color: mode === "manual" ? colors.text : colors.textSecondary,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {t("add_book_manual")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center rounded-lg"
          style={getTabStyle("search")}
          onPress={() => onModeChange("search")}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === "search" }}
          accessibilityLabel={t("add_book_search")}
        >
          <Search
            size={16}
            color={mode === "search" ? colors.primary : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            className="font-semibold text-sm"
            style={{
              color: mode === "search" ? colors.text : colors.textSecondary,
              fontFamily: "Inter_600SemiBold",
            }}
          >
            {t("add_book_search")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
