import { useState } from "react";
import { useStore } from "@/stores/app-store";

export function useTaskMenu() {
  const openPanel = useStore((s) => s.openPanel);
  const [confirming, setConfirming] = useState(false);

  return {
    confirming,
    askToDiscard: () => setConfirming(true),
    cancelDiscard: () => setConfirming(false),
    openTerminal: () => openPanel("terminal"),
  };
}
