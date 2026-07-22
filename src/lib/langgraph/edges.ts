import type { LeadState } from "./state";

export function routeAfterRouter(
  state: typeof LeadState.State
): string {
  const stage = state.stage;

  switch (stage) {
    case "DOUBT":
      return "doubt_resolution";
    case "QUALIFICATION":
    case "CAPTURED":
      return "capture";
    case "URGENT":
      return "distribution";
    case "NURTURING":
      return "qualification";
    default:
      return "doubt_resolution";
  }
}

export function routeAfterCapture(
  state: typeof LeadState.State
): string {
  const { email, name } = state.leadData || {};

  if (email || name) {
    return "qualification";
  }

  return "__end__";
}

export function routeAfterQualification(
  state: typeof LeadState.State
): string {
  if (state.scoreCategory === "HOT") {
    return "distribution";
  }

  return "__end__";
}

export function routeAfterDoubt(
  _state: typeof LeadState.State
): string {
  return "__end__";
}
