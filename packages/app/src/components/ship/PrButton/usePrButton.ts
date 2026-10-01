import { useState } from "react";
import { usePullRequest } from "@/hooks/usePullRequest";
import type { Agent } from "@/types";

type Dialog = "create" | "pr" | null;

export function usePrButton(agent: Agent) {
  const pr = usePullRequest(agent);
  const [dialog, setDialog] = useState<Dialog>(null);

  return {
    pr,
    dialog,
    openCreate: () => setDialog("create"),
    openPr: () => setDialog("pr"),
    close: () => setDialog(null),
  };
}
