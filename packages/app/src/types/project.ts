import type { AgentKind } from "./agent";

export type Autonomy = "auto" | "full-auto";

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
