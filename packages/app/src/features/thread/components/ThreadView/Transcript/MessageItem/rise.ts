import type { Variants } from "motion/react";
import { fadeIn, spring } from "@/lib/motion";

const STAGGER = 0.04;
const MAX_STAGGERED = 5;

/** A message rises in; the blocks of a new agent reply follow a beat apart, capped so long replies don't drag. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: (i: number) => {
    const delay = Math.min(i, MAX_STAGGERED) * STAGGER;
    return {
      opacity: 1,
      y: 0,
      transition: { y: { ...spring, delay }, opacity: { ...fadeIn, delay } },
    };
  },
};
