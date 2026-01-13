import React, { useState, useMemo, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Search,
  Grid,
  List,
  Plus,
  ArrowUpDown,
  BookOpen,
} from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useBooks, Book } from "../../context/BooksContext";
import { useAuth } from "../../context/AuthContext";
import FilterDropdown from "../../components/FilterDropdown";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { BookCard } from "../../components/BookCard";

type SortOption = "title_asc" | "title_desc" | "author_asc" | "rating_desc";

export default function BooksScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { books } = useBooks();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const { t, i18n } = useTranslation();

  // States
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(t("all_genres"));
  const [sortBy, setSortBy] = useState<SortOption>("title_asc");
  const [activeStatus, setActiveStatus] = useState("Tümü");

  // İstatistikler
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const readBooks = books.filter((b) => b.status === "Okundu").length;
    const readingBooks = books.filter((b) => b.status === "Okunuyor").length;
    const toReadBooks = books.filter((b) => b.status === "Okunacak").length;
    return { totalBooks, readBooks, readingBooks, toReadBooks };
  }, [books]);

  // Reset filter when language changes
  useEffect(() => {
    setSelectedGenre(t("all_genres"));
  }, [i18n.language, t]);

  // Grid hesaplamaları
  const COLUMN_WIDTH = (width - 48 - 16) / 2;

  // Dinamik Filtre Listesi
  const filters = useMemo(() => {
    const genres = new Set(books.map((b) => b.genre || t("general")));
    return [t("all_genres"), ...Array.from(genres)];
  }, [books, t]);

  // Filtreleme ve Sıralama Mantığı
  const processedBooks = useMemo(() => {
    let result = books.filter((book) => {
      // 1. Durum Filtresi
      const matchesStatus =
        activeStatus === "Tümü" || book.status === activeStatus;

      // 2. Tür Filtresi
      const bookGenre = book.genre || t("general");
      const matchesGenre =
        selectedGenre === t("all_genres") || bookGenre === selectedGenre;

      // 3. Arama Filtresi
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesGenre && matchesSearch;
    });

    // 3. Sıralama
    result.sort((a, b) => {
      switch (sortBy) {
        case "title_asc":
          return a.title.localeCompare(b.title);
        case "title_desc":
          return b.title.localeCompare(a.title);
        case "author_asc":
          return a.author.localeCompare(b.author);
        default:
          return 0;
      }
    });

    return result;
  }, [books, activeStatus, selectedGenre, searchQuery, sortBy, t]);

  const handleBookPress = React.useCallback(
    (id: string) => {
      router.push({ pathname: "/book-detail", params: { id } });
    },
    [router],
  );

  const renderBookItem = React.useCallback(
    ({ item }: { item: Book }) => {
      return (
        <View style={{ width: viewMode === "grid" ? COLUMN_WIDTH : "100%" }}>
          <BookCard book={item} variant={viewMode} onPressId={handleBookPress} />
        </View>
      );
    },
    [viewMode, COLUMN_WIDTH, handleBookPress],
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center px-6 py-5">
          <View className="flex-row items-center flex-1">
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-3 border-[1.5px]"
              style={{
                backgroundColor: colors.primary + "15",
                borderColor: isDarkMode ? colors.primary : "#334155",
              }}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 28, height: 28 }}
                contentFit="contain"
              />
            </View>
            <View>
              <Text
                className="text-[13px] font-medium"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {t("hello")},
              </Text>
              <Text
                className="text-[22px] font-bold"
                style={{ color: colors.text }}
                numberOfLines={1}
              >
                {user?.displayName || t("book_lover")}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            {/* Sort Button */}
            <TouchableOpacity
              onPress={() => {
                const options: SortOption[] = [
                  "title_asc",
                  "title_desc",
                  "author_asc",
                  "rating_desc",
                ];
                const currentIndex = options.indexOf(sortBy);
                const nextIndex = (currentIndex + 1) % options.length;
                setSortBy(options[nextIndex]);
              }}
              className="p-2 rounded-xl"
              style={{ backgroundColor: colors.card }}
            >
              <ArrowUpDown size={22} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
              }
              className="p-2 rounded-xl"
              style={{ backgroundColor: colors.card }}
            >
              {viewMode === "grid" ? (
                <List size={22} color={colors.text} />
              ) : (
                <Grid size={22} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View
          className="flex-row items-center mx-6 px-4 py-2 rounded-xl mb-4 shadow-sm"
          style={{
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.03,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Search
            size={20}
            color={colors.placeholder}
            style={{ marginRight: 12 }}
          />
          <TextInput
            placeholder={t("search_placeholder_books")}
            placeholderTextColor={colors.placeholder}
            className="flex-1 font-regular text-base"
            style={{ color: colors.text, fontFamily: "Inter_400Regular" }}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Durum Sekmeleri (Ana sayfa ile aynı tasarım) */}
        <View className="px-6 mb-4 shadow-sm">
          <LinearGradient
            colors={isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#FFF7ED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row justify-between">
              {[
                { key: "Tümü", label: t("all_books"), count: stats.totalBooks },
                { key: "Okunuyor", label: t("reading"), count: stats.readingBooks },
                { key: "Okunacak", label: t("to_read"), count: stats.toReadBooks },
                { key: "Okundu", label: t("read"), count: stats.readBooks },
              ].map((item) => (
                <TouchableOpacity
                  key={item.key}
                  className="flex-1 items-center"
                  style={{ opacity: activeStatus === item.key ? 1 : 0.5 }}
                  onPress={() => setActiveStatus(item.key)}
                  accessibilityLabel={`${item.label}: ${item.count}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeStatus === item.key }}
                >
                  <Text
                    className="text-[11px] mb-1.5 text-center"
                    style={{
                      color: "#667085",
                      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    className="text-xl font-bold text-center"
                    style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
                  >
                    {item.count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Minimal Dropdown Filtre Alanı */}
        <View className="mb-5 px-6 flex-row justify-between items-center">
          <FilterDropdown
            label={t("filter_genre")}
            items={filters}
            selectedValue={selectedGenre}
            onValueChange={setSelectedGenre}
          />
          {/* Active Sort Indicator */}
          <View
            className="px-3 py-1.5 rounded-lg border"
            style={{
              backgroundColor: colors.card,
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_500Medium",
              }}
            >
              {sortBy === "title_asc" && t("sort_az")}
              {sortBy === "title_desc" && t("sort_za")}
              {sortBy === "author_asc" && t("sort_author")}
              {sortBy === "rating_desc" && t("sort_rating")}
            </Text>
          </View>
        </View>

        <FlashList
          key={viewMode}
          data={processedBooks}
          renderItem={renderBookItem}
          // @ts-ignore
          estimatedItemSize={180}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === "grid" ? 2 : 1}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          columnWrapperStyle={
            viewMode === "grid"
              ? { justifyContent: "space-between", marginBottom: 24 }
              : undefined
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-[60px] px-5">
              <BookOpen
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Text
                className="font-regular text-center text-base"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_400Regular",
                }}
              >
                {searchQuery
                  ? t("empty_search", { query: searchQuery })
                  : t("empty_category")}
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          className="absolute bottom-6 right-6 w-[50px] h-[50px] rounded-2xl justify-center items-center shadow-lg elevation-6"
          onPress={() => router.push("/add-book")}
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
              borderRadius: 16,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1.5,
              borderColor: isDarkMode ? colors.primary : "#334155",
            }}
          >
            <Plus size={24} color={isDarkMode ? "#FFFFFF" : "#334155"} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
