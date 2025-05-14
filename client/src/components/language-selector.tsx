import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, useLanguage } from "@/hooks/use-language";

type LanguageSelectorProps = {
  onLanguageChange?: (lang: string) => void;
  currentLanguage?: string;
  excludeLanguage?: string;
  variant?: "default" | "outline" | "secondary";
};

export default function LanguageSelector({
  onLanguageChange,
  currentLanguage,
  excludeLanguage,
  variant = "default",
}: LanguageSelectorProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  // Use provided currentLanguage or fall back to the global language context
  const selectedLanguage = currentLanguage || language;

  const handleLanguageChange = (lang: string) => {
    // If an external handler is provided, use it
    if (onLanguageChange) {
      onLanguageChange(lang);
    } else {
      // Otherwise, update the global language
      setLanguage(lang as keyof typeof SUPPORTED_LANGUAGES);
    }
  };

  // Filter out excluded language if provided
  const availableLanguages = excludeLanguage
    ? Object.entries(SUPPORTED_LANGUAGES).filter(([code]) => code !== excludeLanguage)
    : Object.entries(SUPPORTED_LANGUAGES);

  return (
    <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[180px] ${variant === 'outline' ? 'border-gray-300 dark:border-gray-600' : ''}`}>
        <SelectValue placeholder={t(`language.${selectedLanguage}`)} />
      </SelectTrigger>
      <SelectContent>
        {availableLanguages.map(([code, name]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
