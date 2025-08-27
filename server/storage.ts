import { randomUUID } from "crypto";
import {
  users,
  progress,
  exerciseSessions,
  type User,
  type InsertUser,
  type Progress,
  type InsertProgress,
  type ExerciseSession,
  type InsertExerciseSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface LearningProgress {
  userId: string;
  stepId: number;
  section: 'learn' | 'practice' | 'test';
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
  attempts?: number;
}

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: 'no-password' }) // Simple name-only auth
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    return await db.select().from(progress).where(eq(progress.userId, userId));
  }

  async getProgressByCategory(userId: string, category: string): Promise<Progress[]> {
    return await db.select().from(progress).where(
      and(
        eq(progress.userId, userId), 
        eq(progress.category, category)
      )
    );
  }

  async getProgressItem(userId: string, category: string, itemName: string): Promise<Progress | undefined> {
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
    const [session] = await db
      .insert(exerciseSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async getUserExerciseSessions(userId: string): Promise<ExerciseSession[]> {
    return await db.select().from(exerciseSessions).where(eq(exerciseSessions.userId, userId));
  }

  // Learning journey progress (stored in memory for now, could be added to database later)
  private learningProgress: Map<string, LearningProgress> = new Map();

  async getUserLearningProgress(userId: string): Promise<LearningProgress[]> {
    return Array.from(this.learningProgress.values()).filter(p => p.userId === userId);
  }

  async updateLearningProgress(progressData: Partial<LearningProgress> & { userId: string; stepId: number; section: string }): Promise<LearningProgress> {
    const key = `${progressData.userId}-${progressData.stepId}-${progressData.section}`;
    const existing = this.learningProgress.get(key);
    
    const updated: LearningProgress = {
      userId: progressData.userId,
      stepId: progressData.stepId,
      section: progressData.section as 'learn' | 'practice' | 'test',
      isCompleted: progressData.isCompleted ?? false,
      completedAt: progressData.isCompleted ? new Date() : existing?.completedAt,
      score: progressData.score ?? existing?.score,
      attempts: (existing?.attempts ?? 0) + (progressData.attempts ?? 1),
    };
    
    this.learningProgress.set(key, updated);
    return updated;
  }
}

export const storage = new DatabaseStorage();