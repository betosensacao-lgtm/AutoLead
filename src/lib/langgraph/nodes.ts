import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { CHAT_MODEL, AI_BASE_URL, AI_API_KEY } from "@/lib/ai";
import { workflowTools } from "./tools";

function createModel(temperature = 0.2, maxTokens = 1024) {
  return new ChatOpenAI({
    model: CHAT_MODEL,
    temperature,
    maxTokens,
    configuration: { baseURL: AI_BASE_URL },
    apiKey: AI_API_KEY,
  } as any);
}

const FLOWAI_PROMPT = `Você é o assistente de IA da plataforma FlowAI.
Sua missão é ajudar o usuário a planejar, criar e automatizar fluxos de trabalho no n8n.

Quando o usuário pedir para criar um fluxo ou automação (ex: "Crie uma automação que recebe leads via Webhook e envia no Slack e HubSpot"):
1. Identifique o gatilho (Webhook, Agendador, Evento)
2. Identifique as integrações necessárias
3. Utilize a ferramenta 'create_n8n_workflow' para registrar a automação no sistema.

Responda sempre com clareza, em português do Brasil, apresentando os passos do fluxo de forma estruturada.`;

export async function workflowAgentNode(state: { messages: any[] }) {
  const model = createModel(0.2, 1024).bindTools(workflowTools);
  const messages = [
    new SystemMessage(FLOWAI_PROMPT),
    ...state.messages.slice(-6),
  ];

  try {
    const response = await model.invoke(messages);
    return { messages: [response] };
  } catch (err: any) {
    console.error("[FLOWAI AGENT ERROR]", err?.message ?? err);
    return {
      messages: [new AIMessage("Desculpe, ocorreu um erro ao processar sua solicitação de automação. Tente novamente.")],
    };
  }
}
