import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_LANGUAGES, useLanguage } from "@/hooks/use-language";

export default function LanguageSwitcher() {
  const { t } = useTranslation();
  const { language, setLanguage, isRtl } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as keyof typeof SUPPORTED_LANGUAGES);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 px-2 lg:px-3">
          <Globe className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline">{t(`language.${language}`)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
          <DropdownMenuItem
            key={code}
            className={`flex cursor-pointer ${isRtl && code === 'ar' ? 'justify-end' : ''}`}
            onClick={() => handleLanguageChange(code)}
          >
            <span className={`${code === language ? "font-medium" : ""}`}>
              {name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
