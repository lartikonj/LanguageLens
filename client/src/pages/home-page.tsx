import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Category } from "@/lib/types";
import { Loader2, BookOpen, ChevronRight } from "lucide-react";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState(false);

  // Fetch categories
  useEffect(() => {
    // Get current language from localStorage or default to 'en'
    const currentLang = localStorage.getItem("preferredLanguage") || 'en';

    // Fetch categories with current language
    setIsLoading(true);
    fetch(`/api/categories?lang=${currentLang}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setCategories(data);
        setIsLoading(false);
        console.log("Categories loaded:", data);
      })
      .catch(err => {
        console.error("Failed to load categories:", err);
        setError("Failed to load categories");
        setIsLoading(false);
      });
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>LinguaContent - Learn Languages Through Content You Love</title>
        <meta name="description" content="Learn languages naturally by enjoying content in English, Arabic, French, Spanish, and German. Switch between languages to improve your skills." />
        <link rel="canonical" href="https://linguacontent.com" />
        <meta property="og:title" content="LinguaContent - Multilingual Content Platform" />
        <meta property="og:description" content="Learn languages naturally by enjoying content in multiple languages. Switch between languages to improve your skills." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://linguacontent.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="LinguaContent - Multilingual Content Platform" />
        <meta name="twitter:description" content="Learn languages naturally by enjoying content in multiple languages. Switch between languages to improve your skills." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block font-arabic">كلمة</span>
            <span className="block">Kalima</span>
            <span className="block text-primary mt-4 text-2xl sm:text-3xl md:text-4xl">Your Gateway to Arabic Language</span>
          </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Immerse yourself in the rich world of Arabic language and culture. Learn diverse dialects, classical texts, and modern expressions through carefully curated content.
            </p>
            <div className="mt-10 flex justify-center">
              <Link href="/categories">
                <Button size="lg" className="px-8">
                  Start Exploring
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 dark:text-primary-500 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              A better way to learn languages
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
              Enjoy reading in multiple languages with intuitive features designed to help you learn naturally.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <BookOpen className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Dual Language View</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      View content in two languages side by side to easily compare and understand.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">5 Languages Supported</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Content available in English, Arabic, French, Spanish, and German.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-white dark:bg-gray-800 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-500 rounded-md shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">Save Your Favorites</h3>
                    <p className="mt-5 text-base text-gray-500 dark:text-gray-400">
                      Bookmark articles to read later and track your learning progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Featured Articles
            </h2>
            <Link href="/featured">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-3 flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : (
              categories?.slice(0, 3).map((category) => (
                <ArticleCard
                  key={category.id}
                  id={category.id}
                  slug={category.slug}
                  title={category.name}
                  description={category.description}
                  category={{ name: "Featured", slug: "featured" }}
                  imageUrl="/placeholder.jpg"
                  views={1000}
                  numLanguages={5}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Popular Content */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Popular Content
            </h2>
            <Link href="/popular">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <div className="col-span-3 flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
              </div>
            ) : (
              categories?.slice(0, 3).map((category) => (
                <ArticleCard
                  key={category.id}
                  id={category.id}
                  slug={category.slug}
                  title={category.name}
                  description={category.description}
                  category={{ name: "Popular", slug: "popular" }}
                  imageUrl="/placeholder.jpg"
                  views={2000}
                  numLanguages={5}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Explore Categories
            </h2>
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-300">
              Discover content across various categories that interest you
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
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categories?.map((category) => (
                  <div key={category.id} className="block">
                    <Link href={`/categories/${category.slug}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle>{category.name}</CardTitle>
                          <CardDescription>
                            {category.description || "Explore content in this category"}
                          </CardDescription>
                        </CardHeader>
                        <CardFooter>
                          <Button variant="outline" className="w-full">Browse Content</Button>
                        </CardFooter>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}