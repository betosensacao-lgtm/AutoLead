import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runFlowGraph } from "@/lib/langgraph";

export async function GET() {
  return NextResponse.json({ status: "ok", message: "n8n webhook endpoint ready" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await runFlowGraph({
      messages: [new HumanMessage(JSON.stringify(body))],
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
