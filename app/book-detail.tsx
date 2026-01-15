import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Trash2, ShoppingCart, Pencil } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { getGenreTranslationKey } from "../utils/genreTranslator";
import { BookStatus } from "../context/BooksContext";
import { useBookDetails } from "../hooks/book/useBookDetails";
import { useTranslation } from "react-i18next";
import PriceComparisonModal from "../components/PriceComparisonModal";
import BookEditModal from "../components/BookEditModal";

import { BookNotes } from "../components/BookNotes";

// Helper function to get translation key for status
const getStatusTranslationKey = (status: BookStatus): string => {
  const keys: Record<BookStatus, string> = {
    Okundu: "read",
    Okunuyor: "reading",
    Okunacak: "to_read",
  };
  return keys[status];
};

export default function BookDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  // params.id'yi güvenli bir şekilde al
  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

  // useBookDetails hook - tüm kitap state ve işlemleri hook'tan geliyor
  const {
    book,
    notes,
    currentPage,
    pageCount,
    updateStatus,
    updateNotes,
    updateProgress,
    updateBookInfo,
    deleteBook: deleteBookFromContext,
  } = useBookDetails(bookId || "");

  // Modal states
  const [isPriceModalVisible, setPriceModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setEditModalVisible] = useState<boolean>(false);

  // Kitap silindiğinde veya bulunamadığında
  if (!book) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
      >
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
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

  // Handler: Durum değiştir
  const handleStatusChange = (newStatus: BookStatus) => {
    updateStatus(newStatus);
  };

  // Handler: Not değiştir
  const handleNotesChange = (text: string) => {
    updateNotes(text);
  };

  // Handler: İlerleme değiştir
  const handleProgressChange = (current: string, total: string) => {
    const currentNum = Number.parseInt(current, 10) || 0;
    const totalNum = Number.parseInt(total, 10) || 0;
    updateProgress(currentNum, totalNum);
  };

  // Handler: Kitap sil
  const handleDelete = () => {
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
          deleteBookFromContext();
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
        <View className="flex-row gap-1">
          <TouchableOpacity
            onPress={() => setEditModalVisible(true)}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Pencil size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={22} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Adjust based on header
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: Platform.OS === "ios" ? 40 : 100, // Extra space for keyboard
          }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
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
              source={book.coverUrl}
              className="w-[180px] h-[270px] rounded-xl"
              style={{ backgroundColor: colors.imagePlaceholder }}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
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
              style={{
                fontFamily: "Inter_600SemiBold",
                color: colors.textSecondary,
              }}
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
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    color: colors.text,
                  }}
                >
                  {t(getGenreTranslationKey(book.genre || "Diğer"))}
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
                style={{
                  fontFamily: "Inter_600SemiBold",
                  color: colors.primary,
                }}
              >
                {t("price_compare")}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mb-6">
            <Text
              className="text-base font-bold mb-3"
              style={{
                fontFamily: "Inter_700Bold",
                color: colors.sectionHeader,
              }}
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
                style={{
                  fontFamily: "Inter_700Bold",
                  color: colors.sectionHeader,
                }}
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
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
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

          <BookNotes notes={notes} onNotesChange={handleNotesChange} />

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>

      <PriceComparisonModal
        visible={isPriceModalVisible}
        onClose={() => setPriceModalVisible(false)}
        bookTitle={book.title}
        bookAuthor={book.author}
      />

      <BookEditModal
        visible={isEditModalVisible}
        book={book}
        onClose={() => setEditModalVisible(false)}
        onSave={updateBookInfo}
      />
    </SafeAreaView>
  );
}
