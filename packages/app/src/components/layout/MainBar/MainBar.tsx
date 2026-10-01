import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fadeIn, fadeOut } from "@/lib/motion";
import { UsagePill } from "./UsagePill/UsagePill";

/**
 * Top of the main area: a title or picker on the left, the usage pill on the right. Going compact (the side
 * panel opening) crossfades the right-hand controls instead of swapping them while the column is moving.
 */
export function MainBar({
  left,
  right,
  compact,
}: {
  left?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className="relative flex h-[52px] shrink-0 items-center gap-2 px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={compact ? "compact" : "full"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { ...fadeIn, delay: 0.1 } }}
          exit={{ opacity: 0, transition: fadeOut }}
          className="flex shrink-0 items-center gap-2"
        >
          {right}
          {!compact && <UsagePill />}
        </motion.div>
      </AnimatePresence>
    </header>
  );
}
