import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  X,
  ExternalLink,
  ShoppingCart,
  Search,
  TrendingDown,
  AlertCircle,
} from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../context/ThemeContext";
import { PriceService, StoreLink } from "../services/PriceService";
import { cn } from "../utils/cn";

interface PriceComparisonModalProps {
  visible: boolean;
  onClose: () => void;
  bookTitle: string;
  bookAuthor?: string;
  isbn?: string;
}

// Fiyat karşılaştırma siteleri
const COMPARISON_SITES = [
  {
    id: "google",
    name: "Google Shopping",
    color: "#4285F4",
    getUrl: (query: string) =>
      `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(query)}`,
  },
  {
    id: "akakce",
    name: "Akakçe",
    color: "#FF6B00",
    getUrl: (query: string) =>
      `https://www.akakce.com/arama/?q=${encodeURIComponent(query)}`,
  },
  {
    id: "cimri",
    name: "Cimri",
    color: "#00C853",
    getUrl: (query: string) =>
      `https://www.cimri.com/arama?q=${encodeURIComponent(query)}`,
  },
];

export default function PriceComparisonModal({
  visible,
  onClose,
  bookTitle,
  bookAuthor,
  isbn,
}: Readonly<PriceComparisonModalProps>) {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();

  const storeLinks = PriceService.getStoreLinks(bookTitle, isbn, bookAuthor);
  const searchQuery = `${bookTitle}${bookAuthor ? " " + bookAuthor : ""} kitap`;

  const openLink = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url, {
        toolbarColor: colors.background,
        controlsColor: colors.primary,
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });
    } catch (error) {
      // WebBrowser hata verirse harici tarayıcıda aç
      console.log("WebBrowser hatası, harici tarayıcı açılıyor:", error);
      try {
        await Linking.openURL(url);
      } catch (linkError) {
        console.error("Link açılamadı:", linkError);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View
          className={cn(
            "rounded-t-3xl max-h-[80%] overflow-hidden",
            isDarkMode ? "bg-slate-900" : "bg-white",
          )}
          style={{ backgroundColor: colors.card }}
        >
          {/* Header */}
          <View
            className={cn(
              "flex-row justify-between items-center p-5 border-b",
              isDarkMode ? "border-slate-700" : "border-slate-100",
            )}
            style={{ borderBottomColor: colors.border }}
          >
            <Text
              className={cn(
                "text-lg font-bold",
                isDarkMode ? "text-white" : "text-slate-900",
              )}
              style={{ color: colors.text }}
            >
              {t("compare_options")}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="p-1"
              accessibilityLabel={t("close") || "Kapat"}
              accessibilityRole="button"
            >
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          >
            {/* Fiyat Karşılaştırma Bölümü */}
            <View
              className="p-4 rounded-xl mb-5"
              style={{ backgroundColor: colors.priceSection }}
            >
              <View className="flex-row items-center mb-2">
                <TrendingDown size={20} color={colors.primary} />
                <Text
                  className={cn(
                    "text-base font-bold ml-2",
                    isDarkMode ? "text-white" : "text-slate-900",
                  )}
                  style={{ color: colors.text }}
                >
                  {t("compare_prices") || "Fiyatları Karşılaştır"}
                </Text>
              </View>
              <Text
                className={cn(
                  "text-[13px] mb-4",
                  isDarkMode ? "text-slate-400" : "text-slate-600",
                )}
                style={{ color: colors.textSecondary }}
              >
                {t("compare_prices_desc") ||
                  "En uygun fiyatı bulmak için karşılaştırma sitelerini kullanın"}
              </Text>

              <View className="mt-2 gap-3">
                {COMPARISON_SITES.map((site) => (
                  <TouchableOpacity
                    key={site.id}
                    className="flex-row items-center justify-center px-4 py-3.5 rounded-xl gap-2 shadow-sm"
                    style={{
                      backgroundColor: site.color,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 2,
                    }}
                    onPress={() => openLink(site.getUrl(searchQuery))}
                    accessibilityLabel={`${site.name} ${t("search") || "ile ara"}`}
                    accessibilityRole="link"
                  >
                    <Search size={16} color="#FFF" />
                    <Text className="text-white text-[15px] font-semibold">
                      {site.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Mağaza Linkleri Bölümü */}
            <Text
              className="text-[13px] mb-3 text-center"
              style={{ color: colors.textSecondary }}
            >
              {t("or_go_directly") || "veya doğrudan mağazaya git"}
            </Text>

            {/* Bilgilendirme Notu */}
            <View
              className={cn(
                "flex-row items-center p-2.5 rounded-lg mb-3 gap-2",
                isDarkMode ? "bg-slate-700" : "bg-amber-50",
              )}
            >
              <AlertCircle
                size={14}
                color={isDarkMode ? "#FCD34D" : "#D97706"}
              />
              <Text
                className={cn(
                  "text-xs flex-1",
                  isDarkMode ? "text-amber-300" : "text-amber-800",
                )}
              >
                {t("store_availability_note") ||
                  "Bazı mağazalarda bu kitap bulunmayabilir"}
              </Text>
            </View>

            {storeLinks.map((link: StoreLink) => (
              <View
                key={link.store.id}
                className={cn(
                  "p-3 mb-2 rounded-xl border",
                  isDarkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-slate-50 border-slate-200",
                )}
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-9 h-9 rounded-lg justify-center items-center mr-2.5"
                      style={{ backgroundColor: link.store.logoColor }}
                    >
                      <ShoppingCart size={20} color="#FFF" />
                    </View>
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: colors.text }}
                    >
                      {link.store.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    className="flex-row items-center px-2.5 py-1.5 rounded-md"
                    style={{ backgroundColor: colors.primary + "15" }}
                    onPress={() => openLink(link.url)}
                    accessibilityLabel={`${link.store.name} ${t("go_to_store") || "mağazasına git"}`}
                    accessibilityRole="link"
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: colors.primary }}
                    >
                      {t("go_to_store")}
                    </Text>
                    <ExternalLink
                      size={14}
                      color={colors.primary}
                      style={{ marginLeft: 4 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
