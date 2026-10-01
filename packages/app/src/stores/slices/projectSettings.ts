import type { ProjectSettings } from "@/types";
import { saveBaseBranch } from "@/daemon/branchPreference";
import * as settings from "@/daemon/projectSettings";
import type { SliceCreator } from "../types";

export interface ProjectSettingsSlice {
  /** Saves a change of settings in the daemon and keeps the store on what the daemon now holds. */
  updateSettings: (projectId: string, change: Partial<ProjectSettings>) => Promise<void>;
  setBaseBranch: (projectId: string, branch: string) => void;
  /** Takes the project off Interlock; the folder and its branches stay where they are. */
  deleteProject: (projectId: string) => Promise<void>;
}

export const createProjectSettingsSlice: SliceCreator<ProjectSettingsSlice> = (set, get) => ({
  updateSettings: async (projectId, change) => {
    const saved = await settings.saveProjectSettings(projectId, change);
    const project = get().projects[projectId];
    if (project) {
      set((s) => ({
        projects: { ...s.projects, [projectId]: { ...project, settings: saved.settings } },
      }));
    }
  },

  setBaseBranch: (projectId, branch) => {
    const project = get().projects[projectId];
    if (!project) return;
    saveBaseBranch(project.rootPath, branch);
    set((s) => ({
      projects: { ...s.projects, [projectId]: { ...project, defaultBranch: branch } },
    }));
  },

  deleteProject: async (projectId) => {
    try {
      await settings.removeProject(projectId);
      get().removeProject(projectId);
      get().go({ kind: "yard" });
    } catch (error) {
      get().reportError(error);
    }
  },
});
