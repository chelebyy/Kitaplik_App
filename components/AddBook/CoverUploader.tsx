import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { Image } from "expo-image";
import { Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

interface CoverUploaderProps {
  coverUrl: string | null;
  onCoverChange: (url: string | null) => void;
}

/**
 * CoverUploader - Component for uploading book cover images
 *
 * Features:
 * - Take photo with camera
 * - Pick from gallery
 * - Preview uploaded image
 * - Remove uploaded image
 *
 * @example
 * ```tsx
 * <CoverUploader
 *   coverUrl={form.coverUrl}
 *   onCoverChange={form.setCoverUrl}
 * />
 * ```
 */
export function CoverUploader({ coverUrl, onCoverChange }: CoverUploaderProps) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } =
      await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(t("add_book_fill_required"), t("add_book_not_found_msg"));
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onCoverChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      onCoverChange(result.assets[0].uri);
    }
  };

  const handleUpload = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["İptal", "Fotoğraf Çek", "Galeriden Seç"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        },
      );
    } else {
      Alert.alert(t("add_book_add_cover"), t("add_book_upload"), [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("take_photo"),
          onPress: () => {
            void takePhoto();
          },
        },
        {
          text: t("choose_from_gallery"),
          onPress: () => {
            void pickImage();
          },
        },
      ]);
    }
  };

  const handleRemove = () => {
    onCoverChange(null);
  };

  return (
    <View
      className="border-[1.5px] border-dashed rounded-2xl p-8 items-center mb-8 min-h-[200px] justify-center"
      style={{
        backgroundColor: isDarkMode ? colors.card : "#F8F9FA",
        borderColor: colors.border,
      }}
    >
      {coverUrl ? (
        <View className="w-full items-center">
          <Image
            source={coverUrl}
            className="w-[120px] h-[180px] rounded-lg mb-3"
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
          <TouchableOpacity
            className="px-3 py-1.5 rounded-xl bg-black/60"
            onPress={handleRemove}
          >
            <Text
              className="text-white text-xs font-semibold"
              style={{ fontFamily: "Inter_600SemiBold" }}
            >
              {t("add_book_remove")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View
            className="w-16 h-16 rounded-full justify-center items-center mb-4"
            style={{ backgroundColor: colors.iconBackground }}
          >
            <ImageIcon size={32} color="#448AFF" />
          </View>
          <Text
            className="font-semibold text-base mb-1"
            style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
          >
            {t("add_book_cover")}
          </Text>
          <Text
            className="font-regular text-sm mb-4"
            style={{
              color: colors.textSecondary,
              fontFamily: "Inter_400Regular",
            }}
          >
            {t("add_book_add_cover")}
          </Text>
          <TouchableOpacity
            className="px-8 py-2.5 rounded-lg"
            style={{ backgroundColor: colors.chipBackground }}
            onPress={handleUpload}
          >
            <Text
              className="font-semibold text-sm"
              style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
            >
              {t("add_book_upload")}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
