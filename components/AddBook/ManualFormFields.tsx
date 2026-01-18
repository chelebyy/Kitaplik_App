import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ChevronDown, ScanLine } from "lucide-react-native";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { GenreType } from "../../utils/genreTranslator";

interface ManualFormFieldsProps {
  readonly title: string;
  readonly author: string;
  readonly genre: GenreType | "";
  readonly pageCount: string;
  readonly currentPage: string;
  readonly onTitleChange: (value: string) => void;
  readonly onAuthorChange: (value: string) => void;
  readonly onPageCountChange: (value: string) => void;
  readonly onCurrentPageChange: (value: string) => void;
  readonly onGenrePress: () => void;
  readonly onBarcodePress: () => void;
}

/**
 * ManualFormFields - Form fields for manual book entry
 *
 * Features:
 * - Title input
 * - Author input
 * - Genre picker trigger
 * - Page count input
 * - Current page input
 * - Barcode scan button
 *
 * @example
 * ```tsx
 * <ManualFormFields
 *   title={form.title}
 *   author={form.author}
 *   genre={form.genre}
 *   pageCount={form.pageCount}
 *   currentPage={form.currentPage}
 *   onTitleChange={form.setTitle}
 *   onAuthorChange={form.setAuthor}
 *   onPageCountChange={form.setPageCount}
 *   onCurrentPageChange={form.setCurrentPage}
 *   onGenrePress={() => setGenrePickerVisible(true)}
 *   onBarcodePress={() => setIsScannerVisible(true)}
 * />
 * ```
 */
export function ManualFormFields({
  title,
  author,
  genre,
  pageCount,
  currentPage,
  onTitleChange,
  onAuthorChange,
  onPageCountChange,
  onCurrentPageChange,
  onGenrePress,
  onBarcodePress,
}: ManualFormFieldsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <>
      {/* Scan Barcode Button */}
      <TouchableOpacity
        className="flex-row items-center justify-center p-3 rounded-xl border border-dashed mb-6"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.primary,
        }}
        onPress={onBarcodePress}
        accessibilityRole="button"
        accessibilityLabel={t("add_book_scan_barcode")}
      >
        <ScanLine size={20} color={colors.primary} style={{ marginRight: 8 }} />
        <Text
          className="font-semibold text-sm"
          style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}
        >
          {t("add_book_scan_barcode")}
        </Text>
      </TouchableOpacity>

      {/* Title Field */}
      <View className="mb-6">
        <Text
          className="font-semibold text-base mb-3"
          style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
        >
          {t("add_book_book_name")}
        </Text>
        <TextInput
          className="border rounded-xl px-4 h-[50px] font-regular text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={t("add_book_book_name_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={title}
          onChangeText={onTitleChange}
          accessibilityLabel={t("add_book_book_name")}
        />
      </View>

      {/* Author Field */}
      <View className="mb-6">
        <Text
          className="font-semibold text-base mb-3"
          style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
        >
          {t("add_book_author")}
        </Text>
        <TextInput
          className="border rounded-xl px-4 h-[50px] font-regular text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={t("add_book_author_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={author}
          onChangeText={onAuthorChange}
          accessibilityLabel={t("add_book_author")}
        />
      </View>

      {/* Genre and Page Count Row */}
      <View className="flex-row items-center">
        <View className="flex-1 mr-3 mb-6">
          <Text
            className="font-semibold text-base mb-3"
            style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
          >
            {t("add_book_genre")}
          </Text>
          <TouchableOpacity
            onPress={onGenrePress}
            className="border rounded-xl px-4 h-[50px] flex-row items-center justify-between"
            style={{
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
            }}
            accessibilityRole="button"
            accessibilityLabel={t("add_book_genre")}
          >
            <Text
              style={{
                color: genre ? colors.text : colors.textSecondary,
                fontFamily: "Inter_400Regular",
              }}
            >
              {genre || t("select_genre")}
            </Text>
            <ChevronDown size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 mb-6">
          <Text
            className="font-semibold text-base mb-3"
            style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
          >
            {t("add_book_page_count")}
          </Text>
          <TextInput
            className="border rounded-xl px-4 h-[50px] font-regular text-base"
            style={{
              backgroundColor: colors.inputBackground,
              borderColor: colors.border,
              color: colors.text,
              fontFamily: "Inter_400Regular",
            }}
            placeholder={t("add_book_page_count_placeholder")}
            placeholderTextColor={colors.placeholder}
            value={pageCount}
            onChangeText={onPageCountChange}
            keyboardType="numeric"
            accessibilityLabel={t("add_book_page_count")}
          />
        </View>
      </View>

      {/* Current Page Field */}
      <View className="mb-6">
        <Text
          className="font-semibold text-base mb-3"
          style={{ color: colors.text, fontFamily: "Inter_600SemiBold" }}
        >
          {t("book_detail_current_page")}
        </Text>
        <TextInput
          className="border rounded-xl px-4 h-[50px] font-regular text-base"
          style={{
            backgroundColor: colors.inputBackground,
            borderColor: colors.border,
            color: colors.text,
            fontFamily: "Inter_400Regular",
          }}
          placeholder={t("current_page_placeholder")}
          placeholderTextColor={colors.placeholder}
          value={currentPage}
          onChangeText={onCurrentPageChange}
          keyboardType="numeric"
          accessibilityLabel={t("book_detail_current_page")}
        />
      </View>
    </>
  );
}
