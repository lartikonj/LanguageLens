import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/providers/language-provider";
import { Article, Subject } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, ChevronRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { formatDistanceToNow } from "date-fns";

export default function SubjectPage() {
  const { categorySlug, subjectSlug } = useParams<{ categorySlug?: string; subjectSlug?: string }>();
  const { language } = useLanguage();
  const slug = subjectSlug || categorySlug;
  const isCategory = !!categorySlug && !subjectSlug;
  
  // Fetch subject data or category subjects
  const { data: subjectData, isLoading: subjectLoading, error: subjectError } = useQuery<Subject[] | Subject>({
    queryKey: [isCategory ? `/api/categories/${slug}/subjects` : `/api/subjects/${slug}`, language?.code],
    enabled: !!language && !!slug,
  });

  // Fetch articles for the subject
  const { data: articles, isLoading: articlesLoading, error: articlesError } = useQuery<Article[]>({
    queryKey: [isCategory ? null : `/api/subjects/${slug}/articles`, language?.code],
    enabled: !!language && !!slug && !isCategory,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // Loading state
  if (subjectLoading || (articlesLoading && !isCategory)) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Error state
  if (subjectError || (!isCategory && articlesError) || !subjectData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-500">Content not found</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          The {isCategory ? "category" : "subject"} you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // If we're on a category page, display subjects
  if (isCategory) {
    const subjects = subjectData as Subject[];
    const category = subjects.length > 0 ? subjects[0].category : null;

    // Breadcrumb items
    const breadcrumbItems = [
      {
        label: "Categories",
        href: "/categories",
      },
      {
        label: category?.name || "Category",
      },
    ];

    return (
      <>
        <Helmet>
          <title>{category?.name || "Category"} | LinguaContent</title>
          <meta name="description" content={`Browse all subjects in ${category?.name || "this category"} on LinguaContent.`} />
          <link rel="canonical" href={`https://linguacontent.com/categories/${slug}`} />
        </Helmet>

        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb items={breadcrumbItems} />
          </div>
        </div>

        {/* Subjects List */}
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                {category?.name || "Category"}
              </h1>
              {category?.description && (
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                  {category.description}
                </p>
              )}
            </div>

            <div className="mt-10">
              {subjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {subjects.map((subject) => (
                    <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                      <a className="block">
                        <Card className="hover:shadow-md transition-shadow h-full">
                          <CardHeader>
                            <CardTitle>{subject.name}</CardTitle>
                            <CardDescription>
                              {subject.description || `Explore ${subject.name} content`}
                            </CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button variant="outline" className="w-full">
                              View Articles
                              <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
                      </a>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400">No subjects found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </>
    );
  }

  // If we're on a subject page, display articles
  const subject = subjectData as Subject;

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Categories",
      href: "/categories",
    },
    {
      label: subject.category.name,
      href: `/categories/${subject.category.slug}`,
    },
    {
      label: subject.name,
    },
  ];

  return (
    <>
      <Helmet>
        <title>{subject.name} | LinguaContent</title>
        <meta name="description" content={subject.description || `Read articles about ${subject.name} in multiple languages on LinguaContent.`} />
        <link rel="canonical" href={`https://linguacontent.com/subjects/${slug}`} />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Articles List */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {subject.name}
            </h1>
            {subject.description && (
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
                {subject.description}
              </p>
            )}
          </div>

          <div className="mt-10">
            {articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <Link key={article.id} href={`/articles/${article.slug}`}>
                    <a className="block">
                      <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                        <CardHeader>
                          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
                          <CardDescription className="flex items-center text-sm mt-2">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(article.publishedAt || article.createdAt)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div 
                            className="line-clamp-3 text-sm text-gray-600 dark:text-gray-300"
                            dangerouslySetInnerHTML={{ 
                              __html: article.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'
                            }} 
                          />
                        </CardContent>
                        <CardFooter className="flex justify-between items-center">
                          {article.author && (
                            <div className="flex items-center">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarFallback>
                                  {article.author.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">{article.author.username}</span>
                            </div>
                          )}
                          <Button variant="ghost" size="sm">
                            Read More
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </CardFooter>
                      </Card>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 dark:text-gray-400">No articles found in this subject.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
