import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Search } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { GoogleBookResult } from "../../services/GoogleBooksService";
import { BookStatus } from "../../context/BooksContext";
import SearchResultsList from "../SearchResultsList";

interface SearchTabProps {
  readonly searchQuery: string;
  readonly searchType: "book" | "author";
  readonly searchResults: GoogleBookResult[];
  readonly isLoading: boolean;
  readonly status: BookStatus;
  readonly onQueryChange: (query: string) => void;
  readonly onSearchTypeChange: (type: "book" | "author") => void;
  readonly onSearch: () => void;
  readonly onClearSearch: () => void;
  readonly onAddBook: (book: GoogleBookResult) => void;
}

/**
 * SearchTab - Tab content for searching and adding books from Google Books API
 *
 * Features:
 * - Search type toggle (book title / author)
 * - Search input field
 * - Search results display
 * - Add book from search results
 *
 * @example
 * ```tsx
 * <SearchTab
 *   searchQuery={searchQuery}
 *   searchType={searchType}
 *   searchResults={searchResults}
 *   isLoading={isLoading}
 *   status={status}
 *   onQueryChange={setSearchQuery}
 *   onSearchTypeChange={setSearchType}
 *   onSearch={searchGoogleBooks}
 *   onClearSearch={clearSearch}
 *   onAddBook={handleAddFromSearch}
 * />
 * ```
 */
export function SearchTab({
  searchQuery,
  searchType,
  searchResults,
  isLoading,
  status,
  onQueryChange,
  onSearchTypeChange,
  onSearch,
  onClearSearch,
  onAddBook,
}: SearchTabProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const handleSearchTypeChange = (type: "book" | "author") => {
    onSearchTypeChange(type);
    onClearSearch();
  };

  return (
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
          onPress={() => handleSearchTypeChange("book")}
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center"
          style={{
            backgroundColor:
              searchType === "book" ? colors.primary : "transparent",
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: searchType === "book" }}
        >
          <Text
            className="text-sm font-semibold"
            style={{
              color: searchType === "book" ? "#FFFFFF" : colors.textSecondary,
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
          onPress={() => handleSearchTypeChange("author")}
          className="flex-1 py-3 px-4 rounded-lg items-center justify-center"
          style={{
            backgroundColor:
              searchType === "author" ? colors.primary : "transparent",
          }}
          accessibilityRole="tab"
          accessibilityState={{ selected: searchType === "author" }}
        >
          <Text
            className="text-sm font-semibold"
            style={{
              color: searchType === "author" ? "#FFFFFF" : colors.textSecondary,
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

      {/* Search Input */}
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
          placeholder={
            searchType === "book"
              ? t("add_book_search_books")
              : t("add_book_search_authors")
          }
          placeholderTextColor={colors.placeholder}
          value={searchQuery}
          onChangeText={onQueryChange}
          returnKeyType="search"
          onSubmitEditing={onSearch}
          accessibilityLabel={
            searchType === "book"
              ? t("add_book_search_books")
              : t("add_book_search_authors")
          }
        />
        <TouchableOpacity
          onPress={onSearch}
          className="px-2 py-1"
          accessibilityRole="button"
          accessibilityLabel={t("search")}
        >
          <Search size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <SearchResultsList
        results={searchResults}
        isLoading={isLoading}
        query={searchQuery}
        status={status}
        onAddBook={onAddBook}
      />
    </View>
  );
}
