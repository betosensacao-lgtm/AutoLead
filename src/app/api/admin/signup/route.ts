import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { organizations, users, qualificationCriteria } from "@/db/schema";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { name, email, password, company } = await request.json();

    if (!name || !email || !password || !company) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const slug = slugify(company);

    const [org] = await db
      .insert(organizations)
      .values({
        name: company,
        slug,
        emailFrom: `contact@${slug}.com`,
        salesEmail: `sales@${slug}.com`,
      } as any)
      .returning();

    const passwordHash = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({
        organizationId: org.id,
        email,
        name,
        role: "admin",
        passwordHash,
      } as any)
      .returning();

    const defaultCriteria = [
      { question: "Do you have budget available to invest?", field: "budget", weight: 30 },
      { question: "Are you the person responsible for the decision?", field: "authority", weight: 25 },
      { question: "What is the main need you need to solve?", field: "need", weight: 25 },
      { question: "What is the timeline for implementation?", field: "timeline", weight: 20 },
    ];

    for (let i = 0; i < defaultCriteria.length; i++) {
      await db.insert(qualificationCriteria).values({
        organizationId: org.id,
        question: defaultCriteria[i].question,
        field: defaultCriteria[i].field,
        weight: defaultCriteria[i].weight,
        order: i,
      } as any);
    }

    const token = await createSessionToken({
      userId: user.id,
      organizationId: org.id,
      email: user.email,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("[SIGNUP ERROR]", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
