import { Check, GitBranch } from "lucide-react";
import type { Project } from "@/types";
import { Input } from "@/components/ui/Input/Input";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { useBranchMenu } from "./useBranchMenu";

function hintFor(branch: string, base: string, defaultBranch: string) {
  if (branch === base) return <Check />;
  return branch === defaultBranch ? "default" : undefined;
}

export function BranchMenu({
  project,
  base,
  onPick,
}: {
  project: Project;
  base: string;
  onPick: (branch: string) => void;
}) {
  const { query, setQuery, branches } = useBranchMenu(project);

  return (
    <>
      <Input
        mono
        ref={(el) => el?.focus()}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find a branch"
        aria-label="Find a branch"
        className="mb-1 h-8"
      />
      <div className="max-h-64 overflow-y-auto">
        {branches.map((branch) => (
          <MenuItem
            key={branch}
            active={branch === base}
            onSelect={() => onPick(branch)}
            hint={hintFor(branch, base, project.defaultBranch)}
          >
            <GitBranch />
            <span className="truncate font-mono text-[12px]">{branch}</span>
          </MenuItem>
        ))}
      </div>
    </>
  );
}
