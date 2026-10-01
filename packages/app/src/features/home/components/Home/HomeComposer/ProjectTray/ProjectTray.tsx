import type { Project } from "@/types";
import { FolderTray } from "../FolderTray/FolderTray";
import { ReadyTray } from "../ReadyTray/ReadyTray";
import { WorktreeTray } from "../WorktreeTray/WorktreeTray";

/** What sits under the composer: where a git project's task branches from, where a plain folder's runs, or what the machine can run. */
export function ProjectTray({
  project,
  base,
  onBase,
}: {
  project: Project | undefined;
  base: string | undefined;
  onBase: (branch: string) => void;
}) {
  if (!project) return <ReadyTray />;
  if (!project.git) return <FolderTray project={project} />;
  return base ? <WorktreeTray project={project} base={base} onBase={onBase} /> : <ReadyTray />;
}
