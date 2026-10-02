import { motion } from "motion/react";
import { Check, Square } from "lucide-react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { lineAnimate, lineExit, lineInitial } from "../MessageItem/rise";
import { finishedLabel } from "@/lib/agentStatus";

export function Outcome({ agent, stopped }: { agent: Agent; stopped: boolean }) {
  return (
    <motion.p
      initial={lineInitial}
      animate={lineAnimate}
      exit={lineExit}
      className={cn("flex items-center gap-1.5 text-[14px]", stopped ? "text-ink-3" : "text-green")}
    >
      {stopped ? (
        <Square className="size-3.5" strokeWidth={2.5} />
      ) : (
        <Check className="size-4" strokeWidth={2.5} />
      )}
      {stopped ? "Stopped. Say what to do next." : finishedLabel(agent)}
    </motion.p>
  );
}
