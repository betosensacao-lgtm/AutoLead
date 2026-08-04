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

const FLOWAI_PROMPT = `You are FlowAI's AI assistant.
Your mission is to help the user plan, create, and automate n8n workflows.

When the user asks you to create a flow or automation (e.g. "Create an automation that receives leads via webhook and sends them to Slack and HubSpot"):
1. Identify the trigger (Webhook, Schedule, Event)
2. Identify the integrations needed
3. You MUST call the 'create_n8n_workflow' tool to register the automation and generate the JSON in the system.

Always respond clearly, in English, confirming that the workflow was generated and is available in the Dashboard panel with the JSON file ready for download.`;

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
              "Workflow generated and saved successfully! The .json file is available for download in the Automation Dashboard."
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
          "Sorry, something went wrong while processing your automation request. Please try again."
        ),
      ],
    };
  }
}
