import React, { useState, useCallback, memo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
  ListRenderItemInfo,
} from "react-native";
import { ChevronDown, Check, X } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";

interface FilterDropdownProps {
  label: string;
  items: string[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

function FilterDropdown({
  label,
  items,
  selectedValue,
  onValueChange,
}: Readonly<FilterDropdownProps>) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  // Optimized with useCallback to prevent unnecessary re-renders
  const handleSelect = useCallback(
    (item: string) => {
      onValueChange(item);
      setVisible(false);
    },
    [onValueChange],
  );

  // Memoized renderItem for FlashList
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<string>) => {
      const isSelected = item === selectedValue;
      return (
        <TouchableOpacity
          className={cn("flex-row justify-between items-center py-3.5 px-5")}
          style={
            isSelected
              ? { backgroundColor: colors.selectedBackground }
              : undefined
          }
          onPress={() => handleSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={
            isSelected ? t("selected_option", { option: item }) : item
          }
        >
          <Text
            className={cn(
              "text-base",
              isSelected ? "font-bold" : "font-regular",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
            style={{
              fontFamily: isSelected ? "Inter_700Bold" : "Inter_400Regular",
              color: isSelected ? colors.primary : colors.text,
            }}
          >
            {item}
          </Text>
          {isSelected && <Check size={18} color={colors.primary} />}
        </TouchableOpacity>
      );
    },
    [colors, handleSelect, selectedValue, isDarkMode, t],
  );

  return (
    <>
      <TouchableOpacity
        className={cn(
          "flex-row items-center justify-between px-4 py-2.5 rounded-xl border min-w-[150px]",
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200",
        )}
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        accessibilityLabel={`${label}: ${selectedValue}`}
        accessibilityRole="button"
        accessibilityHint={t("select_option", { label })}
      >
        <View className="flex-row items-center flex-1 mr-2">
          <Text
            className={cn(
              "font-regular text-sm mr-1.5",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.textSecondary,
            }}
          >
            {label}:
          </Text>
          <Text
            className="font-semibold text-sm flex-1"
            style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
            numberOfLines={1}
          >
            {selectedValue}
          </Text>
        </View>
        <ChevronDown size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-6"
          onPress={() => setVisible(false)}
        >
          <View
            className={cn(
              "w-full rounded-3xl shadow-xl overflow-hidden",
              isDarkMode ? "bg-slate-800" : "bg-white",
            )}
            style={{
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 10,
              maxHeight: "60%",
              minHeight: 150,
            }}
          >
            <View
              className={cn(
                "flex-row justify-between items-center p-4 border-b",
                isDarkMode ? "border-slate-700" : "border-slate-100",
              )}
              style={{ borderBottomColor: colors.border }}
            >
              <Text
                className={cn(
                  "font-bold text-base",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
                style={{ fontFamily: "Inter_700Bold", color: colors.text }}
              >
                {t("select_option", { label })}
              </Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                className="p-1"
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={renderItem}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

export default memo(FilterDropdown);
