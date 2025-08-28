import { randomUUID } from "crypto";
import {
  users,
  progress,
  exerciseSessions,
  learningProgress,
  type User,
  type InsertUser,
  type Progress,
  type InsertProgress,
  type ExerciseSession,
  type InsertExerciseSession,
  type LearningProgress,
  type InsertLearningProgress,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";


export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Progress methods
  getUserProgress(userId: string): Promise<Progress[]>;
  getProgressByCategory(userId: string, category: string): Promise<Progress[]>;
  getProgressItem(userId: string, category: string, itemName: string): Promise<Progress | undefined>;
  upsertProgress(progress: InsertProgress): Promise<Progress>;
  
  // Exercise session methods
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getUserExerciseSessions(userId: string): Promise<ExerciseSession[]>;
  
  // Learning journey progress methods
  getUserLearningProgress(userId: string): Promise<LearningProgress[]>;
  updateLearningProgress(progress: Partial<LearningProgress> & { userId: string; stepId: number; section: string }): Promise<LearningProgress>;
}

// In-memory storage implementation for development
export class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private progress: Progress[] = [];
  private exerciseSessions: ExerciseSession[] = [];
  private learningProgress: LearningProgress[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: randomUUID(),
      username: insertUser.username,
      password: 'no-password',
    };
    this.users.push(user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return [...this.users];
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    return this.progress.filter(p => p.userId === userId);
  }

  async getProgressByCategory(userId: string, category: string): Promise<Progress[]> {
    return this.progress.filter(p => p.userId === userId && p.category === category);
  }

  async getProgressItem(userId: string, category: string, itemName: string): Promise<Progress | undefined> {
    return this.progress.find(p => 
      p.userId === userId && 
      p.category === category && 
      p.itemName === itemName
    );
  }

  async upsertProgress(insertProgress: InsertProgress): Promise<Progress> {
    const existingIndex = this.progress.findIndex(p => 
      p.userId === insertProgress.userId &&
      p.category === insertProgress.category &&
      p.itemName === insertProgress.itemName
    );

    if (existingIndex !== -1) {
      const updated: Progress = {
        ...this.progress[existingIndex],
        ...insertProgress,
        lastPracticed: new Date(),
        masteredAt: insertProgress.status === 'mastered' ? new Date() : this.progress[existingIndex].masteredAt,
      };
      this.progress[existingIndex] = updated;
      return updated;
    } else {
      const newProgress: Progress = {
        id: randomUUID(),
        userId: insertProgress.userId,
        category: insertProgress.category,
        itemName: insertProgress.itemName,
        status: insertProgress.status ?? 'not_started',
        attempts: insertProgress.attempts ?? 0,
        correctAnswers: insertProgress.correctAnswers ?? 0,
        lastPracticed: new Date(),
        masteredAt: insertProgress.status === 'mastered' ? new Date() : null,
      };
      this.progress.push(newProgress);
      return newProgress;
    }
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const session: ExerciseSession = {
      id: randomUUID(),
      userId: insertSession.userId,
      category: insertSession.category,
      itemName: insertSession.itemName,
      isCorrect: insertSession.isCorrect,
      userAnswer: insertSession.userAnswer ?? null,
      correctAnswer: insertSession.correctAnswer ?? null,
      timeToComplete: insertSession.timeToComplete ?? null,
      createdAt: new Date(),
    };
    this.exerciseSessions.push(session);
    return session;
  }

  async getUserExerciseSessions(userId: string): Promise<ExerciseSession[]> {
    return this.exerciseSessions.filter(s => s.userId === userId);
  }

  async getUserLearningProgress(userId: string): Promise<LearningProgress[]> {
    return this.learningProgress.filter(lp => lp.userId === userId);
  }

  async updateLearningProgress(progressData: Partial<LearningProgress> & { userId: string; stepId: number; section: string }): Promise<LearningProgress> {
    const existingIndex = this.learningProgress.findIndex(lp => 
      lp.userId === progressData.userId &&
      lp.stepId === progressData.stepId &&
      lp.section === progressData.section
    );

    if (existingIndex !== -1) {
      const existing = this.learningProgress[existingIndex];
      const updated: LearningProgress = {
        ...existing,
        isCompleted: progressData.isCompleted ?? existing.isCompleted,
        completedAt: progressData.isCompleted ? new Date() : existing.completedAt,
        score: progressData.score ?? existing.score,
        attempts: existing.attempts + 1,
        updatedAt: new Date(),
      };
      this.learningProgress[existingIndex] = updated;
      return updated;
    } else {
      const newProgress: LearningProgress = {
        id: randomUUID(),
        userId: progressData.userId,
        stepId: progressData.stepId,
        section: progressData.section,
        isCompleted: progressData.isCompleted ?? false,
        completedAt: progressData.isCompleted ? new Date() : null,
        score: progressData.score ?? null,
        attempts: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.learningProgress.push(newProgress);
      return newProgress;
    }
  }
}

export class DatabaseStorage implements IStorage {
  private _db: any = null;
  
  private async getDb() {
    if (!this._db) {
      try {
        const { db } = await import("./db.js");
        this._db = db;
      } catch (error) {
        throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    return this._db;
  }

  async getUser(id: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const db = await this.getDb();
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const db = await this.getDb();
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: 'no-password' }) // Simple name-only auth
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const db = await this.getDb();
    return await db.select().from(users);
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    const db = await this.getDb();
    return await db.select().from(progress).where(eq(progress.userId, userId));
  }

  async getProgressByCategory(userId: string, category: string): Promise<Progress[]> {
    const db = await this.getDb();
    return await db.select().from(progress).where(
      and(
        eq(progress.userId, userId), 
        eq(progress.category, category)
      )
    );
  }

  async getProgressItem(userId: string, category: string, itemName: string): Promise<Progress | undefined> {
    const db = await this.getDb();
    const [item] = await db.select().from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.category, category),
          eq(progress.itemName, itemName)
        )
      );
    return item || undefined;
  }

  async upsertProgress(insertProgress: InsertProgress): Promise<Progress> {
    const existing = await this.getProgressItem(
      insertProgress.userId,
      insertProgress.category,
      insertProgress.itemName
    );

    const db = await this.getDb();
    if (existing) {
      const [updated] = await db
        .update(progress)
        .set({
          ...insertProgress,
          lastPracticed: new Date(),
          masteredAt: insertProgress.status === 'mastered' ? new Date() : existing.masteredAt
        })
        .where(eq(progress.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(progress)
        .values({
          ...insertProgress,
          lastPracticed: new Date(),
          masteredAt: insertProgress.status === 'mastered' ? new Date() : null,
        })
        .returning();
      return newProgress;
    }
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const db = await this.getDb();
    const [session] = await db
      .insert(exerciseSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getUserExerciseSessions(userId: string): Promise<ExerciseSession[]> {
    const db = await this.getDb();
    return await db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId));
  }

  // Learning journey progress methods
  async getUserLearningProgress(userId: string): Promise<LearningProgress[]> {
    const db = await this.getDb();
    return await db.select().from(learningProgress).where(eq(learningProgress.userId, userId));
  }

  async updateLearningProgress(progressData: Partial<LearningProgress> & { userId: string; stepId: number; section: string }): Promise<LearningProgress> {
    const db = await this.getDb();
    const existing = await db.select().from(learningProgress)
      .where(and(
        eq(learningProgress.userId, progressData.userId),
        eq(learningProgress.stepId, progressData.stepId),
        eq(learningProgress.section, progressData.section)
      ));

    if (existing.length > 0) {
      // Update existing record
      const [updated] = await db
        .update(learningProgress)
        .set({
          isCompleted: progressData.isCompleted ?? existing[0].isCompleted,
          completedAt: progressData.isCompleted ? new Date() : existing[0].completedAt,
          score: progressData.score ?? existing[0].score,
          attempts: existing[0].attempts + 1,
          updatedAt: new Date(),
        })
        .where(eq(learningProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [newProgress] = await db
        .insert(learningProgress)
        .values({
          userId: progressData.userId,
          stepId: progressData.stepId,
          section: progressData.section,
          isCompleted: progressData.isCompleted ?? false,
          completedAt: progressData.isCompleted ? new Date() : null,
          score: progressData.score,
          attempts: 1,
        })
        .returning();
      return newProgress;
    }
  }
}

// Conditional storage selection based on environment
function createStorage(): IStorage {
  if (process.env.DATABASE_URL) {
    try {
      // Return DatabaseStorage which uses lazy loading via private getter
      // This avoids importing db at module level and allows proper fallback
      return new DatabaseStorage();
    } catch (error) {
      console.warn("Database connection failed, falling back to in-memory storage:", error);
      return new InMemoryStorage();
    }
  } else {
    console.log("No DATABASE_URL found, using in-memory storage for development");
    return new InMemoryStorage();
  }
}

export const storage = createStorage();