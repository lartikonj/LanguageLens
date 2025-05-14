import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

type LanguageCode = "en" | "fr" | "es" | "de" | "ar";

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  en: "English",
  fr: "Français",
  es: "Español",
  de: "Deutsch",
  ar: "العربية",
};

const DEFAULT_LANGUAGE: LanguageCode = "en";

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  supportedLanguages: Record<LanguageCode, string>;
  isRtl: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  
  // Initialize language state from localStorage or browser preference
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const savedLanguage = localStorage.getItem("language") as LanguageCode;
    if (savedLanguage && Object.keys(SUPPORTED_LANGUAGES).includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Try to match navigator language with supported languages
    const browserLang = navigator.language.split("-")[0] as LanguageCode;
    if (Object.keys(SUPPORTED_LANGUAGES).includes(browserLang)) {
      return browserLang;
    }
    
    return DEFAULT_LANGUAGE;
  });

  const isRtl = language === "ar";

  // Update i18n language when language changes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
  }, [language, i18n, isRtl]);

  // Set language function that updates both state and i18n
  const setLanguage = (code: LanguageCode) => {
    if (Object.keys(SUPPORTED_LANGUAGES).includes(code)) {
      setLanguageState(code);
    }
  };

  const value = {
    language,
    setLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
    isRtl,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  
  return context;
}
