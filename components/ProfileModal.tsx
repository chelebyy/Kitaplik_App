import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { X, LogOut, User as UserIcon, Check } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ProfileModal({
  visible,
  onClose,
}: Readonly<ProfileModalProps>) {
  const { isDarkMode } = useTheme();
  // We use inline colors for icons where className can't easily reach props, 
  // but for main UI we use Tailwind classes.
  // Note: For text/bg colors, we often rely on isDarkMode toggle or standard Tailwind dark: utility if configured.
  // Since this project uses manual isDarkMode context, we'll use conditional classes.

  const { user, signIn, signOut } = useAuth();
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const handleCreateProfile = async () => {
    if (name.trim().length === 0) {
      Alert.alert(t("profile_error_title"), t("profile_error_msg"));
      return;
    }
    await signIn(name);
    setName("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View
          className={cn(
            "w-full max-w-[360px] rounded-3xl border overflow-hidden shadow-xl",
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          )}
          style={isDarkMode ? undefined : { elevation: 10 }} // Tailwind shadow doesn't always map to elevation on Android
        >
          {/* Header */}
          <View className={cn("flex-row justify-between items-center px-5 py-4 border-b", isDarkMode ? "border-slate-700" : "border-slate-100")}>
            <Text className={cn("text-lg font-bold", isDarkMode ? "text-white" : "text-slate-900")}>
              {t("profile")}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color={isDarkMode ? "#94a3b8" : "#64748b"} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="p-6">
            {user ? (
              // Logged In View
              <View className="items-center">
                <Image
                  source={{
                    uri: user.photoURL || "https://via.placeholder.com/100",
                  }}
                  className="w-20 h-20 rounded-full mb-4 bg-slate-200"
                />
                <Text className={cn("text-lg font-bold mb-4", isDarkMode ? "text-white" : "text-slate-900")}>
                  {user.displayName || t("book_lover")}
                </Text>

                <View
                  className={cn(
                    "p-4 rounded-xl mb-6 w-full",
                    isDarkMode ? "bg-[#333]" : "bg-gray-100"
                  )}
                >
                  <Text className={cn("text-[13px] text-center leading-5", isDarkMode ? "text-gray-300" : "text-slate-600")}>
                    {t("profile_local_active")}
                  </Text>
                </View>

                <TouchableOpacity
                  className={cn(
                    "flex-row items-center py-3 px-6 rounded-xl border w-full justify-center",
                    "border-red-500"
                  )}
                  onPress={() => {
                    signOut();
                    onClose();
                  }}
                >
                  <LogOut
                    size={18}
                    color="#ef4444"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm font-semibold text-red-500">
                    {t("profile_delete")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Guest View / Create Profile
              <View className="items-center">
                <View
                  className="w-16 h-16 rounded-full justify-center items-center mb-4 bg-sky-100"
                >
                  <UserIcon size={32} color="#0284C7" />
                </View>
                <Text className={cn("text-xl font-bold mb-2", isDarkMode ? "text-white" : "text-slate-900")}>
                  {t("profile_create")}
                </Text>
                <Text
                  className={cn("text-sm text-center mb-6 leading-5", isDarkMode ? "text-gray-400" : "text-slate-500")}
                >
                  {t("profile_create_desc")}
                </Text>

                <View
                  className={cn(
                    "w-full rounded-xl border mb-4 px-4 h-[50px] justify-center",
                    isDarkMode ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                  )}
                >
                  <TextInput
                    className={cn("text-base", isDarkMode ? "text-white" : "text-slate-900")}
                    placeholder={t("profile_name_placeholder")}
                    placeholderTextColor={isDarkMode ? "#64748b" : "#94a3b8"}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                <TouchableOpacity
                  className="flex-row items-center justify-center py-[14px] px-6 rounded-xl w-full bg-blue-600"
                  onPress={handleCreateProfile}
                >
                  <Check size={20} color="#FFF" style={{ marginRight: 8 }} />
                  <Text className="text-base font-semibold text-white">
                    {t("profile_create_button")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
