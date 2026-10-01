import type { PlanStatus } from "@/types";
import { cn } from "@/lib/utils";
import { StepIcon } from "@/components/ui/StepIcon/StepIcon";

export function StepList({
  steps,
  statuses,
}: {
  steps: { text: string }[];
  statuses: PlanStatus[];
}) {
  return (
    <ul className="px-3 pt-2.5">
      {steps.map((s, i) => (
        <li key={s.text} className="flex items-center gap-2.5 px-1 py-1.5 text-[13.5px]">
          <StepIcon status={statuses[i] ?? "pending"} />
          <span
            className={cn(
              "transition-colors duration-200",
              statuses[i] === "pending" ? "text-ink-3" : "text-ink",
            )}
          >
            {s.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
