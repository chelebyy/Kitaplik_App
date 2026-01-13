import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { ChevronDown } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

// Android için LayoutAnimation'ı etkinleştir
// Android için LayoutAnimation'ı etkinleştir
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  // New Architecture (Fabric) desteği kontrolü - warning'i önlemek için
  // @ts-ignore - global tip tanımlaması olmayabilir
  if (!globalThis.nativeFabricUIManager) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

/**
 * Açılır/kapanır bölüm komponenti.
 * Ayarlar sayfasındaki bildirimler gibi uzun listeleri gruplamak için kullanılır.
 */
export const CollapsibleSection = memo(function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = false,
}: Readonly<CollapsibleSectionProps>) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Optimized with useCallback to prevent unnecessary re-renders
  const toggleOpen = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <View className="mb-6">
      {/* Başlık - Tıklanabilir */}
      <TouchableOpacity
        onPress={toggleOpen}
        className="flex-row items-center justify-between py-3 px-1"
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isOpen ? t("expanded") : t("collapsed")}`}
        accessibilityHint={t("toggle_section")}
        accessibilityState={{ expanded: isOpen }}
      >
        <View className="flex-row items-center">
          {icon && (
            <View
              className="w-10 h-10 rounded-xl justify-center items-center mr-3"
              style={{ backgroundColor: colors.iconBackground }}
            >
              {icon}
            </View>
          )}
          <Text
            className="text-[15px] uppercase tracking-wider font-bold"
            style={{ color: colors.sectionHeader, fontFamily: "Inter_700Bold" }}
          >
            {title}
          </Text>
        </View>

        {/* Ok ikonu - Açık/Kapalı duruma göre döner */}
        <View
          style={{
            transform: [{ rotate: isOpen ? "180deg" : "0deg" }],
          }}
        >
          <ChevronDown size={20} color={colors.sectionHeader} />
        </View>
      </TouchableOpacity>

      {/* İçerik - Sadece açıkken göster */}
      {isOpen && (
        <View
          className="rounded-2xl py-2 px-4 shadow-sm"
          style={{ backgroundColor: colors.card }}
        >
          {children}
        </View>
      )}
    </View>
  );
});
