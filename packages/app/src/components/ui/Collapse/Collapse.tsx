import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { fadeIn, fadeOut, spring } from "@/lib/motion";

/**
 * Grows to its content's height and back, so opening a section pushes what's below instead of
 * making it jump. Padding belongs on the children; padding here would snap at the ends.
 */
export function Collapse({
  open,
  children,
  className,
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: { height: spring, opacity: fadeIn } }}
          exit={{ height: 0, opacity: 0, transition: { height: spring, opacity: fadeOut } }}
          className={className}
          style={{ overflow: "hidden" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
