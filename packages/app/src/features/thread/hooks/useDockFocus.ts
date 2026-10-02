import {
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";

const MAX_BLUR_PX = 5;
const BLUR_PER_SPEED = 1 / 90;
const DEAD_BAND_PX = 0.8;
const FOCUS_PULL = { stiffness: 1000, damping: 58 };

/**
 * The chat goes soft while its column is being squeezed or released and pulls back into focus as it settles,
 * like a lens following a moving subject. Blur follows how fast the width changes, so it is zero at rest and
 * peaks mid-move; a dead band cuts the long tail of the dock spring so focus is back as the move lands.
 */
export function useDockFocus(width: MotionValue<number>) {
  const reduced = useReducedMotion();
  const speed = useVelocity(width);
  const blur = useSpring(
    useTransform(speed, (v) =>
      Math.min(MAX_BLUR_PX, Math.max(0, Math.abs(v) * BLUR_PER_SPEED - DEAD_BAND_PX)),
    ),
    FOCUS_PULL,
  );
  return useTransform(blur, (px) => (reduced || px < 0.08 ? "none" : `blur(${px.toFixed(2)}px)`));
}
