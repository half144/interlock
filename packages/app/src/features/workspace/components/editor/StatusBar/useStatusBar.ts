import { useStore } from "@/stores/app-store";
import { usePullRequest } from "@/hooks/usePullRequest";
import { statusLine } from "@/lib/agentStatus";
import { useReview } from "@/features/workspace/hooks/useReview";
import { languageOf } from "@/features/workspace/utils/language";
import type { Agent } from "@/types";

export function useStatusBar(agent: Agent) {
  const { files, editor } = useReview(agent.id);
  const branch = useStore((s) => s.workspaces[agent.workspaceId ?? ""]?.branch) ?? agent.branch;
  const pr = usePullRequest(agent);

  return {
    branch,
    status: statusLine(agent),
    filesChanged: files.length,
    language: editor.active ? languageOf(editor.active).name : null,
    pr,
  };
}
