import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { useStore } from "@/stores/app-store";
import type { AppState } from "@/stores/types";
import { watchDiff } from "./diff";
import { loadShip } from "./ship";
import { loadSubagents } from "./subagents";
import { watchTimeline } from "./timeline";

function watchAgent(
  client: DaemonClient,
  agent: { id: string; cwd: string; workspaceId: string | null },
): () => void {
  const stops = [watchTimeline(client, agent.id), watchDiff(client, agent)];
  const { reportError } = useStore.getState();
  loadSubagents(client, agent.id).catch(reportError);
  loadShip(client, agent).catch(reportError);
  return () => stops.forEach((stop) => stop());
}

const focusKey = (state: AppState) => {
  const agent =
    state.daemon.synced && state.selectedAgentId ? state.agents[state.selectedAgentId] : undefined;
  return agent ? { key: `${agent.id}|${agent.cwd}`, agent } : null;
};

/** Follows the open task: its timeline, its subagents and its diff are subscribed only while it is open. */
export function startFocusSync(client: DaemonClient): () => void {
  let key = "";
  let stop: () => void = () => undefined;
  const apply = (state: AppState) => {
    const focus = focusKey(state);
    const next = focus?.key ?? "";
    if (next === key) return;
    key = next;
    stop();
    stop = focus ? watchAgent(client, focus.agent) : () => undefined;
  };
  apply(useStore.getState());
  const unsubscribe = useStore.subscribe(apply);
  return () => {
    unsubscribe();
    stop();
  };
}
