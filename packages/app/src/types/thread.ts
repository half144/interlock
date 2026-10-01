import type { ToolName } from "./tool";

/**
 * Where a plan item stands, in the words both providers use: Claude's TodoWrite and Codex's update_plan
 * (`turn/plan/updated`). Codex's exec JSON only says `completed: boolean`; there, the first unfinished
 * item counts as in progress.
 */
export type PlanStatus = "pending" | "in_progress" | "completed";

export interface ToolChip {
  tool: ToolName;
  label: string;
}

export type Block =
  | { type: "text"; text: string }
  | { type: "delegate"; agentId: string; subagentIds: string[] }
  /**
   * One item of the agent's plan. `text`, `status` and `activeForm` are what the provider reports;
   * `activeForm` ("Adding the refund_keys table") comes from Claude only. `detail` and `tools` are what
   * the UI groups under the item from the tool calls made while it was in progress.
   */
  | {
      type: "step";
      text: string;
      status: PlanStatus;
      activeForm?: string;
      detail?: string;
      tools?: ToolChip[];
    }
  | { type: "hold"; agentId: string }
  | { type: "changes"; agentId: string }
  | { type: "followups"; items: string[] };

export type Message =
  | { id: string; role: "user"; text: string; minAgo: number }
  | { id: string; role: "agent"; agentId?: string | undefined; blocks: Block[]; minAgo: number };

export interface Thread {
  id: string;
  projectId: string;
  title: string;
  updatedMin: number;
  agentIds: string[];
  messages: Message[];
}
