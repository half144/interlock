import { motion } from "motion/react";
import { Check } from "lucide-react";
import type { Agent } from "@/types";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { finishedLabel } from "@/lib/agentStatus";

export function Outcome({ agent }: { agent: Agent }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn } }}
      exit={{ opacity: 0, transition: fadeOut }}
      className="flex items-center gap-1.5 text-[14px] text-green"
    >
      <Check className="size-4" strokeWidth={2.5} />
      {finishedLabel(agent)}
    </motion.p>
  );
}
