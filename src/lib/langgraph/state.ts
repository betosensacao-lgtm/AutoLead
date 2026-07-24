import { Annotation } from "@langchain/langgraph";
import { type BaseMessage } from "@langchain/core/messages";

export const FlowState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (a, b) => a.concat(b),
  }),
  workflowId: Annotation<string>(),
  executionId: Annotation<string>(),
  status: Annotation<string>(),
  error: Annotation<string | null>(),
});
