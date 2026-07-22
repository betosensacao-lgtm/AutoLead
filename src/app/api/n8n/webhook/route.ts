import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { runLeadGraph } from "@/lib/langgraph";

export async function POST(request: Request) {
  try {
    // 1. Validar Segurança (Basic / Bearer Auth)
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Extrair Payload
    const reqBody = await request.json();
    console.log("[N8N PAYLOAD RECEBIDO]:", reqBody); 
    
    // Se o n8n mandar o objeto cru do Webhook, o dado real fica dentro de 'body'
    const data = reqBody.body ? reqBody.body : reqBody;

    // Tenta extrair da raiz (se o nó Set funcionou) ou do payload cru (fallback)
    const organizationId = reqBody.organizationId || data.organizationId || "org_default_123";
    const leadId = reqBody.leadId || data.email || "lead_desconhecido";
    const text = reqBody.text || `Origem: ${data.source}\nEmpresa: ${data.company_name}\nMensagem: ${data.message}`;
    const platform = reqBody.platform || "email";

    if (!organizationId || !text) {
      return NextResponse.json(
        { status: "error", message: "Missing required fields: organizationId and text" },
        { status: 400 }
      );
    }

    // 3. Injetar a mensagem (dado legado) no LangGraph
    const result = await runLeadGraph(
      {
        messages: [new HumanMessage(text)],
        organizationId: organizationId,
        platform: platform,
        leadId: leadId,
      },
      leadId // Usar o leadId como threadId para manter o estado persistente por Lead
    );

    // 4. Retornar resposta ao n8n
    return NextResponse.json({ 
      status: "ok", 
      message: "Lead processed by LangGraph",
      // Retornar o estado atualizado pro n8n poder tomar decisões
      leadData: result.leadData,
      score: result.score,
      stage: result.stage
    });

  } catch (error) {
    console.error("[N8N WEBHOOK ERROR]", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" }, 
      { status: 500 }
    );
  }
}
