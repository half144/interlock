import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { useStore } from "@/stores/app-store";
import { toFileDiffs } from "../adapters/diff";

/** Keeps the files the open task changed up to date: merge-base with the base branch to the working tree. */
export function watchDiff(client: DaemonClient, agent: { id: string; cwd: string }): () => void {
  const subscriptionId = `interlock:diff:${agent.id}`;
  const apply = (files: Parameters<typeof toFileDiffs>[0], error: { message: string } | null) => {
    if (error) {
      console.error(`Diff of ${agent.cwd}: ${error.message}`);
      return;
    }
    useStore.getState().setDiff(agent.id, toFileDiffs(files));
  };

  const off = client.on("checkout_diff_update", ({ payload }) => {
    if (payload.subscriptionId === subscriptionId) apply(payload.files, payload.error);
  });
  client
    .subscribeCheckoutDiff(agent.cwd, { mode: "base_worktree" }, { subscriptionId })
    .then((payload) => apply(payload.files, payload.error))
    .catch((error: unknown) => useStore.getState().reportError(error));
  return () => {
    off();
    client.unsubscribeCheckoutDiff(subscriptionId);
  };
}
