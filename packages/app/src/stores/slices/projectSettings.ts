import type { ProjectSettings } from "@/types";
import * as settings from "@/daemon/projectSettings";
import type { SliceCreator } from "../types";

export interface ProjectSettingsSlice {
  /** Saves a change of settings in the daemon and keeps the store on what the daemon now holds. */
  updateSettings: (projectId: string, change: Partial<ProjectSettings>) => Promise<void>;
  /** Takes the project off Interlock; the folder and its branches stay where they are. */
  deleteProject: (projectId: string) => Promise<void>;
}

export const createProjectSettingsSlice: SliceCreator<ProjectSettingsSlice> = (set, get) => ({
  updateSettings: async (projectId, change) => {
    const saved = await settings.saveProjectSettings(projectId, change);
    const project = get().projects[projectId];
    if (project) {
      set((s) => ({
        projects: {
          ...s.projects,
          [projectId]: {
            ...project,
            settings: saved.settings,
            defaultBranch: saved.settings.defaultBranch ?? project.defaultBranch,
          },
        },
      }));
    }
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
