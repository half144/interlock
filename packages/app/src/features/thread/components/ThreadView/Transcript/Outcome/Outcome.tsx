import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Agent } from "@/types";
import { lineAnimate, lineExit, lineInitial } from "../MessageItem/rise";
import { finishedLabel } from "@/lib/agentStatus";

export function Outcome({ agent }: { agent: Agent }) {
  return (
    <motion.p
      initial={lineInitial}
      animate={lineAnimate}
      exit={lineExit}
      className="flex items-center gap-1.5 text-[14px] text-green"
    >
      <Check className="size-4" strokeWidth={2.5} />
      {finishedLabel(agent)}
    </motion.p>
  );
}
