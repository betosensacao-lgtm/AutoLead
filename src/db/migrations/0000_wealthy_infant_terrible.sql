CREATE TYPE "public"."interaction_type" AS ENUM('message', 'qualification', 'followup', 'notification', 'conversion');--> statement-breakpoint
CREATE TYPE "public"."lead_channel" AS ENUM('web', 'whatsapp', 'email');--> statement-breakpoint
CREATE TYPE "public"."lead_score_category" AS ENUM('COLD', 'WARM', 'HOT');--> statement-breakpoint
CREATE TYPE "public"."lead_stage" AS ENUM('NEW', 'CAPTURED', 'QUALIFYING', 'QUALIFIED', 'NURTURING', 'HOT', 'CONVERTED', 'LOST');--> statement-breakpoint
CREATE TABLE "lead_interactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" "interaction_type" NOT NULL,
	"summary" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"channel" "lead_channel",
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"phone" varchar(30),
	"company" varchar(255),
	"role" varchar(255),
	"stage" "lead_stage" DEFAULT 'NEW' NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"score_category" "lead_score_category" DEFAULT 'COLD' NOT NULL,
	"channel" "lead_channel" DEFAULT 'web' NOT NULL,
	"notes" text,
	"metadata" jsonb,
	"converted_at" timestamp,
	"last_interaction_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nurturing_sequences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"trigger_stage" "lead_stage" DEFAULT 'QUALIFYING',
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nurturing_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sequence_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"delay_hours" integer NOT NULL,
	"channel" "lead_channel" DEFAULT 'email' NOT NULL,
	"subject" varchar(255),
	"content" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"whatsapp_phone_number_id" varchar(50),
	"whatsapp_access_token" text,
	"email_from" varchar(255),
	"sales_email" varchar(255),
	"crm_webhook_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "qualification_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"question" text NOT NULL,
	"field" varchar(50),
	"weight" integer DEFAULT 1 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "autolead_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'agent' NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "autolead_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_messages" ADD CONSTRAINT "lead_messages_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nurturing_sequences" ADD CONSTRAINT "nurturing_sequences_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nurturing_steps" ADD CONSTRAINT "nurturing_steps_sequence_id_nurturing_sequences_id_fk" FOREIGN KEY ("sequence_id") REFERENCES "public"."nurturing_sequences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qualification_criteria" ADD CONSTRAINT "qualification_criteria_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "autolead_users" ADD CONSTRAINT "autolead_users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;