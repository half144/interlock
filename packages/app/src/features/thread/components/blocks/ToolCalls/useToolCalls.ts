import { useMemo } from "react";
import type { ToolChip } from "@/types";
import { groupTools } from "@/features/thread/utils/toolGroups";

export function useToolCalls(chips: ToolChip[]) {
  const groups = useMemo(() => groupTools(chips), [chips]);
  return { groups };
}
