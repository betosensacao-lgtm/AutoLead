import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { CHAT_MODEL, AI_BASE_URL, AI_API_KEY } from "@/lib/ai";
import { workflowTools, executeToolCalls } from "./tools";

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
3. OBRIGATORIAMENTE execute a ferramenta 'create_n8n_workflow' para registrar a automação e gerar o JSON no sistema.

Responda sempre com clareza, em português do Brasil, confirmando que o workflow foi gerado e está disponível no Painel Dashboard com o arquivo JSON para download.`;

export async function workflowAgentNode(state: { messages: any[] }) {
  const model = createModel(0.2, 1024).bindTools(workflowTools);
  const messages = [
    new SystemMessage(FLOWAI_PROMPT),
    ...state.messages.slice(-6),
  ];

  try {
    const response = await model.invoke(messages);

    // If the model invokes create_n8n_workflow tool call, execute it!
    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolMessages = await executeToolCalls(response.tool_calls);
      const followUp = await model.invoke([
        new SystemMessage(FLOWAI_PROMPT),
        ...messages,
        response,
        ...toolMessages,
      ]);

      return {
        messages: [
          new AIMessage(
            (followUp.content as string) ||
              "Workflow gerado e salvo com sucesso no banco de dados! O arquivo .json está disponível para download no Dashboard de Automações."
          ),
        ],
      };
    }

    return { messages: [response] };
  } catch (err: any) {
    console.error("[FLOWAI AGENT ERROR]", err?.message ?? err);
    return {
      messages: [
        new AIMessage(
          "Desculpe, ocorreu um erro ao processar sua solicitação de automação. Tente novamente."
        ),
      ],
    };
  }
}
