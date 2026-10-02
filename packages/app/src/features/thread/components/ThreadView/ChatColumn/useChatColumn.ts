import type { MotionValue } from "motion/react";
import { useDockFocus } from "@/features/thread/hooks/useDockFocus";

export function useChatColumn(reading: MotionValue<number>) {
  return { focus: useDockFocus(reading) };
}
