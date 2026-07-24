import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { n8nClient } from "@/lib/n8n/client";
import { db } from "@/db";
import { workflows, workflowExecutions } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createN8nWorkflowTool = new DynamicStructuredTool({
  name: "create_n8n_workflow",
  description: "Cria um novo workflow de automação n8n via IA com os nós e conexões especificados.",
  schema: z.object({
    name: z.string().describe("Nome do workflow"),
    description: z.string().describe("Descrição do que o workflow faz"),
    triggerType: z.enum(["WEBHOOK", "SCHEDULE", "EVENT", "MANUAL", "AI_AGENT"]).default("WEBHOOK"),
    nodes: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })).describe("Lista de nós n8n"),
  }),
  func: async ({ name, description, triggerType, nodes }) => {
    try {
      const n8nWf = await n8nClient.createWorkflow(name, nodes, {});

      const [dbWf] = await db.insert(workflows).values({
        name,
        description,
        n8nWorkflowId: n8nWf.id,
        triggerType,
        nodesCount: nodes.length,
        status: "ACTIVE",
        tags: ["AI-Generated", triggerType],
      } as any).returning();

      return JSON.stringify({
        success: true,
        workflowId: dbWf.id,
        n8nWorkflowId: n8nWf.id,
        name: dbWf.name,
        nodesCount: nodes.length,
      });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  },
});

export const executeN8nWorkflowTool = new DynamicStructuredTool({
  name: "execute_n8n_workflow",
  description: "Dispara a execução de um workflow n8n ativo.",
  schema: z.object({
    workflowId: z.string().describe("ID do workflow no sistema"),
    inputData: z.record(z.unknown()).optional().describe("Dados de entrada para o disparo"),
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
  description: "Lista os workflows ativos e seu status de execução.",
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
