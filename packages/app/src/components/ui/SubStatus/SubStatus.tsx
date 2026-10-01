import { CircleStop, CircleX, Clock3 } from "lucide-react";
import type { SubagentStatus } from "@/types";
import { StepIcon } from "@/components/ui/StepIcon/StepIcon";

export function SubStatus({ status }: { status: SubagentStatus }) {
  if (status === "done") return <StepIcon status="completed" />;
  if (status === "running") return <StepIcon status="in_progress" />;
  if (status === "failed") return <CircleX className="size-4 shrink-0 text-red" />;
  if (status === "stopped") return <CircleStop className="size-4 shrink-0 text-ink-3" />;
  return <Clock3 className="size-4 shrink-0 text-ink-4" />;
}
