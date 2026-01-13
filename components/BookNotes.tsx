import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Copy, NotebookPen, Check } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";

interface BookNotesProps {
  notes: string;
  onNotesChange: (text: string) => void;
}

export const BookNotes = ({ notes, onNotesChange }: BookNotesProps) => {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!notes) return;
    await Clipboard.setStringAsync(notes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View className="flex-row items-center gap-2">
          <NotebookPen size={18} color={colors.primary} strokeWidth={2.5} />
          <Text
            className="text-base font-bold"
            style={{
              fontFamily: "Inter_700Bold",
              color: colors.sectionHeader,
            }}
          >
            {t("book_detail_notes") || "Notlarım"}
          </Text>
        </View>

        {notes.length > 0 && (
          <TouchableOpacity
            onPress={handleCopy}
            className={cn(
              "flex-row items-center gap-1.5 px-3 py-1.5 rounded-full",
              "border",
              isDarkMode
                ? "bg-slate-800/50 border-slate-700"
                : "bg-white/80 border-slate-200",
            )}
            accessibilityLabel={
              copied
                ? t("copied") || "Kopyalandı"
                : t("copy") || "Notları kopyala"
            }
            accessibilityRole="button"
          >
            {copied ? (
              <>
                <Check size={14} color={colors.fabBlue || "#22c55e"} />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.fabBlue || "#22c55e" }}
                >
                  Kopyalandı
                </Text>
              </>
            ) : (
              <>
                <Copy size={14} color={colors.textSecondary || "#64748b"} />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: colors.textSecondary || "#64748b" }}
                >
                  Kopyala
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <View
        className={cn(
          "relative overflow-hidden rounded-3xl border shadow-sm min-h-[160px]",
          isDarkMode
            ? "bg-slate-800/40 border-slate-700/50"
            : "bg-white/60 border-indigo-100/50",
        )}
      >
        {/* Glass Effect Overlay */}
        <View
          className="absolute inset-0 opacity-30"
          style={{ backgroundColor: colors.noteBackground || colors.card }}
        />

        <TextInput
          className="flex-1 p-5 text-[15px] leading-7"
          style={{
            fontFamily: "Inter_400Regular",
            color: colors.text,
            textAlignVertical: "top",
          }}
          placeholder={
            t("book_detail_notes_placeholder") ||
            "Bu kitap hakkında düşüncelerin neler?..."
          }
          placeholderTextColor={colors.placeholder}
          multiline
          value={notes}
          onChangeText={onNotesChange}
          scrollEnabled={false} // Allow container to grow
          accessibilityLabel={t("book_detail_notes") || "Kitap notları"}
          accessibilityHint={
            t("book_detail_notes_placeholder") ||
            "Bu kitap hakkında notlarınızı yazın"
          }
        />

        {/* Decorative corner accent */}
        <View
          className="absolute right-0 bottom-0 w-16 h-16 opacity-5 -z-10"
          style={{
            backgroundColor: colors.primary,
            borderTopLeftRadius: 100,
          }}
        />
      </View>
    </View>
  );
};
