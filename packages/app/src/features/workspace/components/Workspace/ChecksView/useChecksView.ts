import { usePullRequest } from "@/hooks/usePullRequest";
import { accessNote } from "@/lib/shipFailure";
import type { Agent } from "@/types";

export function useChecksView(agent: Agent) {
  const pr = usePullRequest(agent);
  return { pr, blocker: accessNote(pr.access) };
}
