import { useState } from "react";
import { Article, ArticleTranslation, Comment, ViewMode } from "@/lib/types";
import { useLanguage } from "@/providers/language-provider";
import { ArticleContent } from "./article-content";
import { Button } from "@/components/ui/button";
import { BookOpen, Heart, HeartOff, Bookmark, BookmarkX, Share2, Clock, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { LanguageSwitcher } from "./ui/language-switcher";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CommentSection } from "./comment-section";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ArticleViewProps {
  article: Article;
  translations: ArticleTranslation[];
  comments: Comment[];
  isLiked: boolean;
  isSaved: boolean;
}

export function ArticleView({ article, translations, comments, isLiked, isSaved }: ArticleViewProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();
  
  // Local state
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [secondaryLanguage, setSecondaryLanguage] = useState<string>("en");
  
  // Find secondary language translation
  const secondaryTranslation = translations.find(t => t.language.code === secondaryLanguage);
  
  // Format publish date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(language?.code || "en", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Like article mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/articles/${article.id}/like`);
        return false;
      } else {
        await apiRequest("POST", "/api/articles/like", { articleId: article.id });
        return true;
      }
    },
    onSuccess: (liked) => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${article.slug}`, language?.code] });
      toast({
        title: liked ? "Article liked" : "Article unliked",
        description: liked ? "This article has been added to your likes." : "This article has been removed from your likes.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save article mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        await apiRequest("DELETE", `/api/articles/${article.id}/save`);
        return false;
      } else {
        await apiRequest("POST", "/api/articles/save", { articleId: article.id });
        return true;
      }
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${article.slug}`, language?.code] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/saved-articles"] });
      toast({
        title: saved ? "Article saved" : "Article unsaved",
        description: saved ? "This article has been saved to your profile." : "This article has been removed from your saved articles.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle like button click
  const handleLikeClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like articles.",
        variant: "destructive",
      });
      return;
    }
    
    likeMutation.mutate();
  };

  // Handle save button click
  const handleSaveClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save articles.",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate();
  };

  // Handle share button click
  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: `Check out this article: ${article.title}`,
        url: window.location.href,
      }).catch((error) => {
        console.error("Error sharing:", error);
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      });
    }
  };

  return (
    <div className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Article Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 p-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            <LanguageSwitcher />
            <Select 
              value={viewMode} 
              onValueChange={(value) => setViewMode(value as ViewMode)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Display mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single view</SelectItem>
                <SelectItem value="dual">Side-by-side view</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLikeClick}
              disabled={likeMutation.isPending}
            >
              {isLiked ? (
                <>
                  <HeartOff className="mr-2 h-4 w-4 text-red-500" />
                  Unlike
                </>
              ) : (
                <>
                  <Heart className="mr-2 h-4 w-4" />
                  Like
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveClick}
              disabled={saveMutation.isPending}
            >
              {isSaved ? (
                <>
                  <BookmarkX className="mr-2 h-4 w-4 text-blue-500" />
                  Unsave
                </>
              ) : (
                <>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareClick}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
        
        {/* Article Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 font-serif">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-4 flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              {formatDate(article.publishedAt || article.createdAt)}
            </span>
            {article.author && (
              <span className="mr-4 flex items-center">
                <User className="mr-1 h-4 w-4" />
                {article.author.username}
              </span>
            )}
            <span className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              {Math.ceil(article.content.length / 1000)} min read
            </span>
          </div>
        </div>
        
        {/* Article Content */}
        <div className={`grid grid-cols-1 ${viewMode === "dual" ? "lg:grid-cols-2" : ""} gap-6 lg:gap-10 mb-10`}>
          {/* Primary Language Content */}
          <ArticleContent article={article} isRtl={language?.rtl || false} />
          
          {/* Secondary Language Content (for dual view) */}
          {viewMode === "dual" && secondaryTranslation && (
            <div className="relative">
              <div className="absolute top-0 right-0 z-10 m-4">
                <Select 
                  value={secondaryLanguage} 
                  onValueChange={setSecondaryLanguage}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Second language" />
                  </SelectTrigger>
                  <SelectContent>
                    {translations.filter(t => t.language.code !== language?.code).map(t => (
                      <SelectItem key={t.language.code} value={t.language.code}>
                        {t.language.nativeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ArticleContent 
                article={{
                  ...article,
                  title: secondaryTranslation.title,
                  content: secondaryTranslation.content,
                  notes: secondaryTranslation.notes
                }} 
                isRtl={secondaryTranslation.language.rtl}
              />
            </div>
          )}
        </div>
        
        {/* Notes Section */}
        {article.notes && (
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-10">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notes & References</h3>
            <div className="prose prose-sm max-w-none text-gray-600 dark:text-gray-300"
                 dangerouslySetInnerHTML={{ __html: article.notes }} />
          </div>
        )}
        
        {/* Comments Section */}
        <CommentSection comments={comments} articleId={article.id} />
      </div>
    </div>
  );
}
