import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { useStore } from "@/stores/app-store";
import { toProviderEntries, type ProviderSnapshotEntry } from "../adapters/providers";
import { toProviderUsage } from "../adapters/usage";
import { rederiveAgents } from "./directory";

const USAGE_REFRESH_MS = 5 * 60_000;

function applyProviders(entries: ProviderSnapshotEntry[]) {
  useStore.getState().setProviders(toProviderEntries(entries));
  rederiveAgents(() => true);
}

export async function loadProviders(client: DaemonClient): Promise<void> {
  const snapshot = await client.getProvidersSnapshot();
  applyProviders(snapshot.entries);
}

export async function loadUsage(client: DaemonClient): Promise<void> {
  const usage = await client.listProviderUsage();
  useStore.getState().setUsage(usage.providers.flatMap((p) => toProviderUsage(p) ?? []));
}

/** Provider catalog pushes, and a usage refresh on a timer for as long as it runs. */
export function listenProviders(client: DaemonClient): () => void {
  const off = client.on("providers_snapshot_update", ({ payload }) =>
    applyProviders(payload.entries),
  );
  const timer = setInterval(() => {
    loadUsage(client).catch((error: unknown) => console.error("Usage refresh failed", error));
  }, USAGE_REFRESH_MS);
  return () => {
    off();
    clearInterval(timer);
  };
}
