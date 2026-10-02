import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { paceStep } from "@/features/thread/utils/pacing";

/**
 * Releases streamed text at a steady pace instead of in the chunks the daemon sends. What is already there
 * when this mounts shows whole; only text that arrives afterwards is paced. `live` stays true until the pace
 * has caught up, so the reply keeps flowing for a moment after the agent stops.
 */
export function useSmoothText(target: string, streaming: boolean) {
  const reduced = useReducedMotion() === true;
  const [shown, setShown] = useState(target.length);
  const latest = useRef({ target, shown: target.length });
  const behind = !reduced && shown < target.length;

  useEffect(() => {
    latest.current.target = target;
  }, [target]);

  useEffect(() => {
    if (!behind) return;
    let frame = 0;
    let last = performance.now();
    let owed = 0;
    const tick = (now: number) => {
      const { target: text, shown: from } = latest.current;
      const step = paceStep(text, from, owed, now - last);
      owed = step.owed;
      last = now;
      if (step.to !== from) {
        latest.current.shown = step.to;
        setShown(step.to);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [behind]);

  const visible = reduced ? target.length : Math.min(shown, target.length);
  return { text: target.slice(0, visible), live: streaming || visible < target.length };
}
