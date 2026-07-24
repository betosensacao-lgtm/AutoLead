import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/admin/dashboard", "http://localhost:3000"));
}
