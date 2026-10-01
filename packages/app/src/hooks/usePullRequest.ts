import { useStore } from "@/stores/app-store";
import { pullRequestOf, type PullRequestView } from "@/lib/pullRequest";
import type { Agent } from "@/types";

/** The task's pull request as the UI reads it: phase, number, link, checks, and what blocks the forge. */
export function usePullRequest(
  agent: Pick<Agent, "cwd" | "workspaceId" | "aspect">,
): PullRequestView {
  const checkout = useStore((s) => s.checkouts[agent.cwd]);
  const shipped = useStore((s) => s.shipped[agent.cwd]);
  const workspacePr = useStore((s) =>
    agent.workspaceId ? s.pullRequests[agent.workspaceId] : undefined,
  );
  return pullRequestOf({ agent, checkout, shipped, workspacePr });
}
