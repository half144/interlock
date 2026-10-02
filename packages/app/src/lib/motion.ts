import type { Transition } from "motion/react";

/** Arrivals: a quick start and a long, soft landing. */
export const easeOut = [0.23, 1, 0.32, 1] as const;
/** Departures: get out of the way without drawing the eye. */
export const easeIn = [0.4, 0, 1, 1] as const;

/**
 * Springs without bounce. They land like a decelerating tween but can be interrupted mid-flight,
 * which is what makes repeated toggling feel smooth instead of queued.
 */
export const spring = { type: "spring", visualDuration: 0.26, bounce: 0 } satisfies Transition;

export const fadeIn = { duration: 0.18, ease: easeOut } satisfies Transition;
/** Exits run faster than entrances. */
export const fadeOut = { duration: 0.11, ease: easeIn } satisfies Transition;

/**
 * The layout dock: sidebar, chat column and side panel all move on this one spring and start on the same
 * frame, so their edges travel together and the panel settles into the space the others make for it.
 * No bounce: the conversation travels hundreds of pixels here, and any overshoot reads as a wobble.
 */
export const dock = { type: "spring", visualDuration: 0.3, bounce: 0 } satisfies Transition;

/** A control turning into its own surface: the shape stretches with a hint of give, then settles. */
export const morph = { type: "spring", visualDuration: 0.34, bounce: 0.12 } satisfies Transition;

/** The dock spring's timing for what CSS animates alongside it (padding, corners), so they land together. */
export const dockCss = "duration-[300ms] ease-out-quint";
