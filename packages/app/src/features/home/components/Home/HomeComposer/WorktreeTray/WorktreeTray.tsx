import { Check, ChevronDown, GitBranch } from "lucide-react";
import type { Project } from "@/types";
import { ComposerTray } from "@/components/ui/ComposerTray/ComposerTray";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Popover } from "@/components/ui/Popover/Popover";
import { useStartingBranches } from "@/features/home/hooks/useStartingBranches";

/**
 * Where the task will run, tucked under the composer: every task gets its own worktree, cut from the project's
 * default branch or from a branch another task is still working on, as Codex lets you pick a starting branch.
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
  const branches = useStartingBranches(project);

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
          <>
            <p className="px-2 pt-1 pb-1.5 text-[12px] text-ink-3">Starting branch</p>
            {branches.map((branch) => (
              <MenuItem
                key={branch}
                active={branch === base}
                onSelect={() => (onBase(branch), close())}
                hint={
                  branch === base ? (
                    <Check />
                  ) : branch === project.defaultBranch ? (
                    "default"
                  ) : undefined
                }
              >
                <GitBranch />
                <span className="truncate font-mono text-[12px]">{branch}</span>
              </MenuItem>
            ))}
          </>
        )}
      </Popover>
      <span className="ml-auto shrink-0 text-ink-4">{project.stack}</span>
    </ComposerTray>
  );
}
