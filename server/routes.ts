import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { articleLikeSchema, articleSaveSchema, commentSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // API Routes
  // Languages
  app.get("/api/languages", async (req, res) => {
    const languages = await storage.getLanguages();
    res.json(languages);
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const languageCode = req.query.lang as string || "en";
    const categories = await storage.getCategoriesWithTranslations(languageCode);
    res.json(categories);
  });

  // Subjects by category
  app.get("/api/categories/:slug/subjects", async (req, res) => {
    const { slug } = req.params;
    const languageCode = req.query.lang as string || "en";
    
    try {
      const subjects = await storage.getSubjectsByCategorySlug(slug, languageCode);
      res.json(subjects);
    } catch (error) {
      res.status(404).json({ message: "Category not found" });
    }
  });

  // Articles by subject
  app.get("/api/subjects/:slug/articles", async (req, res) => {
    const { slug } = req.params;
    const languageCode = req.query.lang as string || "en";
    
    try {
      const articles = await storage.getArticlesBySubjectSlug(slug, languageCode);
      res.json(articles);
    } catch (error) {
      res.status(404).json({ message: "Subject not found" });
    }
  });

  // Single article with translations
  app.get("/api/articles/:slug", async (req, res) => {
    const { slug } = req.params;
    const languageCode = req.query.lang as string || "en";
    
    try {
      const article = await storage.getArticleBySlug(slug, languageCode);
      res.json(article);
    } catch (error) {
      res.status(404).json({ message: "Article not found" });
    }
  });

  // Get article translations
  app.get("/api/articles/:slug/translations", async (req, res) => {
    const { slug } = req.params;
    
    try {
      const translations = await storage.getArticleTranslations(slug);
      res.json(translations);
    } catch (error) {
      res.status(404).json({ message: "Article not found" });
    }
  });

  // Comments
  app.get("/api/articles/:slug/comments", async (req, res) => {
    const { slug } = req.params;
    
    try {
      const comments = await storage.getCommentsByArticleSlug(slug);
      res.json(comments);
    } catch (error) {
      res.status(404).json({ message: "Article not found" });
    }
  });

  // Add comment
  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = commentSchema.parse(req.body);
      const user = req.user as Express.User;
      const comment = await storage.createComment({
        ...validatedData,
        userId: user.id,
      });
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Like article
  app.post("/api/articles/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = articleLikeSchema.parse(req.body);
      const user = req.user as Express.User;
      const like = await storage.likeArticle(validatedData.articleId, user.id);
      res.status(201).json(like);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to like article" });
    }
  });

  // Unlike article
  app.delete("/api/articles/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const articleId = parseInt(req.params.id);
      const user = req.user as Express.User;
      await storage.unlikeArticle(articleId, user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike article" });
    }
  });

  // Save article
  app.post("/api/articles/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = articleSaveSchema.parse(req.body);
      const user = req.user as Express.User;
      const saved = await storage.saveArticle(validatedData.articleId, user.id);
      res.status(201).json(saved);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to save article" });
    }
  });

  // Unsave article
  app.delete("/api/articles/:id/save", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const articleId = parseInt(req.params.id);
      const user = req.user as Express.User;
      await storage.unsaveArticle(articleId, user.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unsave article" });
    }
  });

  // Admin routes
  app.get("/api/admin/pending-articles", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as Express.User).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const articles = await storage.getPendingArticles();
    res.json(articles);
  });

  app.post("/api/admin/articles/:id/approve", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as Express.User).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    await storage.approveArticle(parseInt(id));
    res.sendStatus(200);
  });

  app.post("/api/admin/articles/:id/reject", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as Express.User).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { id } = req.params;
    await storage.rejectArticle(parseInt(id));
    res.sendStatus(200);
  });

  app.get("/api/admin/messages", async (req, res) => {
    if (!req.isAuthenticated() || !(req.user as Express.User).isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const messages = await storage.getAdminMessages();
    res.json(messages);
  });

  // Get saved articles
  app.get("/api/user/saved-articles", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = req.user as Express.User;
    const languageCode = req.query.lang as string || "en";
    
    try {
      const savedArticles = await storage.getSavedArticles(user.id, languageCode);
      res.json(savedArticles);
    } catch (error) {
      res.status(500).json({ message: "Failed to get saved articles" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
