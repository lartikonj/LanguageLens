import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
});

// Language schema
export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  nativeName: text("native_name").notNull(),
  rtl: boolean("rtl").default(false).notNull(),
});

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category translations
export const categoryTranslations = pgTable("category_translations", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  languageId: integer("language_id").notNull().references(() => languages.id),
  name: text("name").notNull(),
  description: text("description"),
});

// Subject schema
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subject translations
export const subjectTranslations = pgTable("subject_translations", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  languageId: integer("language_id").notNull().references(() => languages.id),
  name: text("name").notNull(),
  description: text("description"),
});

// Article schema
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  subjectId: integer("subject_id").notNull().references(() => subjects.id),
  authorId: integer("author_id").references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Article translations
export const articleTranslations = pgTable("article_translations", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id),
  languageId: integer("language_id").notNull().references(() => languages.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  notes: text("notes"),
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  parentId: integer("parent_id").references(() => comments.id),
});

// Likes
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Saved articles
export const savedArticles = pgTable("saved_articles", {
  id: serial("id").primaryKey(),
  articleId: integer("article_id").notNull().references(() => articles.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Language = typeof languages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type CategoryTranslation = typeof categoryTranslations.$inferSelect;
export type Subject = typeof subjects.$inferSelect;
export type SubjectTranslation = typeof subjectTranslations.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type ArticleTranslation = typeof articleTranslations.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type SavedArticle = typeof savedArticles.$inferSelect;

// Schemas for API
export const languageSchema = z.object({
  code: z.string().min(2).max(5),
  name: z.string().min(1),
  nativeName: z.string().min(1),
  rtl: z.boolean().default(false),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(1000),
  articleId: z.number().int().positive(),
  parentId: z.number().int().positive().optional(),
});

export const articleLikeSchema = z.object({
  articleId: z.number().int().positive(),
});

export const articleSaveSchema = z.object({
  articleId: z.number().int().positive(),
});
