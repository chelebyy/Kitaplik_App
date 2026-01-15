import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { Book } from "../context/BooksContext";

interface AchievementCardProps {
  books: Book[];
}

type BadgeLevel = {
  id: string;
  title: string;
  description: string;
  minBooks: number;
  emoji: string;
  colors: [string, string];
  bgTint: [string, string];
};

const LEVELS: BadgeLevel[] = [
  {
    id: "lvl1",
    title: "level_1_title",
    description: "level_1_desc",
    minBooks: 0,
    emoji: "📜", // Satır Avcısı - Parşömen
    colors: ["#94A3B8", "#64748B"],
    bgTint: ["#F8FAFC", "#F1F5F9"],
  },
  {
    id: "lvl2",
    title: "level_2_title",
    description: "level_2_desc",
    minBooks: 3,
    emoji: "✒️", // Sayfa Çeviren - Tüy Kalem
    colors: ["#38BDF8", "#0EA5E9"],
    bgTint: ["#F0F9FF", "#E0F2FE"],
  },
  {
    id: "lvl3",
    title: "level_3_title",
    description: "level_3_desc",
    minBooks: 5,
    emoji: "🧭", // Okuma Meraklısı - Pusula
    colors: ["#22D3EE", "#0891B2"],
    bgTint: ["#ECFEFF", "#CFFAFE"],
  },
  {
    id: "lvl4",
    title: "level_4_title",
    description: "level_4_desc",
    minBooks: 10,
    emoji: "🗺️", // Hikaye Yolcusu - Harita
    colors: ["#2DD4BF", "#0D9488"],
    bgTint: ["#F0FDFA", "#CCFBF1"],
  },
  {
    id: "lvl5",
    title: "level_5_title",
    description: "level_5_desc",
    minBooks: 15,
    emoji: "🏮", // İyi Okur - Fener
    colors: ["#34D399", "#059669"],
    bgTint: ["#ECFDF5", "#D1FAE5"],
  },
  {
    id: "lvl6",
    title: "level_6_title",
    description: "level_6_desc",
    minBooks: 25,
    emoji: "�️", // Kitap Dostu - Anahtar
    colors: ["#4ADE80", "#16A34A"],
    bgTint: ["#F0FDF4", "#DCFCE7"],
  },
  {
    id: "lvl7",
    title: "level_7_title",
    description: "level_7_desc",
    minBooks: 40,
    emoji: "�", // Kitap Kurdu - Büyü Kitapları
    colors: ["#A3E635", "#65A30D"],
    bgTint: ["#F7FEE7", "#ECFCCB"],
  },
  {
    id: "lvl8",
    title: "level_8_title",
    description: "level_8_desc",
    minBooks: 60,
    emoji: "🔭", // Sözcük Gezgini - Dürbün
    colors: ["#FACC15", "#D97706"],
    bgTint: ["#FEFCE8", "#FEF9C3"],
  },
  {
    id: "lvl9",
    title: "level_9_title",
    description: "level_9_desc",
    minBooks: 80,
    emoji: "⏳", // Kütüphane Müdavimi - Kum Saati
    colors: ["#F59E0B", "#B45309"],
    bgTint: ["#FFFBEB", "#FEF3C7"],
  },
  {
    id: "lvl10",
    title: "level_10_title",
    description: "level_10_desc",
    minBooks: 100,
    emoji: "🎩", // Kelimelerin Efendisi - Büyücü Şapkası
    colors: ["#FB923C", "#C2410C"],
    bgTint: ["#FFF7ED", "#FFEDD5"],
  },
  {
    id: "lvl11",
    title: "level_11_title",
    description: "level_11_desc",
    minBooks: 150,
    emoji: "🧪", // Edebiyat Gurmesi - İksir
    colors: ["#F87171", "#B91C1C"],
    bgTint: ["#FEF2F2", "#FEE2E2"],
  },
  {
    id: "lvl12",
    title: "level_12_title",
    description: "level_12_desc",
    minBooks: 250,
    emoji: "�", // Bilge Okur - Küre
    colors: ["#F472B6", "#BE185D"],
    bgTint: ["#FDF2F8", "#FCE7F3"],
  },
  {
    id: "lvl13",
    title: "level_13_title",
    description: "level_13_desc",
    minBooks: 400,
    emoji: "🛡️", // Kütüphane Muhafızı - Kalkan
    colors: ["#C084FC", "#7E22CE"],
    bgTint: ["#FAF5FF", "#F3E8FF"],
  },
  {
    id: "lvl14",
    title: "level_14_title",
    description: "level_14_desc",
    minBooks: 500,
    emoji: "👑", // Efsane - Taç
    colors: ["#A78BFA", "#6D28D9"],
    bgTint: ["#F5F3FF", "#EDE9FE"],
  },
];

export const AchievementCard: React.FC<AchievementCardProps> = ({ books }) => {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();

  // Okunan kitap sayısı
  const readCount = useMemo(
    () => books.filter((b) => b.status === "Okundu").length,
    [books],
  );

  // Mevcut seviyeyi bul
  const currentLevel = useMemo(() => {
    // Tersten kontrol et, şartı sağlayan ilk seviyeyi (en yükseği) al
    return (
      [...LEVELS].reverse().find((level) => readCount >= level.minBooks) ||
      LEVELS[0]
    );
  }, [readCount]);

  // Sonraki seviyeyi bul
  const nextLevel = useMemo(() => {
    const currentIndex = LEVELS.findIndex((l) => l.id === currentLevel.id);
    return LEVELS[currentIndex + 1] || null;
  }, [currentLevel]);

  // İlerleme yüzdesi
  const progress = useMemo(() => {
    if (!nextLevel) return 100;
    const currentMin = currentLevel.minBooks;
    const nextMin = nextLevel.minBooks;
    const diff = nextMin - currentMin;
    const currentProgress = readCount - currentMin;
    return Math.min(Math.round((currentProgress / diff) * 100), 100);
  }, [readCount, currentLevel, nextLevel]);

  return (
    <View className="mx-5 mb-5">
      <LinearGradient
        colors={isDarkMode ? ["#1E293B", "#0F172A"] : currentLevel.bgTint}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Rozet İkonu */}
        <LinearGradient
          colors={currentLevel.colors}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
            shadowColor: currentLevel.colors[0],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <Text className="text-2xl">{currentLevel.emoji}</Text>
        </LinearGradient>

        {/* Bilgiler */}
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text
              className="text-lg font-bold"
              style={{
                color: colors.text,
                fontFamily: "Inter_700Bold",
              }}
            >
              {t(currentLevel.title as any)}
            </Text>
            <View
              className="px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isDarkMode ? "#334155" : "#F1F5F9",
              }}
            >
              <Text
                className="text-[10px] font-bold"
                style={{ color: colors.textSecondary }}
              >
                {t("books_count", { count: readCount })}
              </Text>
            </View>
          </View>

          <Text
            className="text-xs mb-3"
            style={{
              color: colors.textSecondary,
              fontFamily: "Inter_400Regular",
            }}
          >
            {t(currentLevel.description as any)}
          </Text>

          {/* İlerleme Çubuğu */}
          {nextLevel && (
            <View>
              <View className="flex-row justify-between mb-1">
                <Text
                  className="text-[10px]"
                  style={{ color: colors.placeholder }}
                >
                  {t("next_level")}: {t(nextLevel.title as any)}
                </Text>
                <Text
                  className="text-[10px] font-medium"
                  style={{ color: currentLevel.colors[0] }}
                >
                  %{progress}
                </Text>
              </View>
              <View
                className="h-1.5 rounded-full overflow-hidden"
                style={{
                  backgroundColor: isDarkMode ? "#334155" : "#E2E8F0",
                }}
              >
                <View
                  style={{
                    width: `${progress}%`,
                    height: "100%",
                    backgroundColor: currentLevel.colors[0],
                    borderRadius: 99,
                  }}
                />
              </View>
            </View>
          )}

          {!nextLevel && (
            <Text
              className="text-xs font-medium"
              style={{ color: currentLevel.colors[0] }}
            >
              {t("at_the_top")}
            </Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};
