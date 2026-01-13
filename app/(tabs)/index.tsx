import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Search,
  Plus,
  Sun,
  Moon,
  Sparkles,
  User,
  Grid,
  List,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useBooks, Book } from "../../context/BooksContext";
import { useAuth } from "../../context/AuthContext";
import RecommendationModal from "../../components/RecommendationModal";
import ProfileModal from "../../components/ProfileModal";
import { BookCard } from "../../components/BookCard";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, toggleTheme, isDarkMode } = useTheme();
  const { books } = useBooks();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [activeFilter, setActiveFilter] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isRecommendationModalVisible, setIsRecommendationModalVisible] =
    useState<boolean>(false);
  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);

  // Helper function to get localized filter title (reduces cognitive complexity)
  const getFilterTitle = (filter: string): string => {
    const titles: Record<string, string> = {
      Tümü: t("all_books"),
      Okundu: t("read"),
      Okunuyor: t("reading"),
      Okunacak: t("to_read"),
    };
    return titles[filter] || filter;
  };

  // Grid hesaplamaları
  const COLUMN_WIDTH = (width - 48 - 16) / 2;

  // İstatistik Hesaplama
  const stats = useMemo(() => {
    const totalBooks = books.length;
    const readBooks = books.filter((b) => b.status === "Okundu").length;
    const readingBooks = books.filter((b) => b.status === "Okunuyor").length;
    const toReadBooks = books.filter((b) => b.status === "Okunacak").length;

    return { totalBooks, readBooks, readingBooks, toReadBooks };
  }, [books]);

  // Filtreleme Mantığı
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // 1. Durum Filtresi
      const matchesStatus =
        activeFilter === "Tümü" || book.status === activeFilter;

      // 2. Arama Filtresi
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [books, activeFilter, searchQuery]);

  const handleBookPress = React.useCallback(
    (id: string) => {
      router.push({
        pathname: "/book-detail",
        params: { id },
      });
    },
    [router],
  );

  // Optimized renderItem with useCallback to prevent unnecessary re-renders
  const renderBookItem = React.useCallback(
    ({ item }: { item: Book }) => (
      <View
        style={{
          width: viewMode === "grid" ? COLUMN_WIDTH : "100%",
          paddingHorizontal: viewMode === "list" ? 24 : 0,
        }}
      >
        <BookCard book={item} variant={viewMode} onPressId={handleBookPress} />
      </View>
    ),
    [viewMode, COLUMN_WIDTH, handleBookPress],
  );

  // Helper: Top Bar with logo, user greeting, and action buttons
  const renderTopBar = () => (
    <View className="flex-row justify-between items-center px-5 py-4">
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
            cachePolicy="memory-disk"
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
            className="text-2xl font-bold tracking-tighter"
            style={{
              color: colors.text,
              fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
            }}
            numberOfLines={1}
          >
            {user?.displayName || t("book_lover")}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => setIsProfileModalVisible(true)}
          className="w-10 h-10 rounded-full justify-center items-center border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          activeOpacity={0.7}
          accessibilityLabel={t("profile")}
          accessibilityRole="button"
        >
          <User size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsRecommendationModalVisible(true)}
          className="w-10 h-10 rounded-full justify-center items-center border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          activeOpacity={0.7}
          accessibilityLabel={t("ai_recommendation")}
          accessibilityRole="button"
        >
          <Sparkles size={20} color="#F79009" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTheme}
          className="w-10 h-10 rounded-full justify-center items-center border"
          style={{ backgroundColor: colors.card, borderColor: colors.border }}
          activeOpacity={0.7}
          accessibilityLabel={
            isDarkMode ? t("switch_to_light") : t("switch_to_dark")
          }
          accessibilityRole="button"
        >
          {isDarkMode ? (
            <Sun size={22} color={colors.text} />
          ) : (
            <Moon size={22} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Helper: Search bar input
  const renderSearchBar = () => (
    <View className="px-5 mb-5">
      <View
        className="flex-row items-center rounded-xl px-4 h-12"
        style={{ backgroundColor: isDarkMode ? colors.card : "#E4E7EC" }}
      >
        <Search
          size={20}
          color={colors.placeholder}
          style={{ marginRight: 12 }}
        />
        <TextInput
          placeholder={t("search_placeholder")}
          placeholderTextColor={colors.placeholder}
          className="flex-1 h-full text-[15px] font-regular"
          style={{ color: colors.text, fontFamily: "Inter_400Regular" }}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityLabel={t("search_books")}
          accessibilityHint={t("search_books_hint")}
        />
      </View>
    </View>
  );

  // Helper: Filter button component to reduce repetition
  const renderFilterButton = (
    filterKey: string,
    label: string,
    count: number,
  ) => (
    <TouchableOpacity
      className="flex-1 items-center"
      style={{ opacity: activeFilter === filterKey ? 1 : 0.5 }}
      onPress={() => setActiveFilter(filterKey)}
      accessibilityLabel={`${label}: ${count}`}
      accessibilityRole="button"
      accessibilityState={{ selected: activeFilter === filterKey }}
    >
      <Text
        className="text-[11px] mb-1.5 text-center"
        style={{
          color: "#667085",
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        }}
      >
        {label}
      </Text>
      <Text
        className="text-xl font-bold text-center"
        style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
      >
        {count}
      </Text>
    </TouchableOpacity>
  );

  // Helper: Summary card with interactive filters
  const renderSummaryCard = () => (
    <View className="px-5 mb-5 shadow-sm">
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
        <View className="flex-row justify-between">
          {renderFilterButton("Tümü", t("all_books"), stats.totalBooks)}
          {renderFilterButton("Okundu", t("read"), stats.readBooks)}
          {renderFilterButton("Okunuyor", t("reading"), stats.readingBooks)}
          {renderFilterButton("Okunacak", t("to_read"), stats.toReadBooks)}
        </View>
      </LinearGradient>
    </View>
  );

  // Helper: Section header with title and view mode toggle
  const renderSectionHeader = () => (
    <View className="flex-row justify-between items-center px-5 mb-4">
      <Text
        className="text-lg font-bold tracking-tighter"
        style={{
          color: colors.text,
          fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
        }}
      >
        {getFilterTitle(activeFilter)}
      </Text>
      <TouchableOpacity
        onPress={() =>
          setViewMode((prev) => (prev === "grid" ? "list" : "grid"))
        }
        className="p-2 rounded-lg"
        style={{ backgroundColor: colors.card }}
        accessibilityLabel={
          viewMode === "grid" ? t("switch_to_list") : t("switch_to_grid")
        }
        accessibilityRole="button"
      >
        {viewMode === "grid" ? (
          <List size={20} color={colors.text} />
        ) : (
          <Grid size={20} color={colors.text} />
        )}
      </TouchableOpacity>
    </View>
  );

  // Main header - composed from helper functions
  const renderHeader = () => (
    <View className="mb-2">
      {renderTopBar()}
      {renderSearchBar()}
      {renderSummaryCard()}
      {renderSectionHeader()}
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <FlashList
        key={viewMode}
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === "grid" ? 2 : 1}
        // @ts-expect-error - FlashList v2 type definitions missing estimatedItemSize
        estimatedItemSize={viewMode === "grid" ? 250 : 140}
        renderItem={renderBookItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ paddingBottom: 100 }}
        columnWrapperStyle={
          viewMode === "grid"
            ? {
                justifyContent: "space-between",
                marginBottom: 24,
                paddingHorizontal: 24,
              }
            : undefined
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Text
              className="font-regular text-sm text-center"
              style={{ color: "#667085", fontFamily: "Inter_400Regular" }}
            >
              {t("no_books_found")}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-[50px] h-[50px] rounded-2xl justify-center items-center shadow-lg elevation-6"
        onPress={() => router.push("/add-book")}
        activeOpacity={0.8}
        accessibilityLabel={t("add_book")}
        accessibilityRole="button"
      >
        <LinearGradient
          colors={isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#F8FAFC"]}
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

      <RecommendationModal
        visible={isRecommendationModalVisible}
        onClose={() => setIsRecommendationModalVisible(false)}
      />

      <ProfileModal
        visible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
      />
    </SafeAreaView>
  );
}
