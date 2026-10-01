import type { AgentTimelineItem } from "@interlock/protocol/agent-types";
import type { Block, Message } from "@/types";
import { todoToSteps } from "./plan";
import { addNotice, appendText, applyTodo, applyToolCall } from "./timelineBlocks";
import { stripTrailing } from "./trailing";

export { currentStep, withTrailingBlocks } from "./trailing";

export interface TimelineInput {
  item: AgentTimelineItem;
  timestamp: string;
}

type AgentMessage = Extract<Message, { role: "agent" }>;

function applyUser(
  messages: Message[],
  item: Extract<AgentTimelineItem, { type: "user_message" }>,
  at: number,
): Message[] {
  const existing = messages.findIndex(
    (m) =>
      m.role === "user" &&
      (m.id === item.messageId ||
        (item.clientMessageId !== undefined && m.id === item.clientMessageId)),
  );
  const current = messages[existing];
  if (current?.role === "user") return messages.with(existing, { ...current, text: item.text });
  const id = item.messageId ?? item.clientMessageId ?? `u-${messages.length}`;
  return [...messages, { id, role: "user", text: item.text, at }];
}

function blocksFor(blocks: Block[], item: AgentTimelineItem, agentId: string): Block[] {
  switch (item.type) {
    case "assistant_message":
      return appendText(blocks, "text", item.text);
    case "reasoning":
      return appendText(blocks, "reasoning", item.text);
    case "tool_call":
      return applyToolCall(blocks, item, agentId);
    case "todo":
      return applyTodo(blocks, todoToSteps(item.items));
    case "error":
      return addNotice(blocks, "error", item.message);
    case "notification":
      return addNotice(blocks, item.level, item.message);
    case "compaction":
      return item.status === "completed"
        ? addNotice(blocks, "info", "Compacted the conversation")
        : blocks;
    case "user_message":
      return blocks;
  }
}

export function applyTimelineItem(
  messages: Message[],
  { item, timestamp }: TimelineInput,
  agentId: string,
): Message[] {
  const at = Date.parse(timestamp);
  if (item.type === "user_message") return applyUser(messages, item, at);
  const last = messages.at(-1);
  const open: AgentMessage =
    last?.role === "agent"
      ? { ...last, blocks: stripTrailing(last.blocks) }
      : { id: `a-${messages.length}`, role: "agent", agentId, blocks: [], at };
  const blocks = blocksFor(open.blocks, item, agentId);
  if (blocks === open.blocks) return messages;
  const next = { ...open, blocks };
  return last?.role === "agent" ? [...messages.slice(0, -1), next] : [...messages, next];
}

export function buildMessages(inputs: TimelineInput[], agentId: string): Message[] {
  return inputs.reduce<Message[]>(
    (messages, input) => applyTimelineItem(messages, input, agentId),
    [],
  );
}
