import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { hashPassword } from "@/lib/auth";
import {
  organizations,
  users,
  qualificationCriteria,
  nurturingSequences,
  nurturingSteps,
} from "./schema";

config({ path: ".env.local" });

async function run() {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not configured");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  console.log("Creating seed data...");

  const [org] = await db
    .insert(organizations)
    .values({
      name: process.env.DEFAULT_ORG_NAME ?? "My Company",
      slug: process.env.DEFAULT_ORG_SLUG ?? "my-company",
      emailFrom: "contact@mycompany.com",
      salesEmail: "sales@mycompany.com",
    } as any)
    .returning();

  const passwordHash = await hashPassword("SYf3KZh8QV@rCUMv");

  await db.insert(users).values({
    organizationId: org.id,
    email: "admin@mycompany.com",
    name: "Admin",
    role: "admin",
    passwordHash,
  } as any);

  await db.insert(users).values({
    organizationId: org.id,
    email: "sales@mycompany.com",
    name: "Sales Rep",
    role: "agent",
    passwordHash,
  } as any);

  const criteria = [
    { question: "Do you have budget available to invest?", field: "budget", weight: 30 },
    { question: "Are you the decision maker?", field: "authority", weight: 25 },
    { question: "What need are you trying to solve?", field: "need", weight: 25 },
    { question: "What is the implementation timeline?", field: "timeline", weight: 20 },
  ];

  for (let i = 0; i < criteria.length; i++) {
    await db.insert(qualificationCriteria).values({
      organizationId: org.id,
      question: criteria[i].question,
      field: criteria[i].field,
      weight: criteria[i].weight,
      order: i,
    } as any);
  }

  const [seq] = await db
    .insert(nurturingSequences)
    .values({
      organizationId: org.id,
      name: "Standard follow-up",
      triggerStage: "QUALIFYING",
    } as any)
    .returning();

  const steps = [
    { order: 1, delayHours: 24, subject: "Thanks for reaching out!", content: "Hi {{name}}, thanks for contacting us. Do you have any additional questions about our services?" },
    { order: 2, delayHours: 72, subject: "Still thinking?", content: "Hi {{name}}, we noticed you haven't confirmed yet. Can we help with more information?" },
    { order: 3, delayHours: 168, subject: "Last chance!", content: "Hi {{name}}, this is our last automated contact. If you change your mind, we're here to help." },
  ];

  for (const step of steps) {
    await db.insert(nurturingSteps).values({
      sequenceId: seq.id,
      ...step,
    } as any);
  }

  console.log("Seed completed!");
  console.log(`Organization: ${org.slug}`);
  console.log("Admin: admin@mycompany.com / SYf3KZh8QV@rCUMv");

  await client.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
