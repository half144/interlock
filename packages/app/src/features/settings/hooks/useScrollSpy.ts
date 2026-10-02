import { useRef, useState, type RefObject } from "react";
import { activeSection } from "@/features/settings/utils/activeSection";

const END_SLACK = 2;

/** Tracks which anchored section is being read inside `scroller`, and scrolls to one on request. */
export function useScrollSpy(scroller: RefObject<HTMLElement | null>, ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  // A jump to a section near the end can't scroll it up to the read line; the pin keeps the one you clicked until you scroll yourself.
  const pinned = useRef(false);

  const onScroll = () => {
    const root = scroller.current;
    if (!root || pinned.current) return;
    const top = root.getBoundingClientRect().top;
    const offsets = Object.fromEntries(
      ids.flatMap((id) => {
        const el = root.querySelector<HTMLElement>(`#${id}`);
        return el ? [[id, el.getBoundingClientRect().top - top] as const] : [];
      }),
    );
    const atEnd = root.scrollTop + root.clientHeight >= root.scrollHeight - END_SLACK;
    setActive(activeSection(offsets, ids, atEnd));
  };

  const jump = (id: string) => {
    pinned.current = true;
    scroller.current
      ?.querySelector(`#${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  const release = () => {
    pinned.current = false;
  };

  return {
    active,
    onScroll,
    jump,
    userInput: {
      onWheel: release,
      onTouchMove: release,
      onPointerDown: release,
      onKeyDown: release,
    },
  };
}
