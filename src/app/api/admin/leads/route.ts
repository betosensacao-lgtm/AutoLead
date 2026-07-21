import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads } from "@/db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const organizationId = request.headers.get("x-organization-id");
  if (!organizationId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  const conditions = [eq(leads.organizationId, organizationId)];

  if (stage) {
    conditions.push(eq(leads.stage, stage as any));
  }

  if (search) {
    conditions.push(
      sql`(${like(leads.name, `%${search}%`)} OR ${like(leads.email, `%${search}%`)} OR ${like(leads.company, `%${search}%`)})`
    );
  }

  const result = await db
    .select()
    .from(leads)
    .where(and(...conditions))
    .orderBy(desc(leads.createdAt))
    .limit(limit)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(and(...conditions));

  return NextResponse.json({
    leads: result,
    total: Number(count),
    page,
    totalPages: Math.ceil(Number(count) / limit),
  });
}

export async function POST(request: Request) {
  const organizationId = request.headers.get("x-organization-id");
  if (!organizationId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const [lead] = await db
      .insert(leads)
      .values({
        organizationId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        company: body.company,
        role: body.role,
        stage: body.stage ?? "NEW",
        channel: body.channel ?? "web",
        notes: body.notes,
      } as any)
      .returning();

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[CREATE LEAD ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
