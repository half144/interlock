import { useEffect, useEffectEvent, type RefObject } from "react";

/** Calls `onOutside` when a mouse press lands outside `ref`, for as long as `enabled` holds. */
export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
) {
  const handle = useEffectEvent((e: MouseEvent) => {
    if (!ref.current?.contains(e.target as Node)) onOutside();
  });

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [enabled]);
}
