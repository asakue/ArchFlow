import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Организации
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

// Пользователи системы
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  avatar: text("avatar"),
  role: text("role").notNull().default("user"),
  organizationId: integer("organization_id").references(() => organizations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Проекты и шаблоны решений
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // Уникальный код проекта/шаблона (MS-ARCH-2023)
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "project" или "template"
  status: text("status").notNull(), // "active", "review", "approved", "needsWork", "archived"
  responsibleUserId: integer("responsible_user_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

// Архитектурные артефакты
export const artifacts = pgTable("artifacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // тип артефакта: "document", "diagram", "model", "code", etc.
  content: text("content"), // содержимое артефакта или ссылка на него
  projectId: integer("project_id").references(() => projects.id),
  version: text("version").notNull(),
  userId: integer("user_id").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertArtifactSchema = createInsertSchema(artifacts).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

// Активности в системе
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(), // "create", "update", "delete", "approve", "reject"
  entityType: text("entity_type").notNull(), // "project", "artifact", etc.
  entityId: integer("entity_id").notNull(),
  details: json("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Стандарты и соответствие
export const standards = pgTable("standards", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // "security", "integration", "performance", etc.
  criteria: json("criteria"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStandardSchema = createInsertSchema(standards).omit({
  id: true,
  createdAt: true,
});

// Соответствие проектов стандартам
export const compliance = pgTable("compliance", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  standardId: integer("standard_id").references(() => standards.id),
  score: integer("score").notNull(), // 0-100%
  details: json("details"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertComplianceSchema = createInsertSchema(compliance).omit({
  id: true,
  updatedAt: true,
});

// Экспортируем типы
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Artifact = typeof artifacts.$inferSelect;
export type InsertArtifact = z.infer<typeof insertArtifactSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Standard = typeof standards.$inferSelect;
export type InsertStandard = z.infer<typeof insertStandardSchema>;

export type Compliance = typeof compliance.$inferSelect;
export type InsertCompliance = z.infer<typeof insertComplianceSchema>;