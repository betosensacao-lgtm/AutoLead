export const maxDuration = 60;

import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runFlowGraph } from "@/lib/langgraph";
import { sanitizeInput, detectInjection } from "@/lib/security/guardrails";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "message parameter is required" },
        { status: 400 }
      );
    }

    const sanitized = sanitizeInput(message);
    if (detectInjection(sanitized)) {
      return NextResponse.json({
        reply: "Sorry, I cannot process that message.",
        sessionId: sessionId ?? crypto.randomUUID(),
      });
    }

    const result = await runFlowGraph(
      {
        messages: [new HumanMessage(sanitized)],
      },
      sessionId
    );

    const lastMessage = result.messages[result.messages.length - 1];
    const reply = typeof lastMessage?.content === "string" ? lastMessage.content : "Workflow processado com sucesso.";

    return NextResponse.json({
      reply,
      sessionId: sessionId ?? crypto.randomUUID(),
    });
  } catch (error) {
    console.error("[FLOWAI CHAT ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
