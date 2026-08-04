import { DynamicStructuredTool } from "@langchain/core/tools";
import { ToolMessage } from "@langchain/core/messages";
import { z } from "zod";
import { n8nClient } from "@/lib/n8n/client";
import { db } from "@/db";
import { workflows, workflowExecutions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createN8nWorkflowTool = new DynamicStructuredTool({
  name: "create_n8n_workflow",
  description: "Creates a new n8n automation workflow via AI with the specified nodes and connections, and saves the JSON to the database.",
  schema: z.object({
    name: z.string().describe("Workflow name"),
    description: z.string().describe("Description of what the workflow does"),
    triggerType: z.enum(["WEBHOOK", "SCHEDULE", "EVENT", "MANUAL", "AI_AGENT"]).default("WEBHOOK"),
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })).describe("List of n8n nodes"),
  }),
  func: async ({ name, description, triggerType, nodes }) => {
    try {
      const n8nWf = await n8nClient.createWorkflow(name, nodes, {});

      // Construct standard n8n workflow JSON export structure
      const definitionJson = {
        name,
        nodes: nodes.map((n, index) => ({
          parameters: {},
          id: n.id || `node-${index + 1}`,
          name: n.name,
          type: n.type.includes(".") ? n.type : `n8n-nodes-base.${n.type}`,
          typeVersion: 1,
          position: [250 * (index + 1), 300],
        })),
        connections: {},
        active: true,
        settings: { executionOrder: "v1" },
        versionId: crypto.randomUUID(),
        meta: { templateId: `flowai-${Date.now()}` },
      };

      const [dbWf] = await db.insert(workflows).values({
        name,
        description,
        n8nWorkflowId: n8nWf.id,
        triggerType,
        nodesCount: nodes.length,
        status: "ACTIVE",
        tags: ["AI-Generated", triggerType],
        definitionJson,
      } as any).returning();

      return JSON.stringify({
        success: true,
        workflowId: dbWf.id,
        n8nWorkflowId: n8nWf.id,
        name: dbWf.name,
        nodesCount: nodes.length,
        definitionJson,
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  },
});

export const executeN8nWorkflowTool = new DynamicStructuredTool({
  name: "execute_n8n_workflow",
  description: "Triggers execution of an active n8n workflow.",
  schema: z.object({
    workflowId: z.string().describe("Workflow ID in the system"),
    inputData: z.record(z.unknown()).optional().describe("Input data for the trigger"),
  }),
  func: async ({ workflowId, inputData }) => {
    try {
      const [wf] = await db.select().from(workflows).where(eq(workflows.id, workflowId)).limit(1);
      const n8nWfId = wf?.n8nWorkflowId || workflowId;

      const startTime = Date.now();
      const execution = await n8nClient.executeWorkflow(n8nWfId, inputData);
      const durationMs = Date.now() - startTime;

      if (wf) {
        await db.insert(workflowExecutions).values({
          workflowId: wf.id,
          status: execution.status === "error" ? "FAILED" : "SUCCESS",
          durationMs,
          inputData: inputData || null,
          outputData: { executionId: execution.id, status: execution.status },
        } as any);

        await db.update(workflows).set({ lastRunAt: new Date() } as any).where(eq(workflows.id, wf.id));
      }

      return JSON.stringify({
        success: true,
        executionId: execution.id,
        status: execution.status,
        durationMs,
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  },
});

export const listN8nWorkflowsTool = new DynamicStructuredTool({
  name: "list_n8n_workflows",
  description: "Lists active workflows and their execution status.",
  schema: z.object({}),
  func: async () => {
    try {
      const activeWorkflows = await db.select().from(workflows).orderBy(workflows.createdAt);
      return JSON.stringify({
        success: true,
        count: activeWorkflows.length,
        workflows: activeWorkflows.map((w) => ({
          id: w.id,
          name: w.name,
          triggerType: w.triggerType,
          status: w.status,
          nodesCount: w.nodesCount,
        })),
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  },
});

export const allTools = [
  createN8nWorkflowTool,
  executeN8nWorkflowTool,
  listN8nWorkflowsTool,
];

export const workflowTools = [
  createN8nWorkflowTool,
  executeN8nWorkflowTool,
  listN8nWorkflowsTool,
];

export async function executeToolCalls(
  toolCalls: Array<{ name: string; args: Record<string, unknown>; id?: string }>
): Promise<ToolMessage[]> {
  const results: ToolMessage[] = [];

  for (const tc of toolCalls) {
    const tool = allTools.find((t) => t.name === tc.name);
    if (tool) {
      try {
        const result = await tool.func(tc.args as Parameters<typeof tool.func>[0]);
        results.push(
          new ToolMessage({
            content: typeof result === "string" ? result : JSON.stringify(result),
            tool_call_id: tc.id ?? crypto.randomUUID(),
            name: tc.name,
          })
        );
      } catch (error) {
        results.push(
          new ToolMessage({
            content: JSON.stringify({ error: String(error) }),
            tool_call_id: tc.id ?? crypto.randomUUID(),
            name: tc.name,
          })
        );
      }
    }
  }

  return results;
}
