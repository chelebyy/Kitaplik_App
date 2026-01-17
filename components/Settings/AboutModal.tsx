import React from "react";
import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { X } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface AboutModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AboutModal({ visible, onClose }: AboutModalProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className="rounded-t-3xl pb-10 px-6 min-h-[400px]"
          style={{ backgroundColor: colors.card }}
        >
          <View className="flex-row justify-between items-center py-5 mb-2.5">
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
            >
              {t("settings_about_title")}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View className="items-center">
            <View
              className="mb-4 shadow-sm"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 80, height: 80, resizeMode: "contain" }}
              />
            </View>
            <Text
              className="text-2xl font-bold mb-3"
              style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
            >
              {t("settings_app_name")}
            </Text>
            <Text
              className="text-base text-center leading-6 mb-6 font-regular"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
              }}
            >
              {t("settings_about_desc")}
            </Text>
            <Text
              className="text-sm font-semibold mb-2"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {t("settings_developer")}
            </Text>
            <Text
              className="text-xs font-regular opacity-60"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
              }}
            >
              {t("settings_copyright", { year: new Date().getFullYear() })}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
