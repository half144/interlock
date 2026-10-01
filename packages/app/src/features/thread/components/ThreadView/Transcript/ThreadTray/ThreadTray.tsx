import { useId } from "react";
import { FolderGit2, GitBranch, GitPullRequest, Network } from "lucide-react";
import type { Agent } from "@/types";
import { useStore } from "@/stores/app-store";
import { ComposerTray } from "@/components/ui/ComposerTray/ComposerTray";
import { useSubagents } from "@/hooks/useSubagents";
import { SubagentChip } from "./SubagentChip/SubagentChip";

const SHOWN = 3;

/** Under the composer: the task's subagents, one click each, and the branch the work lands on. */
export function ThreadTray({ agent }: { agent: Agent }) {
  const subs = useSubagents(agent.id);
  const openSubagent = useStore((s) => s.openSubagent);
  const openPanel = useStore((s) => s.openPanel);
  const selected = useStore((s) =>
    s.panelOpen && s.panelTab === "agents" ? s.selectedSubagentId : undefined,
  );
  const group = useId();

  return (
    <ComposerTray className="pt-[19px] pr-1.5 pb-1 pl-3">
      {subs.length === 0 ? (
        <span className="flex shrink-0 items-center gap-1.5">
          <FolderGit2 className="size-3" />
          Worktree
        </span>
      ) : (
        <span className="flex shrink-0 items-center gap-0.5">
          <Network className="mr-1 size-3 shrink-0" aria-label="Subagents" />
          {subs.slice(0, SHOWN).map((s) => (
            <SubagentChip
              key={s.id}
              sub={s}
              agent={agent}
              selected={selected === s.id}
              layoutId={`${group}-selected`}
              onOpen={() => openSubagent(s.id)}
            />
          ))}
          {subs.length > SHOWN && (
            <button
              type="button"
              onClick={() => openSubagent(null)}
              className="h-6 shrink-0 rounded-full px-1.5 text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
            >
              +{subs.length - SHOWN}
            </button>
          )}
        </span>
      )}
      <button
        type="button"
        onClick={() => openPanel("diff")}
        title={agent.branch}
        className="ml-auto inline-flex h-6 min-w-0 shrink items-center gap-1.5 rounded-full px-1.5 transition-colors hover:bg-hover hover:text-ink-2"
      >
        {agent.pr && (
          <span className="flex shrink-0 items-center gap-1 text-merge">
            <GitPullRequest className="size-3" />#{agent.pr}
          </span>
        )}
        <GitBranch className="size-3 shrink-0" />
        <span className="truncate font-mono text-[11px]">{agent.branch}</span>
      </button>
    </ComposerTray>
  );
}
