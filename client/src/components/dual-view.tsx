import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SUPPORTED_LANGUAGES, useLanguage } from "@/hooks/use-language";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ContentItem = {
  language: string;
  title: string;
  content: string;
  imageUrl?: string;
};

type DualViewProps = {
  contents: ContentItem[];
  currentLanguage: string;
};

type ViewMode = "single" | "dual" | "toggle";

export default function DualView({ contents, currentLanguage }: DualViewProps) {
  const { t } = useTranslation();
  const { language, supportedLanguages } = useLanguage();
  
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [secondaryLanguage, setSecondaryLanguage] = useState<string>(
    Object.keys(supportedLanguages).find(lang => lang !== currentLanguage) || "en"
  );

  // Get current content
  const currentContent = contents.find(c => c.language === currentLanguage) || contents[0];
  
  // Get secondary content for dual view
  const secondaryContent = contents.find(c => c.language === secondaryLanguage);

  // Available languages excluding current
  const availableLanguages = contents
    .filter(content => content.language !== currentLanguage)
    .map(content => content.language);

  // Handle view mode change
  const handleViewModeChange = (value: string) => {
    setViewMode(value as ViewMode);
  };

  // Handle secondary language change
  const handleSecondaryLanguageChange = (value: string) => {
    setSecondaryLanguage(value);
  };

  // Toggle view
  if (viewMode === "toggle") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {t(`language.${currentLanguage}`)}
            </Badge>
            
            <Select value={viewMode} onValueChange={handleViewModeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("viewMode.single")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t("viewMode.single")}</SelectItem>
                <SelectItem value="dual">{t("viewMode.dual")}</SelectItem>
                <SelectItem value="toggle">{t("viewMode.toggle")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={secondaryLanguage} onValueChange={handleSecondaryLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t(`language.${secondaryLanguage}`)} />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {t(`language.${lang}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue={currentLanguage} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value={currentLanguage}>
              {t(`language.${currentLanguage}`)}
            </TabsTrigger>
            <TabsTrigger value={secondaryLanguage}>
              {t(`language.${secondaryLanguage}`)}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={currentLanguage} className="mt-0">
            <Card>
              <CardContent className="p-6">
                {currentContent.imageUrl && (
                  <img 
                    src={currentContent.imageUrl} 
                    alt={currentContent.title}
                    className="w-full h-auto rounded-lg mb-6"
                  />
                )}
                <div 
                  className="prose prose-primary dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: currentContent.content }} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value={secondaryLanguage} className="mt-0">
            <Card>
              <CardContent className="p-6">
                {secondaryContent?.imageUrl && (
                  <img 
                    src={secondaryContent.imageUrl} 
                    alt={secondaryContent.title}
                    className="w-full h-auto rounded-lg mb-6"
                  />
                )}
                <div 
                  className="prose prose-primary dark:prose-invert max-w-none" 
                  dangerouslySetInnerHTML={{ __html: secondaryContent?.content || "" }} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Dual view
  if (viewMode === "dual") {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              {t(`language.${currentLanguage}`)} / {t(`language.${secondaryLanguage}`)}
            </Badge>
            
            <Select value={viewMode} onValueChange={handleViewModeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("viewMode.single")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{t("viewMode.single")}</SelectItem>
                <SelectItem value="dual">{t("viewMode.dual")}</SelectItem>
                <SelectItem value="toggle">{t("viewMode.toggle")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={secondaryLanguage} onValueChange={handleSecondaryLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t(`language.${secondaryLanguage}`)} />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map(lang => (
                <SelectItem key={lang} value={lang}>
                  {t(`language.${lang}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Language */}
          <Card>
            <CardContent className="p-6">
              <Badge className="mb-4 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900">
                {t(`language.${currentLanguage}`)}
              </Badge>
              
              {currentContent.imageUrl && (
                <img 
                  src={currentContent.imageUrl} 
                  alt={currentContent.title}
                  className="w-full h-auto rounded-lg mb-6"
                />
              )}
              
              <div 
                className="prose prose-primary dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: currentContent.content }} 
              />
            </CardContent>
          </Card>
          
          {/* Secondary Language */}
          <Card>
            <CardContent className="p-6">
              <Badge className="mb-4 bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-900">
                {t(`language.${secondaryLanguage}`)}
              </Badge>
              
              {secondaryContent?.imageUrl && (
                <img 
                  src={secondaryContent.imageUrl} 
                  alt={secondaryContent.title}
                  className="w-full h-auto rounded-lg mb-6"
                />
              )}
              
              <div 
                className="prose prose-primary dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: secondaryContent?.content || "" }} 
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Single view (default)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {t(`language.${currentLanguage}`)}
          </Badge>
          
          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("viewMode.single")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">{t("viewMode.single")}</SelectItem>
              <SelectItem value="dual">{t("viewMode.dual")}</SelectItem>
              <SelectItem value="toggle">{t("viewMode.toggle")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          {currentContent.imageUrl && (
            <img 
              src={currentContent.imageUrl} 
              alt={currentContent.title}
              className="w-full h-auto rounded-lg mb-6"
            />
          )}
          
          <div 
            className="prose prose-primary dark:prose-invert max-w-none" 
            dangerouslySetInnerHTML={{ __html: currentContent.content }} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
