import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { useStore } from "@/stores/app-store";
import { toCheckout, toSetupRun, toShipped } from "../adapters/ship";

/** Listens for pull request and setup pushes. The listeners live as long as the client, across reconnects. */
export function listenShip(client: DaemonClient): () => void {
  const offs = [
    client.on("checkout_status_update", ({ payload }) => {
      if (payload.prStatus) {
        useStore.getState().setCheckout(payload.cwd, toCheckout(payload.prStatus));
      }
    }),
    client.on("task_ship_update", ({ payload }) => {
      useStore.getState().setShipped(payload.cwd, toShipped(payload));
    }),
    client.on("workspace_setup_progress", ({ payload }) => {
      useStore.getState().setSetupRun(payload.workspaceId, toSetupRun(payload));
    }),
  ];
  return () => offs.forEach((off) => off());
}

/** The pull request and setup output of the open task, so its tabs have content before the next push. */
export async function loadShip(
  client: DaemonClient,
  agent: { cwd: string; workspaceId: string | null },
): Promise<void> {
  const state = useStore.getState();
  const [pr, setup] = await Promise.all([
    client.checkoutPrStatus(agent.cwd),
    agent.workspaceId ? client.fetchWorkspaceSetupStatus(agent.workspaceId) : null,
  ]);
  state.setCheckout(agent.cwd, toCheckout(pr));
  if (agent.workspaceId && setup?.snapshot) {
    state.setSetupRun(agent.workspaceId, toSetupRun(setup.snapshot));
  }
}
