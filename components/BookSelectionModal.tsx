/**
 * BookSelectionModal - Kitap Seçim Modalı
 *
 * Barkod taramasında birden fazla sonuç bulunduğunda
 * kullanıcıya seçim sunmak için kullanılır.
 */

import React, { useCallback } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { useTranslation } from "react-i18next";
import { X, Check, Calendar } from "lucide-react-native";
import { GoogleBookResult } from "@/services/GoogleBooksService";

interface BookSelectionModalProps {
  /** Modal görünürlüğü */
  visible: boolean;
  /** Seçilebilir kitap listesi */
  books: GoogleBookResult[];
  /** Kitap seçildiğinde çağrılır */
  onSelect: (book: GoogleBookResult) => void;
  /** Modal kapatıldığında çağrılır */
  onClose: () => void;
}

/**
 * ISBN formatını formatlı gösterir
 */
function formatIsbn(
  identifiers?: { type: string; identifier: string }[],
): string {
  if (!identifiers?.length) return "";
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13");
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10");
  return isbn13?.identifier || isbn10?.identifier || "";
}

/**
 * Yayın yılını çıkarır
 */
function extractYear(publishedDate?: string): string {
  if (!publishedDate) return "";
  return publishedDate.substring(0, 4);
}

export default function BookSelectionModal({
  visible,
  books,
  onSelect,
  onClose,
}: Readonly<BookSelectionModalProps>) {
  const { t } = useTranslation();

  const renderBookItem = useCallback(
    ({ item, index }: { item: GoogleBookResult; index: number }) => {
      const info = item.volumeInfo;
      // Fallback görsel - listede de göster
      const coverUrl =
        info.imageLinks?.thumbnail ||
        "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400&h=600";
      const isbn = formatIsbn(info.industryIdentifiers);
      const year = extractYear(info.publishedDate);

      return (
        <Pressable
          onPress={() => onSelect(item)}
          accessibilityRole="button"
          accessibilityLabel={`${t("barcode_select")} ${info.title}`}
          testID={`book-selection-item-${index}`}
          className="flex-row bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-700 shadow-lg active:scale-[0.98]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          {/* Kapak Görseli - Daha büyük */}
          <View className="w-24 h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 mr-4">
            <Image
              source={{ uri: coverUrl }}
              className="w-full h-full"
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>

          {/* Kitap Bilgileri */}
          <View className="flex-1 justify-between py-1">
            <View>
              <Text
                className="text-lg font-bold text-slate-900 dark:text-white leading-tight"
                numberOfLines={2}
              >
                {info.title}
              </Text>
              {info.authors && (
                <Text
                  className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium"
                  numberOfLines={1}
                >
                  {info.authors.join(", ")}
                </Text>
              )}
            </View>

            {/* Meta Bilgiler */}
            <View className="flex-row items-center mt-3 gap-3">
              {year ? (
                <View className="flex-row items-center bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                  <Calendar size={12} color="#64748b" />
                  <Text className="text-xs text-slate-600 dark:text-slate-300 ml-1 font-medium">
                    {year}
                  </Text>
                </View>
              ) : null}
              {isbn ? (
                <Text className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {isbn}
                </Text>
              ) : null}
            </View>

            {/* Seç Butonu - Premium gradient look */}
            <View className="flex-row justify-end mt-3">
              <View className="flex-row items-center bg-green-500 dark:bg-green-600 px-4 py-2 rounded-full shadow-sm">
                <Check size={16} color="#fff" strokeWidth={3} />
                <Text className="text-sm font-bold text-white ml-1.5">
                  {t("barcode_select")}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [onSelect, t],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="flex-1 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[80%] w-full">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
            <View>
              <Text className="text-lg font-bold text-slate-900 dark:text-white">
                {t("barcode_select_edition")}
              </Text>
              <Text className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {t("barcode_select_edition_desc")}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("common.close")}
              testID="book-selection-close"
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800"
            >
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          {/* Kitap Listesi */}
          <FlashList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            testID="book-selection-list"
            // @ts-expect-error - FlashList v2 type definitions missing estimatedItemSize
            estimatedItemSize={150}
          />
        </View>
      </View>
    </Modal>
  );
}
