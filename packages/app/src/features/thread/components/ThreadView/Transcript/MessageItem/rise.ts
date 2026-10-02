import type { Variants } from "motion/react";
import { dock, fadeIn, fadeOut, spring } from "@/lib/motion";

/** The gap between messages (`gap-7`) and between a reply's blocks (`gap-3`). */
const MESSAGE_GAP = 28;
const REPLY_GAP = 12;

/**
 * Whatever comes or goes makes its room on the spring, margin included, so the view sees one smooth change in
 * height. Left to snap, the follower would chase each step and the conversation would lurch up and back.
 */
const fold = (gap: number) => ({
  closed: { height: 0, marginTop: -gap, overflow: "hidden" },
  open: {
    height: "auto",
    marginTop: 0,
    transitionEnd: { overflow: "visible" },
  },
});
const makeRoom = { height: dock, marginTop: dock };

const reply = fold(REPLY_GAP);
const thread = fold(MESSAGE_GAP);
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

/** A block that joins a reply already being written: a short, plain arrival with no wait. */
export const joinInitial = { opacity: 0, y: 6, ...reply.closed };
export const joinAnimate = {
  opacity: 1,
  y: 0,
  ...reply.open,
  transition: { y: spring, opacity: fadeIn, ...makeRoom },
};

/** A block that leaves a reply (a card the agent no longer owes you) folds away. */
export const leave = { opacity: 0, ...reply.closed, transition: { opacity: fadeOut, ...makeRoom } };

/** A new message opens up its room as it comes. */
export const room: Variants = {
  hidden: thread.closed,
  shown: { ...thread.open, transition: makeRoom },
};

/** A line under the conversation, like the outcome, arriving and leaving. */
export const lineInitial = { opacity: 0, y: 8, ...thread.closed };
export const lineAnimate = {
  opacity: 1,
  y: 0,
  ...thread.open,
  transition: { y: spring, opacity: fadeIn, ...makeRoom },
};
export const lineExit = {
  opacity: 0,
  ...thread.closed,
  transition: { opacity: fadeOut, ...makeRoom },
};
