export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  description?: string;
  createdAt: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: number;
  slug: string;
  name: string;
  description?: string;
  categoryId: number;
  articles: Article[];
}

export interface Subject {
  id: number;
  slug: string;
  categoryId: number;
  createdAt: string;
  name: string;
  description?: string;
  category: Category;
}

export interface Article {
  id: number;
  slug: string;
  subjectId: number;
  authorId?: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  content: string;
  notes?: string;
  author?: {
    id: number;
    username: string;
  };
  subject: Subject;
}

export interface ArticleTranslation {
  id: number;
  articleId: number;
  languageId: number;
  title: string;
  content: string;
  notes?: string;
  language: Language;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface Comment {
  id: number;
  articleId: number;
  userId: number;
  content: string;
  createdAt: string;
  parentId?: number;
  user: {
    id: number;
    username: string;
  };
  replies?: Comment[];
}

export type ViewMode = 'single' | 'dual';