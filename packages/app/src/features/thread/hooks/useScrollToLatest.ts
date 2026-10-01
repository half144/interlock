import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Keeps a conversation scrolled to its latest message. It opens already at the bottom, before the first
 * paint, so a chat never lands at the top and jumps; new messages after that glide into view.
 * `seen` is how many messages were already on screen, so only newer ones play their entrance.
 */
export function useScrollToLatest(count: number) {
  const scroller = useRef<HTMLDivElement>(null);
  const seen = useRef(count);

  useLayoutEffect(() => {
    scroller.current!.scrollTop = scroller.current!.scrollHeight;
  }, []);

  useEffect(() => {
    if (seen.current === count) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
    seen.current = count;
  }, [count]);

  return { scroller, seen };
}
