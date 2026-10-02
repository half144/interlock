import { useEffect, useMemo, useState } from "react";
import { parseMarkdown } from "@/features/thread/utils/markdown";

/** Words fade in only once the block has been on screen: what is there when it mounts does not replay. */
export function useMarkdown(text: string, streaming: boolean) {
  const blocks = useMemo(() => parseMarkdown(text), [text]);
  const [settled, setSettled] = useState(false);
  useEffect(() => setSettled(true), []);
  return { blocks, fade: streaming && settled };
}
