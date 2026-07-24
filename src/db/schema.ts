import {
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgSchema,
} from "drizzle-orm/pg-core";

export const flowaiSchema = pgSchema("flowai");
export const pgTable = flowaiSchema.table;

// ─── Enums ───────────────────────────────────────────────

export const workflowStatus = flowaiSchema.enum("workflow_status", [
  "DRAFT",
  "ACTIVE",
  "PAUSED",
  "ARCHIVED",
]);

export const executionStatus = flowaiSchema.enum("execution_status", [
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
]);

export const triggerType = flowaiSchema.enum("trigger_type", [
  "WEBHOOK",
  "SCHEDULE",
  "EVENT",
  "MANUAL",
  "AI_AGENT",
]);

// ─── Tables ─────────────────────────────────────────────

export const workflows = pgTable("workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  n8nWorkflowId: varchar("n8n_workflow_id", { length: 100 }),
  triggerType: triggerType("trigger_type").default("WEBHOOK").notNull(),
  status: workflowStatus("status").default("ACTIVE").notNull(),
  nodesCount: integer("nodes_count").default(1).notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  definitionJson: jsonb("definition_json"),
  lastRunAt: timestamp("last_run_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .references(() => workflows.id, { onDelete: "cascade" })
    .notNull(),
  status: executionStatus("status").default("RUNNING").notNull(),
  durationMs: integer("duration_ms"),
  inputData: jsonb("input_data"),
  outputData: jsonb("output_data"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workflowTemplates = pgTable("workflow_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  iconName: varchar("icon_name", { length: 50 }).default("Workflow").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  n8nJson: jsonb("n8n_json").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("admin").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  active: boolean("active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
