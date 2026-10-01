import { AnimatePresence, motion } from "motion/react";
import type { Subagent } from "@/types";
import { doing, lastCall, tools } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { recentCalls } from "@/features/subagents/utils/calls";
import { ToolBody } from "@/features/subagents/components/chat/ToolBody/ToolBody";

/** Over the subagent's shoulder: the app it's in, the call it's on, and the file or output it's looking at right now. */
export function LiveView({ sub }: { sub: Subagent }) {
  const call = lastCall(sub);
  const { icon: Icon, app } = tools[call?.kind ?? "shell"];
  const { shown, hidden } = recentCalls(sub);

  return (
    <div className={cn(surface.card, "overflow-hidden")}>
      <div className="flex items-center gap-3 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-run/15 text-run">
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-ink">
            {sub.name} is using {app}
          </p>
          <p className="shimmer truncate text-[13px]">{doing(sub)}</p>
        </div>
      </div>

      {call?.body && (
        <div className="border-t border-seam bg-inset">
          {/* A new call swaps what's on screen; the fade marks the switch without replaying on every tick. */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${call.sec}-${call.text}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: fadeIn }}
              exit={{ opacity: 0, transition: fadeOut }}
            >
              <p className="flex items-center gap-2 border-b border-seam px-3 py-1.5 font-mono text-[11.5px] text-ink-3">
                <span className="truncate">{call.text}</span>
                {call.meta && <span className="ml-auto shrink-0">{call.meta}</span>}
              </p>
              <ToolBody call={call} className="max-h-52 rounded-none" />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      <ul className="border-t border-seam px-3 py-2.5 text-[12.5px] text-ink-3">
        {shown.map((c) => (
          <li key={`${c.sec}-${c.kind}-${c.text}`} className="truncate">
            {tools[c.kind].verb} {c.text}
          </li>
        ))}
        {hidden > 0 && <li className="text-ink-4">+{hidden} more tool uses</li>}
      </ul>
    </div>
  );
}
