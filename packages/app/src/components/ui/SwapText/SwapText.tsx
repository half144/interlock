import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";

/**
 * A line that changes in place: the old text lifts out as the new one rises in, so a status update
 * reads as an update instead of a blink. Both sit in the same grid cell, so nothing reflows mid-swap.
 */
export function SwapText({ text, className }: { text: string; className?: string }) {
  return (
    <span className="grid min-w-0 grid-cols-[minmax(0,1fr)]">
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn } }}
          exit={{ opacity: 0, y: -5, transition: fadeOut }}
          className={cn("truncate [grid-area:1/1]", className)}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
