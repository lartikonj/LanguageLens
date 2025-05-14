import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Clock, Eye } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/use-language";

type ArticleCardProps = {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: {
    name: string;
    slug: string;
  };
  imageUrl: string;
  views: number;
  readTime?: number;
  numLanguages: number;
  className?: string;
};

export default function ArticleCard({
  slug,
  title,
  description,
  category,
  imageUrl,
  views,
  readTime = 5,
  numLanguages,
  className = "",
}: ArticleCardProps) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();

  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow duration-300 ${className}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Link href={`/article/${slug}`}>
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      
      <CardContent className="p-4">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2 space-x-2 rtl:space-x-reverse">
          <Link href={`/category/${category.slug}`}>
            <Badge variant="outline" className="hover:bg-secondary-50">
              {category.name}
            </Badge>
          </Link>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 rtl:ml-1 rtl:mr-0" />
            <span>{readTime} min read</span>
          </div>
        </div>
        
        <Link href={`/article/${slug}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
            {title}
          </h3>
        </Link>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-sm flex justify-between items-center">
        <span className="text-primary-600 dark:text-primary-400">
          {t("article.availableIn")} {numLanguages} {t("article.languages")}
        </span>
        
        <div className="flex items-center text-gray-500 dark:text-gray-400">
          <Eye className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
          <span>{views}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
