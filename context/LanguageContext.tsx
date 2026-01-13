import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import * as Localization from "expo-localization";
import i18n from "../i18n/i18n";
import { StorageService } from "../services/storage";

type Language = "tr" | "en";

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);
const LANGUAGE_KEY = "user_language";

/**
 * Cihazın dilini algılar ve desteklenen dillere göre (tr/en) döndürür.
 * Cihaz dili Türkçe ise 'tr', aksi halde varsayılan olarak 'en' döner.
 */
const getDeviceLanguage = (): Language => {
  const locales = Localization.getLocales();
  const deviceLangCode = locales[0]?.languageCode?.toLowerCase() ?? "en";

  // Eğer cihaz dili Türkçe ise 'tr', değilse 'en' kullan
  return deviceLangCode === "tr" ? "tr" : "en";
};

export function LanguageProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [language, setLanguage] = useState<Language>("tr");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await StorageService.getItem<Language>(LANGUAGE_KEY);

        if (savedLang === "tr" || savedLang === "en") {
          // Kullanıcı daha önce dil seçmiş, o dili kullan
          setLanguage(savedLang);
          await i18n.changeLanguage(savedLang);
        } else {
          // İlk açılış: Cihaz diline göre otomatik dil seç
          const deviceLang = getDeviceLanguage();
          setLanguage(deviceLang);
          await i18n.changeLanguage(deviceLang);
          // Seçilen dili kaydet (gelecek açılışlar için)
          await StorageService.setItem(LANGUAGE_KEY, deviceLang);
        }
      } catch (e) {
        console.error("Failed to load language", e);
        // Hata durumunda cihaz diline göre ayarla
        const deviceLang = getDeviceLanguage();
        setLanguage(deviceLang);
      } finally {
        // Yükleme tamamlandı
      }
    };
    loadLanguage();
  }, []);

  // Dil değiştirme fonksiyonu - useCallback ile memoize edildi
  const changeLanguage = useCallback(async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      await StorageService.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.error("Failed to save language", e);
    }
  }, []);

  // Context value - useMemo ile memoize edildi (S6481 düzeltmesi)
  const contextValue = useMemo<LanguageContextType>(
    () => ({
      language,
      changeLanguage,
    }),
    [language, changeLanguage],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
