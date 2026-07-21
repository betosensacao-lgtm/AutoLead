import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runLeadGraph } from "@/lib/langgraph";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token === expectedToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) {
      return NextResponse.json({ status: "ignored" });
    }

    const messages = value.messages ?? [];
    const metadata = value.metadata ?? {};

    for (const msg of messages) {
      if (msg.type === "text") {
        const phoneNumber = msg.from;
        const orgId = metadata.organization_id;

        if (!orgId) continue;

        await runLeadGraph(
          {
            messages: [new HumanMessage(msg.text.body)],
            organizationId: orgId,
            platform: "whatsapp",
          },
          phoneNumber
        );
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[WEBHOOK ERROR]", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
