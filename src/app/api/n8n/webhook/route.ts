import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runFlowGraph } from "@/lib/langgraph";
import { isWebhookAuthorized } from "@/lib/security/webhook-auth";
import { sanitizeInput, detectInjection } from "@/lib/security/guardrails";
import { webhookRequestSchema } from "@/lib/security/schemas";

export async function GET() {
  return NextResponse.json({ status: "ok", message: "n8n webhook endpoint ready" });
}

export async function POST(request: Request) {
  if (!isWebhookAuthorized(request)) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  try {
    const rawBody = await request.json();
    const parsed = webhookRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ status: "rejected" }, { status: 400 });
    }

    const sanitized = sanitizeInput(JSON.stringify(parsed.data));
    if (detectInjection(sanitized)) {
      return NextResponse.json({ status: "rejected" }, { status: 400 });
    }

    const result = await runFlowGraph({
      messages: [new HumanMessage(sanitized)],
    });

    const lastMsg = result.messages[result.messages.length - 1];

    return NextResponse.json({
      status: "success",
      reply: typeof lastMsg?.content === "string" ? lastMsg.content : "Execution logged",
    });
  } catch (error) {
    console.error("[N8N WEBHOOK ERROR]", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
