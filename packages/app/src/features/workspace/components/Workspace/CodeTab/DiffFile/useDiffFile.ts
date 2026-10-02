import { useMemo, useState } from "react";
import { capHunks, FIRST_DIFF_LINES } from "@/features/workspace/utils/diff";
import type { FileDiff } from "@/types";

export function useDiffFile(file: FileDiff) {
  const [all, setAll] = useState(false);
  const { shown, hidden } = useMemo(
    () => capHunks(file.hunks, all ? Infinity : FIRST_DIFF_LINES),
    [file.hunks, all],
  );

  return { hunks: shown, hidden, showAll: () => setAll(true) };
}
