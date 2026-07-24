import { StateGraph } from "@langchain/langgraph";
import { FlowState } from "./state";
import { workflowAgentNode } from "./nodes";

const workflow = new StateGraph(FlowState)
  .addNode("agent", workflowAgentNode as any)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

export const flowGraph = workflow.compile();

export async function runFlowGraph(
  input: {
    messages: any[];
    workflowId?: string;
  },
  threadId?: string
) {
  const config = {
    configurable: {
      thread_id: threadId ?? crypto.randomUUID(),
    },
  };

  const result = await flowGraph.invoke(
    {
      messages: input.messages,
      workflowId: input.workflowId ?? "",
    },
    config
  );

  return result;
}
