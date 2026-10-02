import { useEffect, useLayoutEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { followStep } from "@/features/thread/utils/follow";

const STICK_DISTANCE = 96;

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

  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    let last = 0;
    let expected = el.scrollTop;
    let height = el.scrollHeight;
    const bottom = () => el.scrollHeight - el.clientHeight;
    const tick = (now: number) => {
      frame = 0;
      if (!pinned.current) return;
      const gap = bottom() - el.scrollTop;
      if (gap <= 0) return;
      el.scrollTop += reduced ? gap : followStep(gap, now - last);
      expected = el.scrollTop;
      last = now;
      frame = requestAnimationFrame(tick);
    };
    follow.current = () => {
      if (frame || !pinned.current) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const track = () => {
      const shrank = el.scrollHeight < height;
      height = el.scrollHeight;
      if (Math.abs(el.scrollTop - expected) < 1) return;
      expected = el.scrollTop;
      // The browser pulling the view up because content got shorter is not you scrolling away.
      if (shrank) return;
      pinned.current = bottom() - el.scrollTop < STICK_DISTANCE;
    };
    const release = (e: WheelEvent) => {
      if (e.deltaY < 0) pinned.current = false;
    };
    el.addEventListener("scroll", track, { passive: true });
    el.addEventListener("wheel", release, { passive: true });
    let width = content.current?.clientWidth ?? 0;
    const grow = new ResizeObserver(() => {
      const next = content.current?.clientWidth ?? 0;
      const reflowed = next !== width;
      width = next;
      if (reflowed && pinned.current) {
        // Text re-wrapping changes the height with no new content, so the view has to stay put on the bottom this very frame.
        el.scrollTop = bottom();
        expected = el.scrollTop;
        return;
      }
      follow.current?.();
    });
    if (content.current) grow.observe(content.current);
    if (dock.current) grow.observe(dock.current);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", track);
      el.removeEventListener("wheel", release);
      grow.disconnect();
    };
  }, [reduced]);

  useEffect(() => {
    if (seen.current === count) return;
    pinned.current = true;
    seen.current = count;
    follow.current?.();
  }, [count]);

  return { scroller, content, dock, seen };
}
