import { useState } from "react";
import type { ToolChip } from "@/types";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/styles";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { CallFacts } from "./CallFacts/CallFacts";
import { CallLabel } from "./CallLabel/CallLabel";
import { ToolCallDetail } from "./ToolCallDetail/ToolCallDetail";
import { toolIcons } from "./toolIcons";

/** One call as a pill, after Manus: what it did in words. Opens to the command and its output, or the diff. */
export function ToolCall({ chip }: { chip: ToolChip }) {
  const [open, setOpen] = useState(false);
  const Icon = toolIcons[chip.action];

  return (
    <div className="flex w-full flex-col items-start">
      <button
        type="button"
        disabled={!chip.detail}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={chip.detail ? open : undefined}
        className={cn(
          "inline-flex h-7 max-w-full items-center gap-2 rounded-full px-3 text-[13px] enabled:hover:bg-raised enabled:active:scale-[0.98] disabled:cursor-default",
          pressable,
          open ? "bg-raised" : "bg-inset",
        )}
      >
        <Icon className="size-3.5 shrink-0 text-ink-3" />
        <CallLabel chip={chip} />
        <CallFacts chip={chip} />
      </button>
      {chip.detail && (
        <Collapse open={open} className="w-full">
          <ToolCallDetail detail={chip.detail} />
        </Collapse>
      )}
    </div>
  );
}
