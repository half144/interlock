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
}

export interface Project {
  id: string;
  name: string;
  rootPath: string;
  remoteUrl: string | null;
  defaultBranch: string;
  settings: ProjectSettings;
}
