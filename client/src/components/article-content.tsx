import { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ArticleContentProps {
  article: Article;
  isRtl: boolean;
}

export function ArticleContent({ article, isRtl }: ArticleContentProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 font-serif",
      isRtl && "text-right"
    )}
    dir={isRtl ? "rtl" : "ltr"}>
      <div className="prose prose-primary dark:prose-invert max-w-none">
        <h1 className="text-2xl font-bold mb-4">{article.title}</h1>
        <div 
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }} 
        />
      </div>
    </div>
  );
}
