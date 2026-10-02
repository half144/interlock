import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { advance, countWords, wordsPerSecond } from "@/features/thread/utils/pacing";

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
      owed += ((now - last) / 1000) * wordsPerSecond(countWords(text, from));
      last = now;
      const words = Math.floor(owed);
      if (words > 0) {
        owed -= words;
        const to = advance(text, from, words);
        latest.current.shown = to;
        setShown(to);
        if (to >= text.length) return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [behind]);

  const visible = reduced ? target.length : Math.min(shown, target.length);
  return { text: target.slice(0, visible), live: streaming || visible < target.length };
}
