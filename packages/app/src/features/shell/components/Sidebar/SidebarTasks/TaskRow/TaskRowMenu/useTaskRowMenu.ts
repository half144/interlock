import { useState, type MouseEvent } from "react";

// Rows closer than this to the window bottom open their menu upward, so the scrolling list never
// clips it: the menu height plus the sidebar footer.
const ROOM_BELOW = 120;

export function useTaskRowMenu() {
  const [confirming, setConfirming] = useState(false);
  const [side, setSide] = useState<"top" | "bottom">("bottom");

  return {
    confirming,
    side,
    placeMenu: (event: MouseEvent<HTMLElement>) => {
      const { bottom } = event.currentTarget.getBoundingClientRect();
      setSide(window.innerHeight - bottom < ROOM_BELOW ? "top" : "bottom");
    },
    askToDelete: () => setConfirming(true),
    cancelDelete: () => setConfirming(false),
  };
}
