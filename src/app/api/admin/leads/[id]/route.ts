import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, leadMessages, leadInteractions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const organizationId = request.headers.get("x-organization-id");
  const { id } = await params;

  if (!organizationId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.id, id));

  if (!lead || lead.organizationId !== organizationId) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const messages = await db
    .select()
    .from(leadMessages)
    .where(eq(leadMessages.leadId, id))
    .orderBy(desc(leadMessages.createdAt))
    .limit(100);

  const interactions = await db
    .select()
    .from(leadInteractions)
    .where(eq(leadInteractions.leadId, id))
    .orderBy(desc(leadInteractions.createdAt))
    .limit(50);

  return NextResponse.json({ lead, messages, interactions });
}
