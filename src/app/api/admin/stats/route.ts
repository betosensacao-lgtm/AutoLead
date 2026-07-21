import { NextResponse } from "next/server";
import { db } from "@/db";
import { leads, leadMessages } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export async function GET(request: Request) {
  const organizationId = request.headers.get("x-organization-id");
  if (!organizationId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(eq(leads.organizationId, organizationId));

  const [todayLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(
      and(eq(leads.organizationId, organizationId), gte(leads.createdAt, today))
    );

  const [hotLeads] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(
      and(
        eq(leads.organizationId, organizationId),
        eq(leads.scoreCategory, "HOT")
      )
    );

  const [totalMessages] = await db
    .select({ count: sql<number>`count(*)` })
    .from(leadMessages);

  const stageDistribution = await db
    .select({
      stage: leads.stage,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .where(eq(leads.organizationId, organizationId))
    .groupBy(leads.stage);

  const channelDistribution = await db
    .select({
      channel: leads.channel,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .where(eq(leads.organizationId, organizationId))
    .groupBy(leads.channel);

  const avgScore = await db
    .select({ avg: sql<number>`avg(${leads.score})` })
    .from(leads)
    .where(eq(leads.organizationId, organizationId));

  return NextResponse.json({
    totalLeads: Number(totalLeads.count),
    todayLeads: Number(todayLeads.count),
    hotLeads: Number(hotLeads.count),
    totalMessages: Number(totalMessages.count),
    avgScore: Math.round(Number(avgScore[0]?.avg ?? 0)),
    stageDistribution: stageDistribution.map((s) => ({
      stage: s.stage,
      count: Number(s.count),
    })),
    channelDistribution: channelDistribution.map((c) => ({
      channel: c.channel,
      count: Number(c.count),
    })),
  });
}
