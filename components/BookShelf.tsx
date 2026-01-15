import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { Book } from "../context/BooksContext";

interface BookShelfProps {
  books: Book[];
  maxVisible?: number;
  title?: string;
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
}

/**
 * Okunan kitapların yatay rafı bileşeni.
 * Kitap kapakları yan yana gösterilir, ahşap raf görünümü verilir.
 */
export const BookShelf: React.FC<BookShelfProps> = ({
  books,
  maxVisible = 10,
  title,
  itemWidth = 72,
  itemHeight = 108,
  gap = 14,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();

  // Gösterilecek kitaplar
  const displayBooks = books.slice(0, maxVisible);

  // Kitap yoksa boş durum göster
  if (books.length === 0) {
    return (
      <View className="mx-5 mb-5">
        <Text
          className="text-sm font-semibold mb-3"
          style={{
            color: colors.textSecondary,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          {title || t("read")}
        </Text>
        <View
          className="rounded-xl p-6 items-center"
          style={{
            backgroundColor: isDarkMode ? colors.card : "#F8FAFC",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <BookOpen
            size={36}
            color={colors.textSecondary}
            style={{ opacity: 0.4, marginBottom: 8 }}
          />
          <Text
            className="text-sm text-center"
            style={{
              color: colors.textSecondary,
              fontFamily: "Inter_500Medium",
            }}
          >
            {t("no_books_read")}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-5">
      {/* Başlık */}
      <View className="flex-row justify-between items-center mx-5 mb-3">
        <Text
          className="text-sm font-semibold"
          style={{
            color: colors.textSecondary,
            fontFamily: "Inter_600SemiBold",
          }}
        >
          {title || t("read")}
        </Text>
        {books.length > maxVisible && (
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => router.push("/(tabs)/books")}
            accessibilityLabel={t("see_all")}
            accessibilityRole="button"
          >
            <Text
              className="text-xs"
              style={{
                color: isDarkMode ? colors.primary : "#334155",
                fontFamily: "Inter_500Medium",
              }}
            >
              {t("see_all")}
            </Text>
            <ChevronRight
              size={14}
              color={isDarkMode ? colors.primary : "#334155"}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Kitap Rafı */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {displayBooks.map((book, index) => (
          <TouchableOpacity
            key={book.id}
            activeOpacity={0.7}
            onPress={() =>
              router.push({
                pathname: "/book-detail",
                params: { id: book.id },
              })
            }
            style={{ marginRight: index === displayBooks.length - 1 ? 0 : gap }}
            accessibilityLabel={`${book.title} - ${book.author}`}
            accessibilityRole="button"
          >
            <View
              className="rounded-lg overflow-hidden"
              style={{
                width: itemWidth,
                height: itemHeight,
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 5,
              }}
            >
              {book.coverUrl ? (
                <Image
                  source={{ uri: book.coverUrl }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              ) : (
                <View
                  className="w-full h-full items-center justify-center"
                  style={{
                    backgroundColor: isDarkMode ? "#374151" : "#E5E7EB",
                  }}
                >
                  <BookOpen size={24} color={colors.textSecondary} />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default BookShelf;
