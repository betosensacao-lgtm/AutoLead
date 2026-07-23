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

export const autoleadSchema = pgSchema("autolead");
export const pgTable = autoleadSchema.table;

// ─── Enums ───────────────────────────────────────────────

export const leadStage = autoleadSchema.enum("lead_stage", [
  "NEW",
  "CAPTURED",
  "QUALIFYING",
  "QUALIFIED",
  "NURTURING",
  "HOT",
  "CONVERTED",
  "LOST",
]);

export const leadScoreCategory = autoleadSchema.enum("lead_score_category", [
  "COLD",
  "WARM",
  "HOT",
]);

export const leadChannel = autoleadSchema.enum("lead_channel", [
  "web",
  "whatsapp",
  "email",
]);

export const interactionType = autoleadSchema.enum("interaction_type", [
  "message",
  "qualification",
  "followup",
  "notification",
  "conversion",
]);

// ─── Tabelas ─────────────────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  whatsappPhoneNumberId: varchar("whatsapp_phone_number_id", { length: 50 }),
  whatsappAccessToken: text("whatsapp_access_token"),
  emailFrom: varchar("email_from", { length: 255 }),
  salesEmail: varchar("sales_email", { length: 255 }),
  crmWebhookUrl: varchar("crm_webhook_url", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  company: varchar("company", { length: 255 }),
  role: varchar("role", { length: 255 }),
  stage: leadStage("stage").default("NEW").notNull(),
  score: integer("score").default(0).notNull(),
  scoreCategory: leadScoreCategory("score_category")
    .default("COLD")
    .notNull(),
  channel: leadChannel("channel").default("web").notNull(),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  convertedAt: timestamp("converted_at"),
  lastInteractionAt: timestamp("last_interaction_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadMessages = pgTable("lead_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .references(() => leads.id)
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  channel: leadChannel("channel"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadInteractions = pgTable("lead_interactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .references(() => leads.id)
    .notNull(),
  type: interactionType("type").notNull(),
  summary: text("summary"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const qualificationCriteria = pgTable("qualification_criteria", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  question: text("question").notNull(),
  field: varchar("field", { length: 50 }),
  weight: integer("weight").default(1).notNull(),
  enabled: boolean("enabled").default(true).notNull(),
  order: integer("order").default(0).notNull(),
});

export const nurturingSequences = pgTable("nurturing_sequences", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  triggerStage: leadStage("trigger_stage").default("QUALIFYING"),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nurturingSteps = pgTable("nurturing_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  sequenceId: uuid("sequence_id")
    .references(() => nurturingSequences.id)
    .notNull(),
  order: integer("order").notNull(),
  delayHours: integer("delay_hours").notNull(),
  channel: leadChannel("channel").default("email").notNull(),
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
});

export const users = pgTable("autolead_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id")
    .references(() => organizations.id)
    .notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).default("agent").notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  active: boolean("active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Relations ───────────────────────────────────────────

export const leadRelations = {
  organization: {
    tableName: "organizations",
    fields: [leads.organizationId],
    references: [organizations.id],
  },
  messages: {
    tableName: "lead_messages",
    fields: [leads.id],
    references: [leadMessages.leadId],
  },
  interactions: {
    tableName: "lead_interactions",
    fields: [leads.id],
    references: [leadInteractions.leadId],
  },
};
