import { useEffect, useLayoutEffect, useRef } from "react";

const STICK_DISTANCE = 96;

/**
 * Keeps a conversation scrolled to its latest message. It opens already at the bottom, before the first
 * paint, so a chat never lands at the top and jumps; a new message glides into view, and a reply that keeps
 * growing (`size`) stays in view as long as you haven't scrolled away from the bottom.
 * `seen` is how many messages were already on screen, so only newer ones play their entrance.
 */
export function useScrollToLatest(count: number, size: number) {
  const scroller = useRef<HTMLDivElement>(null);
  const seen = useRef(count);
  const pinned = useRef(true);

  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const track = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_DISTANCE;
    };
    el.addEventListener("scroll", track, { passive: true });
    return () => el.removeEventListener("scroll", track);
  }, []);

  useEffect(() => {
    if (seen.current === count) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
    pinned.current = true;
    seen.current = count;
  }, [count]);

  useLayoutEffect(() => {
    if (pinned.current) scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [size]);

  return { scroller, seen };
}
