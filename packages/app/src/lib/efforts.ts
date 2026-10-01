import type { Effort } from "@/types";

export const LEVELS: Effort[] = ["low", "medium", "high", "max"];

export const efforts: Record<Effort, { label: string; blurb: string; pace: string }> = {
  low: {
    label: "Low",
    blurb: "Answers fast. Good for small, obvious edits.",
    pace: "Fastest · fewest tokens",
  },
  medium: {
    label: "Medium",
    blurb: "Thinks before it acts. Right for most tasks.",
    pace: "Balanced",
  },
  high: {
    label: "High",
    blurb: "Plans across files and checks its work before editing.",
    pace: "Slower · more tokens",
  },
  max: {
    label: "Max",
    blurb: "Its deepest reasoning, for hard bugs and large refactors.",
    pace: "Slowest · most tokens",
  },
};
