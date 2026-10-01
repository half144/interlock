import { motion } from "motion/react";
import { spring } from "@/lib/motion";

/** The selected row's background, shared between rows so it slides to the one you pick. */
export function TreeSelection() {
  return (
    <motion.span
      layoutId="selection"
      transition={spring}
      style={{ borderRadius: 8 }}
      className="absolute inset-0 -z-10 bg-selected"
    />
  );
}
