import { ChevronDown, GitBranch } from "lucide-react";
import type { Project } from "@/types";
import { ComposerTray } from "@/components/ui/ComposerTray/ComposerTray";
import { Popover } from "@/components/ui/Popover/Popover";
import { BranchMenu } from "./BranchMenu/BranchMenu";

/**
 * Where the task will run, tucked under the composer: every task gets its own worktree, cut from the project's
 * default branch or from any other branch of the repository, as Codex lets you pick a starting branch.
 */
export function WorktreeTray({
  project,
  base,
  onBase,
}: {
  project: Project;
  base: string;
  onBase: (branch: string) => void;
}) {
  return (
    <ComposerTray className="pt-[21px] pr-4 pb-1.5 pl-4">
      <GitBranch className="size-3 shrink-0" />
      New worktree from
      <Popover
        className="w-[300px]"
        trigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            className="-mx-1 inline-flex min-w-0 items-center gap-1 rounded px-1 py-0.5 font-mono text-[11.5px] text-ink-2 transition-colors hover:bg-selected hover:text-ink"
          >
            <span className="truncate">{base}</span>
            <ChevronDown className="size-3 shrink-0 text-ink-3" />
          </button>
        )}
      >
        {(close) => (
          <BranchMenu
            project={project}
            base={base}
            onPick={(branch) => {
              onBase(branch);
              close();
            }}
          />
        )}
      </Popover>
    </ComposerTray>
  );
}
