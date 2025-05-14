import { 
  createContext, 
  ReactNode, 
  useContext, 
  useEffect, 
  useState 
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Language } from "@/lib/types";

interface LanguageContextType {
  language: Language | null;
  languages: Language[];
  setLanguage: (language: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: null,
  languages: [],
  setLanguage: () => {},
  isLoading: true
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language | null>(null);

  // Fetch available languages
  const { data: languages = [], isLoading } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
  });

  // Initialize with browser language or default to English
  useEffect(() => {
    if (languages.length > 0 && !language) {
      // Get browser language code (e.g., "en-US" -> "en")
      const browserLang = navigator.language.split('-')[0];
      
      // Try to find a matching language
      const matchedLang = languages.find(l => l.code === browserLang);
      
      // Set to matched language or default to English or first available
      const defaultLang = matchedLang || 
        languages.find(l => l.code === "en") || 
        languages[0];
      
      setLanguage(defaultLang);
      
      // Also store in localStorage for persistence
      localStorage.setItem("preferredLanguage", defaultLang.code);
    }
  }, [languages, language]);

  // Handle language change
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem("preferredLanguage", newLanguage.code);
    
    // Update HTML lang attribute and dir for RTL support
    document.documentElement.lang = newLanguage.code;
    document.documentElement.dir = newLanguage.rtl ? "rtl" : "ltr";
  };

  // Load saved language preference from localStorage on initial load
  useEffect(() => {
    if (languages.length > 0) {
      const savedLangCode = localStorage.getItem("preferredLanguage");
      if (savedLangCode) {
        const savedLang = languages.find(l => l.code === savedLangCode);
        if (savedLang) {
          setLanguage(savedLang);
          document.documentElement.lang = savedLang.code;
          document.documentElement.dir = savedLang.rtl ? "rtl" : "ltr";
        }
      }
    }
  }, [languages]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        languages,
        setLanguage: handleSetLanguage,
        isLoading
      }}
    >
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
