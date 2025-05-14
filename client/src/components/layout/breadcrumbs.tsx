import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ChevronRight, Home } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation();
  const { isRtl } = useLanguage();
  
  // In RTL mode, we need to reverse the chevron direction
  const Separator = isRtl ? 
    () => <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transform rotate-180" /> : 
    () => <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />;

  return (
    <nav 
      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      aria-label="Breadcrumb"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 rtl:space-x-reverse">
          <li>
            <div>
              <Link href="/" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <Home className="h-5 w-5" />
                <span className="sr-only">{t("breadcrumbs.home")}</span>
              </Link>
            </div>
          </li>
          
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <Separator />
              <div className={isRtl ? "mr-2" : "ml-2"}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400" aria-current="page">
                    {item.label}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
