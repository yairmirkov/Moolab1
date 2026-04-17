import { pgTable, text, serial, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const parentsTable = pgTable("parents", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const childrenTable = pgTable("children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => parentsTable.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  pin: varchar("pin", { length: 4 }).notNull(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  ageGroup: varchar("age_group", { length: 10 }).notNull(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  bossWins: integer("boss_wins").notNull().default(0),
  moolies: integer("moolies").notNull().default(0),
  lessonsCompleted: integer("lessons_completed").notNull().default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParentSchema = createInsertSchema(parentsTable).omit({ id: true, createdAt: true });
export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parentsTable.$inferSelect;

export const insertChildSchema = createInsertSchema(childrenTable).omit({ id: true, createdAt: true });
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof childrenTable.$inferSelect;
