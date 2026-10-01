import type { ReactNode } from "react";
import { motion } from "motion/react";
import { foldTransition } from "@/features/shell/utils/fold";

/** A part of the sidebar that only exists while it's open: it fades, and can't be focused while hidden. */
export function Fold({
  show,
  className,
  children,
}: {
  show: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={false}
      inert={!show}
      animate={{ opacity: show ? 1 : 0 }}
      transition={foldTransition(show)}
      className={className}
    >
      {children}
    </motion.div>
  );
}
