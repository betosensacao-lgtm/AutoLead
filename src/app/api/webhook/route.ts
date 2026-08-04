import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runFlowGraph } from "@/lib/langgraph";
import { sanitizeInput, detectInjection } from "@/lib/security/guardrails";
import { isWebhookAuthorized } from "@/lib/security/webhook-auth";
import { webhookRequestSchema } from "@/lib/security/schemas";

export async function GET() {
  return NextResponse.json({ status: "FlowAI Webhook Receiver Ready", timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  if (!isWebhookAuthorized(request)) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const parsed = webhookRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ status: "rejected", reply: "Invalid payload." }, { status: 400 });
    }
    const body = parsed.data;
    const rawMessage: string = body.message || body.prompt || JSON.stringify(body);

    const sanitized = sanitizeInput(rawMessage);
    if (detectInjection(sanitized)) {
      return NextResponse.json({ status: "rejected", reply: "Sorry, I cannot process that message." }, { status: 400 });
    }

    const result = await runFlowGraph({
      messages: [new HumanMessage(sanitized)],
    });

    const lastMsg = result.messages[result.messages.length - 1];

    return NextResponse.json({
      status: "ok",
      reply: typeof lastMsg?.content === "string" ? lastMsg.content : "OK",
    });
  } catch (error) {
    console.error("[FLOWAI WEBHOOK ERROR]", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
