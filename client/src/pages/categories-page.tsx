import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { useLanguage } from "@/providers/language-provider";
import { Category } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export default function CategoriesPage() {
  const { language } = useLanguage();
  
  // Fetch categories
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories", language?.code],
    enabled: !!language,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Categories",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Categories | LinguaContent</title>
        <meta name="description" content="Browse all content categories on LinguaContent. Find articles, stories and more in English, Arabic, French, Spanish, and German." />
        <link rel="canonical" href="https://linguacontent.com/categories" />
      </Helmet>

      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Categories
            </h1>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              Browse all content categories and find what interests you
            </p>
          </div>

          <div className="mt-10">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-10">
                Failed to load categories. Please try again later.
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <Link key={category.id} href={`/categories/${category.slug}`}>
                    <a className="block">
                      <Card className="hover:shadow-md transition-shadow h-full">
                        <CardHeader>
                          <CardTitle>{category.name}</CardTitle>
                          <CardDescription>
                            {category.description || "Explore content in this category"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <BookOpen className="h-4 w-4 mr-2" />
                            <span>Browse articles and content</span>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Explore
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
                <p className="text-gray-500 dark:text-gray-400">No categories found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
