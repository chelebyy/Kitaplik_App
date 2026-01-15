import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Trophy, Edit3 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { StorageService } from "../services/storage";
import type { Book } from "../context/BooksContext";
import ReadingGoalModal from "./ReadingGoalModal";

interface ReadingChallengeCardProps {
  books: Book[];
}

const STORAGE_KEY = "reading_challenge";
const DEFAULT_GOAL = 20;

export function ReadingChallengeCard({
  books,
}: Readonly<ReadingChallengeCardProps>) {
  const { t } = useTranslation();
  const { colors, isDarkMode } = useTheme();
  const [yearlyGoal, setYearlyGoal] = useState(DEFAULT_GOAL);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Load reading goal from storage
  useEffect(() => {
    const loadGoal = async () => {
      try {
        const data = await StorageService.getItem<{
          yearlyGoal: number;
          currentYear: number;
        }>(STORAGE_KEY);
        if (data?.yearlyGoal) {
          setYearlyGoal(data.yearlyGoal);
        }
      } catch {
        // Silently fail - will use default goal
      }
    };
    void loadGoal();
  }, []);

  // Calculate read books count for current year
  const readBooksThisYear = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return books.filter((book) => {
      if (book.status !== "Okundu") return false;
      // Eğer kitabın addedAt tarihi bu yıl içindeyse say
      const bookYear = new Date(book.addedAt).getFullYear();
      return bookYear === currentYear;
    }).length;
  }, [books]);

  // Progress percentage
  const progress = useMemo(() => {
    return Math.min((readBooksThisYear / yearlyGoal) * 100, 100);
  }, [readBooksThisYear, yearlyGoal]);

  // Motivational message based on progress
  const motivationMessage = useMemo(() => {
    if (progress === 0) return t("reading_challenge_motivation_0");
    if (progress < 25) return t("reading_challenge_motivation_0");
    if (progress < 50) return t("reading_challenge_motivation_25");
    if (progress < 75) return t("reading_challenge_motivation_50");
    if (progress < 100) return t("reading_challenge_motivation_75");
    return t("reading_challenge_motivation_100");
  }, [progress, t]);

  const handleSaveGoal = (newGoal: number) => {
    setYearlyGoal(newGoal);
  };

  return (
    <>
      <View className="px-5 mb-5">
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setIsModalVisible(true)}
        >
          <LinearGradient
            colors={
              isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#FFF7ED"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            className="shadow-sm"
          >
            {/* Header Row */}
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center gap-2">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: colors.primary + "15" }}
                >
                  <Trophy size={20} color="#F97316" />
                </View>
                <Text
                  className="text-base font-bold"
                  style={{ color: colors.text, fontFamily: "Inter_700Bold" }}
                >
                  {t("reading_challenge_title")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.card }}
                activeOpacity={0.7}
              >
                <Edit3 size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Goal Info */}
            <View className="mb-3">
              <Text
                className="text-sm mb-1"
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                }}
              >
                {t("reading_challenge_goal", {
                  year: new Date().getFullYear(),
                })}
              </Text>
              <View className="flex-row items-baseline gap-2">
                <Text
                  className="text-3xl font-bold"
                  style={{
                    color: colors.text,
                    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                  }}
                >
                  {readBooksThisYear}
                </Text>
                <Text
                  className="text-lg"
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  / {yearlyGoal} {t("reading_challenge_books")}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View
              className="h-2 rounded-full mb-3 overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#F97316",
                }}
              />
            </View>

            {/* Motivation Text */}
            <Text
              className="text-xs"
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
              }}
            >
              {motivationMessage}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ReadingGoalModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        currentGoal={yearlyGoal}
        onSave={handleSaveGoal}
      />
    </>
  );
}
