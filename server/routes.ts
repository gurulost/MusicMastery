import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgressSchema, insertExerciseSessionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get progress by category
  app.get("/api/progress/:userId/:category", async (req, res) => {
    try {
      const { userId, category } = req.params;
      const progress = await storage.getProgressByCategory(userId, category);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category progress" });
    }
  });

  // Update progress
  app.post("/api/progress", async (req, res) => {
    try {
      const validatedData = insertProgressSchema.parse(req.body);
      const progress = await storage.upsertProgress(validatedData);
      res.json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid progress data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update progress" });
      }
    }
  });

  // Record exercise session
  app.post("/api/exercise-sessions", async (req, res) => {
    try {
      const validatedData = insertExerciseSessionSchema.parse(req.body);
      const session = await storage.createExerciseSession(validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to record session" });
      }
    }
  });

  // Get exercise sessions for a user
  app.get("/api/exercise-sessions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const sessions = await storage.getUserExerciseSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise sessions" });
    }
  });

  // Learning progress routes (for guided journey)
  app.get('/api/learning-progress/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const progress = await storage.getUserLearningProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch learning progress' });
    }
  });

  app.post('/api/learning-progress', async (req, res) => {
    try {
      const progressData = req.body;
      const result = await storage.updateLearningProgress(progressData);
      res.json(result);
    } catch (error) {
      console.error('Learning progress update error:', error);
      res.status(500).json({ error: 'Failed to update learning progress' });
    }
  });

  // Get overall progress summary
  app.get("/api/progress-summary/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const allProgress = await storage.getUserProgress(userId);
      
      const totalItems = 37; // 12 major + 12 minor + 13 intervals
      const mastered = allProgress.filter(p => p.status === 'mastered').length;
      const inProgress = allProgress.filter(p => p.status === 'in_progress').length;
      const notStarted = totalItems - mastered - inProgress;
      
      const summary = {
        totalItems,
        mastered,
        inProgress,
        notStarted,
        overallProgress: Math.round((mastered / totalItems) * 100)
      };
      
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress summary" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const { username } = req.body;
      if (!username || username.trim().length === 0) {
        return res.status(400).json({ message: "Name is required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username.trim());
      if (existingUser) {
        return res.status(400).json({ message: "This name is already taken" });
      }

      const user = await storage.createUser({ username: username.trim() });
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
