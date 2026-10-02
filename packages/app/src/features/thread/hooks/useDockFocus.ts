import {
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "motion/react";

const MAX_BLUR_PX = 6;
const BLUR_PER_SPEED = 1 / 100;
const FOCUS_PULL = { stiffness: 170, damping: 26 };

/**
 * The chat goes soft while its column is being squeezed or released and pulls back into focus as it settles,
 * like a lens following a moving subject. Blur follows how fast the width changes, so it is zero at rest and
 * peaks mid-move; a spring on top makes focus arrive a beat after the motion stops.
 */
export function useDockFocus(width: MotionValue<number>) {
  const reduced = useReducedMotion();
  const speed = useVelocity(width);
  const blur = useSpring(
    useTransform(speed, (v) => Math.min(MAX_BLUR_PX, Math.abs(v) * BLUR_PER_SPEED)),
    FOCUS_PULL,
  );
  return useTransform(blur, (px) => (reduced || px < 0.08 ? "none" : `blur(${px.toFixed(2)}px)`));
}
