import { useEffect, useEffectEvent } from "react";

/** Calls `onEscape` when Escape is pressed anywhere, for as long as `enabled` holds. */
export function useEscape(onEscape: () => void, enabled = true) {
  const handle = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === "Escape") onEscape();
  });

  useEffect(() => {
    if (!enabled) return;
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [enabled]);
}
