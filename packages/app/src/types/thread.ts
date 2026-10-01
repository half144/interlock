import type { ToolChip } from "./tool";

/**
 * Where a plan item stands, in the words both providers use: Claude's TodoWrite and Codex's update_plan
 * (`turn/plan/updated`). Codex's exec JSON only says `completed: boolean`; there, the first unfinished
 * item counts as in progress.
 */
export type PlanStatus = "pending" | "in_progress" | "completed";

export type Block =
  | { type: "text"; text: string }
  | { type: "reasoning"; text: string }
  | { type: "tools"; tools: ToolChip[] }
  | { type: "notice"; level: "info" | "warning" | "error"; text: string }
  | { type: "delegate"; agentId: string; toolCallIds: string[] }
  /**
   * One item of the agent's plan. `text`, `status` and `activeForm` are what the provider reports;
   * `activeForm` ("Adding the refund_keys table") comes from Claude only. `tools` are the calls the agent
   * made while the item was in progress.
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

export interface MessageAttachment {
  name: string;
  isImage: boolean;
}

export type Message =
  | { id: string; role: "user"; text: string; at: number; attachments?: MessageAttachment[] }
  | { id: string; role: "agent"; agentId?: string | undefined; blocks: Block[]; at: number };

export interface Thread {
  /** The id of the agent that leads it. */
  id: string;
  projectId: string;
  title: string;
  updatedAt: number;
  agentIds: string[];
  messages: Message[];
}
