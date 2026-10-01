import { Folder } from "lucide-react";
import type { Project } from "@/types";
import { ComposerTray } from "@/components/ui/ComposerTray/ComposerTray";

/** A plain folder has nothing to cut a worktree from: the task runs in it directly, and the tray says so. */
export function FolderTray({ project }: { project: Project }) {
  return (
    <ComposerTray className="pt-[21px] pr-4 pb-1.5 pl-4">
      <Folder className="size-3 shrink-0" />
      <span className="min-w-0 truncate" title={project.rootPath}>
        Runs in this folder, no git. The agent edits your files in place.
      </span>
    </ComposerTray>
  );
}
