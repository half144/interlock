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
  remoteUrl: string | null;
  defaultBranch: string;
  settings: ProjectSettings;
}
