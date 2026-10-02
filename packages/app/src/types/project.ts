import type { AgentKind } from "./agent";

export type Autonomy = "auto" | "full-auto";

/** How far an agent may go on its own, picked per conversation: plan first, work and ask when risky, or never ask. */
export type Access = "plan" | Autonomy;

export interface ProjectSettings {
  setupCommands: string[];
  env: [string, string][];
  filesToCopy: string[];
  autonomy: Autonomy;
  defaultKind: AgentKind | null;
  defaultModel: string | null;
  archiveAfterMerge: boolean;
  /** The base branch picked in settings; null follows the detected default branch. */
  defaultBranch: string | null;
}

export interface Project {
  id: string;
  name: string;
  /** The name as the UI shows it: the folder name, plus its parent folder when another project has the same name. */
  label: string;
  rootPath: string;
  /** False for a plain folder: tasks run in it directly, with no branches, diff or pull requests. */
  git: boolean;
  remoteUrl: string | null;
  defaultBranch: string;
  settings: ProjectSettings;
}

/** A git repository the daemon found on this machine. */
export interface DiscoveredRepository {
  path: string;
  name: string;
  /** Epoch milliseconds of the last git activity in it. */
  lastActivityAt: number;
}
