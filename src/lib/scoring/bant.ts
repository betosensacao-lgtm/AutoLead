export interface BantInput {
  budget: boolean;
  authority: boolean;
  need: boolean;
  timeline: number;
}

export interface BantResult {
  score: number;
  category: "COLD" | "WARM" | "HOT";
  breakdown: {
    budget: number;
    authority: number;
    need: number;
    timeline: number;
  };
}

const WEIGHTS = {
  budget: 30,
  authority: 25,
  need: 25,
  timeline: { base: 0, multiplier: 5, max: 20 },
};

export function calculateBant(input: BantInput): BantResult {
  const budget = input.budget ? WEIGHTS.budget : 0;
  const authority = input.authority ? WEIGHTS.authority : 0;
  const need = input.need ? WEIGHTS.need : 0;
  const timeline = Math.min(input.timeline, 4) * WEIGHTS.timeline.multiplier;

  const score = budget + authority + need + timeline;
  const category = score >= 61 ? "HOT" : score >= 31 ? "WARM" : "COLD";

  return {
    score,
    category,
    breakdown: { budget, authority, need, timeline },
  };
}
