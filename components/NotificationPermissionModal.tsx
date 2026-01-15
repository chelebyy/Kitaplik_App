import React from "react";
import { Modal, View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Bell, Settings } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface Props {
  readonly visible: boolean;
  readonly onContinue: () => void;
}

export function NotificationPermissionModal({ visible, onContinue }: Props) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <StatusBar
        backgroundColor="rgba(0,0,0,0.5)"
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />
      <View
        className="flex-1 justify-center items-center px-8"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="w-full rounded-3xl p-6"
          style={{
            backgroundColor: colors.card,
            maxWidth: 360,
          }}
        >
          {/* Icon */}
          <View
            className="self-center w-20 h-20 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <Bell size={40} color={colors.primary} strokeWidth={2.5} />
          </View>

          {/* Title */}
          <Text
            className="text-2xl font-bold text-center mb-3"
            style={{
              fontFamily: "Inter_700Bold",
              color: colors.text,
            }}
          >
            {t("notification_permission_title")}
          </Text>

          {/* Description */}
          <Text
            className="text-base text-center mb-4 leading-6"
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.textSecondary,
            }}
          >
            {t("notification_permission_description")}
          </Text>

          {/* Settings hint with icon */}
          <View
            className="flex-row items-center justify-center mb-6 px-3 py-2 rounded-xl"
            style={{ backgroundColor: colors.inputBackground }}
          >
            <Settings size={16} color={colors.textSecondary} strokeWidth={2} />
            <Text
              className="text-xs ml-2"
              style={{
                fontFamily: "Inter_400Regular",
                color: colors.textSecondary,
              }}
            >
              {t("notification_permission_note")}
            </Text>
          </View>

          {/* Single Continue Button */}
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center"
            style={{ backgroundColor: colors.primary }}
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text
              className="text-base font-semibold"
              style={{
                fontFamily: "Inter_600SemiBold",
                color: "#FFFFFF",
              }}
            >
              {t("notification_permission_allow")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
