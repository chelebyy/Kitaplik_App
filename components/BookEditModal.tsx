/**
 * BookEditModal - Kitap düzenleme modal'ı
 *
 * Başlık, Yazar, Tür ve Kapak düzenleme imkanı sağlar.
 */
import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActionSheetIOS,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { X, Camera, ChevronDown } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Book } from "../context/BooksContext";
import {
  GENRE_LIST,
  GenreType,
  getGenreTranslationKey,
  normalizeGenre,
} from "../utils/genreTranslator";
import GenrePickerModal from "./GenrePickerModal";

interface BookEditModalProps {
  visible: boolean;
  book: Book;
  onClose: () => void;
  onSave: (
    data: Partial<Pick<Book, "title" | "author" | "genre" | "coverUrl">>,
  ) => void;
}

export default function BookEditModal({
  visible,
  book,
  onClose,
  onSave,
}: Readonly<BookEditModalProps>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Edit state'leri
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);
  const [editGenre, setEditGenre] = useState<GenreType>(
    normalizeGenre(book.genre),
  );
  const [editCoverUrl, setEditCoverUrl] = useState(book.coverUrl);
  const [genrePickerVisible, setGenrePickerVisible] = useState(false);

  // Book değiştiğinde state'leri sıfırla
  useEffect(() => {
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditGenre(normalizeGenre(book.genre));
    setEditCoverUrl(book.coverUrl);
  }, [book]);

  // Kapak fotoğrafı seçenekleri
  const showCoverOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("cancel"), t("take_photo"), t("choose_from_gallery")],
          cancelButtonIndex: 0,
          title: t("edit_cover_options"),
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickFromGallery();
          }
        },
      );
    } else {
      Alert.alert(
        t("edit_cover_options"),
        "",
        [
          { text: t("cancel"), style: "cancel" },
          { text: t("take_photo"), onPress: () => void takePhoto() },
          {
            text: t("choose_from_gallery"),
            onPress: () => void pickFromGallery(),
          },
        ],
        { cancelable: true },
      );
    }
  };

  // Galeriden seç
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("attention"), t("camera_permission_required"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditCoverUrl(result.assets[0].uri);
    }
  };

  // Kamera ile çek
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("attention"), t("camera_permission_required"));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setEditCoverUrl(result.assets[0].uri);
    }
  };

  const showGenrePicker = () => {
    if (Platform.OS === "ios") {
      // Translate genres for ActionSheet
      const translatedGenres = GENRE_LIST.map((g) =>
        t(getGenreTranslationKey(g)),
      );

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t("cancel"), ...translatedGenres],
          cancelButtonIndex: 0,
          title: t("select_genre"),
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setEditGenre(GENRE_LIST[buttonIndex - 1]);
          }
        },
      );
    } else {
      // Android için GenrePickerModal aç
      setGenrePickerVisible(true);
    }
  };

  // Kaydet
  const handleSave = () => {
    if (!editTitle.trim() || !editAuthor.trim()) {
      Alert.alert(t("add_book_fill_required"), t("add_book_fill_required_msg"));
      return;
    }

    onSave({
      title: editTitle.trim(),
      author: editAuthor.trim(),
      genre: editGenre,
      coverUrl: editCoverUrl,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
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
              {t("edit")}
            </Text>
            <TouchableOpacity
              onPress={handleSave}
              className="px-4 py-2 rounded-lg"
              style={{ backgroundColor: colors.primary }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: "#FFFFFF", fontFamily: "Inter_600SemiBold" }}
              >
                {t("save_changes")}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Kapak Resmi */}
            <TouchableOpacity
              onPress={showCoverOptions}
              className="items-center mb-6"
            >
              <View className="relative">
                <Image
                  source={editCoverUrl}
                  className="w-[140px] h-[210px] rounded-xl"
                  style={{ backgroundColor: colors.imagePlaceholder }}
                  contentFit="cover"
                />
                <View
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Camera size={20} color="#FFFFFF" />
                </View>
              </View>
              <Text
                className="text-sm mt-3"
                style={{ color: colors.primary, fontFamily: "Inter_500Medium" }}
              >
                {t("edit_cover")}
              </Text>
            </TouchableOpacity>

            {/* Başlık */}
            <View className="mb-5">
              <Text
                className="text-sm font-medium mb-2"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {t("add_book_book_name")}
              </Text>
              <TextInput
                className="border rounded-xl px-4 py-3"
                style={{
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: "Inter_400Regular",
                }}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder={t("add_book_book_name_placeholder")}
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* Yazar */}
            <View className="mb-5">
              <Text
                className="text-sm font-medium mb-2"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {t("add_book_author")}
              </Text>
              <TextInput
                className="border rounded-xl px-4 py-3"
                style={{
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                  color: colors.text,
                  fontFamily: "Inter_400Regular",
                }}
                value={editAuthor}
                onChangeText={setEditAuthor}
                placeholder={t("add_book_author_placeholder")}
                placeholderTextColor={colors.placeholder}
              />
            </View>

            {/* Tür Seçimi */}
            <View className="mb-5">
              <Text
                className="text-sm font-medium mb-2"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {t("add_book_genre")}
              </Text>
              <TouchableOpacity
                onPress={showGenrePicker}
                className="border rounded-xl px-4 py-3 flex-row items-center justify-between"
                style={{
                  backgroundColor: colors.inputBackground,
                  borderColor: colors.border,
                }}
              >
                <Text
                  style={{ color: colors.text, fontFamily: "Inter_400Regular" }}
                >
                  {t(getGenreTranslationKey(editGenre))}
                </Text>
                <ChevronDown size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Genre Picker Modal for Android */}
      <GenrePickerModal
        visible={genrePickerVisible}
        selectedGenre={editGenre}
        onSelect={setEditGenre}
        onClose={() => setGenrePickerVisible(false)}
      />
    </Modal>
  );
}
