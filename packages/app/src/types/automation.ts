import type { AgentKind } from "./agent";

export type Trigger =
  | { type: "schedule"; cron: string; label: string }
  | { type: "issue"; label: string }
  | { type: "alert"; source: string }
  | { type: "pr"; label: string };

export interface AutomationRun {
  minAgo: number;
  result: "merged" | "review" | "failed" | "skipped";
  headcode: string;
}

export interface Automation {
  id: string;
  projectId: string;
  name: string;
  prompt: string;
  trigger: Trigger;
  kind: AgentKind;
  model: string;
  enabled: boolean;
  runs: AutomationRun[];
}
