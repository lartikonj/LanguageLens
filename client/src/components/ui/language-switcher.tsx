import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Globe } from "lucide-react";
import { Language } from "@/lib/types";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function LanguageSwitcher({
  className,
  variant = "outline",
  size = "default",
}: LanguageSwitcherProps) {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLang, setCurrentLang] = useState<Language | null>(null);
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Fetch languages
  useEffect(() => {
    fetch('/api/languages')
      .then(res => res.json())
      .then(data => {
        setLanguages(data);
        
        // Set initial language
        if (data.length > 0 && !currentLang) {
          // Try to get from localStorage or use browser language
          const savedLangCode = localStorage.getItem("preferredLanguage");
          const browserLang = navigator.language.split('-')[0];
          
          // Find a matching language
          let selectedLang = null;
          
          if (savedLangCode) {
            selectedLang = data.find((l: Language) => l.code === savedLangCode);
          }
          
          if (!selectedLang) {
            selectedLang = data.find((l: Language) => l.code === browserLang) || 
                        data.find((l: Language) => l.code === "en") || 
                        data[0];
          }
          
          setCurrentLang(selectedLang);
          
          // Update HTML attributes
          document.documentElement.lang = selectedLang.code;
          document.documentElement.dir = selectedLang.rtl ? "rtl" : "ltr";
        }
      })
      .catch(err => {
        console.error("Failed to load languages:", err);
      });
  }, []);

  // Handle dropdown item click
  const handleSelect = (lang: Language) => {
    if (currentLang?.code === lang.code) {
      setOpen(false);
      return; // Don't do anything if the same language is selected
    }
    
    setCurrentLang(lang);
    setOpen(false);
    
    // Save preference
    localStorage.setItem("preferredLanguage", lang.code);
    
    // Update HTML attributes
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.rtl ? "rtl" : "ltr";
    
    // Instead of reloading, manually trigger a fetch of new data
    // This approach is safer than a full page reload
    window.dispatchEvent(new CustomEvent('language-changed', { detail: lang.code }));
    
    // Refresh the current page content without a full reload
    setTimeout(() => {
      window.location.href = window.location.pathname;
    }, 100);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label="Select language"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className={isMobile ? "sr-only" : ""}>{currentLang?.nativeName || "Language"}</span>
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleSelect(lang)}
            className="flex items-center justify-between"
            dir={lang.rtl ? "rtl" : "ltr"}
          >
            <span>{lang.nativeName}</span>
            {currentLang?.code === lang.code && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
