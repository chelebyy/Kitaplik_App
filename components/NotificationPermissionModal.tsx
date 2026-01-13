import React from "react";
import { Modal, View, Text, TouchableOpacity, StatusBar } from "react-native";
import { Bell } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface Props {
  readonly visible: boolean;
  readonly onAllow: () => void;
  readonly onDeny: () => void;
}

export function NotificationPermissionModal({
  visible,
  onAllow,
  onDeny,
}: Props) {
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
            className="text-base text-center mb-6 leading-6"
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.textSecondary,
            }}
          >
            {t("notification_permission_description")}
          </Text>

          {/* Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              className="w-full py-4 rounded-2xl items-center"
              style={{ backgroundColor: colors.primary }}
              onPress={onAllow}
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

            <TouchableOpacity
              className="w-full py-4 rounded-2xl items-center"
              style={{ backgroundColor: colors.inputBackground }}
              onPress={onDeny}
              activeOpacity={0.8}
            >
              <Text
                className="text-base font-semibold"
                style={{
                  fontFamily: "Inter_600SemiBold",
                  color: colors.textSecondary,
                }}
              >
                {t("notification_permission_deny")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Note */}
          <Text
            className="text-xs text-center mt-5"
            style={{
              fontFamily: "Inter_400Regular",
              color: colors.textSecondary + "80",
            }}
          >
            {t("notification_permission_note")}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
