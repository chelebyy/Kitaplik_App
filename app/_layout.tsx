import "../global.css";
import { Stack, SplashScreen } from "expo-router";
import { cssInterop } from "nativewind";
import { Image } from "expo-image";
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from "react-native-reanimated";
import { StatusBar } from "expo-status-bar";
import { useFrameworkReady } from "../hooks/useFrameworkReady";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { ThemeProvider, useTheme } from "../context/ThemeContext";
import { BooksProvider, useBooks } from "../context/BooksContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { LanguageProvider } from "../context/LanguageContext";
import { CreditsProvider, useCredits } from "../context/CreditsContext";
import {
  NotificationProvider,
  useNotifications,
} from "../context/NotificationContext";
import { NotificationPermissionModal } from "../components/NotificationPermissionModal";
import { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { AnimatedSplash } from "../components/AnimatedSplash";
import { getAnalytics, logEvent } from "@react-native-firebase/analytics";

cssInterop(Image, {
  className: "style",
});

// Disable Reanimated strict mode to prevent "Reading from value during render" warnings
// common with NativeWind v4
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

// Keep splash visible until app is ready
SplashScreen.preventAutoHideAsync();

function RootLayoutContent({ fontsLoaded }: { readonly fontsLoaded: boolean }) {
  const { isDarkMode } = useTheme();
  const { isLoading: authLoading } = useAuth();
  const { isLoading: booksLoading } = useBooks();
  const { showInfoModal, handleModalDismiss } = useNotifications();

  // Firebase Analytics: Track app open event
  useEffect(() => {
    const trackAppOpen = async () => {
      try {
        const analyticsInstance = getAnalytics();
        await logEvent(analyticsInstance, "app_open");
      } catch {
        // Analytics is non-critical, silently ignore failures
      }
    };
    trackAppOpen();
  }, []);

  // Günlük giriş kredisi: Uygulama açılışında otomatik talep et
  const { claimDailyCredit, hasDailyCreditAvailable, isLoading } = useCredits();
  useEffect(() => {
    const checkDailyCredit = async () => {
      // Loading bittiyse ve kredi varsa çalıştır
      if (!isLoading && hasDailyCreditAvailable) {
        await claimDailyCredit();
        // Kredi başarıyla alındı - sessiz (debug log kaldırıldı)
      }
    };
    checkDailyCredit();
  }, [hasDailyCreditAvailable, claimDailyCredit, isLoading]); // isLoading dependency eklendi

  // Animasyonlu splash gösterilsin mi?
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Tüm kritik kaynakların (font, auth, veri) yüklenmesini bekle
  const isReady = fontsLoaded && !authLoading && !booksLoading;

  // Native splash'i AnimatedSplash render edildiğinde gizle
  const onLayoutAnimatedSplash = useCallback(async () => {
    if (isReady) {
      // AnimatedSplash görünümü render edildi, artık native splash'i gizleyebiliriz
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Animasyon bittiğinde uygulamayı göster
  const handleAnimationFinish = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  if (!isReady) {
    // Native splash screen'in ekranda kalmasını sağla
    return null;
  }

  // Animasyonlu splash göster - onLayout ile Native splash'i kaldır
  if (showAnimatedSplash) {
    return (
      <View style={{ flex: 1 }} onLayout={onLayoutAnimatedSplash}>
        <AnimatedSplash onAnimationFinish={handleAnimationFinish} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="add-book" options={{ presentation: "modal" }} />
        <Stack.Screen name="book-detail" />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Bilgilendirme Modalı - İlk açılışta gösterilir */}
      <NotificationPermissionModal
        visible={showInfoModal}
        onContinue={handleModalDismiss}
      />
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BooksProvider>
            <CreditsProvider>
              <NotificationProvider>
                <RootLayoutContent fontsLoaded={fontsLoaded} />
              </NotificationProvider>
            </CreditsProvider>
          </BooksProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}
