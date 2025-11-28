import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n/i18n';

type Language = 'tr' | 'en';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
const LANGUAGE_KEY = 'user_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLang === 'tr' || savedLang === 'en') {
          setLanguage(savedLang);
          await i18n.changeLanguage(savedLang);
        } else {
          // i18n başlatıldığında varsayılan olarak cihaz dilini veya 'tr'yi seçmişti.
          // State'i bu değerle senkronize edelim.
          // i18n.language 'tr-TR' gibi gelebilir, sadece ilk 2 harfi alalım.
          const currentLang = i18n.language?.split('-')[0] as Language;
          if (currentLang === 'en' || currentLang === 'tr') {
            setLanguage(currentLang);
          }
        }
      } catch (e) {
        console.error('Failed to load language', e);
      }
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to save language', e);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
