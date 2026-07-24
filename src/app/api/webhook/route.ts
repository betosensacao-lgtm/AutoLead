import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runFlowGraph } from "@/lib/langgraph";

export async function GET() {
  return NextResponse.json({ status: "FlowAI Webhook Receiver Ready", timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message || body.prompt || JSON.stringify(body);

    const result = await runFlowGraph({
      messages: [new HumanMessage(message)],
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
