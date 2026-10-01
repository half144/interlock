import { ChevronDown } from "lucide-react";
import type { PlanStatus, ToolChip } from "@/types";
import { cn } from "@/lib/utils";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { StepIcon } from "@/components/ui/StepIcon/StepIcon";
import { Markdown } from "@/features/thread/components/blocks/Markdown/Markdown";
import { ToolCalls } from "@/features/thread/components/blocks/ToolCalls/ToolCalls";
import { useStepItem } from "./useStepItem";

interface StepItemProps {
  text: string;
  status: PlanStatus;
  detail?: string;
  tools?: ToolChip[];
}

export function StepItem({ text, status, detail, tools }: StepItemProps) {
  const { hasBody, open, toggle } = useStepItem(status, detail, tools);

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
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
      <Collapse open={open}>
        <div className="ml-[7px] border-l border-seam pt-0.5 pb-2 pl-[18px]">
          {detail && (
            <div className="text-ink-2 [&_.prose-agent]:text-[14px] [&_.prose-agent]:text-ink-2">
              <Markdown text={detail} />
            </div>
          )}
          {tools && tools.length > 0 && <ToolCalls chips={tools} className="mt-2" />}
        </div>
      </Collapse>
    </div>
  );
}
