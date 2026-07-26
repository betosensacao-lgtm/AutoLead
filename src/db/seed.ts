import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hashPassword } from "@/lib/auth";
import { users, workflowExecutions } from "./schema";

config({ path: ".env.local" });

async function run() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not configured");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  console.log("Creating FlowAI seed data...");

  const passwordHash = await hashPassword("SYf3KZh8QV@rCUMv");

  await db.insert(users).values({
    email: "admin@flowai.dev",
    name: "FlowAI Admin",
    role: "admin",
    passwordHash,
  } as any).onConflictDoNothing();

  await db.insert(workflowExecutions).values({
    workflowId: "n8n-wf-001",
    workflowName: "HubSpot & Slack Lead Integration",
    status: "COMPLETED",
    executionTimeMs: 450,
    triggeredBy: "Webhook Trigger",
    outputData: { leadCount: 1, status: "sent" },
  } as any);

  console.log("FlowAI Seed completed!");
  console.log("Admin: admin@flowai.dev / SYf3KZh8QV@rCUMv");

  await client.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
