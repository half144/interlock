import type { Project, PullRequestRef, Workspace } from "@/types";
import * as daemon from "@/daemon/commands";
import { withProjectMeta } from "@/lib/projectMeta";
import type { SliceCreator } from "../types";

export interface ProjectSlice {
  projects: Record<string, Project>;
  workspaces: Record<string, Workspace>;
  /** The pull request of a workspace, by workspace id. */
  pullRequests: Record<string, PullRequestRef>;

  /** Adds the folder and reports a refusal as a toast. */
  addProject: (path: string) => Promise<void>;
  /** Adds the folder; resolves to why the daemon refused it, or null when it is now a project. */
  tryAddProject: (path: string) => Promise<string | null>;
  replaceProjects: (projects: Project[]) => void;
  upsertProject: (project: Project) => void;
  removeProject: (projectId: string) => void;
  replaceWorkspaces: (entries: { workspace: Workspace; pr: PullRequestRef | null }[]) => void;
  upsertWorkspace: (workspace: Workspace, pr: PullRequestRef | null) => void;
  removeWorkspace: (workspaceId: string) => void;
}

const byProject = (projects: Project[]) => Object.fromEntries(projects.map((p) => [p.id, p]));

const withoutKey = <T>(record: Record<string, T>, key: string) =>
  Object.fromEntries(Object.entries(record).filter(([k]) => k !== key));

export const createProjectSlice: SliceCreator<ProjectSlice> = (set, get) => ({
  projects: {},
  workspaces: {},
  pullRequests: {},

  addProject: async (path) => {
    const failure = await get().tryAddProject(path);
    if (failure) get().reportError(new Error(failure));
  },

  tryAddProject: (path) =>
    daemon.addProject(path).then(
      (project) => {
        get().upsertProject(project);
        set({ newTaskProjectId: project.id });
        return null;
      },
      (error: unknown) =>
        error instanceof Error ? error.message : "Could not add the folder. Try again.",
    ),

  replaceProjects: (projects) =>
    set((s) => ({ projects: withProjectMeta(byProject(projects), s.workspaces) })),

  upsertProject: (project) =>
    set((s) => {
      const prev = s.projects[project.id];
      const next = prev
        ? {
            ...project,
            settings: prev.settings,
            defaultBranch: prev.defaultBranch,
            remoteUrl: project.remoteUrl ?? prev.remoteUrl,
          }
        : project;
      return { projects: withProjectMeta({ ...s.projects, [project.id]: next }, s.workspaces) };
    }),

  removeProject: (projectId) =>
    set((s) => ({
      projects: withProjectMeta(withoutKey(s.projects, projectId), s.workspaces),
    })),

  replaceWorkspaces: (entries) =>
    set((s) => {
      const workspaces = Object.fromEntries(entries.map((e) => [e.workspace.id, e.workspace]));
      return {
        workspaces,
        projects: withProjectMeta(s.projects, workspaces),
        pullRequests: Object.fromEntries(
          entries.flatMap((e) => (e.pr ? [[e.workspace.id, e.pr] as const] : [])),
        ),
      };
    }),

  upsertWorkspace: (workspace, pr) =>
    set((s) => {
      const workspaces = { ...s.workspaces, [workspace.id]: workspace };
      return {
        workspaces,
        projects: withProjectMeta(s.projects, workspaces),
        pullRequests: pr
          ? { ...s.pullRequests, [workspace.id]: pr }
          : withoutKey(s.pullRequests, workspace.id),
      };
    }),

  removeWorkspace: (workspaceId) =>
    set((s) => ({
      workspaces: withoutKey(s.workspaces, workspaceId),
      pullRequests: withoutKey(s.pullRequests, workspaceId),
    })),
});
