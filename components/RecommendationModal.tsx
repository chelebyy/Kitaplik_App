import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  X,
  Sparkles,
  BookOpen,
  Globe,
  Check,
  RefreshCw,
  Coins,
  PlayCircle,
} from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { Book, useBooks } from "../context/BooksContext";
import { RecommendationService } from "../services/RecommendationService";
import { useCredits } from "../context/CreditsContext";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { cn } from "../utils/cn";

import {
  RewardedInterstitialAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";
import { logError } from "../utils/errorUtils";

const adUnitId = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : "ca-app-pub-8736697399468029/7599879644";

const rewardedInterstitial = RewardedInterstitialAd.createForAdRequest(adUnitId, {
  keywords: ["fashion", "clothing"],
});

interface RecommendationModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = "selection" | "loading" | "result";

export default function RecommendationModal({
  visible,
  onClose,
}: Readonly<RecommendationModalProps>) {
  const { colors, isDarkMode } = useTheme();
  const { books, addBook, updateBookStatus } = useBooks();
  const router = useRouter();
  const { t } = useTranslation();
  const { credits, addCredits, spendCredits } = useCredits();

  const [step, setStep] = useState<Step>("selection");
  const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);
  const [source, setSource] = useState<"library" | "external">("library");
  const [error, setError] = useState<string | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  React.useEffect(() => {
    const unsubscribeLoaded = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("Ad Loaded");
        setAdLoaded(true);
      },
    );
    const unsubscribeEarned = rewardedInterstitial.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log("User earned reward of ", reward);
        addCredits(1);
      },
    );
    const unsubscribeError = rewardedInterstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        logError("RecommendationModal.adLoad", error);
        setAdLoaded(false);
      },
    );

    rewardedInterstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeError();
    };
  }, [addCredits]);

  const handleEarnCredit = () => {
    if (adLoaded) {
      rewardedInterstitial.show();
      setAdLoaded(false);
      rewardedInterstitial.load();
    } else {
      console.log("Ad not ready");
      Alert.alert(
        t("attention", { defaultValue: "Dikkat" }),
        t("ad_not_ready", {
          defaultValue:
            "Reklam henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin.",
        }),
      );
      rewardedInterstitial.load();
    }
  };

  const handleClose = () => {
    setStep("selection");
    setRecommendedBook(null);
    setError(null);
    onClose();
  };

  const handleGetLocalRecommendation = () => {
    setStep("loading");
    setSource("library");

    // Simulate a short delay for "magic" effect
    setTimeout(() => {
      const book = RecommendationService.getRandomFromLibrary(books);
      if (book) {
        setRecommendedBook(book);
        setStep("result");
      } else {
        setError(t("recommendation_error_no_books"));
        setStep("result");
      }
    }, 1500);
  };

  const handleGetExternalRecommendation = async () => {
    if (credits < 1) {
      // Optional: Alert user or show modal
      Alert.alert(
        t("attention", { defaultValue: "Dikkat" }),
        t("insufficient_credit", {
          defaultValue:
            "Bu işlem için krediniz yetersiz. Lütfen reklam izleyerek kredi kazanın.",
        }),
      );
      return;
    }

    const success = await spendCredits(1);
    if (!success) return; // Should not happen given check above, but safely handle it

    setStep("loading");
    setSource("external");

    const favoriteGenre = RecommendationService.getFavoriteGenre(books);
    const excludedTitles = books.map((b) => b.title);

    try {
      const book = await RecommendationService.getDiscoveryRecommendation(
        favoriteGenre,
        excludedTitles,
      );
      if (book) {
        setRecommendedBook(book);
        setStep("result");
      } else {
        setError(t("recommendation_error_not_found"));
        setStep("result");
      }
    } catch {
      setError(t("recommendation_error_generic"));
      setStep("result");
    }
  };

  const handleAction = () => {
    if (!recommendedBook) return;

    if (source === "library") {
      // If local, maybe update status to 'Okunuyor' or just go to detail
      updateBookStatus(recommendedBook.id, "Okunuyor");
      handleClose();
      router.push({
        pathname: "/book-detail",
        params: { id: recommendedBook.id },
      });
    } else {
      // If external, add to library
      addBook({
        title: recommendedBook.title,
        author: recommendedBook.author,
        status: "Okunacak",
        coverUrl: recommendedBook.coverUrl,
        genre: recommendedBook.genre,
        notes: recommendedBook.notes,
        pageCount: recommendedBook.pageCount,
        currentPage: recommendedBook.currentPage,
      });
      handleClose();
      // Navigate to the new book (we'd need the new ID, but for now just closing is fine, or we can find it by title)
      // Simple UX: just close and show success toast (or just close)
    }
  };

  const handleRetry = () => {
    if (source === "library") {
      handleGetLocalRecommendation();
    } else {
      handleGetExternalRecommendation();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View
          className={cn(
            "w-full max-w-[400px] rounded-3xl border overflow-hidden shadow-xl",
            isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          )}
          style={isDarkMode ? undefined : { elevation: 10 }}
        >
          {/* Header */}
          <View
            className={cn(
              "flex-row justify-between items-center px-5 py-4 border-b",
              isDarkMode ? "border-slate-700" : "border-slate-100"
            )}
          >
            <View className="flex-row items-center flex-1 shrink mr-2">
              <Sparkles size={20} color="#F79009" style={{ marginRight: 8 }} />
              <Text className={cn("text-base font-bold shrink", isDarkMode ? "text-white" : "text-slate-900")}>
                {t("recommendation_title")}
              </Text>
            </View>
            <View className="flex-row items-center gap-2 shrink-0">
              <View className="flex-row items-center bg-amber-500/10 px-2 py-1 rounded-xl">
                <Coins size={16} color="#F59E0B" style={{ marginRight: 4 }} />
                <Text className="text-xs font-semibold text-amber-700">
                  {t("credit_balance", { count: credits })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="p-1"
              >
                <X size={20} color={isDarkMode ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View className="p-6 min-h-[300px] justify-center">
            {step === "selection" && (
              <View className="gap-4">
                <Text
                  className={cn("text-center mb-2 font-regular", isDarkMode ? "text-slate-400" : "text-slate-500")}
                >
                  {t("recommendation_subtitle")}
                </Text>

                <TouchableOpacity
                  className={cn(
                    "flex-row items-center p-4 rounded-2xl border",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  )}
                  onPress={handleGetLocalRecommendation}
                  activeOpacity={0.8}
                >
                  <View
                    className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-sky-100"
                  >
                    <BookOpen size={24} color="#0284C7" />
                  </View>
                  <View className="flex-1">
                    <Text className={cn("text-base font-semibold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                      {t("recommendation_library")}
                    </Text>
                    <Text
                      className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}
                    >
                      {t("recommendation_library_desc")}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className={cn(
                    "flex-row items-center p-4 rounded-2xl border",
                    isDarkMode ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-slate-200"
                  )}
                  onPress={handleGetExternalRecommendation}
                  activeOpacity={0.8}
                >
                  <View
                    className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-purple-100"
                  >
                    <Globe size={24} color="#9333EA" />
                  </View>
                  <View className="flex-1">
                    <Text className={cn("text-base font-semibold mb-1", isDarkMode ? "text-white" : "text-slate-900")}>
                      {t("recommendation_discover")}
                    </Text>
                    <Text
                      className={cn("text-xs", isDarkMode ? "text-slate-400" : "text-slate-500")}
                    >
                      {t("recommendation_discover_desc")}
                    </Text>
                  </View>
                  <View className="bg-amber-100 px-2 py-1 rounded-lg">
                    <Text className="text-[10px] font-bold text-amber-700">{t("cost_1_credit")}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center justify-center p-3 rounded-xl border border-dashed border-green-200 bg-green-50"
                  onPress={handleEarnCredit}
                  activeOpacity={0.8}
                >
                  <PlayCircle
                    size={20}
                    color="#16A34A"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-sm font-semibold text-green-700">
                    {t("earn_credit")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {step === "loading" && (
              <View className="items-center justify-center">
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  className={cn("mt-4 font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}
                >
                  {source === "library"
                    ? t("recommendation_loading_library")
                    : t("recommendation_loading_discover")}
                </Text>
              </View>
            )}

            {step === "result" && (
              <View className="items-center">
                {error ? (
                  <View className="items-center">
                    <Text className="text-center mb-4 font-medium text-red-500">
                      {error}
                    </Text>
                    <TouchableOpacity
                      className={cn(
                        "flex-row items-center px-4 py-2 rounded-2xl border",
                        isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
                      )}
                      onPress={() => setStep("selection")}
                    >
                      <RefreshCw
                        size={16}
                        color={isDarkMode ? "#FFF" : "#000"}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        className={cn("font-medium", isDarkMode ? "text-white" : "text-slate-900")}
                      >
                        {t("recommendation_retry")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  recommendedBook && (
                    <>
                      <View className="items-center mb-6">
                        <Image
                          source={{ uri: recommendedBook.coverUrl }}
                          className="w-[100px] h-[150px] rounded-lg mb-4 shadow-sm"
                          resizeMode="cover"
                        />
                        <Text
                          className={cn("text-lg font-bold text-center mb-1", isDarkMode ? "text-white" : "text-slate-900")}
                        >
                          {recommendedBook.title}
                        </Text>
                        <Text
                          className={cn("text-sm font-medium mb-3", isDarkMode ? "text-slate-400" : "text-slate-500")}
                        >
                          {recommendedBook.author}
                        </Text>
                        <View
                          className={cn(
                            "px-3 py-1 rounded-xl",
                            isDarkMode ? "bg-[#333]" : "bg-slate-100"
                          )}
                        >
                          <Text
                            className={cn("text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}
                          >
                            {recommendedBook.genre}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        className={cn(
                          "flex-row items-center justify-center py-3 px-6 rounded-xl w-full",
                          "bg-blue-600" // logic for dynamic primary color usually done via inline style or mapped class, here using blue-600 as default primary map
                        )}
                        style={{ backgroundColor: colors.primary }}
                        onPress={handleAction}
                      >
                        {source === "library" ? (
                          <>
                            <BookOpen
                              size={18}
                              color="#FFF"
                              style={{ marginRight: 8 }}
                            />
                            <Text className="text-white text-base font-semibold">
                              {t("recommendation_start_reading")}
                            </Text>
                          </>
                        ) : (
                          <>
                            <Check
                              size={18}
                              color="#FFF"
                              style={{ marginRight: 8 }}
                            />
                            <Text className="text-white text-base font-semibold">
                              {t("recommendation_add_library")}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="mt-3"
                        onPress={handleRetry}
                      >
                        <Text
                          className={cn("text-[13px]", isDarkMode ? "text-slate-400" : "text-slate-500")}
                        >
                          {t("recommendation_try_another")}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
