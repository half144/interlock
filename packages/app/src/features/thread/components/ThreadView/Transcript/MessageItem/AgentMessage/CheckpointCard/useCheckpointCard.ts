import { useStore } from "@/stores/app-store";
import { usePullRequest } from "@/hooks/usePullRequest";
import { since } from "@/lib/utils";

export function useCheckpointCard(agentId: string) {
  const agent = useStore((s) => s.agents[agentId]);
  const thread = useStore((s) => (agent ? s.threads[agent.threadId] : undefined));
  const diff = useStore((s) => s.diffs[agentId]);
  const openPanel = useStore((s) => s.openPanel);
  const pr = usePullRequest(agent ?? { cwd: "", workspaceId: null, aspect: "idle" });

  return {
    agent,
    title: thread?.title ?? agent?.title ?? "",
    files: diff?.length ?? agent?.files.length ?? 0,
    phase: pr.phase,
    prNumber: pr.number,
    updated: thread ? since(thread.updatedAt) : "now",
    viewChanges: () => openPanel("diff"),
  };
}
