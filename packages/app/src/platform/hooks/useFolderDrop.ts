import { useEffect, useRef, useState } from "react";
import { onDragDrop } from "../desktop";

/** Calls `onDrop` with the first path dropped on the window; returns the path being dragged over it, if any. */
export function useFolderDrop(onDrop: (path: string) => void): string | null {
  const [over, setOver] = useState<string | null>(null);
  const latest = useRef(onDrop);
  latest.current = onDrop;

  useEffect(
    () =>
      onDragDrop((drag) => {
        const first = drag.phase === "leave" ? undefined : drag.paths[0];
        setOver(drag.phase === "enter" ? (first ?? null) : null);
        if (drag.phase === "drop" && first) latest.current(first);
      }),
    [],
  );

  return over;
}
