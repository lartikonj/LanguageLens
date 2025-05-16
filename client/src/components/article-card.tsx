
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, Languages } from "lucide-react";

interface ArticleCardProps {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: {
    name: string;
    slug: string;
  };
  imageUrl: string;
  views: number;
  readTime?: number;
  numLanguages: number;
  className?: string;
}

export default function ArticleCard({
  slug,
  title,
  description,
  category,
  imageUrl,
  views,
  readTime = 5,
  numLanguages,
  className = "",
}: ArticleCardProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      <Link href={`/articles/${slug}`}>
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>
      
      <CardHeader className="space-y-2">
        <Link href={`/category/${category.slug}`}>
          <Badge variant="outline" className="inline-block hover:bg-secondary">
            {category.name}
          </Badge>
        </Link>
        <Link href={`/articles/${slug}`}>
          <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {description}
        </p>
      </CardContent>
      
      <CardFooter className="justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{readTime} min read</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Languages className="h-4 w-4" />
            <span>{numLanguages}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Eye className="h-4 w-4" />
            <span>{views}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
