import { AnimatePresence } from "motion/react";
import { Folder, FolderOpen, Plus, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarProjects } from "./useSidebarProjects";
import { SidebarIconButton } from "@/features/shell/components/SidebarIconButton/SidebarIconButton";
import { AddProjectDialog } from "./AddProjectDialog/AddProjectDialog";

/** Projects double as a filter for the task list; each row reveals its settings on hover. */
export function SidebarProjects() {
  const { projects, needsYou, go, projectFilter, setProjectFilter, add, flow, submit, closeFlow } =
    useSidebarProjects();

  return (
    <>
      <div className="mt-5 flex h-8 items-center justify-between pr-2 pl-4">
        <span className="placard">Projects</span>
        <SidebarIconButton label="Add project" onClick={add}>
          <Plus />
        </SidebarIconButton>
      </div>
      <div className="flex flex-col gap-0.5 px-2">
        {projects.map((p) => {
          const active = projectFilter === p.id;
          const Icon = active ? FolderOpen : Folder;
          return (
            <div
              key={p.id}
              className={cn(
                "group flex h-9 items-center rounded-lg pr-1 transition-colors",
                active ? "bg-selected" : "hover:bg-hover",
              )}
            >
              <button
                type="button"
                onClick={() => setProjectFilter(active ? null : p.id)}
                aria-pressed={active}
                className="flex min-w-0 flex-1 items-center gap-2.5 self-stretch pl-2.5 text-left text-[14px] text-ink"
              >
                <Icon className="size-4 shrink-0 text-ink-2" />
                <span className="truncate">{p.name}</span>
                {needsYou.has(p.id) && (
                  <span
                    role="img"
                    aria-label="Needs you"
                    className="size-1.5 rounded-full bg-hold"
                  />
                )}
              </button>
              <SidebarIconButton
                label={`${p.name} settings`}
                reveal
                onClick={() => go({ kind: "settings", projectId: p.id })}
              >
                <Settings2 />
              </SidebarIconButton>
            </div>
          );
        })}
      </div>
      <AnimatePresence>
        {flow && (
          <AddProjectDialog
            key="add-project"
            initialPath={flow.path}
            error={flow.error}
            onSubmit={submit}
            onClose={closeFlow}
          />
        )}
      </AnimatePresence>
    </>
  );
}
