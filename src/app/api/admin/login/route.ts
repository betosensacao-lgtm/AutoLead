import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getUserByEmail, verifyPassword, createSessionToken, updateLastLogin, hashPassword } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await getUserByEmail(cleanEmail).catch(() => null);

    // Auto-seed the first admin only on a genuinely empty users table.
    if (!user) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      if (Number(count) === 0) {
        const passwordHash = await hashPassword(password);
        const [newUser] = await db
          .insert(users)
          .values({
            email: cleanEmail,
            name: cleanEmail.split("@")[0],
            role: "admin",
            passwordHash,
            active: true,
          } as any)
          .returning();
        user = newUser;
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash).catch(() => false);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await updateLastLogin(user.id).catch(() => null);

    const response = NextResponse.json({
      user: { id: user.id, name: user.name || cleanEmail, email: user.email, role: user.role },
    });

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
