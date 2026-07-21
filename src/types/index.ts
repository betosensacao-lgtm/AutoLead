export type LeadPlatform = "web" | "whatsapp" | "email";

export type LeadStage =
  | "NEW"
  | "CAPTURED"
  | "QUALIFYING"
  | "QUALIFIED"
  | "NURTURING"
  | "HOT"
  | "CONVERTED"
  | "LOST";

export type LeadScoreCategory = "COLD" | "WARM" | "HOT";

export type InteractionType =
  | "message"
  | "qualification"
  | "followup"
  | "notification"
  | "conversion";

export type LeadIntent =
  | "DOUBT"
  | "QUALIFICATION"
  | "URGENT"
  | "NURTURING"
  | "UNKNOWN";

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  notes: string;
}

export interface BantEvaluation {
  budget: boolean | null;
  authority: boolean | null;
  need: boolean | null;
  timeline: number | null;
}

export interface AdminSession {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
}
