import { useCallback, useEffect, useRef, useState } from "react";

const REACHED = 4;

/** True while a scroller still has content below its fold, so it can hint at it. */
export function useOverflowFade() {
  const ref = useRef<HTMLDivElement>(null);
  const [fade, setFade] = useState(false);
  const measure = useCallback(() => {
    const el = ref.current;
    if (el) setFade(el.scrollHeight - el.scrollTop - el.clientHeight > REACHED);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, [measure]);

  return { ref, fade, onScroll: measure };
}
