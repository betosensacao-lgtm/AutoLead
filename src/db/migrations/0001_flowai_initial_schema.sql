CREATE SCHEMA "flowai";
--> statement-breakpoint
CREATE TYPE "flowai"."workflow_status" AS ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "flowai"."execution_status" AS ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "flowai"."trigger_type" AS ENUM('WEBHOOK', 'SCHEDULE', 'EVENT', 'MANUAL', 'AI_AGENT');--> statement-breakpoint
CREATE TABLE "flowai"."workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"n8n_workflow_id" varchar(100),
	"trigger_type" "flowai"."trigger_type" DEFAULT 'WEBHOOK' NOT NULL,
	"status" "flowai"."workflow_status" DEFAULT 'ACTIVE' NOT NULL,
	"nodes_count" integer DEFAULT 1 NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"definition_json" jsonb,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowai"."workflow_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"status" "flowai"."execution_status" DEFAULT 'RUNNING' NOT NULL,
	"duration_ms" integer,
	"input_data" jsonb,
	"output_data" jsonb,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flowai"."workflow_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"icon_name" varchar(50) DEFAULT 'Workflow' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"n8n_json" jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "flowai"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'admin' NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "flowai"."workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "flowai"."workflows"("id") ON DELETE cascade ON UPDATE no action;
