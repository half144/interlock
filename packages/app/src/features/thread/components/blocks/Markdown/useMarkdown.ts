import { useEffect, useMemo, useState } from "react";
import { useSmoothText } from "@/features/thread/hooks/useSmoothText";
import { parseMarkdown } from "@/features/thread/utils/markdown";

/** Words fade in only once the block has been on screen: what is there when it mounts does not replay. */
export function useMarkdown(text: string, streaming: boolean) {
  const smooth = useSmoothText(text, streaming);
  const blocks = useMemo(() => parseMarkdown(smooth.text), [smooth.text]);
  const [settled, setSettled] = useState(false);
  useEffect(() => setSettled(true), []);
  return { blocks, fade: smooth.live && settled };
}
