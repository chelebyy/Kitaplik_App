import React, { useMemo, useCallback } from "react";
import { Tabs } from "expo-router";
import { Home, Book, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

// Tab ikonları için tip tanımı
interface TabIconProps {
  color: string;
  focused: boolean;
}

// Tab ikonları - Bileşen dışında tanımlanarak her renderda yeniden oluşturulması engelleniyor
const HomeIcon = ({ color, focused }: TabIconProps) => (
  <Home size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const BookIcon = ({ color, focused }: TabIconProps) => (
  <Book size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

const SettingsIcon = ({ color, focused }: TabIconProps) => (
  <Settings size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
);

// TabBar arka plan bileşeni - Props ile tema bilgisi alır
interface TabBarBackgroundProps {
  isDarkMode: boolean;
}

const TabBarBackground = React.memo(function TabBarBackground({
  isDarkMode,
}: TabBarBackgroundProps) {
  return (
    <LinearGradient
      colors={isDarkMode ? ["#1E293B", "#27221F"] : ["#FFFFFF", "#FFF7ED"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        borderTopWidth: 1,
        borderTopColor: isDarkMode ? "#334155" : "#E2E8F0",
      }}
    />
  );
});

export default function TabLayout() {
  const { colors, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // TabBar arka plan render fonksiyonu - useCallback ile memoize edildi
  const renderTabBarBackground = useCallback(
    () => <TabBarBackground isDarkMode={isDarkMode} />,
    [isDarkMode],
  );

  // Screen options - useMemo ile memoize edildi
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarBackground: renderTabBarBackground,
      tabBarStyle: {
        // Dinamik yükseklik: İçerik (60) + sistem navigasyon inset'i
        height: 60 + insets.bottom,
        backgroundColor: "transparent",
        borderTopWidth: 0,
        elevation: 0,
        shadowOpacity: 0,
        // Dinamik alt padding: Sistem navigasyon tuşları için yer bırak
        paddingBottom: insets.bottom,
        paddingTop: 6,
      },
      tabBarItemStyle: {
        justifyContent: "center" as const,
      },
      tabBarLabelStyle: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 11,
        marginTop: 4,
      },
      tabBarIconStyle: {
        marginBottom: 0,
      },
    }),
    [
      colors.primary,
      colors.textSecondary,
      renderTabBarBackground,
      insets.bottom,
    ],
  );

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: t("home"),
          tabBarIcon: HomeIcon,
        }}
      />
      <Tabs.Screen
        name="books"
        options={{
          title: t("books"),
          tabBarIcon: BookIcon,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("settings"),
          tabBarIcon: SettingsIcon,
        }}
      />
    </Tabs>
  );
}
