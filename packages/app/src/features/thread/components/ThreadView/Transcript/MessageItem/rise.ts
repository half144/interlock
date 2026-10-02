import type { Variants } from "motion/react";
import { fadeIn, spring } from "@/lib/motion";

const STAGGER = 0.04;
const MAX_STAGGERED = 5;

/** A new reply waits for your message to leave the composer before it begins to appear. */
const REPLY_DELAY = 0.16;
/** The thinking line comes in once the reply's name has settled. */
export const THINKING_DELAY = 0.42;

/** The blocks of a new agent reply settle in a beat apart, capped so long replies don't drag. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  shown: (i: number) => {
    const delay = REPLY_DELAY + Math.min(i, MAX_STAGGERED) * STAGGER;
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

/** A block that joins a reply already being written: a short, plain arrival with no wait. */
export const joinInitial = { opacity: 0, y: 6 };
export const joinAnimate = { opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn } };

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
