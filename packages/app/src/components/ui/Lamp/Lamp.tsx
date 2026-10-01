import { AnimatePresence, motion } from "motion/react";
import type { Aspect } from "@/types";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { aspectMeta } from "./aspect";
import { LampGlyph } from "./LampGlyph/LampGlyph";

interface LampProps {
  aspect: Aspect;
  progress?: number;
  size?: "sm" | "md";
  className?: string;
}

/** Status glyph in the Linear family: a ring that fills while running, solid marks when settled. A new state pops in; a first render doesn't. */
export function Lamp({ aspect, progress = 0.5, size = "sm", className }: LampProps) {
  const px = size === "sm" ? 14 : 16;
  const color = aspectMeta[aspect].stroke;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 14 14"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <AnimatePresence initial={false}>
        <motion.g
          key={aspect}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={spring}
        >
          <LampGlyph aspect={aspect} progress={progress} color={color} />
        </motion.g>
      </AnimatePresence>
    </svg>
  );
}
