import { useState } from "react";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { tools, type ToolEvent } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motion";
import { clock } from "@/lib/clock";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { monoText } from "@/lib/styles";
import { ToolBody } from "@/features/subagents/components/chat/ToolBody/ToolBody";

/** One call in a group: verb, target and when it ran; opens to show what it saw. */
export function ToolCall({
  call,
  offset,
  fresh,
}: {
  call: ToolEvent;
  offset: number;
  fresh: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { icon: Icon, verb } = tools[call.kind];
  const hasBody = Boolean(call.body?.length);

  return (
    <motion.li
      initial={fresh ? { opacity: 0, x: -4 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={fadeIn}
    >
      <button
        type="button"
        disabled={!hasBody}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={hasBody ? open : undefined}
        className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors enabled:hover:bg-hover"
      >
        <Icon className="size-4 shrink-0 text-ink-3" />
        <span className="shrink-0 text-[13.5px] text-ink-2">{verb}</span>
        <span className={cn(monoText, "min-w-0 truncate text-ink")}>{call.text}</span>
        {call.meta && (
          <span className="shrink-0 truncate text-[12.5px] text-ink-3">{call.meta}</span>
        )}
        <span className="ml-auto shrink-0 pl-2 font-mono text-[11.5px] text-ink-4 tabular-nums">
          +{clock(offset)}
        </span>
        {hasBody && (
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-ink-4 transition-transform duration-200 ease-out-quint",
              open && "rotate-90",
            )}
          />
        )}
      </button>
      <Collapse open={open}>
        <ToolBody call={call} className="mx-2 mt-0.5 mb-2 max-h-72" />
      </Collapse>
    </motion.li>
  );
}
