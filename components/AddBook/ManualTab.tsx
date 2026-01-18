import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { BookStatus } from "../../context/BooksContext";
import { GenreType } from "../../utils/genreTranslator";
import { CoverUploader } from "./CoverUploader";
import { StatusSelector } from "./StatusSelector";
import { ManualFormFields } from "./ManualFormFields";

interface ManualTabProps {
  // Form state
  readonly title: string;
  readonly author: string;
  readonly genre: GenreType | "";
  readonly pageCount: string;
  readonly currentPage: string;
  readonly coverUrl: string | null;
  readonly status: BookStatus;
  // Form handlers
  readonly onTitleChange: (value: string) => void;
  readonly onAuthorChange: (value: string) => void;
  readonly onPageCountChange: (value: string) => void;
  readonly onCurrentPageChange: (value: string) => void;
  readonly onCoverChange: (url: string | null) => void;
  readonly onStatusChange: (status: BookStatus) => void;
  // Actions
  readonly onGenrePress: () => void;
  readonly onBarcodePress: () => void;
  readonly onSave: () => void;
}

/**
 * ManualTab - Complete manual book entry form tab
 *
 * Combines:
 * - CoverUploader
 * - ManualFormFields
 * - StatusSelector
 * - Save button with gradient
 *
 * @example
 * ```tsx
 * <ManualTab
 *   title={form.title}
 *   author={form.author}
 *   genre={form.genre}
 *   pageCount={form.pageCount}
 *   currentPage={form.currentPage}
 *   coverUrl={form.coverUrl}
 *   status={form.status}
 *   onTitleChange={form.setTitle}
 *   onAuthorChange={form.setAuthor}
 *   onPageCountChange={form.setPageCount}
 *   onCurrentPageChange={form.setCurrentPage}
 *   onCoverChange={form.setCoverUrl}
 *   onStatusChange={form.setStatus}
 *   onGenrePress={() => setGenrePickerVisible(true)}
 *   onBarcodePress={() => setIsScannerVisible(true)}
 *   onSave={handleSave}
 * />
 * ```
 */
export function ManualTab({
  title,
  author,
  genre,
  pageCount,
  currentPage,
  coverUrl,
  status,
  onTitleChange,
  onAuthorChange,
  onPageCountChange,
  onCurrentPageChange,
  onCoverChange,
  onStatusChange,
  onGenrePress,
  onBarcodePress,
  onSave,
}: ManualTabProps) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover Upload */}
        <CoverUploader coverUrl={coverUrl} onCoverChange={onCoverChange} />

        {/* Form Fields */}
        <ManualFormFields
          title={title}
          author={author}
          genre={genre}
          pageCount={pageCount}
          currentPage={currentPage}
          onTitleChange={onTitleChange}
          onAuthorChange={onAuthorChange}
          onPageCountChange={onPageCountChange}
          onCurrentPageChange={onCurrentPageChange}
          onGenrePress={onGenrePress}
          onBarcodePress={onBarcodePress}
        />

        {/* Status Selector */}
        <StatusSelector status={status} onStatusChange={onStatusChange} />

        {/* Bottom spacing for save button */}
        <View className="h-[100px]" />
      </ScrollView>

      {/* Save Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-6 pt-4 border-t"
        style={{
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 16) + 8,
        }}
      >
        <TouchableOpacity
          className="h-14 rounded-2xl shadow-sm elevation-4"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}
          onPress={onSave}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t("add_book_save")}
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
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: isDarkMode ? colors.primary : "#334155",
            }}
          >
            <Text
              className="font-bold text-base"
              style={{
                fontFamily: "Inter_700Bold",
                color: isDarkMode ? colors.primary : "#334155",
              }}
            >
              {t("add_book_save")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}
