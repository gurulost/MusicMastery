import { type User, type InsertUser, type Progress, type InsertProgress, type ExerciseSession, type InsertExerciseSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Progress methods
  getUserProgress(userId: string): Promise<Progress[]>;
  getProgressByCategory(userId: string, category: string): Promise<Progress[]>;
  getProgressItem(userId: string, category: string, itemName: string): Promise<Progress | undefined>;
  upsertProgress(progress: InsertProgress): Promise<Progress>;
  
  // Exercise session methods
  createExerciseSession(session: InsertExerciseSession): Promise<ExerciseSession>;
  getUserExerciseSessions(userId: string): Promise<ExerciseSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private progress: Map<string, Progress>;
  private exerciseSessions: Map<string, ExerciseSession>;

  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.exerciseSessions = new Map();
    
    // Create a default user for demo purposes
    const defaultUser: User = {
      id: "demo-user",
      username: "student",
      password: "password123"
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUserProgress(userId: string): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async getProgressByCategory(userId: string, category: string): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter(
      p => p.userId === userId && p.category === category
    );
  }

  async getProgressItem(userId: string, category: string, itemName: string): Promise<Progress | undefined> {
    return Array.from(this.progress.values()).find(
      p => p.userId === userId && p.category === category && p.itemName === itemName
    );
  }

  async upsertProgress(insertProgress: InsertProgress): Promise<Progress> {
    const existing = await this.getProgressItem(
      insertProgress.userId,
      insertProgress.category,
      insertProgress.itemName
    );

    if (existing) {
      const updated: Progress = {
        ...existing,
        ...insertProgress,
        lastPracticed: new Date(),
      };
      this.progress.set(existing.id, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: Progress = {
        ...insertProgress,
        id,
        lastPracticed: new Date(),
        masteredAt: insertProgress.status === 'mastered' ? new Date() : null,
      };
      this.progress.set(id, newProgress);
      return newProgress;
    }
  }

  async createExerciseSession(insertSession: InsertExerciseSession): Promise<ExerciseSession> {
    const id = randomUUID();
    const session: ExerciseSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.exerciseSessions.set(id, session);
    return session;
  }

  async getUserExerciseSessions(userId: string): Promise<ExerciseSession[]> {
    return Array.from(this.exerciseSessions.values()).filter(s => s.userId === userId);
  }
}

export const storage = new MemStorage();
