import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  ChevronRight,
  CloudUpload,
  History,
  Trash2,
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface DataManagementSectionProps {
  readonly isLoading: boolean;
  readonly onBackup: () => void;
  readonly onRestore: () => void;
  readonly onResetData: () => void;
}

export function DataManagementSection({
  isLoading,
  onBackup,
  onRestore,
  onResetData,
}: DataManagementSectionProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
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
          onPress={onBackup}
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
          onPress={onRestore}
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
          onPress={onResetData}
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
  );
}
