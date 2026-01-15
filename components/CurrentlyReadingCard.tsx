import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { BookOpen, ChevronRight } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { Book } from "../context/BooksContext";
import { LinearGradient } from "expo-linear-gradient";

interface CurrentlyReadingCardProps {
  books: Book[];
}

// Interface for shared props used by internal helper components
interface HelperComponentProps {
  colors: ReturnType<typeof useTheme>["colors"];
  isDarkMode: boolean;
  t: ReturnType<typeof useTranslation>["t"];
}

interface SingleBookViewProps extends HelperComponentProps {
  book: Book;
  router: ReturnType<typeof useRouter>;
}

interface MultiBookViewProps extends HelperComponentProps {
  books: Book[];
  router: ReturnType<typeof useRouter>;
}

/**
 * Şu an okunan kitapları gösteren bileşen.
 * - Tek kitap varsa büyük kart gösterir
 * - Birden fazla kitap varsa yatay scroll gösterir
 * - Kitap yoksa motivasyonel mesaj gösterir
 */
const EmptyState = ({ colors, isDarkMode, t }: HelperComponentProps) => (
  <View className="mx-5 mb-5">
    <Text
      className="text-sm font-semibold mb-3"
      style={{
        color: colors.textSecondary,
        fontFamily: "Inter_600SemiBold",
      }}
    >
      {t("reading")}
    </Text>
    <LinearGradient
      colors={isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#FFF7ED"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View className="items-center py-4">
        <BookOpen
          size={48}
          color={colors.textSecondary}
          style={{ opacity: 0.5, marginBottom: 12 }}
        />
        <Text
          className="text-base text-center"
          style={{
            color: colors.textSecondary,
            fontFamily: "Inter_500Medium",
          }}
        >
          {t("currently_reading_empty")}
        </Text>
        <Text
          className="text-sm text-center mt-1"
          style={{
            color: colors.placeholder,
            fontFamily: "Inter_400Regular",
          }}
        >
          {t("currently_reading_hint")}
        </Text>
      </View>
    </LinearGradient>
  </View>
);

const SingleBookView = ({
  book,
  router,
  colors,
  isDarkMode,
  t,
}: SingleBookViewProps) => (
  <View className="mx-5 mb-5">
    <Text
      className="text-sm font-semibold mb-3"
      style={{
        color: colors.textSecondary,
        fontFamily: "Inter_600SemiBold",
      }}
    >
      {t("reading")}
    </Text>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() =>
        router.push({
          pathname: "/book-detail",
          params: { id: book.id },
        })
      }
      accessibilityLabel={`${book.title} - ${book.author}`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#FFF7ED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View className="flex-row">
          <View
            className="rounded-lg overflow-hidden mr-4"
            style={{
              width: 80,
              height: 120,
              backgroundColor: colors.card,
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
                style={{ backgroundColor: isDarkMode ? "#374151" : "#E5E7EB" }}
              >
                <BookOpen size={32} color={colors.textSecondary} />
              </View>
            )}
          </View>

          <View className="flex-1 justify-between">
            <View>
              <Text
                className="text-lg font-bold leading-tight mb-1"
                style={{
                  color: colors.text,
                  fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                }}
                numberOfLines={2}
              >
                {book.title}
              </Text>
              <Text
                className="text-sm"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
                numberOfLines={1}
              >
                {book.author}
              </Text>
            </View>

            <View className="flex-row items-center mt-2">
              <Text
                className="text-sm font-semibold"
                style={{
                  color: isDarkMode ? colors.primary : "#334155",
                  fontFamily: "Inter_600SemiBold",
                }}
              >
                {t("continue_reading")}
              </Text>
              <ChevronRight
                size={18}
                color={isDarkMode ? colors.primary : "#334155"}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </View>
);

const MultiBookView = ({
  books,
  router,
  colors,
  isDarkMode,
  t,
}: MultiBookViewProps) => (
  <View className="mb-5">
    <View className="flex-row justify-between items-center mx-5 mb-3">
      <Text
        className="text-sm font-semibold"
        style={{
          color: colors.textSecondary,
          fontFamily: "Inter_600SemiBold",
        }}
      >
        {t("reading")}
      </Text>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {books.map((book: Book, index: number) => (
        <TouchableOpacity
          key={book.id}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: "/book-detail",
              params: { id: book.id },
            })
          }
          style={{ marginRight: index === books.length - 1 ? 0 : 10 }}
          accessibilityLabel={`${book.title} - ${book.author}`}
          accessibilityRole="button"
        >
          <LinearGradient
            colors={
              isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#FFF7ED"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
              width: 115,
              height: 165,
            }}
          >
            <View
              className="rounded-lg overflow-hidden mb-2 self-center"
              style={{
                width: 60,
                height: 90,
                backgroundColor: colors.card,
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

            <Text
              className="text-xs font-bold text-center"
              style={{
                color: colors.text,
                fontFamily: "Inter_600SemiBold",
              }}
              numberOfLines={2}
            >
              {book.title}
            </Text>
            <Text
              className="text-[10px] text-center mt-0.5"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
              }}
              numberOfLines={1}
            >
              {book.author}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export const CurrentlyReadingCard: React.FC<CurrentlyReadingCardProps> = ({
  books,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();

  if (books.length === 0) {
    return <EmptyState colors={colors} isDarkMode={isDarkMode} t={t} />;
  }

  if (books.length === 1) {
    return (
      <SingleBookView
        book={books[0]}
        router={router}
        colors={colors}
        isDarkMode={isDarkMode}
        t={t}
      />
    );
  }

  return (
    <MultiBookView
      books={books}
      router={router}
      colors={colors}
      isDarkMode={isDarkMode}
      t={t}
    />
  );
};

export default CurrentlyReadingCard;
