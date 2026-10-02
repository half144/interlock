import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { watchLatest } from "@/features/thread/utils/watchLatest";

/**
 * Keeps a conversation scrolled to its latest message. It opens already at the bottom, before the first
 * paint, so a chat never lands at the top and jumps. From then on the view glides after whatever grows the
 * conversation (a new message, a reply being written, the plan card rising behind the composer) for as long
 * as you haven't scrolled away from the bottom; one gliding motion for all of it, never a step. A change of
 * width (the side panel squeezing the column) is the exception: the text re-wraps and the view stays glued.
 * `seen` is how many messages were already on screen, so only newer ones play their entrance.
 */
export function useScrollToLatest(count: number) {
  const scroller = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const seen = useRef(count);
  const pinned = useRef(true);
  const follow = useRef<(() => void) | null>(null);
  const reduced = useReducedMotion() === true;
  const [away, setAway] = useState(false);

  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, []);

  useEffect(() => {
    if (!scroller.current) return;
    const watch = watchLatest({
      scroller: scroller.current,
      content: content.current,
      dock: dock.current,
      pinned,
      reduced,
      onAway: setAway,
    });
    follow.current = watch.follow;
    return watch.stop;
  }, [reduced]);

  useEffect(() => {
    if (seen.current === count) return;
    pinned.current = true;
    seen.current = count;
    follow.current?.();
  }, [count]);

  const jump = () => {
    pinned.current = true;
    setAway(false);
    follow.current?.();
  };

  return { scroller, content, dock, seen, away, jump };
}
