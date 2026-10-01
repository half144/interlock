import { motion } from "motion/react";
import type { Effort } from "@/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { LEVELS } from "@/lib/efforts";

/** Four dots, filled up to the level: the same small ladder on the pill and on every row of the menu. */
export function Dots({ level, className }: { level: Effort; className?: string }) {
  const filled = LEVELS.indexOf(level) + 1;
  return (
    <span aria-hidden className={cn("flex items-center gap-[3px]", className)}>
      {LEVELS.map((step, i) => (
        <motion.span
          key={step}
          initial={false}
          animate={{ opacity: i < filled ? 1 : 0.25, scale: i < filled ? 1 : 0.8 }}
          transition={{ ...spring, delay: i * 0.025 }}
          className="size-[4px] rounded-full bg-current"
        />
      ))}
    </span>
  );
}
