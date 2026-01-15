import React, { useState, useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Sun, Moon, Sparkles, User, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useBooks } from "../../context/BooksContext";
import { useAuth } from "../../context/AuthContext";
import RecommendationModal from "../../components/RecommendationModal";
import ProfileModal from "../../components/ProfileModal";
import { CurrentlyReadingCard } from "../../components/CurrentlyReadingCard";
import { BookShelf } from "../../components/BookShelf";
import { AchievementCard } from "../../components/AchievementCard";
import { ReadingChallengeCard } from "../../components/ReadingChallengeCard";

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, toggleTheme, isDarkMode } = useTheme();
  const { books } = useBooks();
  const { user } = useAuth();

  const [isRecommendationModalVisible, setIsRecommendationModalVisible] =
    useState<boolean>(false);
  const [isProfileModalVisible, setIsProfileModalVisible] =
    useState<boolean>(false);

  // Şu an okunan kitaplar
  const currentlyReadingBooks = useMemo(
    () => books.filter((b) => b.status === "Okunuyor").slice(0, 3),
    [books],
  );

  // Okunan kitaplar (raf için)
  const readBooks = useMemo(
    () => books.filter((b) => b.status === "Okundu"),
    [books],
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Top Bar */}
        {renderTopBar()}

        {/* Spacing to push cards down */}
        <View className="h-6" />

        {/* Seviye ve Başarım (Gamification) */}
        <AchievementCard books={books} />

        {/* Okuma Meydan Okuması */}
        <ReadingChallengeCard books={books} />

        {/* Şu An Okunan Kitaplar */}
        <CurrentlyReadingCard books={currentlyReadingBooks} />

        {/* Okuma Rafı (Son Okunan 5 Kitap) */}
        <View className="mb-6">
          <BookShelf
            books={readBooks}
            title={t("recently_read")}
            maxVisible={5}
            itemWidth={65}
            itemHeight={98}
            gap={12}
          />
        </View>
      </ScrollView>

      {/* FAB - Kitap Ekle */}
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
