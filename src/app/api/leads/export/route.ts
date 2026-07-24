import { NextRequest, NextResponse } from "next/server";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { leads, googleConnections } from "@/db/schema";
import { verifySessionToken } from "@/lib/auth";
import { getOAuthSheetsClient } from "@/lib/google";
import { createSpreadsheet, appendRows } from "@/lib/google/sheets";

export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get("admin_session");
    if (!cookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await verifySessionToken(cookie.value);

    const [connection] = await db
      .select()
      .from(googleConnections)
      .where(eq(googleConnections.userId, session.userId))
      .limit(1);

    if (!connection) {
      return NextResponse.json(
        { error: "Connect Google Sheets first in the sidebar" },
        { status: 400 }
      );
    }

    const allLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.organizationId, session.organizationId))
      .orderBy(desc(leads.createdAt));

    const sheets = await getOAuthSheetsClient({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      expiresAt: connection.expiresAt,
      scope: connection.scope,
      email: connection.email,
    });

    const spreadsheet = await createSpreadsheet(
      sheets,
      `Leads Export - ${new Date().toLocaleDateString("pt-BR")}`
    );

    const spreadsheetId = spreadsheet.spreadsheetId!;
    const headers = ["Name", "Email", "Phone", "Company", "Role", "Stage", "Score", "Category", "Channel", "Notes", "Created At"];
    const rows = allLeads.map((l) => [
      l.name || "",
      l.email || "",
      l.phone || "",
      l.company || "",
      l.role || "",
      l.stage,
      String(l.score),
      l.scoreCategory,
      l.channel,
      l.notes || "",
      l.createdAt?.toISOString() || "",
    ]);

    await appendRows(sheets, spreadsheetId, "A1:K1", [headers]);
    if (rows.length > 0) {
      await appendRows(sheets, spreadsheetId, "A2:K" + (rows.length + 1), rows);
    }

    return NextResponse.json({
      success: true,
      url: spreadsheet.spreadsheetUrl,
      totalExported: allLeads.length,
    });
  } catch (error) {
    console.error("[EXPORT LEADS ERROR]", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
