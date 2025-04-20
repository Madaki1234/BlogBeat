import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { blogController } from "./controllers/blogController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Blog routes
  app.get("/api/posts", blogController.getPosts);
  app.get("/api/posts/featured", blogController.getFeaturedPosts);
  app.get("/api/posts/:slug", blogController.getPostBySlug);
  app.post("/api/posts", blogController.createPost);
  app.put("/api/posts/:id", blogController.updatePost);
  app.delete("/api/posts/:id", blogController.deletePost);
  
  // Comments
  app.get("/api/posts/:postId/comments", blogController.getComments);
  app.post("/api/posts/:postId/comments", blogController.createComment);
  app.delete("/api/comments/:id", blogController.deleteComment);
  
  // Likes
  app.post("/api/posts/:postId/like", blogController.likePost);
  app.delete("/api/posts/:postId/like", blogController.unlikePost);
  
  // Categories
  app.get("/api/categories", blogController.getCategories);

  const httpServer = createServer(app);

  return httpServer;
}
