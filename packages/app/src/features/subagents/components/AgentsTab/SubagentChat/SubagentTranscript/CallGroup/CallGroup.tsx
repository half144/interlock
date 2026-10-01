import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { SubagentEvent } from "@/types";
import { summarize, type ToolEvent } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { ToolCall } from "./ToolCall/ToolCall";

interface CallGroupProps {
  calls: ToolEvent[];
  startSec: number;
  live: boolean;
  isFresh: (e: SubagentEvent) => boolean;
}

/** A run of back-to-back tool calls under one summary line. Each call opens to show what it saw. */
export function CallGroup({ calls, startSec, live, isFresh }: CallGroupProps) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 py-1 text-left text-[13.5px] text-ink-3 transition-colors hover:text-ink-2"
      >
        <span className={cn(live && "shimmer")}>{summarize(calls)}</span>
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-200 ease-out-quint",
            !open && "-rotate-90",
          )}
        />
      </button>
      <Collapse open={open}>
        <ul className="mt-1 ml-[7px] flex flex-col border-l border-seam pl-2.5">
          {calls.map((call, i) => (
            <ToolCall
              key={`${call.sec}-${i}`}
              call={call}
              offset={call.sec - startSec}
              fresh={isFresh(call)}
            />
          ))}
        </ul>
      </Collapse>
    </div>
  );
}
