import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProgressSchema, insertExerciseSessionSchema } from "@shared/schema";
import { z } from "zod";

// Parameter validation schemas
const userIdSchema = z.object({
  userId: z.string().uuid("Invalid user ID format")
});

const categorySchema = z.object({
  category: z.enum(["major_scales", "minor_scales", "intervals"], {
    errorMap: () => ({ message: "Category must be one of: major_scales, minor_scales, intervals" })
  })
});

const userIdCategorySchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  category: z.enum(["major_scales", "minor_scales", "intervals"], {
    errorMap: () => ({ message: "Category must be one of: major_scales, minor_scales, intervals" })
  })
});

// Helper function to handle parameter validation errors
const handleValidationError = (res: any, error: z.ZodError) => {
  return res.status(400).json({ 
    message: "Invalid request parameters", 
    errors: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Get user progress
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      // Validate URL parameters
      const paramValidation = userIdSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return handleValidationError(res, paramValidation.error);
      }
      
      const { userId } = paramValidation.data;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Get progress by category
  app.get("/api/progress/:userId/:category", async (req, res) => {
    try {
      // Validate URL parameters
      const paramValidation = userIdCategorySchema.safeParse(req.params);
      if (!paramValidation.success) {
        return handleValidationError(res, paramValidation.error);
      }
      
      const { userId, category } = paramValidation.data;
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
      // Validate URL parameters
      const paramValidation = userIdSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return handleValidationError(res, paramValidation.error);
      }
      
      const { userId } = paramValidation.data;
      const sessions = await storage.getUserExerciseSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise sessions" });
    }
  });

  // Learning progress routes (for guided journey)
  app.get('/api/learning-progress/:userId', async (req, res) => {
    try {
      // Validate URL parameters
      const paramValidation = userIdSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return handleValidationError(res, paramValidation.error);
      }
      
      const { userId } = paramValidation.data;
      const progress = await storage.getUserLearningProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch learning progress' });
    }
  });

  app.post('/api/learning-progress', async (req, res) => {
    try {
      // Basic validation for learning progress data
      const learningProgressSchema = z.object({
        userId: z.string().uuid("Invalid user ID format"),
        stepId: z.number().int().min(1).max(7, "Step ID must be between 1 and 7"),
        section: z.enum(["learn", "practice", "test"], {
          errorMap: () => ({ message: "Section must be one of: learn, practice, test" })
        }),
        isCompleted: z.boolean(),
        score: z.number().int().min(0).max(100).optional(),
        attempts: z.number().int().min(0).optional()
      });
      
      const validation = learningProgressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid learning progress data", 
          errors: validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      
      const progressData = validation.data;
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
      // Validate URL parameters
      const paramValidation = userIdSchema.safeParse(req.params);
      if (!paramValidation.success) {
        return handleValidationError(res, paramValidation.error);
      }
      
      const { userId } = paramValidation.data;
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
      // Validate request body
      const createUserSchema = z.object({
        username: z.string()
          .min(1, "Name is required")
          .max(50, "Name must be less than 50 characters")
          .regex(/^[a-zA-Z0-9\s\-_]+$/, "Name can only contain letters, numbers, spaces, hyphens, and underscores")
          .transform(name => name.trim())
      });
      
      const validation = createUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid user data", 
          errors: validation.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        });
      }
      
      const { username } = validation.data;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ message: "This name is already taken" });
      }

      const user = await storage.createUser({ username, password: 'no-password' });
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
