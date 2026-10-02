import type { Variants } from "motion/react";
import { fadeIn, spring } from "@/lib/motion";

const STAGGER = 0.04;
const MAX_STAGGERED = 5;

/** A message rises in; the blocks of a new agent reply follow a beat apart, capped so long replies don't drag. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  shown: (i: number) => {
    const delay = Math.min(i, MAX_STAGGERED) * STAGGER;
    return {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        y: { ...spring, delay },
        opacity: { ...fadeIn, delay },
        filter: { ...fadeIn, delay },
      },
    };
  },
};

/** Your message leaves the composer: it grows a touch from its bottom-right corner as it rises. */
export const send: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97, filter: "blur(4px)" },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      y: { ...spring, visualDuration: 0.34 },
      scale: { ...spring, visualDuration: 0.34 },
      opacity: fadeIn,
      filter: fadeIn,
    },
  },
};
