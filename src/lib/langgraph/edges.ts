import type { FlowState } from "./state";

export function routeWorkflow(state: typeof FlowState.State): string {
  return "__end__";
}
