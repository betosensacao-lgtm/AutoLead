import { StateGraph } from "@langchain/langgraph";
import { LeadState } from "./state";
import {
  routerNode,
  captureNode,
  qualificationNode,
  doubtResolutionNode,
  distributionNode,
} from "./nodes";
import {
  routeAfterRouter,
  routeAfterCapture,
  routeAfterQualification,
  routeAfterDoubt,
} from "./edges";
import { getCheckpointer } from "./persistence";

const workflow = new StateGraph(LeadState)
  .addNode("router", routerNode)
  .addNode("capture", captureNode)
  .addNode("qualification", qualificationNode)
  .addNode("doubt_resolution", doubtResolutionNode)
  .addNode("distribution", distributionNode)
  .addEdge("__start__", "router")
  .addConditionalEdges("router", routeAfterRouter)
  .addConditionalEdges("capture", routeAfterCapture)
  .addConditionalEdges("qualification", routeAfterQualification)
  .addConditionalEdges("doubt_resolution", routeAfterDoubt)
  .addEdge("distribution", "__end__");

export const leadGraph = workflow.compile({ checkpointer: getCheckpointer() });

export async function runLeadGraph(
  input: {
    messages: any[];
    organizationId: string;
    platform?: "web" | "whatsapp" | "email";
    leadId?: string;
  },
  threadId?: string
) {
  const config = {
    configurable: {
      thread_id: threadId ?? crypto.randomUUID(),
      organizationId: input.organizationId,
    },
  };

  const result = await leadGraph.invoke(
    {
      messages: input.messages,
      organizationId: input.organizationId,
      platform: input.platform ?? "web",
      leadId: input.leadId ?? "",
    },
    config
  );

  return result;
}
