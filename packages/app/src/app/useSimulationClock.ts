import { useEffect } from "react";
import { useStore } from "@/stores/app-store";

const BEAT_MS = 1400;

/** Advances the stub simulation (agent progress, subagents, logs) on a steady beat while the app is open. */
export function useSimulationClock() {
  const tick = useStore((s) => s.tick);

  useEffect(() => {
    const timer = setInterval(tick, BEAT_MS);
    return () => clearInterval(timer);
  }, [tick]);
}
