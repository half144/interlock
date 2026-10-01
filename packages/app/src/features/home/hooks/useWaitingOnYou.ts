import type { Aspect } from "@/types";
import { useStore } from "@/stores/app-store";

/** What a task needs from you, most urgent first: a question or approval, a failure, then work to review. */
const WAITING: Aspect[] = ["held", "failed", "review"];

/** The tasks blocked on you across every project, most urgent first, and how many others are still working. */
export function useWaitingOnYou() {
  const agents = useStore((s) => s.agents);
  const all = Object.values(agents);

  return {
    waiting: all
      .filter((a) => WAITING.includes(a.aspect))
      .sort((a, b) => WAITING.indexOf(a.aspect) - WAITING.indexOf(b.aspect)),
    working: all.filter((a) => a.aspect === "running").length,
  };
}
