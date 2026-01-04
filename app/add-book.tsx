import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  ActivityIndicator,
  ActionSheetIOS,
} from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Image as ImageIcon,
  Search,
  PenTool,
  ScanLine,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useBooks, BookStatus } from "../context/BooksContext";
import * as ImagePicker from "expo-image-picker";
import BarcodeScannerModal from "../components/BarcodeScannerModal";
import { GoogleBookResult } from "../services/GoogleBooksService";
import { SearchEngine } from "../services/SearchEngine";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

type InputMode = "manual" | "search";

// Helper function to get translation key for status (reduces cognitive complexity)
const getStatusTranslationKey = (status: BookStatus): string => {
  const keys: Record<BookStatus, string> = {
    Okundu: "read",
    Okunuyor: "reading",
    Okunacak: "to_read",
  };
  return keys[status];
};

export default function AddBookScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { addBook } = useBooks();
  const { t, i18n } = useTranslation();

  // Mode State
  const [mode, setMode] = useState<InputMode>("manual");

  // Form State
  const [status, setStatus] = useState<BookStatus>("Okunuyor");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [currentPage, setCurrentPage] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<"book" | "author">("book");

  // Scanner State
  const [isScannerVisible, setScannerVisible] = useState(false);

  const statuses: BookStatus[] = ["Okunacak", "Okunuyor", "Okundu"];

  const requestPermissions = async () => {
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

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [2, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverUrl(result.assets[0].uri);
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

  const handleBarcodeScanned = async (isbn: string) => {
    setIsLoading(true);
    try {
      // Use SearchEngine
      const items = await SearchEngine.search(
        isbn,
        i18n.language?.split("-")[0],
        "book",
      );

      if (items.length > 0) {
        selectBook(items[0]);
        Alert.alert(t("add_book_success"), t("add_book_success_msg"));
      } else {
        Alert.alert(t("add_book_not_found"), t("add_book_not_found_msg"));
      }
    } catch {
      Alert.alert(t("settings_restore_error"), t("settings_restore_error_msg"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!title.trim() || !author.trim()) {
      Alert.alert(t("add_book_fill_required"), t("add_book_fill_required_msg"));
      return;
    }

    const totalPages = Number.parseInt(pageCount, 10) || 0;
    const current = Number.parseInt(currentPage, 10) || 0;

    let progress = 0;
    if (status === "Okundu") {
      progress = 1;
    } else if (status === "Okunuyor" && totalPages > 0) {
      progress = Math.min(current / totalPages, 1);
    }

    addBook({
      title,
      author,
      status,
      genre: genre || "Genel",
      coverUrl:
        coverUrl ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600",
      progress,
      pageCount: totalPages,
      currentPage: status === "Okundu" ? totalPages : current,
    });

    Alert.alert(t("add_book_success"), t("add_book_success_msg"));
    router.back();
  };

  const searchGoogleBooks = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const items = await SearchEngine.search(
        searchQuery,
        i18n.language?.split("-")[0],
        searchType,
      );
      if (items.length > 0) {
        setSearchResults(items);
      } else {
        setSearchResults([]);
        Alert.alert(t("add_book_not_found"), t("add_book_no_results"));
      }
    } catch {
      Alert.alert(t("settings_restore_error"), t("settings_restore_error_msg"));
    } finally {
      setIsLoading(false);
    }
  };

  const selectBook = (book: GoogleBookResult) => {
    setTitle(book.volumeInfo.title || "");
    setAuthor(book.volumeInfo.authors ? book.volumeInfo.authors[0] : "");

    let image = book.volumeInfo.imageLinks?.thumbnail;
    if (image) {
      image = image.replace("http://", "https://");
    }
    setCoverUrl(image || null);

    if (book.volumeInfo.categories && book.volumeInfo.categories.length > 0) {
      setGenre(book.volumeInfo.categories[0]);
    }

    if (book.volumeInfo.pageCount) {
      setPageCount(book.volumeInfo.pageCount.toString());
    }

    setMode("manual");
    setSearchResults([]);
    setSearchQuery("");
  };

  const renderSearchMode = () => (
    <View className="flex-1 px-6">
      {/* Search Type Toggle */}
      <View
        className="flex-row border rounded-xl p-1 mb-4"
        style={{
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setSearchType("book");
            setSearchQuery("");
            setSearchResults([]);
          }}
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center transition-all bg-transparent"
          style={{
            backgroundColor:
              searchType === "book" ? colors.primary : "transparent",
          }}
        >
          <Text
            className="text-sm font-semibold"
            style={{
              color: searchType === "book" ? "#FFFFFF" : colors.text,
              fontFamily:
                searchType === "book"
                  ? "Inter_600SemiBold"
                  : "Inter_400Regular",
            }}
          >
            📚 {t("add_book_search_books")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSearchType("author");
            setSearchQuery("");
            setSearchResults([]);
          }}
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center transition-all bg-transparent"
          style={{
            backgroundColor:
              searchType === "author" ? colors.primary : "transparent",
          }}
        >
          <Text
            className="text-sm font-semibold"
            style={{
              color: searchType === "author" ? "#FFFFFF" : colors.text,
              fontFamily:
                searchType === "author"
                  ? "Inter_600SemiBold"
                  : "Inter_400Regular",
            }}
          >
            👤 {t("add_book_search_authors")}
          </Text>
        </TouchableOpacity>
      </View>

      <View
        className="flex-row items-center border rounded-xl px-3 py-2 mb-4"
        style={{
          backgroundColor: colors.inputBackground,
          borderColor: colors.border,
        }}
      >
        <TextInput
          className="flex-1 font-regular text-base py-2 ml-2.5"
          style={{ color: colors.text, fontFamily: "Inter_400Regular" }}
          placeholder={t("add_book_search_results")}
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          onSubmitEditing={searchGoogleBooks}
        />
        <TouchableOpacity onPress={searchGoogleBooks} className="px-2 py-1">
          <Search size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            className="mt-3 font-medium text-sm"
            style={{
              color: colors.textSecondary,
              fontFamily: "Inter_500Medium",
            }}
          >
            {t("add_book_searching")}
          </Text>
        </View>
      ) : (
        <FlashList
          data={searchResults}
          // @ts-ignore
          estimatedItemSize={100}
          keyExtractor={(item) => item.id}
          // @ts-ignore - FlashList getItemLayout for performance
          getItemLayout={(
            _data: ArrayLike<GoogleBookResult> | null | undefined,
            index: number,
          ) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          contentContainerStyle={{ paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            searchResults.length === 0 && searchQuery ? (
              <Text
                className="text-center mt-6 font-regular"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {t("add_book_no_results")}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row p-3 rounded-xl mb-3 items-center"
              style={{ backgroundColor: colors.card }}
              onPress={() => selectBook(item)}
            >
              <Image
                source={
                  item.volumeInfo.imageLinks?.thumbnail?.replace(
                    "http://",
                    "https://",
                  ) || "https://placehold.co/100x150/png"
                }
                className="w-[50px] h-[75px] rounded mr-3 bg-[#E0E0E0]"
                contentFit="cover"
                transition={200}
              />
              <View className="flex-1 mr-2">
                <Text
                  className="font-semibold text-[15px] mb-1 leading-5"
                  style={{
                    color: colors.text,
                    fontFamily: "Inter_600SemiBold",
                  }}
                  numberOfLines={2}
                >
                  {item.volumeInfo.title || t("add_book_book_name_placeholder")}
                </Text>
                <Text
                  className="font-regular text-[13px] mb-1.5"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                  }}
                  numberOfLines={1}
                >
                  {item.volumeInfo.authors?.join(", ") ||
                    t("add_book_author_placeholder")}
                </Text>
                {item.volumeInfo.categories &&
                  item.volumeInfo.categories.length > 0 && (
                    <View
                      className="self-start px-2 py-0.5 rounded"
                      style={{ backgroundColor: colors.chipBackground }}
                    >
                      <Text
                        className="text-[10px] font-medium"
                        style={{
                          color: colors.textSecondary,
                          fontFamily: "Inter_500Medium",
                        }}
                      >
                        {item.volumeInfo.categories[0]}
                      </Text>
                    </View>
                  )}
                {item.volumeInfo.pageCount ? (
                  <Text
                    className="text-xs font-regular mt-1"
                    style={{
                      color: colors.textSecondary,
                      fontFamily: "Inter_400Regular",
                    }}
                  >
                    {item.volumeInfo.pageCount} {t("book_detail_pages")}
                  </Text>
                ) : null}
              </View>
              <View className="pl-2">
                <Text
                  className="font-semibold"
                  style={{
                    color: colors.primary,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  {t("add_book_add")}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );

  const renderManualMode = () => (
    <ScrollView
      contentContainerStyle={{ padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Scan Barcode Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center p-3 rounded-xl border border-dashed mb-6"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.primary,
        }}
        onPress={() => setScannerVisible(true)}
      >
        <ScanLine size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text
          className="font-semibold text-sm"
          style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
        >
          {t("add_book_scan_barcode")}
        </Text>
      </TouchableOpacity>

      {/* Cover Upload Area */}
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
            />
            <TouchableOpacity
              className="px-3 py-1.5 rounded-xl bg-black/60"
              onPress={() => setCoverUrl(null)}
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

      {/* Form Fields */}
      <View className="mb-6">
        <Text
          className="font-semibold text-base mb-3"
          style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
        >
          {t("add_book_book_name")}
        </Text>
        <TextInput
          className="border rounded-xl px-4 h-[50px] font-regular text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={t("add_book_book_name_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View className="mb-6">
        <Text
          className="font-semibold text-base mb-3"
          style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
        >
          {t("add_book_author")}
        </Text>
        <TextInput
          className="border rounded-xl px-4 h-[50px] font-regular text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={t("add_book_author_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={author}
          onChangeText={setAuthor}
        />
      </View>

      <View className="flex-row items-center">
        <View className="flex-1 mr-3 mb-6">
          <Text
            className="font-semibold text-base mb-3"
            style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
          >
            {t("add_book_genre")}
          </Text>
          <TextInput
            className="border rounded-xl px-4 h-[50px] font-regular text-base"
            style={{
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: "Inter_400Regular",
            }}
            placeholder={t("add_book_genre_placeholder")}
            placeholderTextColor={colors.placeholder}
            value={genre}
            onChangeText={setGenre}
          />
        </View>

        <View className="flex-1 mb-6">
          <Text
            className="font-semibold text-base mb-3"
            style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
          >
            {t("add_book_page_count")}
          </Text>
          <TextInput
            className="border rounded-xl px-4 h-[50px] font-regular text-base"
            style={{
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: "Inter_400Regular",
            }}
            placeholder={t("add_book_page_count_placeholder")}
            placeholderTextColor={colors.placeholder}
            value={pageCount}
            onChangeText={setPageCount}
            keyboardType="numeric"
          />
        </View>
      </View>

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
                onPress={() => setStatus(s)}
                activeOpacity={0.8}
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

      <View className="mb-6">
        <Text
          className="font-semibold text-base mb-3"
          style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
        >
          {t("book_detail_current_page")}
        </Text>
        <TextInput
          className="border rounded-xl px-4 h-[50px] font-regular text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={t("current_page_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={currentPage}
          onChangeText={setCurrentPage}
          keyboardType="numeric"
        />
      </View>

      <View className="h-[100px]" />
    </ScrollView>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View
        className="flex-row items-center justify-between px-6 py-4"
        style={{ backgroundColor: colors.background }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-1 -ml-1">
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ fontFamily: "Inter_700Bold", color: colors.text }}
        >
          {t("add_book_title")}
        </Text>
        <View className="w-6" />
      </View>

      <View className="px-6 mb-4">
        <View
          className="flex-row p-1 rounded-xl h-11"
          style={{ backgroundColor: colors.chipBackground }}
        >
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-lg"
            style={
              mode === "manual"
                ? {
                    backgroundColor: colors.card,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }
                : {}
            }
            onPress={() => setMode("manual")}
          >
            <PenTool
              size={16}
              color={mode === "manual" ? colors.primary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              className="font-semibold text-sm"
              style={{
                color: mode === "manual" ? colors.text : colors.textSecondary,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {t("add_book_manual")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-lg"
            style={
              mode === "search"
                ? {
                    backgroundColor: colors.card,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                    elevation: 2,
                  }
                : {}
            }
            onPress={() => setMode("search")}
          >
            <Search
              size={16}
              color={mode === "search" ? colors.primary : colors.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              className="font-semibold text-sm"
              style={{
                color: mode === "search" ? colors.text : colors.textSecondary,
                fontFamily: "Inter_600SemiBold",
              }}
            >
              {t("add_book_search")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {mode === "manual" ? renderManualMode() : renderSearchMode()}

        {mode === "manual" && (
          <View
            className="absolute bottom-0 left-0 right-0 px-6 pt-4 border-t"
            style={{
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "ios" ? 34 : 24,
            }}
          >
            <TouchableOpacity
              className="h-14 rounded-2xl shadow-sm elevation-4"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#F8FAFC"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: "100%",
                  height: "100%",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: isDarkMode ? colors.primary : "#334155",
                }}
              >
                <Text
                  className="font-bold text-base"
                  style={{
                    fontFamily: "Inter_700Bold",
                    color: isDarkMode ? colors.primary : "#334155",
                  }}
                >
                  {t("add_book_save")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      <BarcodeScannerModal
        visible={isScannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScanned}
      />

      {isLoading && mode === "manual" && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#FFF" />
          <Text
            className="text-white mt-2.5 font-semibold"
            style={{ fontFamily: "Inter_600SemiBold" }}
          >
            Kitap bilgileri getiriliyor...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
