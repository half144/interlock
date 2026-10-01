import { useState } from "react";
import type { Agent } from "@/types";

const NEXT_PR = 1851;

/** The PR this panel opened, if any, and whether its "it's live" moment is on screen. */
export function usePullRequest(agent: Agent) {
  const [opened, setOpened] = useState<Record<string, number>>({});
  const [live, setLive] = useState<number | null>(null);

  const open = () => {
    setOpened((p) => ({ ...p, [agent.id]: NEXT_PR }));
    setLive(NEXT_PR);
  };

  return { prNumber: opened[agent.id] ?? agent.pr, live, open, dismiss: () => setLive(null) };
}
