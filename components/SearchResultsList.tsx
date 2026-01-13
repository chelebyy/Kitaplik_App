/**
 * SearchResultsList - Arama Sonuçları Listesi
 *
 * Google Books arama sonuçlarını gösterir ve kitap eklemeye izin verir.
 */

import React, { useCallback, memo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { GoogleBookResult } from "../services/GoogleBooksService";
import { BookStatus } from "../context/BooksContext";

interface SearchResultsListProps {
  /** Arama sonuçları */
  results: GoogleBookResult[];
  /** Yükleniyor durum */
  isLoading: boolean;
  /** Arama sorgusu */
  query: string;
  /** Kitap durumu */
  status: BookStatus;
  /** Kitap ekleme fonksiyonu */
  onAddBook: (book: GoogleBookResult) => void;
}

// Arama sonucu kartı bileşeni
const SearchResultItem = memo(
  ({
    item,
    onAdd,
    colors,
    t,
  }: {
    item: GoogleBookResult;
    onAdd: () => void;
    colors: ReturnType<typeof useTheme>["colors"];
    t: ReturnType<typeof useTranslation>["t"];
  }) => {
    const info = item.volumeInfo;
    const imageUrl = info.imageLinks?.thumbnail?.replace("http://", "https://");

    return (
      <TouchableOpacity
        className="flex-row p-3 rounded-xl mb-3 items-center"
        style={{ backgroundColor: colors.card }}
        onPress={onAdd}
      >
        <Image
          source={imageUrl || "https://placehold.co/100x150/png"}
          className="w-[50px] h-[75px] rounded mr-3"
          style={{ backgroundColor: colors.imagePlaceholder }}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
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
            {info.title || t("add_book_book_name_placeholder")}
          </Text>
          <Text
            className="font-regular text-[13px] mb-1.5"
            style={{
              color: colors.textSecondary,
              fontFamily: "Inter_400Regular",
            }}
            numberOfLines={1}
          >
            {info.authors?.join(", ") || t("add_book_author_placeholder")}
          </Text>
          {info.categories && info.categories.length > 0 && (
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
                {info.categories[0]}
              </Text>
            </View>
          )}
          {info.pageCount ? (
            <Text
              className="text-xs font-regular mt-1"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
              }}
            >
              {info.pageCount} {t("book_detail_pages")}
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
    );
  },
);

SearchResultItem.displayName = "SearchResultItem";

export default function SearchResultsList({
  results,
  isLoading,
  query,
  status,
  onAddBook,
}: Readonly<SearchResultsListProps>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Memoized renderItem
  const renderItem = useCallback(
    ({ item }: { item: GoogleBookResult }) => {
      const handleAdd = () => onAddBook(item);
      return (
        <SearchResultItem item={item} onAdd={handleAdd} colors={colors} t={t} />
      );
    },
    [onAddBook, colors, t],
  );

  // Boş liste durumu
  const ListEmptyComponent = useCallback(
    () =>
      results.length === 0 && query ? (
        <Text
          className="text-center mt-6 font-regular"
          style={{
            color: colors.textSecondary,
            fontFamily: "Inter_400Regular",
          }}
        >
          {t("add_book_no_results")}
        </Text>
      ) : null,
    [results.length, query, colors.textSecondary, t],
  );

  // Yükleme göstergesi
  if (isLoading) {
    return (
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
    );
  }

  return (
    <FlashList
      data={results}
      // @ts-expect-error - FlashList v2 type definitions missing estimatedItemSize
      estimatedItemSize={100}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={ListEmptyComponent}
      renderItem={renderItem}
    />
  );
}
