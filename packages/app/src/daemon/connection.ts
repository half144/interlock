import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { getDaemonConnection } from "@/platform/desktop";
import { useStore } from "@/stores/app-store";
import { closeClient, currentClient, openClient } from "./client";
import { listenAccounts } from "./sync/accounts";
import { listenAttention } from "./sync/attention";
import { listenDirectory, loadDirectory } from "./sync/directory";
import { startFocusSync } from "./sync/focus";
import { listenProviders, loadProviders, loadUsage } from "./sync/providers";
import { listenShip } from "./sync/ship";
import { listenSubagents } from "./sync/subagents";

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "The daemon is not reachable.";

async function sync(client: DaemonClient): Promise<void> {
  const { setDaemon, reportError } = useStore.getState();
  try {
    await Promise.all([loadDirectory(client), loadProviders(client), loadUsage(client)]);
    setDaemon({ synced: true, error: null });
    void useStore.getState().loadTools();
  } catch (error) {
    reportError(error);
  }
}

function bind(client: DaemonClient): () => void {
  const stops = [
    listenDirectory(client),
    listenSubagents(client),
    listenProviders(client),
    listenAccounts(client),
    listenAttention(client),
    listenShip(client),
    startFocusSync(client),
  ];
  const off = client.subscribeConnectionStatus((state) => {
    const { setDaemon } = useStore.getState();
    if (state.status === "connected") {
      setDaemon({ phase: "connected", error: null });
      void sync(client);
    } else if (state.status === "disconnected") {
      setDaemon({ phase: "disconnected", synced: false, error: state.reason ?? null });
    } else if (state.status === "connecting") {
      setDaemon({ phase: "connecting" });
    }
  });
  return () => {
    off();
    stops.forEach((stop) => stop());
  };
}

/** Skips the reconnect backoff, e.g. when the shell reports the daemon is up. */
export function reconnectNow(): void {
  currentClient()?.ensureConnected();
}

/**
 * Connects to the daemon the platform points at and keeps the store in sync with it. The client reconnects
 * with backoff on its own; this reacts to each state it reports.
 */
export function startDaemon(): () => void {
  let disposed = false;
  let unbind: () => void = () => undefined;

  const connect = async () => {
    try {
      const client = openClient(await getDaemonConnection());
      if (disposed) return;
      unbind = bind(client);
      await client.connect();
    } catch (error) {
      useStore.getState().setDaemon({ phase: "disconnected", error: messageOf(error) });
    }
  };

  void connect();

  return () => {
    disposed = true;
    unbind();
    void closeClient();
  };
}
