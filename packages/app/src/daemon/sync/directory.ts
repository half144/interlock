import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import type {
  AgentSnapshotPayload,
  WorkspaceDescriptorPayload,
} from "@interlock/protocol/messages";
import { modelLabel } from "@/lib/providers";
import { useStore } from "@/stores/app-store";
import type { AppState } from "@/stores/types";
import { toAgent, type AgentContext } from "../adapters/agents";
import { pullRequestOf, toProject, toWorkspace } from "../adapters/projects";
import { checkedOutBranch } from "../branches";
import { savedBaseBranch } from "../branchPreference";
import { loadProjectSettings } from "../projectSettings";

const PAGE = 200;
const SUBSCRIPTION = { subscriptionId: "interlock:directory" };

/** The last snapshot of every agent, so an update to its workspace or to the model catalog can rebuild it. */
const snapshots = new Map<string, AgentSnapshotPayload>();

function contextFor(state: AppState, snapshot: AgentSnapshotPayload): AgentContext {
  const workspace = snapshot.workspaceId ? state.workspaces[snapshot.workspaceId] : undefined;
  const project = workspace && state.projects[workspace.projectId];
  return {
    workspace,
    projectId: project ? project.id : null,
    baseBranch: project ? project.defaultBranch : "main",
    pr: workspace ? (state.pullRequests[workspace.id] ?? null) : null,
    modelLabel: (kind, id) => modelLabel(state.providers, kind, id),
  };
}

/** The daemon can send a snapshot out of order; an older one never overwrites a newer one. */
const isStale = (snapshot: AgentSnapshotPayload) => {
  const known = snapshots.get(snapshot.id);
  return known !== undefined && Date.parse(snapshot.updatedAt) < Date.parse(known.updatedAt);
};

function applyAgent(snapshot: AgentSnapshotPayload): void {
  if (isStale(snapshot)) return;
  snapshots.set(snapshot.id, snapshot);
  const state = useStore.getState();
  const agent = toAgent(snapshot, contextFor(state, snapshot));
  if (agent) state.upsertAgent(agent);
}

export function rederiveAgents(match: (snapshot: AgentSnapshotPayload) => boolean): void {
  for (const snapshot of snapshots.values()) if (match(snapshot)) applyAgent(snapshot);
}

function applyWorkspace(payload: WorkspaceDescriptorPayload): void {
  useStore.getState().upsertWorkspace(toWorkspace(payload), pullRequestOf(payload));
  rederiveAgents((s) => s.workspaceId === payload.id);
}

interface Page<T> {
  entries: T[];
  pageInfo: { hasMore: boolean; nextCursor: string | null };
}

async function allPages<T>(
  fetchPage: (page: { limit: number; cursor?: string }) => Promise<Page<T>>,
) {
  const found: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchPage({ limit: PAGE, ...(cursor ? { cursor } : {}) });
    found.push(...page.entries);
    cursor = page.pageInfo.hasMore ? (page.pageInfo.nextCursor ?? undefined) : undefined;
  } while (cursor);
  return found;
}

/** Replaces projects, workspaces and agents with what the daemon holds, and subscribes to their changes. */
export async function loadDirectory(client: DaemonClient): Promise<void> {
  const [projects, workspaces, entries] = await Promise.all([
    client.listProjects(),
    allPages((page) => client.fetchWorkspaces({ subscribe: SUBSCRIPTION, page })),
    allPages((page) => client.fetchAgents({ subscribe: SUBSCRIPTION, page })),
  ]);
  const agents = entries.map((e) => e.agent);
  const state = useStore.getState();
  state.replaceWorkspaces(
    workspaces.map((w) => ({ workspace: toWorkspace(w), pr: pullRequestOf(w) })),
  );
  const loaded = await Promise.all(
    projects.projects.map(async (p) => {
      const defaultBranch =
        savedBaseBranch(p.projectRootPath) ?? (await checkedOutBranch(client, p.projectRootPath));
      const project = toProject(p, defaultBranch ? { defaultBranch } : {});
      try {
        return { ...project, settings: (await loadProjectSettings(p.projectId)).settings };
      } catch (error) {
        console.error(`Could not read the settings of ${p.projectRootPath}`, error);
        return project;
      }
    }),
  );
  state.replaceProjects(loaded);
  snapshots.clear();
  for (const snapshot of agents) snapshots.set(snapshot.id, snapshot);
  const next = useStore.getState();
  next.replaceAgents(agents.flatMap((s) => toAgent(s, contextFor(next, s)) ?? []));
}

/** Listens for directory pushes. The listeners live as long as the client, across reconnects. */
export function listenDirectory(client: DaemonClient): () => void {
  const offs = [
    client.on("agent_update", ({ payload }) => {
      if (payload.kind === "upsert") {
        applyAgent(payload.agent);
        return;
      }
      snapshots.delete(payload.agentId);
      useStore.getState().removeAgent(payload.agentId);
    }),
    client.on("agent_archived", ({ payload }) => {
      const snapshot = snapshots.get(payload.agentId);
      if (snapshot) applyAgent({ ...snapshot, archivedAt: payload.archivedAt });
    }),
    client.on("agent_deleted", ({ payload }) => {
      snapshots.delete(payload.agentId);
      useStore.getState().removeAgent(payload.agentId);
    }),
    client.on("workspace_update", ({ payload }) => {
      const state = useStore.getState();
      if (payload.kind === "upsert") {
        applyWorkspace(payload.workspace);
        return;
      }
      state.removeWorkspace(payload.id);
      if (payload.removedProjectId) state.removeProject(payload.removedProjectId);
    }),
    client.on("project.update", ({ payload }) => {
      const state = useStore.getState();
      if (payload.kind === "upsert") state.upsertProject(toProject(payload.project));
      else state.removeProject(payload.projectId);
    }),
  ];
  return () => offs.forEach((off) => off());
}
