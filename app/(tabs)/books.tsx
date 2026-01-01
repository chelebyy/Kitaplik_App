import React, { useState, useMemo, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  useWindowDimensions,
} from "react-native";
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

  // Reset filter when language changes
  useEffect(() => {
    setSelectedGenre(t("all_genres"));
  }, [i18n.language, t]);

  // Grid hesaplamaları
  const COLUMN_WIDTH = (width - 48 - 16) / 2;

  // Dinamik Filtre Listesi (Kitaplardan gelen türler)
  const filters = useMemo(() => {
    const genres = new Set(books.map((b) => b.genre || t("general")));
    return [t("all_genres"), ...Array.from(genres)];
  }, [books, t]);

  // Filtreleme ve Sıralama Mantığı
  const processedBooks = useMemo(() => {
    let result = books.filter((book) => {
      // 1. Tür Filtresi
      // Note: We compare against the displayed genre or 'All'
      // Since we don't have a separate value/label system for dropdown yet,
      // we need to match the logic carefully.
      // If selected is 'All' (translated), we show all.
      // If selected is a specific genre, we match it.
      // Since books.genre might be in Turkish (from DB) but we might be in English mode,
      // this simple equality check might fail if we try to translate book.genre on the fly for filtering.
      // Ideally, book.genre should be stored in a language-neutral way or we accept that user-entered genres are what they are.
      // For now, we assume book.genre is what is displayed in the list (except 'Genel' fallback).

      const bookGenre = book.genre || t("general");
      const matchesGenre =
        selectedGenre === t("all_genres") || bookGenre === selectedGenre;

      // 2. Arama Filtresi
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesGenre && matchesSearch;
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
        // Rating sort removed as property doesn't exist yet
        default:
          return 0;
      }
    });

    return result;
  }, [books, selectedGenre, searchQuery, sortBy, t]);

  // getStatusColor ve getStatusLabel BookCard component'ine taşındı



  const handleBookPress = React.useCallback(
    (id: string) => {
      router.push({ pathname: "/book-detail", params: { id } });
    },
    [router],
  );

  const renderBookItem = React.useCallback(
    ({ item }: { item: Book }) => (
      <View style={{ width: viewMode === "grid" ? COLUMN_WIDTH : "100%" }}>
        <BookCard book={item} variant={viewMode} onPressId={handleBookPress} />
      </View>
    ),
    [viewMode, COLUMN_WIDTH, handleBookPress],
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                backgroundColor: colors.primary + "15",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
                borderWidth: 1.5,
                borderColor: isDarkMode ? colors.primary : "#334155",
              }}
            >
              <Image
                source={require("../../assets/images/logo.png")}
                style={{ width: 28, height: 28 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {t("hello")},
              </Text>
              <Text
                style={[
                  styles.headerTitle,
                  { color: colors.text, fontSize: 22 },
                ]}
                numberOfLines={1}
              >
                {user?.displayName || t("book_lover")}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8 }}>
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
              style={[styles.iconButton, { backgroundColor: colors.card }]}
            >
              <ArrowUpDown size={22} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
              }
              style={[styles.iconButton, { backgroundColor: colors.card }]}
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
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <Search
            size={20}
            color={colors.placeholder}
            style={styles.searchIcon}
          />
          <TextInput
            placeholder={t("search_placeholder_books")}
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Minimal Dropdown Filtre Alanı */}
        <View style={styles.filtersContainer}>
          <FilterDropdown
            label={t("filter_genre")}
            items={filters}
            selectedValue={selectedGenre}
            onValueChange={setSelectedGenre}
          />
          {/* Active Sort Indicator */}
          <View style={[styles.sortBadge, { backgroundColor: colors.card }]}>
            <Text style={[styles.sortText, { color: colors.textSecondary }]}>
              {sortBy === "title_asc" && t("sort_az")}
              {sortBy === "title_desc" && t("sort_za")}
              {sortBy === "author_asc" && t("sort_author")}
              {sortBy === "rating_desc" && t("sort_rating")}
            </Text>
          </View>
        </View>

        <FlatList
          key={viewMode}
          data={processedBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.id}
          getItemLayout={(data, index) => ({
            length: 180, // Approximate height of a card item
            offset: 180 * index,
            index,
          })}
          numColumns={viewMode === "grid" ? 2 : 1}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={
            viewMode === "grid" ? styles.gridColumnWrapper : undefined
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BookOpen
                size={48}
                color={colors.textSecondary}
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                {searchQuery
                  ? t("empty_search", { query: searchQuery })
                  : t("empty_category")}
              </Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 28 },
  iconButton: { padding: 8, borderRadius: 12 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, fontFamily: "Inter_400Regular", fontSize: 16 },
  filtersContainer: {
    marginBottom: 20,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContent: { paddingHorizontal: 24, paddingBottom: 100 },
  gridColumnWrapper: { justifyContent: "space-between", marginBottom: 24 },

  // Sort Badge
  sortBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  sortText: { fontSize: 12, fontFamily: "Inter_500Medium" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  // Empty State
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyText: {
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    fontSize: 16,
  },
});
