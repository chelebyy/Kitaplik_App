import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { BookStatus } from "../../context/BooksContext";

interface StatusSelectorProps {
  status: BookStatus;
  onStatusChange: (status: BookStatus) => void;
}

/**
 * Helper function to get translation key for status
 */
const getStatusTranslationKey = (status: BookStatus): string => {
  const keys: Record<BookStatus, string> = {
    Okundu: "read",
    Okunuyor: "reading",
    Okunacak: "to_read",
  };
  return keys[status];
};

/**
 * StatusSelector - Component for selecting book reading status
 *
 * Features:
 * - Three status options: Okunacak, Okunuyor, Okundu
 * - Visual feedback for selected status
 * - Theme-aware styling
 *
 * @example
 * ```tsx
 * <StatusSelector
 *   status={form.status}
 *   onStatusChange={form.setStatus}
 * />
 * ```
 */
export function StatusSelector({
  status,
  onStatusChange,
}: StatusSelectorProps) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const statuses: BookStatus[] = ["Okunacak", "Okunuyor", "Okundu"];

  return (
    <View className="mb-6">
      <Text
        className="font-semibold text-base mb-3"
        style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
      >
        {t("add_book_status")}
      </Text>
      <View className="flex-row gap-3">
        {statuses.map((s) => {
          const isActive = status === s;
          // Active Colors
          const activeBg = isDarkMode ? "#1E293B" : "#334155";
          const activeBorder = isDarkMode ? colors.primary : "#334155";

          return (
            <TouchableOpacity
              key={s}
              className="flex-1 h-11 justify-center items-center rounded-xl overflow-hidden border"
              style={{
                backgroundColor: isActive ? activeBg : "transparent",
                borderColor: isActive ? activeBorder : colors.border,
                borderWidth: isActive ? 1.5 : 1,
              }}
              onPress={() => onStatusChange(s)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(getStatusTranslationKey(s))}
            >
              <Text
                className="font-semibold text-sm z-10"
                style={{
                  color: isActive ? "#FFFFFF" : colors.textSecondary,
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {t(getStatusTranslationKey(s))}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
