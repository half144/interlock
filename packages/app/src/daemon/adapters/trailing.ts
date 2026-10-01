import type { Block, Message, ToolChip } from "@/types";

type AgentMessage = Extract<Message, { role: "agent" }>;

const isTrailing = (block: Block) => block.type === "hold" || block.type === "changes";

export const stripTrailing = (blocks: Block[]): Block[] => {
  const end = blocks.findLastIndex((block) => !isTrailing(block)) + 1;
  return end === blocks.length ? blocks : blocks.slice(0, end);
};

const sameTypes = (a: Block[], b: Block[]) =>
  a.length === b.length && a.every((block, i) => block === b[i] || block.type === b[i]?.type);

export function withTrailingBlocks(
  messages: Message[],
  agentId: string,
  flags: { hold: boolean; changes: boolean },
): Message[] {
  const last = messages.at(-1);
  const wanted: Block[] = [
    ...(flags.changes ? [{ type: "changes" as const, agentId }] : []),
    ...(flags.hold ? [{ type: "hold" as const, agentId }] : []),
  ];
  if (last?.role !== "agent") {
    if (wanted.length === 0) return messages;
    const created: AgentMessage = {
      id: `a-${messages.length}`,
      role: "agent",
      agentId,
      blocks: wanted,
      at: last?.at ?? 0,
    };
    return [...messages, created];
  }
  const next = [...stripTrailing(last.blocks), ...wanted];
  if (sameTypes(last.blocks, next)) return messages;
  const rest = messages.slice(0, -1);
  return next.length === 0 ? rest : [...rest, { ...last, blocks: next }];
}

function chipsOf(block: Block): ToolChip[] {
  if (block.type === "tools") return block.tools;
  if (block.type === "step") return block.tools ?? [];
  return [];
}

export function currentStep(messages: Message[]): string | null {
  const last = messages.findLast((m) => m.role === "agent");
  if (last?.role !== "agent") return null;
  const active = last.blocks.find((b) => b.type === "step" && b.status === "in_progress");
  if (active?.type === "step") return active.activeForm ?? active.text;
  return last.blocks.flatMap(chipsOf).at(-1)?.label ?? null;
}
