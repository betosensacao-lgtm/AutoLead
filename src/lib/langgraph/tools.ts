import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/db";
import { leads, leadMessages, leadInteractions } from "@/db/schema";
import { eq } from "drizzle-orm";

const saveLeadSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().optional(),
  stage: z.string(),
  score: z.number().optional(),
  notes: z.string().optional(),
});

const getLeadByEmailSchema = z.object({
  email: z.string(),
});

const calculateScoreSchema = z.object({
  budget: z.boolean(),
  authority: z.boolean(),
  need: z.boolean(),
  timeline: z.number().min(0).max(4),
});

const sendFollowUpEmailSchema = z.object({
  to: z.string(),
  subject: z.string(),
  content: z.string(),
});

const notifySalesSchema = z.object({
  leadId: z.string(),
  reason: z.string(),
  priority: z.enum(["low", "medium", "high"]),
});

const scheduleNurturingSchema = z.object({
  leadId: z.string(),
  delayHours: z.number(),
  message: z.string(),
});

const queryKnowledgeBaseSchema = z.object({
  query: z.string(),
});

export const saveLeadTool = new DynamicStructuredTool({
  name: "save_lead",
  description: "Salva ou atualiza os dados de um lead no banco de dados",
  schema: saveLeadSchema,
  func: async (args) => {
    try {
      return JSON.stringify({ success: true, data: args });
    } catch (error) {
      return JSON.stringify({ success: false, error: String(error) });
    }
  },
});

export const getLeadByEmailTool = new DynamicStructuredTool({
  name: "get_lead_by_email",
  description: "Busca um lead existente pelo email",
  schema: getLeadByEmailSchema,
  func: async ({ email }) => {
    try {
      const result = await db
        .select()
        .from(leads)
        .where(eq(leads.email, email));
      if (result.length === 0) {
        return JSON.stringify({ found: false });
      }
      return JSON.stringify({ found: true, lead: result[0] });
    } catch (error) {
      return JSON.stringify({ found: false, error: String(error) });
    }
  },
});

export const calculateScoreTool = new DynamicStructuredTool({
  name: "calculate_score",
  description: "Calcula o score BANT do lead baseado nas respostas",
  schema: calculateScoreSchema,
  func: async (args) => {
    let score = 0;
    if (args.budget) score += 30;
    if (args.authority) score += 25;
    if (args.need) score += 25;
    score += args.timeline * 5;

    const category = score >= 61 ? "HOT" : score >= 31 ? "WARM" : "COLD";

    return JSON.stringify({ score, category });
  },
});

export const notifySalesTool = new DynamicStructuredTool({
  name: "notify_sales_team",
  description: "Notifica o time comercial sobre um lead qualificado",
  schema: notifySalesSchema,
  func: async (args) => {
    const message = `[${args.priority.toUpperCase()}] Lead ${args.leadId}: ${args.reason}`;
    console.log(`[NOTIFICATION] ${message}`);
    return JSON.stringify({ notified: true, message });
  },
});

export const queryKnowledgeBaseTool = new DynamicStructuredTool({
  name: "query_knowledge_base",
  description: "Queries information about products and services",
  schema: queryKnowledgeBaseSchema,
  func: async ({ query }) => {
    return JSON.stringify({
      answer: `Information about: ${query}. (Knowledge base to be implemented)`,
    });
  },
});

export const allTools = [
  saveLeadTool,
  getLeadByEmailTool,
  calculateScoreTool,
  notifySalesTool,
  queryKnowledgeBaseTool,
];

export const leadTools = [saveLeadTool, getLeadByEmailTool];
export const qualificationTools = [calculateScoreTool, saveLeadTool];
export const distributionTools = [notifySalesTool, saveLeadTool];
export const knowledgeTools = [queryKnowledgeBaseTool];
