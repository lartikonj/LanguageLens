import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/providers/language-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Article } from "@/lib/types";
import { Loader2, Clock, BookOpen, Heart, Bookmark } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();
  const { language } = useLanguage();
  
  // Fetch saved articles
  const { data: savedArticles, isLoading: savedLoading } = useQuery<Article[]>({
    queryKey: ["/api/user/saved-articles", language?.code],
    enabled: !!user && !!language,
  });

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>My Profile | LinguaContent</title>
        <meta name="description" content="Manage your LinguaContent profile, view saved articles, and update your settings." />
      </Helmet>

      <div className="py-10 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your account and saved content
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username}
                  </CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Member since {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : ''}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      {logoutMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      )}
                      Log out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="saved">
                <TabsList className="mb-8">
                  <TabsTrigger value="saved">Saved Articles</TabsTrigger>
                  <TabsTrigger value="settings">Account Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="saved">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Bookmark className="h-5 w-5 mr-2" />
                        Saved Articles
                      </CardTitle>
                      <CardDescription>
                        Articles you've saved for later reading
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {savedLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                        </div>
                      ) : savedArticles && savedArticles.length > 0 ? (
                        <div className="space-y-6">
                          {savedArticles.map((article) => (
                            <div key={article.id} className="flex flex-col sm:flex-row border-b border-gray-200 dark:border-gray-700 pb-6 last:pb-0 last:border-0">
                              <div className="flex-grow">
                                <Link href={`/articles/${article.slug}`}>
                                  <a className="text-lg font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                                    {article.title}
                                  </a>
                                </Link>
                                <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>
                                    {article.publishedAt 
                                      ? format(new Date(article.publishedAt), 'MMMM d, yyyy') 
                                      : format(new Date(article.createdAt), 'MMMM d, yyyy')}
                                  </span>
                                  <span className="mx-2">•</span>
                                  <BookOpen className="h-4 w-4 mr-1" />
                                  <span>{Math.ceil(article.content.length / 1000)} min read</span>
                                </div>
                                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                                  {article.content.substring(0, 150).replace(/<[^>]*>?/gm, '')}...
                                </p>
                                <div className="mt-3 flex items-center">
                                  <Link href={`/articles/${article.slug}`}>
                                    <Button variant="ghost" size="sm" className="text-primary-600 dark:text-primary-400 pl-0">
                                      Read Article
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <div className="flex justify-center mb-4">
                            <Bookmark className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No saved articles yet</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-6">
                            When you find interesting content, save it to read later.
                          </p>
                          <Link href="/categories">
                            <Button>
                              Browse Categories
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Manage your account details and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Profile Information
                          </h3>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Username
                              </label>
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                {user?.username}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                              </label>
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                {user?.email}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                First Name
                              </label>
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                {user?.firstName || "—"}
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Last Name
                              </label>
                              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                                {user?.lastName || "—"}
                              </div>
                            </div>
                          </div>
                          <div className="mt-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Profile editing functionality coming soon.
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                            Language Preferences
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            You can change your language using the language switcher in the header.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
