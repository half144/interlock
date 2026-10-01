import { useState, type RefObject } from "react";

/** How far below the scroller's top a section's heading must rise before it counts as the one you're reading. */
const READ_LINE = 120;

/** Tracks which anchored section is being read inside `scroller`, and scrolls to one on request. */
export function useScrollSpy(scroller: RefObject<HTMLElement | null>, ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");

  const onScroll = () => {
    const root = scroller.current;
    if (!root) return;
    const top = root.getBoundingClientRect().top;
    const current = ids
      .filter((id) => {
        const el = root.querySelector<HTMLElement>(`#${id}`);
        return el && el.getBoundingClientRect().top - top < READ_LINE;
      })
      .pop();
    setActive(current ?? ids[0] ?? "");
  };

  const jump = (id: string) => {
    scroller.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return { active, onScroll, jump };
}
