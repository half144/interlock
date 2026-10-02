import type { Block } from "@/types";

/** A reply's blocks only ever grow at the end, so a block's position names it for as long as the reply is on screen. */
export const keyBlocks = (blocks: Block[]) =>
  blocks.map((block, position) => ({ block, key: `${block.type}-${position}`, position }));

/** For lists that have no ids and are only ever rebuilt whole, like the nodes of a parsed message. */
export const keyed = <T>(items: T[]) => items.map((item, position) => ({ item, key: position }));

/** What a reply says in prose, for copying: its text blocks, a paragraph apart. */
export const replyText = (blocks: Block[]) =>
  blocks
    .flatMap((b) => (b.type === "text" ? [b.text] : []))
    .join("\n\n")
    .trim();
