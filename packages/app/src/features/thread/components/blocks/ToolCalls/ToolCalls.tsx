import { AnimatePresence, motion } from "motion/react";
import type { ToolChip } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn } from "@/lib/motion";
import { ExploreGroup } from "./ExploreGroup/ExploreGroup";
import { ToolCall } from "./ToolCall/ToolCall";
import { useToolCalls } from "./useToolCalls";

/** The agent's tool calls, one line each; runs of looking around fold into one. */
export function ToolCalls({ chips, className }: { chips: ToolChip[]; className?: string }) {
  const { groups } = useToolCalls(chips);

  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      <AnimatePresence initial={false}>
        {groups.map((group) => (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fadeIn}
            className="w-full"
          >
            {group.type === "explore" ? (
              <ExploreGroup
                summary={group.summary}
                running={group.running}
                failures={group.failures}
              >
                {group.calls.map((call) => (
                  <ToolCall key={call.key} chip={call.chip} />
                ))}
              </ExploreGroup>
            ) : (
              <ToolCall chip={group.chip} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
