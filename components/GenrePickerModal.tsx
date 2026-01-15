/**
 * GenrePickerModal - Tür seçim modal'ı
 *
 * Android'de Alert yerine tam liste gösteren modal.
 * iOS'ta ActionSheetIOS kullanılabilir.
 */
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { X, Check } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import {
  GENRE_LIST,
  GenreType,
  getGenreTranslationKey,
} from "../utils/genreTranslator";

interface GenrePickerModalProps {
  visible: boolean;
  selectedGenre: GenreType;
  onSelect: (genre: GenreType) => void;
  onClose: () => void;
}

export default function GenrePickerModal({
  visible,
  selectedGenre,
  onSelect,
  onClose,
}: Readonly<GenrePickerModalProps>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleSelect = (genre: GenreType) => {
    onSelect(genre);
    onClose();
  };

  const renderGenreItem = ({ item }: { item: GenreType }) => {
    const isSelected = item === selectedGenre;

    return (
      <TouchableOpacity
        onPress={() => handleSelect(item)}
        className="flex-row items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: colors.border }}
      >
        <Text
          className="text-base"
          style={{
            color: isSelected ? colors.primary : colors.text,
            fontFamily: isSelected ? "Inter_600SemiBold" : "Inter_400Regular",
          }}
        >
          {t(getGenreTranslationKey(item))}
        </Text>
        {isSelected && <Check size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: colors.border }}
        >
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            className="text-lg font-bold"
            style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
          >
            {t("select_genre")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Genre List */}
        <FlatList
          data={GENRE_LIST}
          keyExtractor={(item) => item}
          renderItem={renderGenreItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </View>
    </Modal>
  );
}

/**
 * Platform-aware genre picker trigger
 * iOS: ActionSheetIOS kullanır
 * Android: GenrePickerModal açar
 */
export function showGenrePickerIOS(
  t: (key: string) => string,
  currentGenre: GenreType,
  onSelect: (genre: GenreType) => void,
) {
  if (Platform.OS !== "ios") return;

  const translatedGenres = GENRE_LIST.map((g) => t(getGenreTranslationKey(g)));

  ActionSheetIOS.showActionSheetWithOptions(
    {
      options: [t("cancel"), ...translatedGenres],
      cancelButtonIndex: 0,
      title: t("select_genre"),
    },
    (buttonIndex) => {
      if (buttonIndex > 0) {
        onSelect(GENRE_LIST[buttonIndex - 1]);
      }
    },
  );
}
