import type { ToolCallTimelineItem } from "@interlock/protocol/agent-types";
import type { Block, ToolChip } from "@/types";
import type { PlanStep } from "./plan";
import { toolChip } from "./tools";

type Notice = Extract<Block, { type: "notice" }>;

export function appendText(blocks: Block[], type: "text" | "reasoning", text: string): Block[] {
  const last = blocks.at(-1);
  if (last?.type === type) return [...blocks.slice(0, -1), { type, text: last.text + text }];
  return [...blocks, { type, text }];
}

export const addNotice = (blocks: Block[], level: Notice["level"], text: string): Block[] => [
  ...blocks,
  { type: "notice", level, text },
];

const withChip = (chips: ToolChip[], chip: ToolChip) => {
  const at = chips.findIndex((c) => c.callId === chip.callId);
  return at < 0 ? [...chips, chip] : chips.with(at, chip);
};

const holdsChip = (block: Block, callId: string) =>
  (block.type === "tools" && block.tools.some((c) => c.callId === callId)) ||
  (block.type === "step" && (block.tools ?? []).some((c) => c.callId === callId));

function replaceChip(blocks: Block[], chip: ToolChip): Block[] {
  return blocks.map((block) => {
    if (!holdsChip(block, chip.callId ?? "")) return block;
    if (block.type === "tools") return { ...block, tools: withChip(block.tools, chip) };
    if (block.type === "step") return { ...block, tools: withChip(block.tools ?? [], chip) };
    return block;
  });
}

function addChip(blocks: Block[], chip: ToolChip): Block[] {
  const active = blocks.findLastIndex((b) => b.type === "step" && b.status === "in_progress");
  const target = blocks[active];
  if (target?.type === "step") {
    return blocks.with(active, { ...target, tools: [...(target.tools ?? []), chip] });
  }
  const last = blocks.at(-1);
  if (last?.type === "tools")
    return [...blocks.slice(0, -1), { ...last, tools: [...last.tools, chip] }];
  return [...blocks, { type: "tools", tools: [chip] }];
}

function addDelegate(blocks: Block[], agentId: string, callId: string): Block[] {
  if (blocks.some((b) => b.type === "delegate" && b.toolCallIds.includes(callId))) return blocks;
  const last = blocks.at(-1);
  if (last?.type === "delegate") {
    return [...blocks.slice(0, -1), { ...last, toolCallIds: [...last.toolCallIds, callId] }];
  }
  return [...blocks, { type: "delegate", agentId, toolCallIds: [callId] }];
}

export function applyToolCall(blocks: Block[], item: ToolCallTimelineItem, agentId: string) {
  if (item.detail.type === "sub_agent") return addDelegate(blocks, agentId, item.callId);
  const chip = toolChip(item);
  const known = blocks.some((b) => holdsChip(b, item.callId));
  return known ? replaceChip(blocks, chip) : addChip(blocks, chip);
}

export function applyTodo(blocks: Block[], steps: PlanStep[]): Block[] {
  const first = blocks.findIndex((b) => b.type === "step");
  if (first < 0) return [...blocks, ...steps];
  const carried = new Map<string, ToolChip[]>();
  for (const block of blocks) {
    if (block.type === "step" && block.tools) carried.set(block.text, block.tools);
  }
  const next: PlanStep[] = steps.map((step) => {
    const tools = carried.get(step.text);
    return tools ? { ...step, tools } : step;
  });
  const kept = blocks.filter((b, i) => b.type !== "step" || i === first);
  return kept.flatMap<Block>((block) => (block.type === "step" ? next : [block]));
}
