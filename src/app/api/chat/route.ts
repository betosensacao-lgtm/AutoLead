import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runLeadGraph } from "@/lib/langgraph";
import { sanitizeInput, detectInjection } from "@/lib/security/guardrails";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 30) return false;

  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, organizationId } = body;

    if (!message || !organizationId) {
      return NextResponse.json(
        { error: "message and organizationId are required" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in 1 minute." },
        { status: 429 }
      );
    }

    const sanitized = sanitizeInput(message);
    if (detectInjection(sanitized)) {
      return NextResponse.json({
        reply: "Sorry, I cannot process that message.",
        sessionId: sessionId ?? crypto.randomUUID(),
      });
    }

    const result = await runLeadGraph(
      {
        messages: [new HumanMessage(sanitized)],
        organizationId,
        platform: "web",
      },
      sessionId
    );

    const lastMessage = result.messages[result.messages.length - 1];
    const reply = typeof lastMessage?.content === "string" ? lastMessage.content : "";

    return NextResponse.json({
      reply,
      sessionId: sessionId ?? crypto.randomUUID(),
      stage: result.stage,
      score: result.score,
    });
  } catch (error) {
    console.error("[CHAT ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
