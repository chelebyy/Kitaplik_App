import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Trash2, ShoppingCart } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useBooks, BookStatus } from "../context/BooksContext";
import { useTranslation } from "react-i18next";
import PriceComparisonModal from "../components/PriceComparisonModal";

// Helper function to get translation key for status
const getStatusTranslationKey = (status: BookStatus): string => {
  const keys: Record<BookStatus, string> = {
    "Okundu": "read",
    "Okunuyor": "reading",
    "Okunacak": "to_read",
  };
  return keys[status];
};

export default function BookDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const {
    getBookById,
    updateBookStatus,
    updateBookNotes,
    updateBookProgress,
    deleteBook,
  } = useBooks();

  // params.id'yi güvenli bir şekilde al
  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Kitap verisini al
  const book = getBookById(bookId || "");

  const [notes, setNotes] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isPriceModalVisible, setPriceModalVisible] = useState(false);

  useEffect(() => {
    if (book) {
      setNotes(book.notes || "");
      setCurrentPage(book.currentPage || 0);
      setPageCount(book.pageCount || 0);
    }
  }, [book]);

  // Kitap silindiğinde veya bulunamadığında
  if (!book) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2"
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View className="flex-1 justify-center items-center">
          <Text style={{ color: colors.text }}>
            {t("book_detail_not_found")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStatusChange = (newStatus: BookStatus) => {
    if (!bookId) return;
    updateBookStatus(bookId, newStatus);
  };

  const handleNotesChange = (text: string) => {
    if (!bookId) return;
    setNotes(text);
    updateBookNotes(bookId, text);
  };

  const handleProgressChange = (current: string, total: string) => {
    if (!bookId) return;

    const currentNum = Number.parseInt(current, 10) || 0;
    const totalNum = Number.parseInt(total, 10) || 0;

    setCurrentPage(currentNum);
    setPageCount(totalNum);

    updateBookProgress(bookId, currentNum, totalNum);
  };

  const handleDelete = () => {
    if (!bookId) return;

    Alert.alert(t("book_detail_delete_title"), t("book_detail_delete_msg"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("book_detail_delete_button"),
        style: "destructive",
        onPress: () => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace("/(tabs)/books");
          }
          deleteBook(bookId);
        },
      },
    ]);
  };

  const statuses: BookStatus[] = ["Okunacak", "Okunuyor", "Okundu"];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text
          className="text-xl font-bold"
          style={{ fontFamily: "Inter_700Bold", color: colors.text }}
        >
          {t("book_detail_title")}
        </Text>
        <TouchableOpacity
          onPress={handleDelete}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={24} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          <View
            className="items-center mt-4 mb-6 shadow-lg elevation-10"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
            }}
          >
            <Image
              source={{ uri: book.coverUrl }}
              className="w-[180px] h-[270px] rounded-xl bg-[#E0E0E0]"
              resizeMode="cover"
            />
          </View>

          <View className="items-center mb-8">
            <Text
              className="text-2xl font-bold mb-2 text-center"
              style={{ fontFamily: "Inter_700Bold", color: colors.text }}
              numberOfLines={2}
            >
              {book.title}
            </Text>
            <Text
              className="text-base font-semibold mb-4"
              style={{ fontFamily: "Inter_600SemiBold", color: colors.textSecondary }}
            >
              {book.author}
            </Text>

            <View className="flex-row flex-wrap justify-center gap-2">
              <View
                className="px-4 py-2 rounded-[20px]"
                style={{ backgroundColor: colors.chipBackground }}
              >
                <Text
                  className="text-xs font-semibold"
                  style={{ fontFamily: "Inter_600SemiBold", color: colors.text }}
                >
                  {book.genre || t("general")}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              className="flex-row items-center px-4 py-2.5 rounded-[20px] mt-4"
              style={{ backgroundColor: colors.primary + "15" }}
              onPress={() => setPriceModalVisible(true)}
            >
              <ShoppingCart
                size={20}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-sm font-semibold"
                style={{ fontFamily: "Inter_600SemiBold", color: colors.primary }}
              >
                {t("price_compare")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ fontFamily: "Inter_700Bold", color: colors.sectionHeader }}
            >
              {t("book_detail_status")}
            </Text>
            <View className="flex-row gap-3">
              {statuses.map((s) => {
                const isActive = book.status === s;
                // Active Colors
                const activeBg = isDarkMode ? "#1E293B" : "#334155";
                const activeBorder = isDarkMode ? colors.primary : "#334155";

                return (
                  <TouchableOpacity
                    key={s}
                    className="flex-1 h-11 justify-center items-center rounded-xl border"
                    style={{
                      backgroundColor: isActive ? activeBg : "transparent",
                      borderColor: isActive ? activeBorder : colors.border,
                      borderWidth: isActive ? 1.5 : 1,
                    }}
                    onPress={() => handleStatusChange(s)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        color: isActive ? "#FFFFFF" : colors.textSecondary,
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
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className="text-base font-bold mb-0"
                style={{ fontFamily: "Inter_700Bold", color: colors.sectionHeader }}
              >
                {t("book_detail_progress")}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{
                  fontFamily: "Inter_500Medium",
                  color: colors.textSecondary,
                }}
              >
                {book.currentPage || 0} / {book.pageCount || 0}{" "}
                {t("book_detail_pages")}
              </Text>
            </View>

            <View
              className="rounded-2xl p-4 border"
              style={{ backgroundColor: colors.card, borderColor: colors.border }}
            >
              {/* Progress Bar */}
              <View
                className="h-2 rounded-full mb-4 overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(((book.currentPage || 0) / (book.pageCount || 1)) * 100, 100)}%`,
                    backgroundColor:
                      book.status === "Okundu" ? "#4CAF50" : colors.primary,
                  }}
                />
              </View>

              {/* Inputs */}
              <View className="flex-row">
                <View className="flex-1 mr-3">
                  <Text
                    className="text-xs font-medium mb-2"
                    style={{
                      fontFamily: "Inter_500Medium",
                      color: colors.textSecondary,
                    }}
                  >
                    {t("book_detail_current_page")}
                  </Text>
                  <TextInput
                    className="border rounded-lg px-3 py-2.5 text-sm font-semibold"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border,
                      fontFamily: "Inter_600SemiBold",
                    }}
                    value={String(currentPage)}
                    onChangeText={(text) =>
                      handleProgressChange(text, String(pageCount))
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xs font-medium mb-2"
                    style={{
                      fontFamily: "Inter_500Medium",
                      color: colors.textSecondary,
                    }}
                  >
                    {t("book_detail_total_pages")}
                  </Text>
                  <TextInput
                    className="border rounded-lg px-3 py-2.5 text-sm font-semibold"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.text,
                      borderColor: colors.border,
                      fontFamily: "Inter_600SemiBold",
                    }}
                    value={String(pageCount)}
                    onChangeText={(text) =>
                      handleProgressChange(String(currentPage), text)
                    }
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>
              </View>
            </View>
          </View>

          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{ fontFamily: "Inter_700Bold", color: colors.sectionHeader }}
            >
              {t("book_detail_notes")}
            </Text>
            <View
              className="rounded-2xl p-4 min-h-[150px]"
              style={{ backgroundColor: colors.noteBackground }}
            >
              <TextInput
                className="text-[15px] h-full leading-6"
                style={{ fontFamily: "Inter_400Regular", color: colors.text }}
                placeholder={t("book_detail_notes_placeholder")}
                placeholderTextColor={colors.placeholder}
                multiline
                textAlignVertical="top"
                value={notes}
                onChangeText={handleNotesChange}
              />
            </View>
          </View>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      <PriceComparisonModal
        visible={isPriceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        bookTitle={book.title}
        bookAuthor={book.author}
      />
    </SafeAreaView>
  );
}
