import { useState } from "react";
import type { PlanStatus, ToolChip } from "@/types";

export function useStepItem(
  status: PlanStatus,
  detail: string | undefined,
  tools: ToolChip[] | undefined,
) {
  const [open, setOpen] = useState(status === "in_progress");
  const [seen, setSeen] = useState(status);
  // The step the agent is on opens by itself and closes when it's done, so the plan follows the work.
  if (seen !== status) {
    setSeen(status);
    setOpen(status === "in_progress");
  }

  const hasBody = status !== "pending" && (Boolean(detail) || (tools?.length ?? 0) > 0);
  return { hasBody, open: hasBody && open, toggle: () => hasBody && setOpen((o) => !o) };
}
