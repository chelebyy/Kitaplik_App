import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import "intl-pluralrules";

import tr from "./locales/tr.json";
import en from "./locales/en.json";

const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

const initI18n = async () => {
  // LanguageContext will handle loading saved language
  // For now, we default to device locale or 'tr'
  const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? "tr";

  await i18n.use(initReactI18next).init({
    resources,
    lng: deviceLanguage, // Default to device language initially
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false, // react handles escaping
    },
    react: {
      useSuspense: false,
    },
  });
};

initI18n();

export { default } from "i18next";
