import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(), // 'major_scales', 'minor_scales', 'intervals'
  itemName: text("item_name").notNull(), // e.g., 'C Major', 'Perfect 4th'
  status: text("status").notNull().default('not_started'), // 'not_started', 'in_progress', 'mastered'
  attempts: integer("attempts").notNull().default(0),
  correctAnswers: integer("correct_answers").notNull().default(0),
  lastPracticed: timestamp("last_practiced"),
  masteredAt: timestamp("mastered_at"),
});

export const exerciseSessions = pgTable("exercise_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  userAnswer: jsonb("user_answer"), // stores the sequence of notes played
  correctAnswer: jsonb("correct_answer"),
  timeToComplete: integer("time_to_complete"), // in seconds
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const learningProgress = pgTable("learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  stepId: integer("step_id").notNull(),
  section: text("section").notNull(), // 'learn', 'practice', 'test'
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  score: integer("score"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
});

export const insertExerciseSessionSchema = createInsertSchema(exerciseSessions).omit({
  id: true,
  createdAt: true,
});

export const insertLearningProgressSchema = createInsertSchema(learningProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type ExerciseSession = typeof exerciseSessions.$inferSelect;
export type InsertExerciseSession = z.infer<typeof insertExerciseSessionSchema>;
export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;

// Music theory types
export type ScaleType = 'major' | 'minor';
export type IntervalType = 'Perfect Unison' | 'Minor 2nd' | 'Major 2nd' | 'Minor 3rd' | 'Major 3rd' | 
  'Perfect 4th' | 'Tritone' | 'Perfect 5th' | 'Minor 6th' | 'Major 6th' | 'Minor 7th' | 'Major 7th' | 'Perfect Octave';

export type Note = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B' | 'Bb' | 'Eb' | 'Ab' | 'Db' | 'Gb';

// New structured scale definition
export interface ScaleDefinition {
  tonic: Note;
  type: ScaleType;
  accidentals: number; // negative for flats, positive for sharps
  order: number; // circle of fifths order
}

// New structured interval definition with educational data
export interface IntervalDefinition {
  name: IntervalType;
  semitones: number;
  shortName: string;
  explanation: string;
  learningTip: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Scale {
  name: string;
  type: ScaleType;
  tonic: Note;
  notes: Note[];
  sharps: Note[];
  flats: Note[];
}

export interface Interval {
  name: IntervalType;
  semitones: number;
  shortName: string;
}

// Exercise data structure (type-safe alternative to string parsing)
export interface ExerciseData {
  category: 'major_scales' | 'minor_scales' | 'intervals';
  tonic: Note;
  type?: ScaleType;
  intervalType?: IntervalType;
  displayName: string;
  correctNotes: Note[];
  startNote?: Note; // for intervals
}
