import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion, type MotionValue } from "motion/react";
import { fadeIn, fadeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useBarSlot } from "../WindowBar/barSlot";

/** Where a piece sits across the bar, in the main area's coordinates, riding the same motion values as the column below it. */
export interface BarFrame {
  left: MotionValue<number>;
  width: MotionValue<number>;
  /** Follows the column's own fade. A framed piece stays mounted so it never starts mid-animation; what it holds fades itself. */
  opacity?: MotionValue<number>;
}

/**
 * A header that lives in the window bar on a Mac and in its own place everywhere else. Without a frame it
 * spans the main area; with one it sits over its column.
 */
export function BarPiece({
  frame,
  className,
  children,
}: {
  frame?: BarFrame | undefined;
  className?: string;
  children: ReactNode;
}) {
  const slot = useBarSlot();
  if (!slot) return children;

  return createPortal(
    <motion.div
      data-tauri-drag-region
      className={cn("absolute inset-y-0 flex", !frame && "inset-x-0", className)}
      style={{ ...frame }}
      {...(frame
        ? {}
        : {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: fadeIn },
            exit: { opacity: 0, transition: fadeOut },
          })}
    >
      {children}
    </motion.div>,
    slot,
  );
}
