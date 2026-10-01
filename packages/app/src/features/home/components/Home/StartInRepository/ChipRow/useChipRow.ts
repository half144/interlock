import { useCallback, useEffect, useRef, useState } from "react";

const EDGE = 1;

/** A horizontal row that pages sideways and knows which of its edges hide more chips. */
export function useChipRow(count: number) {
  const scroller = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ before: false, after: false });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setMore({
      before: el.scrollLeft > EDGE,
      after: el.scrollLeft + el.clientWidth < el.scrollWidth - EDGE,
    });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [measure, count]);

  const page = (direction: 1 | -1) => {
    const el = scroller.current;
    el?.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return {
    scroller,
    measure,
    more,
    back: () => page(-1),
    forward: () => page(1),
  };
}
