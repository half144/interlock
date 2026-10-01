import { Check, ChevronDown, Folder } from "lucide-react";
import { projects } from "@/mocks/projects";
import type { Project } from "@/types";
import { MenuItem } from "@/components/ui/MenuItem/MenuItem";
import { Pill } from "@/components/ui/Pill/Pill";
import { Popover } from "@/components/ui/Popover/Popover";

/** Which project the new task runs in. */
export function ProjectPill({
  project,
  onChange,
}: {
  project: Project;
  onChange: (projectId: string) => void;
}) {
  return (
    <Popover
      trigger={({ open, toggle }) => (
        <Pill onClick={toggle} aria-expanded={open}>
          <Folder className="size-3.5 text-ink-2" />
          {project.name}
          <ChevronDown className="size-3 text-ink-3" />
        </Pill>
      )}
    >
      {(close) =>
        projects.map((p) => (
          <MenuItem
            key={p.id}
            active={p.id === project.id}
            onSelect={() => (onChange(p.id), close())}
            hint={p.id === project.id ? <Check className="size-3.5" /> : undefined}
          >
            <Folder />
            {p.name}
          </MenuItem>
        ))
      }
    </Popover>
  );
}
