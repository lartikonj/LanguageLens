
import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ArticleCard } from "@/components/article-card";

export default function SubcategoryPage() {
  const { categorySlug, subcategorySlug } = useParams<{ categorySlug: string; subcategorySlug: string }>();
  
  const { data: subcategoryData, isLoading } = useQuery({
    queryKey: [`/api/categories/${categorySlug}/subcategories/${subcategorySlug}`],
  });

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: subcategoryData?.category?.name || "Category", href: `/categories/${categorySlug}` },
    { label: subcategoryData?.name || "Subcategory" },
  ];

  return (
    <>
      <Helmet>
        <title>{subcategoryData?.name || "Subcategory"} | Kalima</title>
      </Helmet>

      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">{subcategoryData?.name}</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-3 flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : subcategoryData?.articles?.map((article) => (
            <ArticleCard
              key={article.id}
              {...article}
              category={subcategoryData.category}
            />
          ))}
        </div>
      </div>
    </>
  );
}
