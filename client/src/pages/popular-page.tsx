
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@/lib/types";
import ArticleCard from "@/components/article-card";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function PopularPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["popular-articles"],
    queryFn: () => apiRequest("/api/articles/popular")
  });

  return (
    <>
      <Helmet>
        <title>Popular Articles | Kalima</title>
        <meta name="description" content="Discover our most popular and trending articles" />
      </Helmet>

      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Popular Articles
            </h1>
            <p className="mt-4 text-xl text-gray-500 dark:text-gray-300">
              Most read and highly engaged content from our community
            </p>
          </div>

          <div className="mt-12">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : articles?.length ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} {...article} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No popular articles found.</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
