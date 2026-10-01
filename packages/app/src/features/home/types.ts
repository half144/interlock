import type { AgentKind } from "@/types";

/** The agent and model a new task will start with. */
export interface ModelChoice {
  kind: AgentKind;
  model: string;
}
