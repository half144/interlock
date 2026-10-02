import { useState } from "react";
import type { Block } from "@/types";

/** How many blocks the reply had when it appeared: the rest joined a reply already being written. */
export function useAgentMessage(blocks: Block[]) {
  const [arrived] = useState(blocks.length);
  return { arrived };
}
