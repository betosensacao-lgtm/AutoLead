import { NextResponse } from "next/server";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { desc } from "drizzle-orm";
import { n8nClient } from "@/lib/n8n/client";

export async function GET() {
  try {
    const list = await db.select().from(workflows).orderBy(desc(workflows.createdAt));
    return NextResponse.json(list);
  } catch (error) {
    console.error("[WORKFLOWS GET ERROR]", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, triggerType, nodes } = body;

    const n8nWf = await n8nClient.createWorkflow(name || "Novo Workflow", nodes || [], {});

    const [created] = await db
      .insert(workflows)
      .values({
        name: name || "Novo Workflow FlowAI",
        description: description || "Criado via FlowAI Studio",
        n8nWorkflowId: n8nWf.id,
        triggerType: triggerType || "WEBHOOK",
        status: "ACTIVE",
        nodesCount: (nodes || []).length || 1,
      } as any)
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("[WORKFLOWS POST ERROR]", error);
    return NextResponse.json({ error: "Failed to create workflow" }, { status: 500 });
  }
}
