import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { morph } from "@/lib/motion";

/**
 * A trigger's own outline or fill, drawn as a layer it can hand off: render it while closed, and the
 * `MorphSurface` with the same `id` stretches out of it on open and folds back into it on close.
 */
export function MorphShape({ id, className }: { id: string; className?: string }) {
  return (
    <motion.span
      layoutId={id}
      transition={morph}
      className={cn("absolute inset-0", className)}
      style={{ borderRadius: 16 }}
    />
  );
}
