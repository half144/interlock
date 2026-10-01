import { useMemo } from "react";
import { useStore } from "@/stores/app-store";
import { anchored, type Anchored } from "@/features/workspace/utils/comments";
import type { DiffLine, Hunk } from "@/types";

export interface HunkRow {
  /** Stable for the life of the hunk, which never reorders its lines. */
  id: string;
  line: DiffLine;
  anchor: Anchored | null;
}

export function useDiffHunk(path: string, hunk: Hunk) {
  const compose = useStore((s) => s.setReviewComposer);
  const rows = useMemo<HunkRow[]>(
    () => hunk.lines.map((line, at) => ({ id: String(at), line, anchor: anchored(path, line) })),
    [path, hunk],
  );

  return { rows, compose };
}
