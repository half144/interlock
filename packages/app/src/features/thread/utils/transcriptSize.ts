import type { Block, Message } from "@/types";

const weight = (block: Block) =>
  block.type === "text" || block.type === "reasoning" ? block.text.length : 1;

/**
 * A number that changes whenever the last reply grows, so the view can follow it as it streams. `closing` is the
 * line under the reply while the agent thinks; it counts on its own, so it can't cancel out a block arriving.
 */
export function transcriptSize(messages: Message[], closing: boolean): number {
  const last = messages.at(-1);
  const growth = last?.role === "agent" ? last.blocks.reduce((n, b) => n + weight(b), 0) : 0;
  return (messages.length * 1_000_000 + growth) * 2 + (closing ? 1 : 0);
}
