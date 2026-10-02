import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Transition,
} from "motion/react";
import { useRef } from "react";

const PEAK_BLUR_PX = 5;
const BELL = { duration: 0.42, times: [0, 0.35, 1], ease: "easeInOut" } satisfies Transition;
const MOVING_FAST = 250;

/**
 * The text goes soft while its column is squeezed or released and comes back into focus as it lands, like a lens
 * following a moving subject. A move that starts fast plays one fixed bell of blur (up to the peak, then back
 * to sharp), so it can't flicker back to focus half way if the speed dips for a frame; the slow tail of the
 * spring doesn't start another.
 */
export function useDockFocus(width: MotionValue<number>) {
  const reduced = useReducedMotion();
  const blur = useMotionValue(0);
  const playing = useRef(false);

  useMotionValueEvent(width, "change", () => {
    if (reduced || playing.current || Math.abs(width.getVelocity()) < MOVING_FAST) return;
    playing.current = true;
    animate(blur, [0, PEAK_BLUR_PX, 0], {
      ...BELL,
      onComplete: () => {
        playing.current = false;
      },
    });
  });

  return useTransform(blur, (px) => (px < 0.08 ? "none" : `blur(${px.toFixed(2)}px)`));
}
