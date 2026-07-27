import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { workflows } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [wf] = await db.select().from(workflows).where(eq(workflows.id, id)).limit(1);

    if (!wf) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const n8nJson = wf.definitionJson || {
      name: wf.name,
      nodes: [
        {
          parameters: {},
          id: "1",
          name: "Webhook Trigger",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [250, 300],
        },
      ],
      connections: {},
      active: true,
      settings: { executionOrder: "v1" },
    };

    const fileName = `${(wf.name || "workflow").toLowerCase().replace(/[^a-z0-9]/g, "-")}.json`;

    return new NextResponse(JSON.stringify(n8nJson, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("[DOWNLOAD JSON ERROR]", error);
    return NextResponse.json({ error: "Failed to download JSON" }, { status: 500 });
  }
}
