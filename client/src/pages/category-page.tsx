import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/hooks/use-language";

import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import ArticleCard from "@/components/article-card";
import LanguageSelector from "@/components/language-selector";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";

export default function CategoryPage() {
  const { t } = useTranslation();
  const { language, isRtl } = useLanguage();
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [, params] = useRoute<{ slug: string }>("/category/:slug");
  
  // If no slug is provided, redirect to home
  if (!params?.slug) {
    return <Link href="/" />;
  }

  const slug = params.slug;
  
  // Fetch category details
  const { 
    data: categoryData, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useQuery({
    queryKey: [`/api/categories/${slug}`, { language }],
  });
  
  // Fetch articles in this category
  const { 
    data: articlesData, 
    isLoading: articlesLoading, 
    error: articlesError 
  } = useQuery({
    queryKey: [`/api/articles`, { page, limit: 12, category: slug, language, sort }],
  });
  
  const isLoading = categoryLoading || articlesLoading;
  const error = categoryError || articlesError;
  
  // Load more articles
  const handleLoadMore = () => {
    if (articlesData && articlesData.articles.length > 0) {
      setPage(page + 1);
    }
  };
  
  // Breadcrumbs
  const breadcrumbItems = categoryData ? [
    {
      label: categoryData.content?.name || slug,
    },
  ] : [];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>
          {categoryData?.content?.name 
            ? `${categoryData.content.name} | LinguaContent`
            : "Category | LinguaContent"
          }
        </title>
        <meta 
          name="description" 
          content={categoryData?.content?.description || `Explore articles in this category in multiple languages.`} 
        />
        
        {/* Open Graph / Social */}
        <meta 
          property="og:title" 
          content={categoryData?.content?.name 
            ? `${categoryData.content.name} | LinguaContent`
            : "Category | LinguaContent"
          } 
        />
        <meta 
          property="og:description" 
          content={categoryData?.content?.description || `Explore articles in this category in multiple languages.`} 
        />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta 
          name="twitter:title" 
          content={categoryData?.content?.name 
            ? `${categoryData.content.name} | LinguaContent`
            : "Category | LinguaContent"
          } 
        />
        <meta 
          name="twitter:description" 
          content={categoryData?.content?.description || `Explore articles in this category in multiple languages.`} 
        />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
      </Helmet>
      
      <Header />
      <Breadcrumbs items={breadcrumbItems} />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Category Header */}
          <div className="mb-8" dir={isRtl ? "rtl" : "ltr"}>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mt-2"></div>
              </div>
            ) : error ? (
              <div className="text-destructive">
                <h1 className="text-3xl font-bold mb-2">{t("error.category.title")}</h1>
                <p>{t("error.category.description")}</p>
              </div>
            ) : (
              <>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {categoryData?.content?.name || slug}
                </h1>
                {categoryData?.content?.description && (
                  <p className="text-xl text-gray-600 dark:text-gray-300">
                    {categoryData.content.description}
                  </p>
                )}
              </>
            )}
          </div>
          
          {/* Filters */}
          <div className="mb-8 flex flex-wrap justify-between items-center gap-4" dir={isRtl ? "rtl" : "ltr"}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("category.articles")}
            </h2>
            
            <div className="flex flex-wrap gap-3">
              <LanguageSelector />
              
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("filter.latest")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">{t("filter.latest")}</SelectItem>
                  <SelectItem value="popular">{t("filter.popular")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Articles Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{t("error.articles")}</p>
              <Button asChild>
                <Link href="/">
                  {t("error.backToHome")}
                </Link>
              </Button>
            </div>
          ) : articlesData && articlesData.articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articlesData.articles.map((article: any) => (
                  <ArticleCard
                    key={article.id}
                    id={article.id}
                    slug={article.slug}
                    title={article.content.title}
                    description={article.content.description || ""}
                    category={{
                      name: article.category?.name || t("category.uncategorized"),
                      slug: article.categoryId ? `category-${article.categoryId}` : "uncategorized",
                    }}
                    imageUrl={article.imageUrl || "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6"}
                    views={article.views}
                    numLanguages={5}
                  />
                ))}
              </div>
              
              {articlesData.articles.length < articlesData.totalCount && (
                <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleLoadMore}
                  >
                    {t("category.loadMore")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-600 dark:text-gray-300">
              <p className="mb-4">{t("category.noArticles")}</p>
              <Button asChild>
                <Link href="/">
                  {t("category.browseAll")}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
