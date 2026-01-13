import React, { useState } from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Platform,
    ScrollView,
    TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { X, Target, TrendingUp, Award, Sparkles } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import { StorageService } from "../services/storage";

interface ReadingGoalModalProps {
    visible: boolean;
    onClose: () => void;
    currentGoal: number;
    onSave: (newGoal: number) => void;
}

const STORAGE_KEY = "reading_challenge";
const MIN_GOAL = 5;
const MAX_GOAL = 100;
const PRESET_GOALS = [
    { value: 5, label: "5", emoji: "🌱" },
    { value: 12, label: "12", emoji: "📚" },
    { value: 24, label: "24", emoji: "🔥" },
    { value: 52, label: "52", emoji: "🚀" },
];

export default function ReadingGoalModal({
    visible,
    onClose,
    currentGoal,
    onSave,
}: Readonly<ReadingGoalModalProps>) {
    const { t } = useTranslation();
    const { isDarkMode } = useTheme();
    const [goalValue, setGoalValue] = useState(currentGoal.toString());

    // Screen height check can be removed or kept if needed for other logic
    // const { height: screenHeight } = Dimensions.get('window');
    // const isSmallScreen = screenHeight < 700;

    const handleSave = async () => {
        try {
            const numValue = Number.parseInt(goalValue, 10);
            if (Number.isNaN(numValue) || numValue < MIN_GOAL || numValue > MAX_GOAL) {
                return;
            }
            const currentYear = new Date().getFullYear();
            await StorageService.setItem(STORAGE_KEY, {
                yearlyGoal: numValue,
                currentYear,
            });
            onSave(numValue);
            onClose();
        } catch (error) {
            console.error("Failed to save reading goal:", error);
        }
    };

    const setPresetGoal = (value: number) => {
        setGoalValue(value.toString());
    };

    const handleTextChange = (text: string) => {
        const cleaned = text.replace(/\D/g, "");
        if (cleaned === "") {
            setGoalValue("");
            return;
        }
        const numValue = Number.parseInt(cleaned, 10);
        if (numValue > MAX_GOAL) {
            setGoalValue(MAX_GOAL.toString());
        } else {
            setGoalValue(cleaned);
        }
    };

    // Motivasyon mesajı ve icon seçimi
    const getCurrentValue = () => {
        const num = Number.parseInt(goalValue, 10);
        return Number.isNaN(num) ? 0 : num;
    };

    const getMotivationInfo = (): {
        icon: any;
        gradient: readonly [string, string, ...string[]];
        message: string;
        bgColor: string;
    } => {
        const current = getCurrentValue();
        if (current <= 10)
            return {
                icon: Target,
                gradient: ["#10B981", "#059669"],
                message: t("motivation_low"),
                bgColor: "#ECFDF5",
            };
        if (current <= 25)
            return {
                icon: TrendingUp,
                gradient: ["#3B82F6", "#2563EB"],
                message: t("motivation_medium"),
                bgColor: "#EFF6FF",
            };
        if (current <= 50)
            return {
                icon: Award,
                gradient: ["#F59E0B", "#D97706"],
                message: t("motivation_high"),
                bgColor: "#FFFBEB",
            };
        return {
            icon: Sparkles,
            gradient: ["#EF4444", "#DC2626"],
            message: t("motivation_ultra"),
            bgColor: "#FEF2F2",
        };
    };

    const motivation = getMotivationInfo();
    const MotivationIcon = motivation.icon;



    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <View
                className="flex-1 justify-end"
                style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            >
                <TouchableOpacity
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <LinearGradient
                    colors={
                        isDarkMode
                            ? ["#1E293B", "#0F172A"]
                            : ["#FFFFFF", "#FAFAFA"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    className="rounded-t-3xl border-t border-gray-200 dark:border-gray-800"
                    style={{
                        maxHeight: "90%",
                    }}
                >
                    <SafeAreaView edges={["bottom", "left", "right"]}>
                        <View className="px-5 pt-4 pb-2">
                            {/* Header */}
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-1">
                                    <Text
                                        className="text-lg font-bold text-slate-900 dark:text-white"
                                        style={{ fontFamily: "Inter_700Bold" }}
                                    >
                                        🎯 {t("reading_goal_modal_title")}
                                    </Text>
                                    <Text
                                        className="text-xs text-slate-500 dark:text-slate-400"
                                        style={{ fontFamily: "Inter_400Regular" }}
                                    >
                                        {t("reading_goal_modal_subtitle")}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={onClose}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 justify-center items-center"
                                >
                                    <X size={18} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                                bounces={false}
                            >
                                {/* Compact Input Section (Horizontal) */}
                                <View
                                    className="rounded-2xl p-4 mb-4 flex-row items-center justify-between"
                                    style={{
                                        backgroundColor: isDarkMode ? "#1E293B" : motivation.bgColor,
                                    }}
                                >
                                    <View className="flex-row items-center flex-1">
                                        <View
                                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                                            style={{
                                                backgroundColor: isDarkMode
                                                    ? motivation.gradient[0] + "30"
                                                    : motivation.gradient[0] + "20",
                                            }}
                                        >
                                            <MotivationIcon
                                                size={24}
                                                color={motivation.gradient[0]}
                                            />
                                        </View>

                                        <View>
                                            <Text
                                                className="text-xs font-semibold text-slate-900 dark:text-white mb-0.5"
                                                style={{ fontFamily: "Inter_600SemiBold" }}
                                            >
                                                {t("reading_goal_modal_books_goal")}
                                            </Text>
                                            <Text
                                                className="text-xs font-medium"
                                                style={{
                                                    color: motivation.gradient[0],
                                                    fontFamily: "Inter_500Medium"
                                                }}
                                            >
                                                {motivation.message}
                                            </Text>
                                        </View>
                                    </View>

                                    <TextInput
                                        value={goalValue}
                                        onChangeText={handleTextChange}
                                        keyboardType="number-pad"
                                        maxLength={3}
                                        selectTextOnFocus
                                        selectionColor={motivation.gradient[0]}
                                        className="text-4xl font-bold text-right"
                                        style={{
                                            color: motivation.gradient[0],
                                            fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
                                            minWidth: 80,
                                            height: 60,
                                            textAlignVertical: "center",
                                            paddingTop: Platform.OS === "android" ? 10 : 0,
                                            includeFontPadding: false,
                                        }}
                                    />
                                </View>

                                {/* Popular Goals */}
                                <View className="mb-4">
                                    <Text
                                        className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 px-1"
                                        style={{ fontFamily: "Inter_600SemiBold" }}
                                    >
                                        {t("popular_goals")}
                                    </Text>
                                    <View className="flex-row gap-2">
                                        {PRESET_GOALS.map((preset) => {
                                            const isSelected = goalValue === preset.value.toString();
                                            return (
                                                <TouchableOpacity
                                                    key={preset.value}
                                                    onPress={() => setPresetGoal(preset.value)}
                                                    activeOpacity={0.7}
                                                    className={`flex-1 items-center justify-center py-3 rounded-xl border ${isSelected
                                                        ? "bg-transparent"
                                                        : isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                                                        }`}
                                                    style={isSelected ? {
                                                        backgroundColor: isDarkMode ? motivation.gradient[0] + "20" : motivation.gradient[0] + "10",
                                                        borderColor: motivation.gradient[0]
                                                    } : undefined}
                                                >
                                                    <Text className="text-lg mb-1">{preset.emoji}</Text>
                                                    <Text
                                                        className={`text-sm font-bold ${isSelected ? "" : "text-slate-900 dark:text-white"
                                                            }`}
                                                        style={{
                                                            color: isSelected ? motivation.gradient[0] : undefined,
                                                            fontFamily: "Inter_700Bold"
                                                        }}
                                                    >
                                                        {preset.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Tip Banner */}
                                <View
                                    className="rounded-xl p-3 flex-row items-center"
                                    style={{
                                        backgroundColor: isDarkMode ? "#1E293B" : "#FFF7ED",
                                    }}
                                >
                                    <Text className="text-lg mr-3">💡</Text>
                                    <Text
                                        className="text-xs flex-1 text-slate-600 dark:text-slate-400"
                                        style={{ fontFamily: "Inter_400Regular" }}
                                    >
                                        {t("goal_tip")}
                                    </Text>
                                </View>
                            </ScrollView>

                            {/* Docked Save Button - Redesigned */}
                            <View
                                className="mt-2 mb-1"
                                style={{
                                    shadowColor: motivation.gradient[0],
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 12,
                                    elevation: 8,
                                }}
                            >
                                <TouchableOpacity
                                    onPress={handleSave}
                                    activeOpacity={0.9}
                                    disabled={getCurrentValue() < MIN_GOAL || getCurrentValue() > MAX_GOAL}
                                    style={{
                                        opacity: getCurrentValue() < MIN_GOAL || getCurrentValue() > MAX_GOAL ? 0.6 : 1,
                                    }}
                                >
                                    <LinearGradient
                                        colors={motivation.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        className="py-4 px-6 rounded-full items-center flex-row justify-center border border-white/10"
                                    >
                                        <Text
                                            className="text-white text-lg font-bold mr-2 tracking-wide"
                                            style={{ fontFamily: "Inter_700Bold" }}
                                        >
                                            {t("reading_goal_modal_save")}
                                        </Text>
                                        <Award size={20} color="#FFFFFF" strokeWidth={2.5} />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SafeAreaView>
                </LinearGradient>
            </View>
        </Modal>
    );
}
