import {
  animate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type MotionValue,
  type Transition,
} from "motion/react";
import { useEffect, useRef, type RefObject } from "react";

const BELL = {
  duration: 0.55,
  times: [0, 0.22, 1],
  ease: ["easeOut", "easeInOut"],
} satisfies Transition;
const MOVING = 60;

/**
 * The chat goes soft while its column is squeezed or released and comes back into focus as it lands, like a lens
 * following a moving subject. A move that gets going plays one fixed bell, so it can't flicker back to focus
 * half way if the speed dips for a frame; the slow tail of the spring doesn't start another.
 *
 * The softness is a blurred layer laid over the conversation whose opacity plays the bell, not a blur radius:
 * WebKit won't draw a blur under about a pixel, so shrinking the radius leaves a visible film that snaps off at
 * the end, where fading a layer of fixed blur crosses every step. `clearance` keeps the composer clear of it.
 */
export function useDockFocus(width: MotionValue<number>, dock: RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion();
  const haze = useMotionValue(0);
  const clearance = useMotionValue(0);
  const playing = useRef(false);

  useMotionValueEvent(width, "change", () => {
    if (reduced || playing.current || Math.abs(width.getVelocity()) < MOVING) return;
    playing.current = true;
    animate(haze, [0, 1, 0], {
      ...BELL,
      onComplete: () => {
        playing.current = false;
      },
    });
  });

  useEffect(() => {
    const el = dock.current;
    if (!el) return;
    const sync = () => clearance.set(el.offsetHeight);
    sync();
    const watch = new ResizeObserver(sync);
    watch.observe(el);
    return () => watch.disconnect();
  }, [dock, clearance]);

  return { haze, clearance };
}
