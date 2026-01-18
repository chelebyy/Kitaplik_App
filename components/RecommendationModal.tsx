import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { Image } from "expo-image";
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

// Ads are native-only
const isNative = Platform.OS !== "web";

const adUnitId = __DEV__
  ? TestIds.REWARDED_INTERSTITIAL
  : "ca-app-pub-8736697399468029/7599879644";

interface RecommendationModalProps {
  visible: boolean;
  onClose: () => void;
}

type Step = "selection" | "loading" | "result";

// Alt bileşen: Seçim ekranı
function SelectionStep({
  isDarkMode,
  onLocalRecommendation,
  onExternalRecommendation,
  onEarnCredit,
}: Readonly<{
  isDarkMode: boolean;
  onLocalRecommendation: () => void;
  onExternalRecommendation: () => void;
  onEarnCredit: () => void;
}>) {
  const { t } = useTranslation();

  return (
    <View className="gap-4">
      <Text
        className={cn(
          "text-center mb-2 font-regular",
          isDarkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {t("recommendation_subtitle")}
      </Text>

      <TouchableOpacity
        className={cn(
          "flex-row items-center p-4 rounded-2xl border",
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-50 border-slate-200",
        )}
        onPress={onLocalRecommendation}
        activeOpacity={0.8}
        accessibilityLabel={t("recommendation_library")}
        accessibilityHint={t("recommendation_library_desc")}
        accessibilityRole="button"
      >
        <View className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-sky-100">
          <BookOpen size={24} color="#0284C7" />
        </View>
        <View className="flex-1">
          <Text
            className={cn(
              "text-base font-semibold mb-1",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {t("recommendation_library")}
          </Text>
          <Text
            className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            {t("recommendation_library_desc")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className={cn(
          "flex-row items-center p-4 rounded-2xl border",
          isDarkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-50 border-slate-200",
        )}
        onPress={onExternalRecommendation}
        activeOpacity={0.8}
        accessibilityLabel={`${t("recommendation_discover")} - ${t("cost_1_credit")}`}
        accessibilityHint={t("recommendation_discover_desc")}
        accessibilityRole="button"
      >
        <View className="w-12 h-12 rounded-full justify-center items-center mr-4 bg-purple-100">
          <Globe size={24} color="#9333EA" />
        </View>
        <View className="flex-1">
          <Text
            className={cn(
              "text-base font-semibold mb-1",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {t("recommendation_discover")}
          </Text>
          <Text
            className={cn(
              "text-xs",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            {t("recommendation_discover_desc")}
          </Text>
        </View>
        <View className="bg-amber-100 px-2 py-1 rounded-lg">
          <Text className="text-[10px] font-bold text-amber-700">
            {t("cost_1_credit")}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        className="flex-row items-center justify-center p-3 rounded-xl border border-dashed border-green-200 bg-green-50"
        onPress={onEarnCredit}
        activeOpacity={0.8}
        accessibilityLabel={t("earn_credit")}
        accessibilityHint={
          t("watch_ad_to_earn") || "Reklam izleyerek kredi kazanın"
        }
        accessibilityRole="button"
      >
        <PlayCircle size={20} color="#16A34A" style={{ marginRight: 8 }} />
        <Text className="text-sm font-semibold text-green-700">
          {t("earn_credit")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Alt bileşen: Yükleniyor ekranı
function LoadingStep({
  source,
  isDarkMode,
  primaryColor,
}: Readonly<{
  source: "library" | "external";
  isDarkMode: boolean;
  primaryColor: string;
}>) {
  const { t } = useTranslation();

  return (
    <View className="items-center justify-center">
      <ActivityIndicator size="large" color={primaryColor} />
      <Text
        className={cn(
          "mt-4 font-medium",
          isDarkMode ? "text-slate-400" : "text-slate-500",
        )}
      >
        {source === "library"
          ? t("recommendation_loading_library")
          : t("recommendation_loading_discover")}
      </Text>
    </View>
  );
}

// Alt bileşen: Sonuç ekranı
function ResultStep({
  error,
  recommendedBook,
  source,
  isDarkMode,
  primaryColor,
  onBack,
  onAction,
  onRetry,
}: Readonly<{
  error: string | null;
  recommendedBook: Book | null;
  source: "library" | "external";
  isDarkMode: boolean;
  primaryColor: string;
  onBack: () => void;
  onAction: () => void;
  onRetry: () => void;
}>) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (error) {
    return (
      <View className="items-center">
        <Text className="text-center mb-4 font-medium text-red-500">
          {error}
        </Text>
        <TouchableOpacity
          className={cn(
            "flex-row items-center px-4 py-2 rounded-2xl border",
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200",
          )}
          onPress={onBack}
        >
          <RefreshCw
            size={16}
            color={isDarkMode ? "#FFF" : "#000"}
            style={{ marginRight: 6 }}
          />
          <Text
            className={cn(
              "font-medium",
              isDarkMode ? "text-white" : "text-slate-900",
            )}
          >
            {t("recommendation_retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!recommendedBook) return null;

  return (
    <View className="items-center">
      <View className="items-center mb-6">
        <Image
          source={recommendedBook.coverUrl}
          className="w-[100px] h-[150px] rounded-lg mb-4 shadow-sm"
          contentFit="cover"
          transition={200}
        />
        <Text
          className={cn(
            "text-lg font-bold text-center mb-1",
            isDarkMode ? "text-white" : "text-slate-900",
          )}
        >
          {recommendedBook.title}
        </Text>
        <Text
          className={cn(
            "text-sm font-medium mb-3",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          {recommendedBook.author}
        </Text>
        <View
          className="px-3 py-1 rounded-xl"
          style={{ backgroundColor: colors.selectedBackground }}
        >
          <Text
            className={cn(
              "text-xs font-medium",
              isDarkMode ? "text-slate-400" : "text-slate-500",
            )}
          >
            {recommendedBook.genre}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="flex-row items-center justify-center py-3 px-6 rounded-xl w-full"
        style={{ backgroundColor: primaryColor }}
        onPress={onAction}
      >
        {source === "library" ? (
          <>
            <BookOpen size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text className="text-white text-base font-semibold">
              {t("recommendation_start_reading")}
            </Text>
          </>
        ) : (
          <>
            <Check size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text className="text-white text-base font-semibold">
              {t("recommendation_add_library")}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity className="mt-3" onPress={onRetry}>
        <Text
          className={cn(
            "text-[13px]",
            isDarkMode ? "text-slate-400" : "text-slate-500",
          )}
        >
          {t("recommendation_try_another")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Ana bileşen - Sadece modal shell ve state yönetimi
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

  // Ad instance'ı ref ile sakla - memory leak önleme (native-only)
  const adInstanceRef = useRef<RewardedInterstitialAd | null>(null);
  const unsubscribeLoadedRef = useRef<(() => void) | null>(null);
  const unsubscribeEarnedRef = useRef<(() => void) | null>(null);
  const unsubscribeErrorRef = useRef<(() => void) | null>(null);
  // excludedTitles'ı useMemo ile optimize et - O(n) -> O(1) lookup
  const excludedTitlesSet = useMemo(() => {
    return new Set(books.map((b) => b.title));
  }, [books]);

  useEffect(() => {
    // Ads are native-only
    if (!isNative) return;

    // Yeni ad instance oluştur
    const adInstance = RewardedInterstitialAd.createForAdRequest(adUnitId, {
      keywords: ["fashion", "clothing"],
    });
    adInstanceRef.current = adInstance;

    const unsubscribeLoaded = adInstance.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setAdLoaded(true);
      },
    );
    const unsubscribeEarned = adInstance.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        addCredits(1);
      },
    );
    const unsubscribeError = adInstance.addAdEventListener(
      AdEventType.ERROR,
      (adError) => {
        logError("RecommendationModal.adLoad", adError);
        setAdLoaded(false);
      },
    );

    // Unsubscribe fonksiyonlarını sakla
    unsubscribeLoadedRef.current = unsubscribeLoaded;
    unsubscribeEarnedRef.current = unsubscribeEarned;
    unsubscribeErrorRef.current = unsubscribeError;

    adInstance.load();

    // Cleanup function - tüm event listener'ları temizle
    return () => {
      if (!isNative) return;
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeError();
      adInstanceRef.current = null;
    };
  }, [addCredits]);

  // Unmount kontrolü için ref
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleEarnCredit = () => {
    const adInstance = adInstanceRef.current;
    if (!adInstance || !isNative) {
      Alert.alert(
        t("attention", { defaultValue: "Dikkat" }),
        t("ad_not_ready", {
          defaultValue:
            "Reklam henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin.",
        }),
      );
      return;
    }

    if (adLoaded) {
      adInstance.show();
      setAdLoaded(false);
      adInstance.load();
    } else {
      Alert.alert(
        t("attention", { defaultValue: "Dikkat" }),
        t("ad_not_ready", {
          defaultValue:
            "Reklam henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin.",
        }),
      );
      adInstance.load();
    }
  };

  const handleClose = () => {
    setStep("selection");
    setRecommendedBook(null);
    setError(null);
    onClose();
  };

  const handleGetLocalRecommendation = async () => {
    setStep("loading");
    setSource("library");
    setTimeout(async () => {
      if (!isMounted.current) return;

      const book = await RecommendationService.getRandomFromLibrary(books);
      if (!isMounted.current) return;

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
    if (!success) return;

    setStep("loading");
    setSource("external");

    const favoriteGenre = RecommendationService.getFavoriteGenre(books);
    // useMemo ile optimize edilmiş Set kullan - O(1) lookup
    const excludedTitles = Array.from(excludedTitlesSet);

    try {
      const book = await RecommendationService.getDiscoveryRecommendation(
        favoriteGenre,
        excludedTitles,
      );

      if (!isMounted.current) return;

      if (book) {
        setRecommendedBook(book);
        setStep("result");
      } else {
        setError(t("recommendation_error_not_found"));
        setStep("result");
      }
    } catch {
      if (!isMounted.current) return;
      setError(t("recommendation_error_generic"));
      setStep("result");
    }
  };

  const handleAction = () => {
    if (!recommendedBook) return;

    if (source === "library") {
      updateBookStatus(recommendedBook.id, "Okunuyor");
      handleClose();
      router.push({
        pathname: "/book-detail",
        params: { id: recommendedBook.id },
      });
    } else {
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
      accessibilityViewIsModal={true}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View
          className={cn(
            "w-full max-w-[400px] rounded-3xl border overflow-hidden shadow-xl",
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200",
          )}
          style={isDarkMode ? undefined : { elevation: 10 }}
        >
          {/* Header */}
          <View
            className={cn(
              "flex-row justify-between items-center px-5 py-4 border-b",
              isDarkMode ? "border-slate-700" : "border-slate-100",
            )}
          >
            <View className="flex-row items-center flex-1 shrink mr-2">
              <Sparkles size={20} color="#F79009" style={{ marginRight: 8 }} />
              <Text
                className={cn(
                  "text-base font-bold shrink",
                  isDarkMode ? "text-white" : "text-slate-900",
                )}
              >
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
                accessibilityLabel={t("close") || "Kapat"}
                accessibilityRole="button"
              >
                <X size={20} color={isDarkMode ? "#94a3b8" : "#64748b"} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View className="p-6 min-h-[300px] justify-center">
            {step === "selection" && (
              <SelectionStep
                isDarkMode={isDarkMode}
                onLocalRecommendation={handleGetLocalRecommendation}
                onExternalRecommendation={handleGetExternalRecommendation}
                onEarnCredit={handleEarnCredit}
              />
            )}

            {step === "loading" && (
              <LoadingStep
                source={source}
                isDarkMode={isDarkMode}
                primaryColor={colors.primary}
              />
            )}

            {step === "result" && (
              <ResultStep
                error={error}
                recommendedBook={recommendedBook}
                source={source}
                isDarkMode={isDarkMode}
                primaryColor={colors.primary}
                onBack={() => setStep("selection")}
                onAction={handleAction}
                onRetry={handleRetry}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
