import { Annotation } from "@langchain/langgraph";
import { type BaseMessage } from "@langchain/core/messages";
import type { LeadPlatform, LeadStage, LeadScoreCategory, LeadData, BantEvaluation } from "@/types";

export const LeadState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
  }),
  platform: Annotation<LeadPlatform>(),
  leadId: Annotation<string>(),
  organizationId: Annotation<string>(),
  stage: Annotation<string>(),
  leadData: Annotation<Partial<LeadData>>({
    reducer: (a, b) => ({ ...a, ...b }),
  }),
  score: Annotation<number>(),
  scoreCategory: Annotation<LeadScoreCategory>(),
  bant: Annotation<Partial<BantEvaluation>>({
    reducer: (a, b) => ({ ...a, ...b }),
  }),
  conversationSummary: Annotation<string>(),
  pendingFollowUp: Annotation<boolean>(),
  error: Annotation<string | null>(),
  locale: Annotation<string>(),
});
