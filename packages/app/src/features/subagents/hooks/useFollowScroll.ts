import { useEffect, useRef, type RefObject } from "react";

/**
 * Keeps a scroller at its end whenever `trigger` changes: the first time it jumps there, after that
 * anything new glides into view.
 */
export function useFollowScroll(scroller: RefObject<HTMLElement | null>, trigger: string | number) {
  const settled = useRef(false);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: settled.current ? "smooth" : "auto",
    });
    settled.current = true;
  }, [scroller, trigger]);
}
