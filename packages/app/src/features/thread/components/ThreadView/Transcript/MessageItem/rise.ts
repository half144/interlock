import type { Variants } from "motion/react";
import { fadeIn, fadeOut, spring } from "@/lib/motion";

/** The gap between messages (`gap-7`) and between a reply's blocks (`gap-3`). */
export const MESSAGE_GAP = 28;
export const REPLY_GAP = 12;
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

/** A block that leaves a reply (a card the agent no longer owes you) folds away, so what is below it glides up instead of dropping. */
export const leave = {
  opacity: 0,
  height: 0,
  marginTop: -REPLY_GAP,
  overflow: "hidden",
  transition: { height: spring, marginTop: spring, opacity: fadeOut },
};

/**
 * A new message makes room for itself on the same spring the cards that leave fold away on, so the view sees one
 * smooth change in height and not a step in each direction.
 */
export const room: Variants = {
  hidden: { height: 0, marginTop: -MESSAGE_GAP, overflow: "hidden" },
  shown: {
    height: "auto",
    marginTop: 0,
    transition: { height: spring, marginTop: spring },
    transitionEnd: { overflow: "visible" },
  },
};
