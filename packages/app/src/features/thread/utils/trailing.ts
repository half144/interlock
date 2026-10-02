import type { Message } from "@/types";

const isLive = (type: string) => type === "hold" || type === "changes";

/** The hold and changes cards are bound to the agent as it is now, so only the latest reply keeps them. */
export function withoutStaleCards(messages: Message[]): Message[] {
  return messages.flatMap((message, i) => {
    if (i === messages.length - 1 || message.role !== "agent") return [message];
    if (!message.blocks.some((b) => isLive(b.type))) return [message];
    const blocks = message.blocks.filter((b) => !isLive(b.type));
    return blocks.length > 0 ? [{ ...message, blocks }] : [];
  });
}
