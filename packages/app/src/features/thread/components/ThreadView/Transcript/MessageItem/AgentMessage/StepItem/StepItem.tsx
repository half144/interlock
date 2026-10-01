import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlanStatus, ToolChip } from "@/types";
import { cn } from "@/lib/utils";
import { tools as toolInfo } from "@/lib/tools";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { StepIcon } from "@/components/ui/StepIcon/StepIcon";
import { Prose } from "@/features/thread/components/blocks/Prose/Prose";

interface StepItemProps {
  text: string;
  status: PlanStatus;
  detail?: string;
  tools?: ToolChip[];
}

/** One step of the agent's plan: a line you can open to see what it did and which tools it used. */
export function StepItem({ text, status, detail, tools }: StepItemProps) {
  const hasBody = Boolean(detail || tools?.length) && status !== "pending";
  const [open, setOpen] = useState(status === "in_progress");
  const [seen, setSeen] = useState(status);
  // The step the agent is on opens by itself and closes when it's done, so the plan follows the work.
  if (seen !== status) {
    setSeen(status);
    setOpen(status === "in_progress");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => hasBody && setOpen((o) => !o)}
        aria-expanded={hasBody ? open : undefined}
        className={cn(
          "flex items-center gap-2.5 py-1.5 text-left",
          hasBody ? "cursor-pointer" : "cursor-default",
        )}
      >
        <StepIcon status={status} />
        <span
          className={cn(
            "text-[14.5px] font-medium transition-colors duration-200",
            status === "pending" ? "text-ink-3" : "text-ink",
          )}
        >
          {text}
        </span>
        {hasBody && (
          <ChevronDown
            className={cn(
              "size-3.5 text-ink-3 transition-transform duration-200 ease-out-quint",
              open && "rotate-180",
            )}
          />
        )}
      </button>
      <Collapse open={hasBody && open}>
        <div className="ml-[7px] border-l border-seam pt-0.5 pb-2 pl-[18px]">
          {detail && (
            <div className="text-ink-2 [&_.prose-agent]:text-[14px] [&_.prose-agent]:text-ink-2">
              <Prose text={detail} />
            </div>
          )}
          {tools && tools.length > 0 && (
            <div className="mt-2 flex flex-col items-start gap-1.5">
              {tools.map((t) => {
                const Icon = toolInfo[t.tool].icon;
                return (
                  <span
                    key={t.label}
                    className="inline-flex h-7 max-w-full items-center gap-2 rounded-full bg-inset px-3 text-[13px] text-ink-2"
                  >
                    <Icon className="size-3.5 shrink-0 text-ink-3" />
                    <span className="truncate">{t.label}</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </Collapse>
    </div>
  );
}
