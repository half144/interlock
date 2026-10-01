import { useEffect, useState, type KeyboardEvent, type RefObject } from "react";
import type { PaletteItem } from "@/features/palette/types";

/** Arrow keys move through `items` (wrapping), Enter runs the active one, and the list keeps it in view. */
export function usePaletteNavigation(items: PaletteItem[], list: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(0);
  const current = Math.min(active, Math.max(0, items.length - 1));

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [current, list]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + items.length) % items.length);
    } else if (e.key === "Enter" && items[current]) {
      e.preventDefault();
      items[current].run();
    }
  };

  return { current, setActive, onKeyDown };
}
