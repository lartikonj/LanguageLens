import { useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/providers/language-provider";
import { ArticleView } from "@/components/article-view";
import { Article, ArticleTranslation, Comment } from "@/lib/types";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function ArticlePage() {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  // Fetch article data
  const { data: article, isLoading: articleLoading, error: articleError } = useQuery<Article>({
    queryKey: [`/api/articles/${articleSlug}`, language?.code],
    enabled: !!language && !!articleSlug,
  });
  
  // Fetch article translations
  const { data: translations, isLoading: translationsLoading } = useQuery<ArticleTranslation[]>({
    queryKey: [`/api/articles/${articleSlug}/translations`],
    enabled: !!articleSlug,
  });
  
  // Fetch comments
  const { data: comments, isLoading: commentsLoading } = useQuery<Comment[]>({
    queryKey: [`/api/articles/${articleSlug}/comments`],
    enabled: !!articleSlug,
  });
  
  // Check if article is liked or saved (if user is logged in)
  const { data: likeStatus } = useQuery<boolean>({
    queryKey: [`/api/articles/${articleSlug}/like`, user?.id],
    enabled: !!user && !!articleSlug && !!article,
  });
  
  const { data: saveStatus } = useQuery<boolean>({
    queryKey: [`/api/articles/${articleSlug}/save`, user?.id],
    enabled: !!user && !!articleSlug && !!article,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [articleSlug]);

  // Loading state
  if (articleLoading || translationsLoading || commentsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Error state
  if (articleError || !article) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500">Article not found</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          The article you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: article.subject.category.name,
      href: `/categories/${article.subject.category.slug}`,
    },
    {
      label: article.subject.name,
      href: `/subjects/${article.subject.slug}`,
    },
    {
      label: article.title,
    },
  ];

  return (
    <>
      {/* SEO Metadata */}
      <Helmet>
        <title>{article.title} | LinguaContent</title>
        <meta name="description" content={article.content.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
        <link rel="canonical" href={`https://linguacontent.com/articles/${articleSlug}`} />
        
        {/* Open Graph / Social Media */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.content.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://linguacontent.com/articles/${articleSlug}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.content.substring(0, 160).replace(/<[^>]*>?/gm, '')} />
        
        {/* Language alternates for SEO */}
        {translations?.map(t => (
          <link 
            key={t.language.code} 
            rel="alternate" 
            hrefLang={t.language.code} 
            href={`https://linguacontent.com/${t.language.code}/articles/${articleSlug}`} 
          />
        ))}
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Article View */}
      <ArticleView 
        article={article} 
        translations={translations || []} 
        comments={comments || []} 
        isLiked={!!likeStatus} 
        isSaved={!!saveStatus} 
      />
    </>
  );
}
